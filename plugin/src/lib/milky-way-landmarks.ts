/**
 * Real Milky Way Galactic Structures & Star Clusters (NASA Spitzer / ESA Gaia DR3 / Harris 2010 / Reid et al. 2019).
 *
 * Replaces abstract category-clustering blobs with scientifically verified Milky Way landmarks:
 *  - 8 real major Milky Way star clusters & giant H-II star-forming complexes at exact IAU / Gaia DR3
 *    Galactocentric 3D coordinates computed from heliocentric (l, b, distKpc).
 *  - 5 real NASA/JPL Milky Way spiral arms aligned 1:1 with the parametric barred-spiral geometry
 *    in `lib/milky-way.ts`.
 */

import { KILOPARSEC_METERS } from './constants';
import { SUN_GALACTOCENTRIC_THREE_M } from './ephemeris';
import { LanguageCode } from './i18n';
import { galacticToThreeUp, Vec3d } from './scale-engine';

export type MilkyWayLandmarkKind =
  | 'globular-cluster'
  | 'super-star-cluster'
  | 'open-cluster'
  | 'hii-complex'
  | 'spiral-arm';

export interface MilkyWayLandmark {
  id: string;
  kind: MilkyWayLandmarkKind;
  /** Scientific catalog designation (NGC / Messier / IAU). */
  designation: string;
  /** Localized display title in all 5 supported languages. */
  name: Record<LanguageCode, string>;
  /** Concise localized short label for 3D Milky Way viewport markers. */
  shortName: Record<LanguageCode, string>;
  /** Localized classification badge. */
  classLabel: Record<LanguageCode, string>;
  /** Localized host galactic region (arm / halo). */
  regionLabel: Record<LanguageCode, string>;
  /** Localized concise scientific summary. */
  description: Record<LanguageCode, string>;
  /** Published heliocentric Galactic longitude l [deg]. */
  galacticLonDeg: number;
  /** Published heliocentric Galactic latitude b [deg]. */
  galacticLatDeg: number;
  /** Published heliocentric distance from the Sun [kpc]. */
  distanceFromSunKpc: number;
  /** Galactocentric Three.js Y-up position [kpc] relative to Sgr A* at origin. */
  posKpc: Vec3d;
  /** Physical optical/virial diameter [ly]. */
  diameterLy: number;
  /** Approximate stellar population or mass label. */
  populationLabel: string;
  /** Framing camera distance [kpc] when flying to inspect this landmark. */
  idealInspectDistKpc: number;
  /** Subtle physically grounded spectral color tint (never saturated neon). */
  accentHex: string;
  /** Normalized [r, g, b] in [0, 1] for 3D marker glow. */
  accentRgb: [number, number, number];
  /** Peer-reviewed observational source. */
  source: string;
}

/**
 * Convert heliocentric IAU Galactic coordinates (l [deg], b [deg], dist [kpc])
 * into exact Galactocentric Three.js Y-up coordinates [kpc] with Sgr A* at [0, 0, 0].
 */
export function helioGalacticToGalactocentricKpc(
  lDeg: number,
  bDeg: number,
  distKpc: number
): Vec3d {
  const lRad = (lDeg * Math.PI) / 180;
  const bRad = (bDeg * Math.PI) / 180;
  const cosB = Math.cos(bRad);
  const helioGalKpc: Vec3d = [
    distKpc * cosB * Math.cos(lRad),
    distKpc * cosB * Math.sin(lRad),
    distKpc * Math.sin(bRad),
  ];
  const helioThreeKpc = galacticToThreeUp(helioGalKpc);
  return [
    SUN_GALACTOCENTRIC_THREE_M[0] / KILOPARSEC_METERS + helioThreeKpc[0],
    SUN_GALACTOCENTRIC_THREE_M[1] / KILOPARSEC_METERS + helioThreeKpc[1],
    SUN_GALACTOCENTRIC_THREE_M[2] / KILOPARSEC_METERS + helioThreeKpc[2],
  ];
}

/**
 * Evaluate exact 3D ridge position [kpc] on one of NASA R. Hurt / Reid et al. (2019)
 * Milky Way spiral arms, synchronized 1:1 with `generateNasaMilkyWayKpcStarfield`.
 */
export function computeSpiralArmRidgeKpc(startAngleRad: number, radiusKpc: number): Vec3d {
  const r0 = 3.15;
  const pitchK = 4.55;
  const theta = startAngleRad - pitchK * Math.log(radiusKpc / r0);
  return [Math.cos(theta) * radiusKpc, 0.0, Math.sin(theta) * radiusKpc];
}

function galactocentricKpcToHelioGalactic(posKpc: Vec3d): {
  lDeg: number;
  bDeg: number;
  distKpc: number;
} {
  const sunX = SUN_GALACTOCENTRIC_THREE_M[0] / KILOPARSEC_METERS;
  const sunY = SUN_GALACTOCENTRIC_THREE_M[1] / KILOPARSEC_METERS;
  const sunZ = SUN_GALACTOCENTRIC_THREE_M[2] / KILOPARSEC_METERS;
  // Inverse of galacticToThreeUp([gx, gy, gz]) => [gx, gz, -gy]
  const dx = posKpc[0] - sunX;
  const dz = posKpc[1] - sunY; // galactic z = Three y
  const dy = -(posKpc[2] - sunZ); // galactic y = -Three z
  const distKpc = Math.hypot(dx, dy, dz);
  const lDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
  const bDeg = distKpc > 1e-6 ? (Math.asin(Math.max(-1, Math.min(1, dz / distKpc))) * 180) / Math.PI : 0;
  return {
    lDeg: Number(lDeg.toFixed(1)),
    bDeg: Number(bDeg.toFixed(1)),
    distKpc: Number(distKpc.toFixed(2)),
  };
}

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

const BAR_ANGLE = -0.95;

/**
 * 8 Real Milky Way Star Clusters & Giant H-II Star-Forming Complexes.
 * Every position is computed directly from published Gaia DR3 / Harris (2010) / Reid et al. (2019)
 * heliocentric Galactic coordinates (l, b, distance).
 */
export const MILKY_WAY_STAR_CLUSTERS: readonly MilkyWayLandmark[] = [
  {
    id: 'mw-cluster:omega-centauri',
    kind: 'globular-cluster',
    designation: 'NGC 5139 · C1323-472',
    name: {
      en: 'Omega Centauri (NGC 5139)',
      vi: 'Cụm cầu Omega Centauri (NGC 5139)',
      ja: 'オメガ星団 (NGC 5139)',
      zh: '半人马座 ω 星团 (NGC 5139)',
      ko: '오메가 센타우리 (NGC 5139)',
    },
    shortName: {
      en: 'Omega Centauri',
      vi: 'Omega Centauri',
      ja: 'オメガ星団',
      zh: '半人马座 ω',
      ko: '오메가 센타우리',
    },
    classLabel: {
      en: 'Globular Star Cluster',
      vi: 'Cụm sao cầu (Globular Cluster)',
      ja: '球状星団',
      zh: '球状星团',
      ko: '구상성단',
    },
    regionLabel: {
      en: 'Inner Galactic Halo',
      vi: 'Quầng trong Dải Ngân Hà',
      ja: '銀河ハロー内縁',
      zh: '银河系内银晕',
      ko: '은하 내부 헤일로',
    },
    description: {
      en: 'The largest and brightest globular cluster orbiting the Milky Way, containing ~10 million ancient stars — widely thought to be the stripped core of an accreted dwarf galaxy.',
      vi: 'Cụm sao cầu lớn và sáng nhất quay quanh Dải Ngân Hà với khoảng 10 triệu ngôi sao cổ đại — nhiều bằng chứng cho thấy đây là lõi còn sót lại của một thiên hà lùn bị Ngân Hà hấp thụ.',
      ja: '約1,000万個の古い恒星を含む天の川銀河最大の球状星団。かつて吸収された矮小銀河の核とみられています。',
      zh: '环绕银河系运行的最大、最亮球状星团，包含约 1,000 万颗古老恒星，被认为是一个被吞并矮星系的残余核心。',
      ko: '약 1,000만 개의 오래된 별을 품은 우리 은하 최대·최고 밝기의 구상성단으로, 병합된 왜소은하의 핵으로 추정됩니다.',
    },
    galacticLonDeg: 309.1,
    galacticLatDeg: 14.97,
    distanceFromSunKpc: 5.43,
    posKpc: helioGalacticToGalactocentricKpc(309.1, 14.97, 5.43),
    diameterLy: 150,
    populationLabel: '~10⁷ stars · 4 × 10⁶ M☉',
    idealInspectDistKpc: 2.2,
    accentHex: '#fcd34d',
    accentRgb: hexToRgb01('#fcd34d'),
    source: 'Baumgardt & Vasiliev (2021) Gaia EDR3; Harris (2010)',
  },
  {
    id: 'mw-cluster:westerlund-1',
    kind: 'super-star-cluster',
    designation: 'Wd 1 · Ara Cluster',
    name: {
      en: 'Westerlund 1 Super Star Cluster',
      vi: 'Siêu cụm sao Westerlund 1',
      ja: 'ウェスタールンド 1 超星団',
      zh: '维斯特卢 1 超级星团',
      ko: '웨스터룬드 1 초성단',
    },
    shortName: {
      en: 'Westerlund 1',
      vi: 'Westerlund 1',
      ja: 'ウェスタールンド 1',
      zh: '维斯特卢 1',
      ko: '웨스터룬드 1',
    },
    classLabel: {
      en: 'Young Super Star Cluster',
      vi: 'Siêu cụm sao trẻ (Super Star Cluster)',
      ja: '若年超星団',
      zh: '年轻超级星团',
      ko: '젊은 초성단',
    },
    regionLabel: {
      en: 'Scutum–Centaurus Arm',
      vi: 'Nhánh Thuẫn – Nhân Mã',
      ja: 'たて・ケンタウルス腕',
      zh: '盾牌–半人马臂',
      ko: '방패–센타우루스 팔',
    },
    description: {
      en: 'The most massive known compact young star cluster in the Milky Way (~50,000–100,000 M☉), packed with Wolf–Rayet stars, yellow hypergiants, and magnetar CXOU J1647.',
      vi: 'Cụm sao trẻ đặc khối lượng lớn nhất từng được phát hiện trong Dải Ngân Hà (~50.000–100.000 M☉), hội tụ dày đặc sao Wolf–Rayet, siêu khổng lồ vàng và sao từ CXOU J1647.',
      ja: '質量約5万〜10万太陽質量の天の川銀河最大級の若年超星団。ウォルフ・ライエ星やマグネターが密集しています。',
      zh: '银河系内已知质量最大的致密年轻星团（约 5–10 万太阳质量），富含沃尔夫–拉叶星、黄特超巨星与磁星。',
      ko: '우리 은하에서 가장 무거운 젊은 밀집 초성단(~5–10만 태양질량)으로, 볼프-레이에별과 마그네타가 밀집해 있습니다.',
    },
    galacticLonDeg: 339.55,
    galacticLatDeg: -0.4,
    distanceFromSunKpc: 4.23,
    posKpc: helioGalacticToGalactocentricKpc(339.55, -0.4, 4.23),
    diameterLy: 12,
    populationLabel: '~10⁵ stars · ~7 × 10⁴ M☉',
    idealInspectDistKpc: 2.0,
    accentHex: '#93c5fd',
    accentRgb: hexToRgb01('#93c5fd'),
    source: 'Negueruela et al. (2022) Gaia EDR3; Clark et al. (2020)',
  },
  {
    id: 'mw-cluster:carina-nebula',
    kind: 'hii-complex',
    designation: 'NGC 3372 · Eta Carinae',
    name: {
      en: 'Carina Nebula Complex (NGC 3372)',
      vi: 'Tinh vân Thuyền Để (Carina · NGC 3372)',
      ja: 'イータカリーナ星雲 (NGC 3372)',
      zh: '船底座大星云 (NGC 3372)',
      ko: '용골자리 성운 (NGC 3372)',
    },
    shortName: {
      en: 'Carina Nebula',
      vi: 'Tinh vân Carina',
      ja: 'カリーナ星雲',
      zh: '船底座星云',
      ko: '용골자리 성운',
    },
    classLabel: {
      en: 'Giant H-II Star-Forming Complex',
      vi: 'Phức hợp Tinh vân tạo sao H-II',
      ja: '巨大 H-II 星形成領域',
      zh: '巨型 H-II 恒星形成区',
      ko: '거대 H-II 별탄생 영역',
    },
    regionLabel: {
      en: 'Sagittarius–Carina Arm',
      vi: 'Nhánh Nhân Mã – Thuyền Để',
      ja: 'いて・りゅうこつ腕',
      zh: '人马–船底臂',
      ko: '궁수–용골자리 팔',
    },
    description: {
      en: 'A colossal 300-light-year H-II star-forming nursery in the Carina–Sagittarius Arm hosting the luminous hypergiant binary Eta Carinae and the Trumpler 14 & 16 OB clusters.',
      vi: 'Vườn ươm tạo sao H-II khổng lồ rộng ~300 năm ánh sáng thuộc nhánh Nhân Mã–Thuyền Để, nơi chứa hệ sao cực siêu khổng lồ Eta Carinae cùng hai cụm sao trẻ Trumpler 14 và 16.',
      ja: 'いて・りゅうこつ腕にある差し渡し約300光年の巨大星形成領域。極超巨星エータ・カリーナを擁します。',
      zh: '位于人马–船底臂、跨度约 300 光年的巨型恒星育婴室，孕育着海山二（Eta Carinae）与 Trumpler 14/16 星团。',
      ko: '궁수–용골자리 팔의 지름 약 300광년 거대 별탄생 성운으로, 에타 카리나 극대거성과 Trumpler 14/16 성단이 자리합니다.',
    },
    galacticLonDeg: 287.6,
    galacticLatDeg: -0.6,
    distanceFromSunKpc: 2.6,
    posKpc: helioGalacticToGalactocentricKpc(287.6, -0.6, 2.6),
    diameterLy: 300,
    populationLabel: '> 14,000 young stars · H-II',
    idealInspectDistKpc: 2.0,
    accentHex: '#f472b6',
    accentRgb: hexToRgb01('#f472b6'),
    source: 'Göppl & Preibisch (2022) Gaia DR3; Smith (2006)',
  },
  {
    id: 'mw-cluster:w49a',
    kind: 'hii-complex',
    designation: 'W49A · Westerhout 49',
    name: {
      en: 'W49A Starburst Complex',
      vi: 'Vùng bùng nổ tạo sao W49A',
      ja: 'W49A スターバースト領域',
      zh: 'W49A 星暴恒星形成区',
      ko: 'W49A 폭발적 별탄생 영역',
    },
    shortName: {
      en: 'W49A Starburst',
      vi: 'Vùng tạo sao W49A',
      ja: 'W49A 領域',
      zh: 'W49A 星暴区',
      ko: 'W49A 영역',
    },
    classLabel: {
      en: 'Galactic Mini-Starburst H-II Region',
      vi: 'Vùng tạo sao H-II cực mạnh',
      ja: '銀河ミニスターバースト領域',
      zh: '银河系微型星暴 H-II 区',
      ko: '은하 미니-스타버스트 영역',
    },
    regionLabel: {
      en: 'Perseus Arm (Far Side)',
      vi: 'Nhánh Anh Tiên (Phía đối diện)',
      ja: 'ペルセウス腕（遠方側）',
      zh: '英仙臂（远端）',
      ko: '페르세우스 팔 (원거리)',
    },
    description: {
      en: 'One of the most luminous giant star-forming complexes in the entire Milky Way (~10⁷ L☉), obscured optically by galactic dust but blazing brightly in radio and infrared.',
      vi: 'Một trong những tổ hợp tạo sao sáng nhất toàn Dải Ngân Hà (~10⁷ L☉), nằm phía bên kia lõi thiên hà; bị bụi che khuất trong ánh sáng khả kiến nhưng rực sáng ở sóng vô tuyến và hồng ngoại.',
      ja: '天の川銀河で最も明るい巨大星形成領域の1つ（約1,000万太陽光度）。塵に遮られるため電波・赤外線で観測されます。',
      zh: '银河系中最明亮的巨型恒星形成区之一（约 1,000 万倍太阳光度），光学波段被尘埃遮挡，在射电与红外波段极为耀眼。',
      ko: '우리 은하에서 가장 밝은 거대 별탄생 영역 중 하나(~10⁷ L☉)로, 먼지에 가려져 전파·적외선으로 관측됩니다.',
    },
    galacticLonDeg: 43.17,
    galacticLatDeg: 0.01,
    distanceFromSunKpc: 11.11,
    posKpc: helioGalacticToGalactocentricKpc(43.17, 0.01, 11.11),
    diameterLy: 350,
    populationLabel: '> 100 O-type stars · 10⁶ M☉',
    idealInspectDistKpc: 2.4,
    accentHex: '#fb7185',
    accentRgb: hexToRgb01('#fb7185'),
    source: 'Zhang et al. (2013) VLBA Parallax; Reid et al. (2019)',
  },
  {
    id: 'mw-cluster:double-cluster',
    kind: 'open-cluster',
    designation: 'NGC 869 / NGC 884 (h & χ Persei)',
    name: {
      en: 'Perseus Double Cluster (NGC 869/884)',
      vi: 'Cụm sao đôi Anh Tiên (NGC 869/884)',
      ja: 'ペルセウス座二重星団 (NGC 869/884)',
      zh: '英仙座双星团 (NGC 869/884)',
      ko: '페르세우스 이중성단 (NGC 869/884)',
    },
    shortName: {
      en: 'Double Cluster',
      vi: 'Cụm đôi Perseus',
      ja: '二重星団',
      zh: '英仙座双星团',
      ko: '이중성단',
    },
    classLabel: {
      en: 'Twin Open Star Clusters',
      vi: 'Cặp cụm sao mở (Open Clusters)',
      ja: '二重散開星団',
      zh: '双疏散星团',
      ko: '이중 산개성단',
    },
    regionLabel: {
      en: 'Perseus Arm',
      vi: 'Nhánh Anh Tiên (Perseus Arm)',
      ja: 'ペルセウス腕',
      zh: '英仙臂',
      ko: '페르세우스 팔',
    },
    description: {
      en: 'A famous pair of young ~13-million-year-old supergiant-rich open clusters anchoring our view of the Perseus Arm just outside the Solar System.',
      vi: 'Cặp cụm sao mở trẻ (~13 triệu năm tuổi) giàu sao siêu khổng lồ xanh–đỏ, là cột mốc định vị kinh điển của Nhánh Anh Tiên ngay phía ngoài quỹ đạo Hệ Mặt Trời.',
      ja: '太陽系のすぐ外側のペルセウス腕に位置する約1,300万年前の若い散開星団ペア。',
      zh: '位于太阳系外侧英仙臂的一对约 1,300 万年历史、富含超巨星的著名疏散星团。',
      ko: '태양계 바깥 페르세우스 팔에 자리한 약 1,300만 년 된 젊은 초거성 풍부 이중 산개성단입니다.',
    },
    galacticLonDeg: 134.8,
    galacticLatDeg: -3.7,
    distanceFromSunKpc: 2.3,
    posKpc: helioGalacticToGalactocentricKpc(134.8, -3.7, 2.3),
    diameterLy: 70,
    populationLabel: '~20,000 M☉ · ~13 Myr',
    idealInspectDistKpc: 2.0,
    accentHex: '#7dd3fc',
    accentRgb: hexToRgb01('#7dd3fc'),
    source: 'Cantat-Gaudin et al. (2020) Gaia DR2; Currie et al. (2010)',
  },
  {
    id: 'mw-cluster:47-tucanae',
    kind: 'globular-cluster',
    designation: 'NGC 104 · 47 Tuc',
    name: {
      en: '47 Tucanae (NGC 104)',
      vi: 'Cụm cầu 47 Tucanae (NGC 104)',
      ja: 'きょしちょう座47 (NGC 104)',
      zh: '杜鹃座 47 (NGC 104)',
      ko: '큰부리새자리 47 (NGC 104)',
    },
    shortName: {
      en: '47 Tucanae',
      vi: '47 Tucanae',
      ja: '47 Tuc',
      zh: '杜鹃座 47',
      ko: '47 Tuc',
    },
    classLabel: {
      en: 'Globular Star Cluster',
      vi: 'Cụm sao cầu (Globular Cluster)',
      ja: '球状星団',
      zh: '球状星团',
      ko: '구상성단',
    },
    regionLabel: {
      en: 'Southern Galactic Halo',
      vi: 'Quầng Nam Dải Ngân Hà',
      ja: '南銀河ハロー',
      zh: '银河系南银晕',
      ko: '남쪽 은하 헤일로',
    },
    description: {
      en: 'The second-brightest globular cluster in Earth’s sky, containing millions of ~12-billion-year-old stars and over two dozen millisecond pulsars in a dense core.',
      vi: 'Cụm sao cầu sáng thứ hai trên bầu trời Trái Đất, gồm hàng triệu ngôi sao ~12 tỷ năm tuổi cùng hơn hai chục sao xung mili-giây tập trung dày đặc ở lõi.',
      ja: '地球から2番目に明るい球状星団。約120億歳の星々と20個以上のミリ秒パルサーを擁します。',
      zh: '地球夜空第二亮的球状星团，拥有数百万颗约 120 亿年古老恒星以及二十余颗毫秒脉冲星。',
      ko: '지구 하늘에서 두 번째로 밝은 구상성단으로, 약 120억 년 된 수백만 개의 별과 20여 개의 밀리초 펄사가 밀집해 있습니다.',
    },
    galacticLonDeg: 305.9,
    galacticLatDeg: -44.89,
    distanceFromSunKpc: 4.52,
    posKpc: helioGalacticToGalactocentricKpc(305.9, -44.89, 4.52),
    diameterLy: 120,
    populationLabel: '~2 × 10⁶ stars · ~10⁶ M☉',
    idealInspectDistKpc: 2.2,
    accentHex: '#fde68a',
    accentRgb: hexToRgb01('#fde68a'),
    source: 'Baumgardt & Vasiliev (2021) Gaia EDR3; Harris (2010)',
  },
  {
    id: 'mw-cluster:m13-hercules',
    kind: 'globular-cluster',
    designation: 'M13 · NGC 6205',
    name: {
      en: 'Hercules Globular Cluster (M13)',
      vi: 'Cụm cầu Vũ Tiên (M13 · NGC 6205)',
      ja: 'ヘルクレス座球状星団 (M13)',
      zh: '武仙座球状星团 (M13)',
      ko: '헤르쿨레스 구상성단 (M13)',
    },
    shortName: {
      en: 'M13 Cluster',
      vi: 'Cụm cầu M13',
      ja: 'M13 星団',
      zh: 'M13 星团',
      ko: 'M13 성단',
    },
    classLabel: {
      en: 'Halo Globular Star Cluster',
      vi: 'Cụm sao cầu Quầng Thiên hà',
      ja: 'ハロー球状星団',
      zh: '银晕球状星团',
      ko: '헤일로 구상성단',
    },
    regionLabel: {
      en: 'Northern Galactic Halo',
      vi: 'Quầng Bắc Dải Ngân Hà',
      ja: '北銀河ハロー',
      zh: '银河系北银晕',
      ko: '북쪽 은하 헤일로',
    },
    description: {
      en: 'Iconic northern halo globular cluster of ~300,000 stars ~11.6 billion years old, famous as the target of the 1974 Arecibo interstellar radio message.',
      vi: 'Cụm sao cầu biểu tượng ở quầng Bắc Ngân Hà với ~300.000 ngôi sao 11,6 tỷ năm tuổi — nổi tiếng là đích đến của Thông điệp Vô tuyến Arecibo năm 1974.',
      ja: '約30万個の星からなる北天を代表する球状星団。1974年のアレシボ・メッセージの送信先として知られます。',
      zh: '北天著名的银晕球状星团，含约 30 万颗 116 亿年恒星，也是 1974 年阿雷西博射电信息的发送目标。',
      ko: '약 30만 개의 116억 년 된 별로 이루어진 북반구 대표 구상성단이며, 1974년 아레시보 메시지의 목적지로 유명합니다.',
    },
    galacticLonDeg: 59.01,
    galacticLatDeg: 40.91,
    distanceFromSunKpc: 7.42,
    posKpc: helioGalacticToGalactocentricKpc(59.01, 40.91, 7.42),
    diameterLy: 145,
    populationLabel: '~3 × 10⁵ stars · 5 × 10⁵ M☉',
    idealInspectDistKpc: 2.3,
    accentHex: '#fef08a',
    accentRgb: hexToRgb01('#fef08a'),
    source: 'Baumgardt & Vasiliev (2021) Gaia EDR3; Harris (2010)',
  },
  {
    id: 'mw-cluster:cygnus-x',
    kind: 'hii-complex',
    designation: 'Cygnus X · Cyg OB2',
    name: {
      en: 'Cygnus X Star-Forming Complex',
      vi: 'Tổ hợp tạo sao Cygnus X (Cyg OB2)',
      ja: 'はくちょう座X 星形成領域',
      zh: '天鹅座 X 恒星形成复合体',
      ko: '백조자리 X 별탄생 복합체',
    },
    shortName: {
      en: 'Cygnus X',
      vi: 'Cygnus X',
      ja: 'はくちょう座X',
      zh: '天鹅座 X',
      ko: '백조자리 X',
    },
    classLabel: {
      en: 'Massive OB Association & Molecular Cloud',
      vi: 'Hiệp hội sao OB & Đám mây phân tử',
      ja: '大質量 OB アソシエーション',
      zh: '大质量 OB 星协与分子云',
      ko: '대질량 OB 성협 및 분자운',
    },
    regionLabel: {
      en: 'Orion–Cygnus Local Spur',
      vi: 'Nhánh phụ Lạp Hộ – Thiên Nga',
      ja: 'オリオン・はくちょう腕',
      zh: '猎户–天鹅支臂',
      ko: '오리온–백조자리 팔',
    },
    description: {
      en: 'The richest massive star-forming complex within 2 kpc of the Sun, housing the Cygnus OB2 super-association of thousands of hot O and B stars.',
      vi: 'Tổ hợp tạo sao khối lượng lớn giàu có nhất trong bán kính 2 kpc quanh Mặt Trời, chứa siêu hiệp hội Cygnus OB2 với hàng nghìn ngôi sao xanh nóng loại O và B.',
      ja: '太陽から2 kpc以内で最大級の星形成領域。数千の高温O/B型星を含むはくちょう座OB2星協を擁します。',
      zh: '距太阳 2 kpc 内最富饶的大质量恒星形成复合体，包含数千颗炽热 O/B 型星的天鹅座 OB2 超星协。',
      ko: '태양에서 2 kpc 이내에서 가장 풍부한 대질량 별탄생 복합체로, 수천 개의 뜨거운 O/B형 별이 모인 Cyg OB2 성협을 품고 있습니다.',
    },
    galacticLonDeg: 80.0,
    galacticLatDeg: 0.8,
    distanceFromSunKpc: 1.4,
    posKpc: helioGalacticToGalactocentricKpc(80.0, 0.8, 1.4),
    diameterLy: 650,
    populationLabel: '~3 × 10⁶ M☉ molecular gas',
    idealInspectDistKpc: 2.0,
    accentHex: '#60a5fa',
    accentRgb: hexToRgb01('#60a5fa'),
    source: 'Rygl et al. (2012) VLBA Maser Parallax; Wright et al. (2015)',
  },
];

/**
 * 4 Real NASA/JPL-Caltech Spiral Arms aligned mathematically with `generateNasaMilkyWayKpcStarfield`.
 */
const armScutumPos = computeSpiralArmRidgeKpc(BAR_ANGLE, 7.6);
const armPerseusPos = computeSpiralArmRidgeKpc(BAR_ANGLE + Math.PI, 10.6);
const armSagCarPos = computeSpiralArmRidgeKpc(BAR_ANGLE + 1.57, 6.8);
const armNormaPos = computeSpiralArmRidgeKpc(BAR_ANGLE - 1.57, 11.4);

const armScutumHelio = galactocentricKpcToHelioGalactic(armScutumPos);
const armPerseusHelio = galactocentricKpcToHelioGalactic(armPerseusPos);
const armSagCarHelio = galactocentricKpcToHelioGalactic(armSagCarPos);
const armNormaHelio = galactocentricKpcToHelioGalactic(armNormaPos);

export const MILKY_WAY_SPIRAL_ARM_LANDMARKS: readonly MilkyWayLandmark[] = [
  {
    id: 'mw-arm:scutum-centaurus',
    kind: 'spiral-arm',
    designation: 'Major Spiral Arm I',
    name: {
      en: 'Scutum–Centaurus Arm',
      vi: 'Nhánh Thuẫn – Nhân Mã (Scutum–Centaurus)',
      ja: 'たて・ケンタウルス腕',
      zh: '盾牌–半人马臂',
      ko: '방패–센타우루스 팔',
    },
    shortName: {
      en: 'Scutum–Centaurus Arm',
      vi: 'Nhánh Thuẫn–Nhân Mã',
      ja: 'たて・ケンタウルス腕',
      zh: '盾牌–半人马臂',
      ko: '방패–센타우루스 팔',
    },
    classLabel: {
      en: 'Major Milky Way Spiral Arm',
      vi: 'Nhánh xoắn ốc chính Dải Ngân Hà',
      ja: '主要渦状腕',
      zh: '银河系主旋臂',
      ko: '우리 은하 주 나선팔',
    },
    regionLabel: {
      en: 'Inner–Mid Galactic Disk',
      vi: 'Đĩa trong – giữa Ngân Hà',
      ja: '銀河円盤内縁〜中域',
      zh: '银盘中内区',
      ko: '은하 원반 내·중부',
    },
    description: {
      en: 'One of the two primary spiral arms emerging directly from the near end of the Milky Way’s central stellar bar, rich in young blue O/B stars, red supergiant clusters, and H-II regions.',
      vi: 'Một trong hai nhánh xoắn ốc chính lớn nhất vươn trực tiếp từ đầu thanh chắn trung tâm Ngân Hà, dày đặc sao xanh trẻ O/B, các cụm siêu khổng lồ đỏ và vùng tạo sao H-II.',
      ja: '中心棒構造の手前側から伸びる2大主要渦状腕の1つ。若い青白色星と巨大星団が密集します。',
      zh: '从银心恒星棒近端延伸出的两大主旋臂之一，富含炽热年轻蓝白恒星、红超巨星团与电离氢区。',
      ko: '은하 중심 막대의 가까운 끝에서 뻗어 나오는 두 주 나선팔 중 하나로, 젊은 O/B형 별과 H-II 영역이 밀집해 있습니다.',
    },
    galacticLonDeg: armScutumHelio.lDeg,
    galacticLatDeg: armScutumHelio.bDeg,
    distanceFromSunKpc: armScutumHelio.distKpc,
    posKpc: armScutumPos,
    diameterLy: 52000,
    populationLabel: 'Primary Barred-Spiral Arm',
    idealInspectDistKpc: 6.5,
    accentHex: '#93c5fd',
    accentRgb: hexToRgb01('#93c5fd'),
    source: 'NASA/JPL-Caltech Spitzer GLIMPSE; Reid et al. (2019)',
  },
  {
    id: 'mw-arm:perseus',
    kind: 'spiral-arm',
    designation: 'Major Spiral Arm II',
    name: {
      en: 'Perseus Arm',
      vi: 'Nhánh Anh Tiên (Perseus Arm)',
      ja: 'ペルセウス腕',
      zh: '英仙臂',
      ko: '페르세우스 팔',
    },
    shortName: {
      en: 'Perseus Arm',
      vi: 'Nhánh Anh Tiên',
      ja: 'ペルセウス腕',
      zh: '英仙臂',
      ko: '페르세우스 팔',
    },
    classLabel: {
      en: 'Major Milky Way Spiral Arm',
      vi: 'Nhánh xoắn ốc chính Dải Ngân Hà',
      ja: '主要渦状腕',
      zh: '银河系主旋臂',
      ko: '우리 은하 주 나선팔',
    },
    regionLabel: {
      en: 'Outer–Mid Galactic Disk',
      vi: 'Đĩa giữa – ngoài Ngân Hà',
      ja: '銀河円盤中域〜外縁',
      zh: '银盘中外区',
      ko: '은하 원반 중·외곽',
    },
    description: {
      en: 'The opposite primary spiral arm sweeping outside the Solar System’s orbit, hosting the Perseus Double Cluster, Crab Nebula, and W49A starburst complex.',
      vi: 'Nhánh xoắn ốc chính đối xứng uốn lượn ngay bên ngoài quỹ đạo Hệ Mặt Trời, chứa Cụm sao đôi Perseus, Tinh vân Con Cua (M1) và vùng bùng nổ tạo sao W49A.',
      ja: '太陽系の外側を巡るもう1つの主要渦状腕。二重星団やかに星雲、W49A領域を抱えます。',
      zh: '环绕太阳系外侧运行的另一条主旋臂，孕育了英仙座双星团、蟹状星云与 W49A 星暴复合体。',
      ko: '태양계 궤도 바깥을 감싸는 또 다른 주 나선팔로, 페르세우스 이중성단, 게 성운, W49A 영역이 위치합니다.',
    },
    galacticLonDeg: armPerseusHelio.lDeg,
    galacticLatDeg: armPerseusHelio.bDeg,
    distanceFromSunKpc: armPerseusHelio.distKpc,
    posKpc: armPerseusPos,
    diameterLy: 58000,
    populationLabel: 'Primary Barred-Spiral Arm',
    idealInspectDistKpc: 6.8,
    accentHex: '#7dd3fc',
    accentRgb: hexToRgb01('#7dd3fc'),
    source: 'NASA/JPL-Caltech Spitzer GLIMPSE; Reid et al. (2019)',
  },
  {
    id: 'mw-arm:sagittarius-carina',
    kind: 'spiral-arm',
    designation: 'Secondary Spiral Arm',
    name: {
      en: 'Sagittarius–Carina Arm',
      vi: 'Nhánh Nhân Mã – Thuyền Để (Sagittarius–Carina)',
      ja: 'いて・りゅうこつ腕',
      zh: '人马–船底臂',
      ko: '궁수–용골자리 팔',
    },
    shortName: {
      en: 'Sagittarius–Carina Arm',
      vi: 'Nhánh Nhân Mã–Thuyền Để',
      ja: 'いて・りゅうこつ腕',
      zh: '人马–船底臂',
      ko: '궁수–용골자리 팔',
    },
    classLabel: {
      en: 'Secondary Spiral Arm',
      vi: 'Nhánh xoắn ốc phụ Dải Ngân Hà',
      ja: '副渦状腕',
      zh: '银河系次旋臂',
      ko: '우리 은하 부 나선팔',
    },
    regionLabel: {
      en: 'Inner Galactic Disk',
      vi: 'Đĩa trong Dải Ngân Hà',
      ja: '銀河円盤内縁',
      zh: '银盘内区',
      ko: '은하 원반 내부',
    },
    description: {
      en: 'Inner secondary spiral arm passing just inward of the Sun, famous for luminous H-II star-forming nurseries including the Carina, Eagle (M16), Omega (M17), and Lagoon (M8) nebulae.',
      vi: 'Nhánh xoắn ốc phụ nằm ngay phía trong quỹ đạo Mặt Trời, nổi tiếng với loạt tinh vân tạo sao rực rỡ như Carina, Đại Bàng (M16), Omega (M17) và Đầm Phá (M8).',
      ja: '太陽系の内側を通る副腕。カリーナ星雲や鷲星雲（M16）、干潟星雲（M8）などの星雲が集中します。',
      zh: '位于太阳系内侧的次旋臂，以船底座星云、鹰状星云（M16）、欧米茄星云（M17）与礁湖星云（M8）闻名。',
      ko: '태양계 안쪽을 지나는 부 나선팔로 용골자리·독수리(M16)·오메가(M17)·석호(M8) 성운 등 별탄생 영역이 풍부합니다.',
    },
    galacticLonDeg: armSagCarHelio.lDeg,
    galacticLatDeg: armSagCarHelio.bDeg,
    distanceFromSunKpc: armSagCarHelio.distKpc,
    posKpc: armSagCarPos,
    diameterLy: 46000,
    populationLabel: 'Gas-Rich Secondary Arm',
    idealInspectDistKpc: 6.2,
    accentHex: '#f472b6',
    accentRgb: hexToRgb01('#f472b6'),
    source: 'NASA/JPL-Caltech Spitzer GLIMPSE; Reid et al. (2019)',
  },
  {
    id: 'mw-arm:norma-outer',
    kind: 'spiral-arm',
    designation: 'Secondary Outer Spiral Arm',
    name: {
      en: 'Norma–Outer Arm',
      vi: 'Nhánh Thước Ê-ke – Ngoài (Norma–Outer)',
      ja: 'じょうぎ・外縁腕',
      zh: '矩尺–外臂',
      ko: '직각자–외곽 팔',
    },
    shortName: {
      en: 'Norma–Outer Arm',
      vi: 'Nhánh Thước–Ngoài',
      ja: 'じょうぎ・外縁腕',
      zh: '矩尺–外臂',
      ko: '직각자–외곽 팔',
    },
    classLabel: {
      en: 'Outer Secondary Spiral Arm',
      vi: 'Nhánh xoắn ốc ngoài Dải Ngân Hà',
      ja: '外縁副渦状腕',
      zh: '银河系外侧次旋臂',
      ko: '외곽 부 나선팔',
    },
    regionLabel: {
      en: 'Outer Galactic Disk Rim',
      vi: 'Vành ngoài đĩa Ngân Hà',
      ja: '銀河円盤最外縁',
      zh: '银盘最外缘',
      ko: '은하 원반 최외곽',
    },
    description: {
      en: 'Sweeps from the inner Norma region near the Galactic Bar far out into the faint hydrogen-rich outer rim of the Milky Way beyond 15 kpc.',
      vi: 'Trải dài từ vùng Norma gần thanh chắn trung tâm vươn ra tận vành đĩa ngoài giàu khí hydro lạnh của Dải Ngân Hà vượt quá 15 kpc.',
      ja: '銀心付近のじょうぎ座領域から天の川銀河の最外縁（15 kpc以遠）へと伸びる副腕です。',
      zh: '从银心附近的矩尺座内区一路蜿蜒伸展至距银心 15 kpc 以外富含中性氢的银盘最外缘。',
      ko: '은하 중심부 직각자 영역에서 시작해 15 kpc 바깥의 차가운 수소 원반 최외곽까지 뻗어 나갑니다.',
    },
    galacticLonDeg: armNormaHelio.lDeg,
    galacticLatDeg: armNormaHelio.bDeg,
    distanceFromSunKpc: armNormaHelio.distKpc,
    posKpc: armNormaPos,
    diameterLy: 55000,
    populationLabel: 'Outer Disk Spiral Arm',
    idealInspectDistKpc: 7.0,
    accentHex: '#a5b4fc',
    accentRgb: hexToRgb01('#a5b4fc'),
    source: 'NASA/JPL-Caltech Spitzer GLIMPSE; Reid et al. (2019)',
  },
];

export const ALL_MILKY_WAY_LANDMARKS: readonly MilkyWayLandmark[] = [
  ...MILKY_WAY_STAR_CLUSTERS,
  ...MILKY_WAY_SPIRAL_ARM_LANDMARKS,
];

export function getMilkyWayLandmarkById(id: string | null | undefined): MilkyWayLandmark | null {
  if (!id) return null;
  return ALL_MILKY_WAY_LANDMARKS.find((lm) => lm.id === id) ?? null;
}

export function getMilkyWayLandmarkPosM(landmark: MilkyWayLandmark): Vec3d {
  return [
    landmark.posKpc[0] * KILOPARSEC_METERS,
    landmark.posKpc[1] * KILOPARSEC_METERS,
    landmark.posKpc[2] * KILOPARSEC_METERS,
  ];
}
