/**
 * Pure Total Solar Eclipse Studio Engine & 5-Language Copy
 * ----------------------------------------------------------------------------
 * Computes live contact phases (C1 -> C2 -> Greatest Eclipse -> C3 -> C4),
 * obscuration %, optical eclipse magnitude, Diamond Ring & Baily's Beads
 * optical flare envelopes, sky luminance dimming, and Earth body-fixed 3D
 * Path of Totality unit coordinates derived directly from astronomy-engine
 * heliocentric ephemeris.
 *
 * Pure TypeScript (zero DOM / browser APIs) so it can be unit-tested in Node
 * and bundled cleanly inside /plugin.
 */

import { computeLunarShadowOnEarth, SolarEclipsePreset } from './astrophysics-science';
import { SOLAR_SYSTEM_BODIES } from './constants';
import { computeSolarSystemEphemeris, computeSunDirectionFromBody } from './ephemeris';
import { LanguageCode } from './i18n';
import { Vec3d } from './scale-engine';

export type EclipseCameraMode = 'orbital' | 'totality' | 'syzygy';

export type EclipseContactPhase =
  | 'pre'
  | 'c1-ingress'
  | 'c2-diamond-ring'
  | 'totality'
  | 'c3-diamond-ring'
  | 'c4-egress'
  | 'post';

export type EclipseContactId = 'c1' | 'c2' | 'max' | 'c3' | 'c4';

export interface EclipseContactOffsetsSec {
  c1: number;
  c2: number;
  max: number;
  c3: number;
  c4: number;
}

export interface EclipseTelemetry {
  /** Seconds relative to Greatest Eclipse (negative before max, positive after). */
  offsetSec: number;
  /** Normalized scrubber progress in [0, 1] across [-5400s, +5400s]. */
  progress: number;
  /** Current astronomical contact stage. */
  phase: EclipseContactPhase;
  /** Solar disk area obscured by the Moon in [0, 100]%. */
  obscurationPct: number;
  /** Linear fraction of solar diameter covered (exceeds 1.00 during totality). */
  magnitude: number;
  /** Normalized totality immersion factor in [0, 1]. */
  totalityFactor: number;
  /** Diamond Ring optical bloom intensity in [0, 1] (peaks sharply at C2 & C3). */
  diamondRingIntensity: number;
  /** Side of the solar limb where the Diamond Ring appears (-1 = left/ingress, +1 = right/egress). */
  diamondRingSide: -1 | 1;
  /** Baily's Beads limb-valley sparkle intensity in [0, 1] right around C2 & C3. */
  bailysBeadsIntensity: number;
  /** Chromosphere & prominence visibility factor in [0, 1]. */
  chromosphereIntensity: number;
  /** Corona streamer visibility factor in [0, 1]. */
  coronaIntensity: number;
  /** Daytime sky luminance factor in [0.015, 1.0] (1 = full daylight, ~0.015 = deep totality). */
  skyLuminance: number;
  /** Moon center horizontal offset in solar radii (-2.1..+2.1; 0 at greatest eclipse). */
  moonOffsetSolarRadii: number;
  /** Apparent Moon/Sun angular radius ratio (~1.015..1.075 for total eclipses). */
  moonToSunRadiusRatio: number;
  /** Approximate umbral track width on Earth's surface in km. */
  umbraWidthKm: number;
  /** Approximate lunar umbral ground speed in km/h. */
  shadowSpeedKmh: number;
  /** Key contact timestamps relative to Greatest Eclipse (in seconds). */
  contacts: EclipseContactOffsetsSec;
}

export const ECLIPSE_WINDOW_HALF_SEC = 5_400; // ±90 minutes around Greatest Eclipse

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/**
 * Exact circle-circle overlap area fraction of the solar disk (radius = 1)
 * eclipsed by a lunar disk of radius `rMoon` separated by center distance `d`.
 */
export function computeCircleObscuration(d: number, rMoon: number): number {
  const rSun = 1.0;
  const dist = Math.abs(d);
  if (dist >= rSun + rMoon) return 0;
  if (dist + rSun <= rMoon) return 1;
  if (dist + rMoon <= rSun) return (rMoon * rMoon) / (rSun * rSun);

  const r1Sq = rSun * rSun;
  const r2Sq = rMoon * rMoon;
  const dSq = dist * dist;
  const alpha = Math.acos(clamp((dSq + r1Sq - r2Sq) / (2 * dist * rSun), -1, 1));
  const beta = Math.acos(clamp((dSq + r2Sq - r1Sq) / (2 * dist * rMoon), -1, 1));
  const part1 = r1Sq * alpha;
  const part2 = r2Sq * beta;
  const part3 =
    0.5 *
    Math.sqrt(
      Math.max(
        0,
        (-dist + rSun + rMoon) *
          (dist + rSun - rMoon) *
          (dist - rSun + rMoon) *
          (dist + rSun + rMoon)
      )
    );
  const overlapArea = part1 + part2 - part3;
  return clamp(overlapArea / (Math.PI * r1Sq), 0, 1);
}

/**
 * Computes deterministic, astrophysically calibrated eclipse telemetry and optical
 * envelopes for any preset and time offset from Greatest Eclipse.
 */
export function computeEclipseTelemetry(
  preset: SolarEclipsePreset,
  rawOffsetSec: number
): EclipseTelemetry {
  const offsetSec = clamp(rawOffsetSec, -ECLIPSE_WINDOW_HALF_SEC, ECLIPSE_WINDOW_HALF_SEC);
  const progress = (offsetSec + ECLIPSE_WINDOW_HALF_SEC) / (2 * ECLIPSE_WINDOW_HALF_SEC);

  // Longer totality implies a larger apparent Moon/Sun ratio (closer to lunar perigee)
  const durationFactor = clamp((preset.durationSec - 120) / 280, 0, 1);
  const moonToSunRadiusRatio = 1.022 + durationFactor * 0.052; // 1.022 .. 1.074
  const halfTotalitySec = Math.max(45, preset.durationSec * 0.5);
  const partialHalfSec = 4_560; // ~76 min partial ingress/egress around max

  const contacts: EclipseContactOffsetsSec = {
    c1: -partialHalfSec,
    c2: -halfTotalitySec,
    max: 0,
    c3: halfTotalitySec,
    c4: partialHalfSec,
  };

  // Piecewise linear center separation (in solar radii) so C1/C2/C3/C4 occur at exact contact offsets:
  // At |t| = halfTotalitySec -> |d| = rMoon - 1 (exact inner tangent C2 / C3)
  // At |t| = partialHalfSec  -> |d| = rMoon + 1 (exact outer tangent C1 / C4)
  const innerTangent = moonToSunRadiusRatio - 1.0;
  const outerTangent = moonToSunRadiusRatio + 1.0;
  const absT = Math.abs(offsetSec);
  let sepSolarRadii: number;
  if (absT <= halfTotalitySec) {
    sepSolarRadii = (absT / halfTotalitySec) * innerTangent;
  } else {
    const partialFrac = (absT - halfTotalitySec) / (partialHalfSec - halfTotalitySec);
    sepSolarRadii = innerTangent + partialFrac * (outerTangent - innerTangent);
  }
  const moonOffsetSolarRadii = offsetSec < 0 ? -sepSolarRadii : sepSolarRadii;

  const obscuration = computeCircleObscuration(sepSolarRadii, moonToSunRadiusRatio);
  const obscurationPct = Math.round(obscuration * 1000) / 10;
  const magnitude = clamp(
    (1.0 + moonToSunRadiusRatio - sepSolarRadii) / 2.0,
    0,
    1.08
  );

  // Contact phase classification
  const diamondWindowSec = Math.min(28, Math.max(14, halfTotalitySec * 0.2));
  let phase: EclipseContactPhase;
  if (offsetSec < contacts.c1) {
    phase = 'pre';
  } else if (offsetSec < contacts.c2 - diamondWindowSec) {
    phase = 'c1-ingress';
  } else if (offsetSec <= contacts.c2 + 8) {
    phase = 'c2-diamond-ring';
  } else if (offsetSec < contacts.c3 - 8) {
    phase = 'totality';
  } else if (offsetSec <= contacts.c3 + diamondWindowSec) {
    phase = 'c3-diamond-ring';
  } else if (offsetSec <= contacts.c4) {
    phase = 'c4-egress';
  } else {
    phase = 'post';
  }

  // Totality immersion (1 inside C2..C3, smooth transition right across contact boundaries)
  const distPastInner = Math.max(0, absT - halfTotalitySec);
  const totalityFactor = clamp(1.0 - distPastInner / 16, 0, 1);

  // Diamond Ring peaks right outside C2 and C3 (around 6-14s outside inner tangent)
  const dC2 = offsetSec - (contacts.c2 - 7);
  const dC3 = offsetSec - (contacts.c3 + 7);
  const ringC2 = Math.exp(-(dC2 * dC2) / (2 * 14 * 14));
  const ringC3 = Math.exp(-(dC3 * dC3) / (2 * 14 * 14));
  const diamondRingIntensity = clamp(Math.max(ringC2, ringC3), 0, 1);
  const diamondRingSide: -1 | 1 = ringC2 >= ringC3 ? 1 : -1;

  // Baily's Beads sparkle sharply right at C2 and C3 (±10s around inner tangent)
  const bC2 = Math.exp(-Math.pow((offsetSec - contacts.c2) / 9, 2));
  const bC3 = Math.exp(-Math.pow((offsetSec - contacts.c3) / 9, 2));
  const bailysBeadsIntensity = clamp(Math.max(bC2, bC3), 0, 1);

  // Corona emerges dramatically once obscuration passes ~98% and reaches full glory during totality
  const coronaIntensity = clamp(
    totalityFactor * 0.92 + Math.pow(obscuration, 28) * 0.25,
    0,
    1
  );
  const chromosphereIntensity = clamp(
    totalityFactor * 0.72 + bailysBeadsIntensity * 0.45,
    0,
    1
  );

  // Sky brightness plunges non-linearly only during the final 3% of obscuration
  const daylightDrop = Math.pow(obscuration, 6.5);
  const skyLuminance = clamp(1.0 - daylightDrop * 0.96 - totalityFactor * 0.03, 0.015, 1.0);

  // Real physical scale of the umbral track width (115–265 km) & ground speed (~1,800–3,200 km/h)
  const umbraWidthKm = Math.round(
    (118 + durationFactor * 142) * (0.45 + 0.55 * Math.exp(-Math.pow(offsetSec / 3400, 2)))
  );
  const shadowSpeedKmh = Math.round(
    1_920 + (1 - Math.exp(-Math.pow(offsetSec / 3800, 2))) * 1_850
  );

  return {
    offsetSec,
    progress,
    phase,
    obscurationPct,
    magnitude: Math.round(magnitude * 1000) / 1000,
    totalityFactor,
    diamondRingIntensity,
    diamondRingSide,
    bailysBeadsIntensity,
    chromosphereIntensity,
    coronaIntensity,
    skyLuminance,
    moonOffsetSolarRadii,
    moonToSunRadiusRatio,
    umbraWidthKm,
    shadowSpeedKmh,
    contacts,
  };
}

/**
 * Samples Earth body-fixed unit vectors along the real 3D Path of Totality
 * for a given eclipse preset using live astronomy-engine Moon/Sun/Earth geometry.
 *
 * Points are returned in Earth's body-fixed local frame (`entry.mesh` space) so
 * the glowing 3D Path of Totality ribbon rotates in lockstep with Earth's continents
 * while the lunar umbra sweeps directly along it.
 */
export function sampleEclipsePathBodyFixedDirs(
  preset: SolarEclipsePreset,
  steps = 56
): Vec3d[] {
  const count = Math.max(8, Math.floor(steps));
  const obliquityRad = (SOLAR_SYSTEM_BODIES.earth.obliquityDeg * Math.PI) / 180;
  const cosOb = Math.cos(-obliquityRad);
  const sinOb = Math.sin(-obliquityRad);

  const pts: Vec3d[] = [];
  for (let i = 0; i <= count; i += 1) {
    const frac = i / count;
    const offsetSec = (frac * 2 - 1) * ECLIPSE_WINDOW_HALF_SEC;
    const ephem = computeSolarSystemEphemeris(new Date(preset.dateMs + offsetSec * 1000));
    const earthBody = ephem.bodies.earth;
    const moonBody = ephem.bodies.moon;
    if (!earthBody || !moonBody) continue;

    const shadow = computeLunarShadowOnEarth(earthBody.helioPosM, moonBody.helioPosM);
    const sunDir = computeSunDirectionFromBody(earthBody.helioPosM);
    const mRel = shadow.moonRelEarthRadii;

    // Intersection of the Sun->Moon shadow axis with Earth's unit sphere
    const proj = mRel[0] * sunDir[0] + mRel[1] * sunDir[1] + mRel[2] * sunDir[2];
    if (proj <= 0) continue;

    const px = mRel[0] - sunDir[0] * proj;
    const py = mRel[1] - sunDir[1] * proj;
    const pz = mRel[2] - sunDir[2] * proj;
    const p2 = px * px + py * py + pz * pz;
    if (p2 >= 0.985) continue; // Shadow axis misses Earth's globe at this timestamp

    const alongSun = Math.sqrt(Math.max(0, 1.0 - p2));
    const wx = px + sunDir[0] * alongSun;
    const wy = py + sunDir[1] * alongSun;
    const wz = pz + sunDir[2] * alongSun;

    // Inverse transform from world frame into entry.mesh body-fixed coordinates:
    // p_local = R_y(-spinAngleRad) * R_z(-obliquityRad) * p_world
    const rzX = wx * cosOb - wy * sinOb;
    const rzY = wx * sinOb + wy * cosOb;
    const rzZ = wz;

    const negSpin = -earthBody.spinAngleRad;
    const cosS = Math.cos(negSpin);
    const sinS = Math.sin(negSpin);
    const lx = rzX * cosS + rzZ * sinS;
    const ly = rzY;
    const lz = -rzX * sinS + rzZ * cosS;

    const len = Math.hypot(lx, ly, lz);
    if (len > 0.5 && Number.isFinite(lx) && Number.isFinite(ly) && Number.isFinite(lz)) {
      pts.push([lx / len, ly / len, lz / len]);
    }
  }

  return pts;
}

export function formatEclipseOffset(offsetSec: number): string {
  const sign = offsetSec < 0 ? '-' : '+';
  const total = Math.round(Math.abs(offsetSec));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `T${sign}${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `T${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface EclipseStudioCopy {
  studioTitle: string;
  studioSubtitle: string;
  openStudioBtn: string;
  closeStudioAria: string;
  eventLabel: string;
  viewLabel: string;
  views: Record<EclipseCameraMode, string>;
  contacts: Record<EclipseContactId, string>;
  phases: Record<EclipseContactPhase, string>;
  timelineLabel: string;
  playLabel: string;
  pauseLabel: string;
  speedLabel: string;
  metrics: {
    obscuration: string;
    magnitude: string;
    umbraWidth: string;
    shadowSpeed: string;
  };
  layers: {
    totalityPath: string;
    shadowCone: string;
    earthClouds: string;
  };
  telescopeNote: string;
  telescopeBadges: {
    corona: string;
    diamondRing: string;
    bailysBeads: string;
    chromosphere: string;
  };
}

export const ECLIPSE_STUDIO_COPY: Record<LanguageCode, EclipseStudioCopy> = {
  en: {
    studioTitle: 'Total Solar Eclipse Studio',
    studioSubtitle: 'NASA Blue Marble · Live Lunar Umbra & Corona Optics',
    openStudioBtn: 'Eclipse Studio',
    closeStudioAria: 'Close Eclipse Studio',
    eventLabel: 'Eclipse Event',
    viewLabel: 'Camera View',
    views: {
      orbital: 'Orbital',
      totality: 'Totality',
      syzygy: 'Syzygy',
    },
    contacts: {
      c1: 'C1',
      c2: 'C2',
      max: 'MAX',
      c3: 'C3',
      c4: 'C4',
    },
    phases: {
      pre: 'Pre-Eclipse',
      'c1-ingress': 'Partial Ingress (C1–C2)',
      'c2-diamond-ring': 'C2 Diamond Ring',
      totality: 'Totality · Corona Visible',
      'c3-diamond-ring': 'C3 Diamond Ring',
      'c4-egress': 'Partial Egress (C3–C4)',
      post: 'Post-Eclipse',
    },
    timelineLabel: 'Contact Timeline',
    playLabel: 'Play Eclipse',
    pauseLabel: 'Pause Eclipse',
    speedLabel: 'Playback Rate',
    metrics: {
      obscuration: 'Obscuration',
      magnitude: 'Magnitude',
      umbraWidth: 'Umbra Width',
      shadowSpeed: 'Shadow Speed',
    },
    layers: {
      totalityPath: 'Path of Totality',
      shadowCone: 'Umbra Cone',
      earthClouds: 'Cloud Deck',
    },
    telescopeNote: 'Ground Telescope View · Chromosphere, Baily’s Beads & Solar Corona',
    telescopeBadges: {
      corona: 'Solar Corona',
      diamondRing: 'Diamond Ring',
      bailysBeads: 'Baily’s Beads',
      chromosphere: 'Chromosphere',
    },
  },
  vi: {
    studioTitle: 'Phòng Mô Phỏng Nhật Thực Toàn Phần',
    studioSubtitle: 'Trái Đất Blue Marble · Bóng Tối Mặt Trăng & Nhật Hoa',
    openStudioBtn: 'Mô phỏng Nhật thực',
    closeStudioAria: 'Đóng Phòng Nhật thực',
    eventLabel: 'Sự kiện Nhật thực',
    viewLabel: 'Góc quan sát',
    views: {
      orbital: 'Quỹ đạo',
      totality: 'Toàn phần',
      syzygy: 'Thẳng hàng',
    },
    contacts: {
      c1: 'C1',
      c2: 'C2',
      max: 'CỰC ĐẠI',
      c3: 'C3',
      c4: 'C4',
    },
    phases: {
      pre: 'Trước nhật thực',
      'c1-ingress': 'Nhật thực một phần (C1–C2)',
      'c2-diamond-ring': 'Vòng Kim Cương C2',
      totality: 'Toàn phần · Hiện Nhật hoa',
      'c3-diamond-ring': 'Vòng Kim Cương C3',
      'c4-egress': 'Nhật thực một phần (C3–C4)',
      post: 'Sau nhật thực',
    },
    timelineLabel: 'Tiến trình tiếp xúc',
    playLabel: 'Phát nhật thực',
    pauseLabel: 'Tạm dừng',
    speedLabel: 'Tốc độ phát',
    metrics: {
      obscuration: 'Che khuất',
      magnitude: 'Độ lớn',
      umbraWidth: 'Bề rộng bóng',
      shadowSpeed: 'Tốc độ bóng',
    },
    layers: {
      totalityPath: 'Đường toàn phần',
      shadowCone: 'Nón bóng tối',
      earthClouds: 'Lớp mây',
    },
    telescopeNote: 'Kính thiên văn mặt đất · Sắc cầu, Chuỗi hạt Baily & Nhật hoa',
    telescopeBadges: {
      corona: 'Nhật hoa',
      diamondRing: 'Vòng Kim Cương',
      bailysBeads: 'Chuỗi hạt Baily',
      chromosphere: 'Sắc cầu',
    },
  },
  ja: {
    studioTitle: '皆既日食スタジオ',
    studioSubtitle: 'Blue Marble 地球・本影と太陽コロナ光学シミュレーション',
    openStudioBtn: '日食スタジオ',
    closeStudioAria: '日食スタジオを閉じる',
    eventLabel: '皆既日食イベント',
    viewLabel: '視点モード',
    views: {
      orbital: '軌道俯瞰',
      totality: '皆既望遠',
      syzygy: '一直線',
    },
    contacts: {
      c1: 'C1',
      c2: 'C2',
      max: '食甚',
      c3: 'C3',
      c4: 'C4',
    },
    phases: {
      pre: '開始前',
      'c1-ingress': '部分食・欠け始め (C1–C2)',
      'c2-diamond-ring': 'C2 ダイヤモンドリング',
      totality: '皆既食・太陽コロナ出現',
      'c3-diamond-ring': 'C3 ダイヤモンドリング',
      'c4-egress': '部分食・復円へ (C3–C4)',
      post: '終了後',
    },
    timelineLabel: '接触タイムライン',
    playLabel: '再生',
    pauseLabel: '一時停止',
    speedLabel: '再生速度',
    metrics: {
      obscuration: '食面積比',
      magnitude: '最大食分',
      umbraWidth: '本影幅',
      shadowSpeed: '影速度',
    },
    layers: {
      totalityPath: '皆既帯ライン',
      shadowCone: '本影コーン',
      earthClouds: '雲レイヤー',
    },
    telescopeNote: '地上望遠鏡ビュー・彩層、ベイリービーズ、太陽コロナ',
    telescopeBadges: {
      corona: '太陽コロナ',
      diamondRing: 'ダイヤモンドリング',
      bailysBeads: 'ベイリービーズ',
      chromosphere: '彩層',
    },
  },
  zh: {
    studioTitle: '日全食光学工作室',
    studioSubtitle: '蓝色弹珠地球 · 实时月球本影与日冕模拟',
    openStudioBtn: '日食工作室',
    closeStudioAria: '关闭日食工作室',
    eventLabel: '日全食事件',
    viewLabel: '观测视角',
    views: {
      orbital: '轨道视角',
      totality: '全食望远',
      syzygy: '三体连珠',
    },
    contacts: {
      c1: '初亏',
      c2: '食既',
      max: '食甚',
      c3: '生光',
      c4: '复圆',
    },
    phases: {
      pre: '初亏前',
      'c1-ingress': '偏食阶段 (初亏–食既)',
      'c2-diamond-ring': '食既钻石环',
      totality: '全食 · 日冕显现',
      'c3-diamond-ring': '生光钻石环',
      'c4-egress': '偏食复圆 (生光–复圆)',
      post: '复圆后',
    },
    timelineLabel: '食相时间轴',
    playLabel: '播放',
    pauseLabel: '暂停',
    speedLabel: '倍速',
    metrics: {
      obscuration: '遮蔽面积',
      magnitude: '食分',
      umbraWidth: '本影宽度',
      shadowSpeed: '本影速度',
    },
    layers: {
      totalityPath: '全食带轨迹',
      shadowCone: '本影锥体',
      earthClouds: '地球云层',
    },
    telescopeNote: '地面望远镜视角 · 色球层、贝利珠与太阳日冕',
    telescopeBadges: {
      corona: '太阳日冕',
      diamondRing: '钻石环',
      bailysBeads: '贝利珠',
      chromosphere: '色球层',
    },
  },
  ko: {
    studioTitle: '개기일식 스튜디오',
    studioSubtitle: '블루 마블 지구 · 실시간 달 본영 및 태양 코로나',
    openStudioBtn: '일식 스튜디오',
    closeStudioAria: '일식 스튜디오 닫기',
    eventLabel: '개기일식 이벤트',
    viewLabel: '카메라 시점',
    views: {
      orbital: '궤도 뷰',
      totality: '개기 망원',
      syzygy: '직렬 뷰',
    },
    contacts: {
      c1: 'C1',
      c2: 'C2',
      max: '최대',
      c3: 'C3',
      c4: 'C4',
    },
    phases: {
      pre: '일식 시작 전',
      'c1-ingress': '부분일식 진행 (C1–C2)',
      'c2-diamond-ring': 'C2 다이아몬드 링',
      totality: '개기식 · 태양 코로나 출현',
      'c3-diamond-ring': 'C3 다이아몬드 링',
      'c4-egress': '부분일식 복원 (C3–C4)',
      post: '일식 종료 후',
    },
    timelineLabel: '접촉 타임라인',
    playLabel: '재생',
    pauseLabel: '일시정지',
    speedLabel: '재생 배속',
    metrics: {
      obscuration: '가림률',
      magnitude: '식분',
      umbraWidth: '본영 폭',
      shadowSpeed: '그림자 속도',
    },
    layers: {
      totalityPath: '개기대 경로',
      shadowCone: '본영 원뿔',
      earthClouds: '지구 구름층',
    },
    telescopeNote: '지상 망원경 시점 · 채층, 베일리 구슬 및 태양 코로나',
    telescopeBadges: {
      corona: '태양 코로나',
      diamondRing: '다이아몬드 링',
      bailysBeads: '베일리 구슬',
      chromosphere: '채층',
    },
  },
};
