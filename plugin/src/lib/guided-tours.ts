import type { WavelengthBandId } from './astrophysics-science';
import type { LanguageCode } from './i18n';
import type { ScalePresetId } from './universe-i18n';

export type GuidedTourId =
  | 'powers-of-ten'
  | 'multi-wavelength-galaxy'
  | 'gravity-and-shadows';

export interface GuidedTourStop {
  id: string;
  /** Optional catalog object ID to select & fly to (e.g. 'star-rigel', 'saturn', 'BLACK_HOLE_CORE'). */
  targetId?: string;
  /** Optional scale preset to frame (e.g. 'earth', 'solar-system', 'milky-way', 'local-group'). */
  presetId?: ScalePresetId;
  /** Optional real total solar eclipse preset ID (e.g. 'eclipse-2026'). */
  eclipsePresetId?: string;
  /** Spectral wavelength band to activate for this stop. */
  wavelengthBand: WavelengthBandId;
  /** Whether to emit the Speed-of-Light Photon Pulse (c = 299,792,458 m/s) at this stop. */
  photonPulse?: boolean;
  /** Whether to open the Inspector drawer on this stop (default false so the 3D scene stays panoramic). */
  openInspector?: boolean;
  /** Suggested auto-advance dwell duration in seconds. */
  durationSec: number;
  /** Concise physical metric readout shown in monospaced telemetry. */
  metricLabel: string;
  /** Localized chapter headline. */
  title: Record<LanguageCode, string>;
  /** Localized 2-sentence scientific commentary. */
  narrative: Record<LanguageCode, string>;
}

export interface GuidedTourDefinition {
  id: GuidedTourId;
  title: Record<LanguageCode, string>;
  subtitle: Record<LanguageCode, string>;
  badgeMetric: string;
  stops: readonly GuidedTourStop[];
}

export const GUIDED_TOURS: readonly GuidedTourDefinition[] = [
  {
    id: 'powers-of-ten',
    badgeMetric: '10⁴ m → 10²⁴ m',
    title: {
      en: 'Powers of Ten — Earth to Local Group',
      vi: 'Lũy thừa của Mười — Từ Trái Đất tới Nhóm Thiên hà Cục bộ',
      ja: 'パワーズ・オブ・テン — 地球から局所銀河群へ',
      zh: '十的次方 — 从地球到本星系群',
      ko: '10의 거듭제곱 — 지구에서 국부은하군까지',
    },
    subtitle: {
      en: 'Traverse 20+ orders of magnitude continuously in float64 SI meters.',
      vi: 'Du hành liên tục hơn 20 bậc độ lớn bằng hệ tọa độ mét SI float64.',
      ja: '倍精度SIメートル座標で20桁以上の宇宙スケールを連続移動します。',
      zh: '在双精度国际单位制米坐标中连续跨越超过20个数量级。',
      ko: '배정밀도 SI 미터 좌표계로 20자리 이상의 우주 스케일을 연속 탐험합니다.',
    },
    stops: [
      {
        id: 'p10-earth',
        presetId: 'earth',
        wavelengthBand: 'optical',
        photonPulse: false,
        durationSec: 10,
        metricLabel: 'R⊕ = 6,371 km · 1.00 AU',
        title: {
          en: '1. Earth’s Living Biosphere',
          vi: '1. Sinh quyển Sống của Trái Đất',
          ja: '1. 地球の生命圏',
          zh: '1. 地球生命圈',
          ko: '1. 지구의 생명권',
        },
        narrative: {
          en: 'Our journey begins above Earth’s Rayleigh-scattered atmosphere, rendered with real-time solar illumination, twilight terminator scattering, and live ephemeris geometry.',
          vi: 'Hành trình bắt đầu phía trên khí quyển tán xạ Rayleigh của Trái Đất, được chiếu sáng theo góc Mặt Trời thực tế và cơ học thiên thể theo thời gian thực.',
          ja: '太陽のリアルタイム入射角とレイリー散乱大気、昼夜境界線を備えた地球上空から旅が始まります。',
          zh: '旅程从地球瑞利散射大气层上空启程，实时呈现太阳晨昏线与精密星历几何。',
          ko: '실시간 태양 조명과 레일리 산란 대기, 황혼 경계선이 구현된 지구 상공에서 여정이 시작됩니다.',
        },
      },
      {
        id: 'p10-light-speed',
        presetId: 'solar-system',
        wavelengthBand: 'optical',
        photonPulse: true,
        durationSec: 12,
        metricLabel: 'c = 299,792,458 m/s · 8m 20s to Earth',
        title: {
          en: '2. The Speed of Light Across the Solar System',
          vi: '2. Tốc độ Ánh sáng Xuyên Hệ Mặt Trời',
          ja: '2. 太陽系を旅する光速の波面',
          zh: '2. 光速穿越太阳系',
          ko: '2. 태양계를 가로지르는 빛의 속도',
        },
        narrative: {
          en: 'A photon pulse expanding outward from the Sun at exact vacuum light speed reveals how vast planetary space truly is: sunlight requires 8 minutes 20 seconds just to reach Earth.',
          vi: 'Một xung photon lan truyền từ Mặt Trời ở đúng tốc độ ánh sáng chân không cho thấy không gian rộng lớn đến nhường nào: ánh sáng mất 8 phút 20 giây mới tới được Trái Đất.',
          ja: '太陽から真空光速で広がる光波面は宇宙の広大さを体感させます。地球へ届くだけでも8分20秒を要します。',
          zh: '从太阳以精确真空光速向外传播的光波前揭示了行星际空间的浩瀚：阳光抵达地球就需要8分20秒。',
          ko: '태양에서 정확한 진공 광속으로 퍼져나가는 빛 파면은 행성 간 공간의 광대함을 보여줍니다. 지구까지 도달하는 데만 8분 20초가 걸립니다.',
        },
      },
      {
        id: 'p10-rigel',
        targetId: 'star-rigel',
        wavelengthBand: 'optical',
        photonPulse: false,
        openInspector: true,
        durationSec: 11,
        metricLabel: 'Rigel (B8Ia) · 12,100 K · 120,000 L☉',
        title: {
          en: '3. Blue Supergiants of the Orion Spur',
          vi: '3. Siêu Khổng lồ Xanh của Nhánh Lạp Hộ',
          ja: '3. オリオン腕の青色超巨星リゲル',
          zh: '3. 猎户旋臂的蓝超巨星参宿七',
          ko: '3. 오리온 팔의 청색 초거성 리겔',
        },
        narrative: {
          en: 'At 860 light-years, Rigel shines 120,000 times brighter than the Sun. Inspect its position in the upper-left supergiant branch of the H-R diagram and its ultraviolet Planck peak at 239 nm.',
          vi: 'Cách 860 năm ánh sáng, Rigel sáng gấp 120.000 lần Mặt Trời. Hãy quan sát vị trí của nó ở nhánh siêu khổng lồ trên biểu đồ H-R và đỉnh bức xạ tử ngoại Planck tại 239 nm.',
          ja: '860光年先のリゲルは太陽の12万倍の明るさで輝きます。H-R図の左上超巨星領域と239 nmのプランク放射ピークを確認できます。',
          zh: '距离860光年的参宿七光度达太阳的12万倍。可在赫罗图左上超巨星区及239 nm普朗克紫外峰值处观察其辐射特征。',
          ko: '860광년 거리의 리겔은 태양보다 12만 배 밝게 빛납니다. H-R 도표 좌상단 초거성 영역과 239 nm 플랑크 자외선 피크를 확인해 보세요.',
        },
      },
      {
        id: 'p10-milky-way',
        presetId: 'milky-way',
        wavelengthBand: 'optical',
        photonPulse: false,
        durationSec: 11,
        metricLabel: 'R₀ = 8.178 kpc · ~100,000 ly disk',
        title: {
          en: '4. The Barred Spiral Milky Way',
          vi: '4. Thiên hà Xoắn ốc Có thanh Ngân Hà',
          ja: '4. 棒渦巻銀河・天の川',
          zh: '4. 棒旋银河系全景',
          ko: '4. 막대나선은하 우리은하',
        },
        narrative: {
          en: 'Zooming out to 34 kiloparsecs frames our entire barred spiral galaxy. The Solar System orbits inside the Orion Spur, 8.178 kpc from Sagittarius A* (GRAVITY Collaboration).',
          vi: 'Thu phóng ra 34 kiloparsec để bao quát toàn bộ thiên hà xoắn ốc có thanh. Hệ Mặt Trời quay trong Nhánh Lạp Hộ, cách tâm Sagittarius A* đúng 8,178 kpc.',
          ja: '34キロパーセクまで引くと棒渦巻銀河の全景が現れます。太陽系はいて座A*から8.178 kpcのオリオン腕内を公転しています。',
          zh: '拉远至34千秒差距即可俯瞰整座棒旋银河系。太阳系位于猎户支臂内，距人马座A*精确8.178千秒差距。',
          ko: '34킬로파섹 거리로 물러서면 막대나선은하 전체가 펼쳐집니다. 태양계는 궁수자리 A*에서 8.178 kpc 떨어진 오리온 팔을 공전합니다.',
        },
      },
      {
        id: 'p10-local-group',
        presetId: 'local-group',
        wavelengthBand: 'optical',
        photonPulse: false,
        durationSec: 11,
        metricLabel: 'M31 = 0.778 Mpc · Virgo = 16.5 Mpc',
        title: {
          en: '5. The Local Group & Nearby Clusters',
          vi: '5. Nhóm Thiên hà Cục bộ & Siêu đám',
          ja: '5. 局所銀河群と近傍銀河団',
          zh: '5. 本星系群与近邻星系团',
          ko: '5. 국부은하군과 인근 은하단',
        },
        narrative: {
          en: 'Beyond our halo lie the Magellanic Clouds, Andromeda (M31) at 2.54 million light-years, Triangulum (M33), and the massive Virgo and Coma galaxy clusters mapped by McConnachie & NED.',
          vi: 'Ngoài quầng Ngân Hà là hai Đám mây Magellan, thiên hà Tiên Nữ (M31) cách 2,54 triệu năm ánh sáng, M33 và các cụm thiên hà khổng lồ Virgo & Coma theo dữ liệu McConnachie & NED.',
          ja: '銀河ハローの彼方にはマゼラン雲、254万光年先のアンドロメダ銀河(M31)、さんかく座銀河(M33)、そしておとめ座・かみのけ座銀河団が広がります。',
          zh: '在银晕之外，分布着麦哲伦星云、254万光年外的仙女座星系（M31）、三角座星系（M33）以及室女座与后发座星系团。',
          ko: '은하 헤일로 너머에는 마젤란 은하, 254만 광년 거리의 안드로메다(M31), 삼각형자리 은하(M33), 그리고 처녀자리·머리털자리 은하단이 펼쳐져 있습니다.',
        },
      },
    ],
  },
  {
    id: 'multi-wavelength-galaxy',
    badgeMetric: 'OPT · IR · HI · X/γ',
    title: {
      en: 'The Multi-Wavelength Milky Way',
      vi: 'Ngân Hà Đa bước sóng (Quang học → Tia Gamma)',
      ja: '多波長で見る天の川銀河',
      zh: '多波段银河系巡天',
      ko: '다파장으로 본 우리은하',
    },
    subtitle: {
      en: 'Observe how interstellar dust vanishes and bipolar Fermi Bubbles emerge across four electromagnetic bands.',
      vi: 'Quan sát lớp bụi liên sao biến mất và cặp Bong bóng Fermi hiện hình qua bốn dải phổ điện từ.',
      ja: '4つの電磁波バンドを切り替えて星間塵の透過と双極フェルミバブルを観測します。',
      zh: '在四个电磁波段间切换，见证星际尘埃消散与双极费米气泡显现。',
      ko: '네 개의 전자기 파장대를 전환하며 성간 먼지 투과와 양극 페르미 버블을 관측합니다.',
    },
    stops: [
      {
        id: 'mw-optical',
        presetId: 'milky-way',
        wavelengthBand: 'optical',
        durationSec: 9,
        metricLabel: 'Optical · 380–750 nm · Gaia DR3',
        title: {
          en: '1. Visible Starlight & Dust Extinction',
          vi: '1. Ánh sáng Khả kiến & Dải Bụi tối',
          ja: '1. 可視光と暗黒星間塵',
          zh: '1. 可见光星光与尘埃消光带',
          ko: '1. 가시광 별빛과 암흑 먼지 띠',
        },
        narrative: {
          en: 'In visible light, young blue OB associations outline the spiral arms while dense carbon-silicate dust lanes carve dark absorbing rifts along the inner edges of each arm.',
          vi: 'Ở dải quang học, các cụm sao trẻ xanh lam phác họa nhánh xoắn ốc trong khi dải bụi dày đặc hấp thụ ánh sáng tạo thành các khe tối dọc theo rìa trong.',
          ja: '可視光では若い青いOB星団が渦状腕を縁取り、高密度な星間塵が暗い吸収帯として腕の内側を刻みます。',
          zh: '在可见光波段，年轻的蓝色OB星协勾勒出旋臂轮廓，而致密的尘埃带则在旋臂内缘刻画出暗色消光沟壑。',
          ko: '가시광선에서는 젊은 청색 OB 성협이 나선팔을 그리고, 짙은 성간 먼지 띠가 팔 안쪽을 따라 어두운 흡수선을 만듭니다.',
        },
      },
      {
        id: 'mw-infrared',
        presetId: 'milky-way',
        wavelengthBand: 'infrared',
        durationSec: 9,
        metricLabel: 'Infrared · 1.2–24 µm · 2MASS / Spitzer',
        title: {
          en: '2. Infrared Penetration Through the Bar',
          vi: '2. Hồng ngoại Xuyên qua Lớp Bụi tới Thanh Trung tâm',
          ja: '2. 赤外線で透過する銀河中心棒構造',
          zh: '2. 红外波段穿透尘埃直视银心棒',
          ko: '2. 적외선으로 투과한 은하 중심 막대',
        },
        narrative: {
          en: 'Longer infrared wavelengths pass effortlessly through opaque dust clouds, exposing the warm 27° Galactic Bar and millions of cool red giant stars concentrated in the bulge.',
          vi: 'Bước sóng hồng ngoại xuyên qua màn bụi dày đặc, phơi bày thanh trung tâm nghiêng 27° ấm nóng cùng hàng triệu sao khổng lồ đỏ tập trung ở nhân phình thiên hà.',
          ja: '波長の長い赤外線は不透明な塵を透過し、27°傾いた銀河中心棒とバルジに密集する赤色巨星群を鮮明に映し出します。',
          zh: '更长的红外波长能够穿透致密尘埃云，清晰揭示倾斜27°的银心棒结构以及核球中密集的红巨星。',
          ko: '긴 파장의 적외선은 불투명한 먼지 구름을 투과하여 27° 기울어진 은하 막대와 팽대부의 적색거성들을 선명하게 드러냅니다.',
        },
      },
      {
        id: 'mw-radio',
        presetId: 'milky-way',
        wavelengthBand: 'radio',
        durationSec: 9,
        metricLabel: 'Radio HI · 21 cm (1.42 GHz) · HI4PI',
        title: {
          en: '3. 21 cm Neutral Hydrogen Radio Emission',
          vi: '3. Sóng Vô tuyến Hydro Trung hòa 21 cm',
          ja: '3. 中性水素21 cm電波マップ',
          zh: '3. 21厘米中性氢射电图谱',
          ko: '3. 21 cm 중성수소 전파 지도',
        },
        narrative: {
          en: 'The 1.42 GHz spin-flip transition of neutral atomic hydrogen traces cold gas far beyond the visible stellar disk, providing the primary radio map of our galaxy’s outer spiral arms.',
          vi: 'Bức xạ chuyển mức spin 1,42 GHz của nguyên tử hydro trung hòa vẽ nên dòng khí lạnh vươn xa hơn hẳn đĩa sao khả kiến, là bản đồ vô tuyến chuẩn của các nhánh xoắn ốc ngoài.',
          ja: '中性水素原子の1.42 GHzスピン反転放射は可視光円盤の外側まで広がる低温ガスを追跡し、銀河外縁の渦状腕構造を描き出します。',
          zh: '中性氢原子的1.42 GHz自旋翻转谱线追踪到远超可见恒星盘范围的冷气体，是测绘银河系外旋臂的核心射电手段。',
          ko: '중성수소 원자의 1.42 GHz 스핀 반전 복사는 가시광 원반 너머까지 뻗은 차가운 가스를 추적해 외곽 나선팔의 정밀 전파 지도를 제공합니다.',
        },
      },
      {
        id: 'mw-xray-fermi',
        presetId: 'milky-way',
        wavelengthBand: 'xray',
        durationSec: 11,
        metricLabel: 'X-Ray / γ · ±8.5 kpc · Fermi-LAT / eROSITA',
        title: {
          en: '4. High-Energy Gamma-Ray Fermi Bubbles',
          vi: '4. Bong bóng Fermi Tia Gamma Năng lượng cao',
          ja: '4. 高エネルギー・フェルミバブル',
          zh: '4. 高能伽马射线费米气泡',
          ko: '4. 고에너지 감마선 페르미 버블',
        },
        narrative: {
          en: 'In X-ray and gamma-ray energies, two colossal bipolar plasma lobes—the Fermi Bubbles—tower 25,000 light-years above and below Sagittarius A*, remnants of ancient galactic-core outbursts.',
          vi: 'Ở dải tia X và gamma, hai thùy plasma lưỡng cực khổng lồ — Bong bóng Fermi — vươn cao 25.000 năm ánh sáng trên và dưới Sagittarius A*, dấu tích từ những đợt bùng phát cổ đại của lõi thiên hà.',
          ja: 'X線・ガンマ線では、いて座A*の上下それぞれ2万5千光年にそびえ立つ双極プラズマ構造「フェルミバブル」が姿を現します。',
          zh: '在X射线与伽马射线波段下，两座高达2.5万光年的双极等离子体巨泡——费米气泡——矗立于人马座A*上下两侧，记录着远古银心爆发的遗迹。',
          ko: 'X선과 감마선 대역에서는 궁수자리 A* 위아래로 각각 2만 5천 광년 솟아오른 거대 양극 플라즈마 로브 ‘페르미 버블’이 모습을 드러냅니다.',
        },
      },
    ],
  },
  {
    id: 'gravity-and-shadows',
    badgeMetric: 'Umbra · Roche · r_s',
    title: {
      en: 'Gravity, Shadows & Event Horizons',
      vi: 'Trọng lực, Bóng Nhật thực & Chân trời Sự kiện',
      ja: '重力・日食の影・事象の地平線',
      zh: '引力、日食本影与事件视界',
      ko: '중력, 일식 본영 그리고 사건의 지평선',
    },
    subtitle: {
      en: 'From a real lunar umbra crossing Earth to Saturn’s Roche rings and spacetime curvature around Sagittarius A*.',
      vi: 'Từ bóng tối Nhật thực thực tế quét qua Trái Đất tới vành đai Roche của Sao Thổ và độ cong không-thời gian quanh Sagittarius A*.',
      ja: '地球を横切る実際の月の本影から土星のロシュ限界リング、いて座A*の重力レンズまでを巡ります。',
      zh: '从掠过地球的真实月球本影，到土星洛希环与人马座A*周围的时空弯曲。',
      ko: '지구를 가로지르는 실제 달 본영에서 토성의 로슈 고리, 궁수자리 A*의 시공간 휘어짐까지 탐험합니다.',
    },
    stops: [
      {
        id: 'gs-eclipse-2026',
        eclipsePresetId: 'eclipse-2026',
        wavelengthBand: 'optical',
        durationSec: 11,
        metricLabel: '2026-08-12 17:47 UTC · 2m 18s Totality',
        title: {
          en: '1. Total Solar Eclipse — Real Lunar Umbra',
          vi: '1. Nhật thực Toàn phần — Bóng tối Umbra thực tế',
          ja: '1. 皆既日食 — 地球に落ちる月の本影',
          zh: '1. 日全食 — 真实月球本影投射',
          ko: '1. 개기일식 — 지구에 드리운 실제 달 본영',
        },
        narrative: {
          en: 'Because the Sun is ~400× larger and ~400× farther than the Moon, the lunar cone casts a razor-sharp dark umbra surrounded by a warm twilight penumbra across the North Atlantic and Spain.',
          vi: 'Nhờ Mặt Trời lớn gấp ~400 lần nhưng cũng xa hơn ~400 lần Mặt Trăng, nón bóng Mặt Trăng tạo nên vùng tối Umbra sắc nét kèm viền chạng vạng Penumbra quét qua Bắc Đại Tây Dương và Tây Ban Nha.',
          ja: '太陽の直径と距離が月の約400倍で一致する奇跡により、月の影は北大西洋とスペインに鮮明な暗黒の本影と半影を落とします。',
          zh: '太阳的直径与距离恰好约为月球的400倍，使月球阴影在大西洋北部与西班牙投下清晰的暗黑本影与暖色半影光环。',
          ko: '태양이 달보다 약 400배 크면서 동시에 400배 멀리 떨어져 있어, 달의 그림자가 북대서양과 스페인에 선명한 본영과 반그림자를 드리웁니다.',
        },
      },
      {
        id: 'gs-saturn',
        targetId: 'saturn',
        wavelengthBand: 'optical',
        durationSec: 10,
        metricLabel: 'Saturn · 9.54 AU · Roche Ring System',
        title: {
          en: '2. Saturn’s Rings & Tidal Roche Limit',
          vi: '2. Vành đai Sao Thổ & Giới hạn Thủy triều Roche',
          ja: '2. 土星の環とロシュ限界',
          zh: '2. 土星光环与潮汐洛希极限',
          ko: '2. 토성의 고리와 조석 로슈 한계',
        },
        narrative: {
          en: 'Inside Saturn’s Roche limit, tidal shear prevents water-ice particles from coalescing into a moon, sculpting razor-thin concentric ringlets divided by orbital resonances such as the Cassini Division.',
          vi: 'Bên trong giới hạn Roche của Sao Thổ, lực thủy triều ngăn các mảnh băng kết tụ thành mặt trăng, điêu khắc nên hệ thống vành đai siêu mỏng ngăn cách bởi khe cộng hưởng Cassini.',
          ja: '土星のロシュ限界の内側では潮汐力が氷粒子の合体を妨げ、カッシーニの間隙などの軌道共鳴が幾重もの繊細なリングを刻みます。',
          zh: '在土星洛希极限之内，潮汐撕裂力阻止冰粒聚合成卫星，轨道共振则雕琢出包含卡西尼缝在内的精细同心环带。',
          ko: '토성의 로슈 한계 내부에서는 조석력이 얼음 입자의 응집을 막아, 카시니 간극 같은 궤도 공명으로 나뉜 얇은 고리 구조를 빚어냅니다.',
        },
      },
      {
        id: 'gs-betelgeuse',
        targetId: 'star-betelgeuse',
        wavelengthBand: 'optical',
        openInspector: true,
        durationSec: 10,
        metricLabel: 'Betelgeuse (M1-2Ia) · 3,600 K · ~764 R☉',
        title: {
          en: '3. Betelgeuse — Red Supergiant Near Core-Collapse',
          vi: '3. Betelgeuse — Siêu Khổng lồ Đỏ cuối vòng đời',
          ja: '3. ベテルギウス — 超新星爆発を控えた赤色超巨星',
          zh: '3. 参宿四 — 临近坍缩的红超巨星',
          ko: '3. 베텔게우스 — 초신성 폭발을 앞둔 적색 초거성',
        },
        narrative: {
          en: 'Swollen wider than the orbit of Mars, Betelgeuse’s 3,600 K photosphere peaks in the near-infrared (805 nm on the Planck curve) as massive convective cells churn before its eventual supernova.',
          vi: 'Phồng to vượt quá quỹ đạo Sao Hỏa, quang cầu 3.600 K của Betelgeuse đạt đỉnh bức xạ ở cận hồng ngoại (805 nm trên phổ Planck) với các tế bào đối lưu khổng lồ trước vụ nổ siêu tân tinh tương lai.',
          ja: '火星軌道を飲み込むほど膨張したベテルギウスの3,600 K光球は、プランク曲線上で近赤外805 nmにピークを持ちます。',
          zh: '膨胀到超越火星轨道的参宿四表面温度3,600 K，其普朗克黑体辐射峰值位于近红外805 nm，正孕育着未来的超新星爆发。',
          ko: '화성 궤도보다 크게 팽창한 베텔게우스의 3,600 K 광구는 플랑크 곡선상 근적외선 805 nm에서 정점을 찍으며 초신성 폭발을 향해 진화합니다.',
        },
      },
      {
        id: 'gs-sgr-a',
        targetId: 'BLACK_HOLE_CORE',
        wavelengthBand: 'optical',
        durationSec: 12,
        metricLabel: 'Sgr A* · 4.297×10⁶ M☉ · r_s = 1.27×10¹⁰ m',
        title: {
          en: '4. Sagittarius A* — Relativistic Spacetime Lensing',
          vi: '4. Sagittarius A* — Thấu kính Hấp dẫn Tương đối tính',
          ja: '4. いて座A* — 相対論的重力レンズと事象の地平線',
          zh: '4. 人马座A* — 相对论时空引力透镜',
          ko: '4. 궁수자리 A* — 상대론적 중력 렌즈와 사건의 지평선',
        },
        narrative: {
          en: 'At the heart of the Milky Way sits a 4.3-million-solar-mass black hole. Real-time Velocity-Verlet null-geodesic raymarching bends background starlight and plasma into the asymmetric Einstein photon ring.',
          vi: 'Tại tâm Ngân Hà là hố đen nặng 4,3 triệu khối lượng Mặt Trời. Thuật toán dò tia trắc địa tương đối tính Velocity-Verlet bẻ cong ánh sáng nền và đĩa bồi tụ tạo thành vòng photon Einstein.',
          ja: '銀河系の中心には太陽430万個分の超大質量ブラックホールが潜みます。リアルタイム測地線レイマーチングが背景の星々と降着円盤をアインシュタイン環へと歪めます。',
          zh: '银河系正中央潜伏着质量达430万倍太阳的超大质量黑洞。实时测地线光线步进将背景星光与吸积盘等离子体弯曲成非对称爱因斯坦光子环。',
          ko: '우리은하 중심에는 태양 질량 430만 배의 초대질량 블랙홀이 자리합니다. 실시간 측지선 레이마칭이 배경 별빛과 강착원반을 아인슈타인 광자 고리로 휘게 만듭니다.',
        },
      },
    ],
  },
] as const;

export function getGuidedTourById(id: string): GuidedTourDefinition | null {
  return GUIDED_TOURS.find((t) => t.id === id) ?? null;
}

export function clampTourStopIndex(tour: GuidedTourDefinition, index: number): number {
  if (tour.stops.length === 0) return 0;
  return Math.max(0, Math.min(tour.stops.length - 1, Math.trunc(index)));
}

export function getNextTourStopIndex(
  tour: GuidedTourDefinition,
  currentIndex: number,
  loop = false
): number {
  if (tour.stops.length === 0) return 0;
  if (currentIndex + 1 < tour.stops.length) return currentIndex + 1;
  return loop ? 0 : tour.stops.length - 1;
}

export function getPrevTourStopIndex(
  tour: GuidedTourDefinition,
  currentIndex: number
): number {
  if (tour.stops.length === 0) return 0;
  return Math.max(0, currentIndex - 1);
}
