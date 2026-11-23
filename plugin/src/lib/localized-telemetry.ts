/**
 * Complete 5-Language Localization (en, vi, ja, zh, ko) for:
 *  - All 48 Milky Way Observatory catalog objects' physical planet/star telemetry specs
 *  - All 48 astrometry orbital/spin period labels
 *  - Extra HUD / toolbar / modal labels so ZERO Vietnamese strings ever leak when lang !== 'vi'
 */

import { LanguageCode } from './i18n';
import { getPlanetSpecForNode, MemoryNode, PlanetSpec } from './memory-types';

export interface LocalizedPlanetSpec {
  designation: string;
  planetType: string;
  diameterKm: string;
  surfaceTemp: string;
  surfaceGravity: string;
  atmosphereComposition: string;
  realInspiration: string;
  hasRings: boolean;
  earthRadiusRatio: number;
  base: PlanetSpec;
}

interface TelemetryLocaleEntry {
  designation?: string;
  planetType: string;
  diameterKm?: string;
  surfaceTemp?: string;
  surfaceGravity?: string;
  atmosphereComposition: string;
  realInspiration: string;
  orbitalPeriod: string;
}

type NonViLang = Exclude<LanguageCode, 'vi'>;

/**
 * Clean international numeric formatting helpers (avoid Vietnamese decimal commas in en/ja/zh/ko
 * and translate any embedded Vietnamese annotations in diameter/temp/gravity/designation).
 */
function sanitizeUnitsForNonVi(raw: string, lang: NonViLang): string {
  // Replace Vietnamese decimal comma inside numbers like "1,00 R⊕" -> "1.00 R⊕", "1.392.700 km" -> "1,392,700 km"
  let out = raw;
  // Convert Vietnamese thousand dots like 1.392.700 or 12.742 -> 1,392,700 or 12,742
  out = out.replace(/\b(\d{1,3})\.(\d{3})\.(\d{3})\b/g, '$1,$2,$3');
  out = out.replace(/\b(\d{1,3})\.(\d{3})\b/g, '$1,$2');
  // Convert Vietnamese decimal comma like 109,3 or 0,95 -> 109.3 or 0.95
  out = out.replace(/(\d),(\d)/g, '$1.$2');
  // Translate any residual Vietnamese qualifiers if a custom/unlisted string appears
  const replacements: Record<NonViLang, Array<[RegExp, string]>> = {
    en: [
      [/quang cầu/gi, 'photosphere'],
      [/hồ magma/gi, 'magma lakes'],
      [/vòng plasma/gi, 'plasma ring'],
      [/tia phản lực/gi, 'relativistic jet'],
      [/cận nhật/gi, 'perihelion'],
      [/đến/gi, 'to'],
      [/triệu km/gi, 'million km'],
      [/tỷ km/gi, 'billion km'],
      [/mét/gi, 'm'],
      [/lõi/gi, 'nucleus'],
      [/Cực đại tương đối tính/gi, 'Relativistic extreme'],
      [/Đường kính Chân trời/gi, 'Event Horizon Ø'],
    ],
    ja: [
      [/quang cầu/gi, '光球'],
      [/hồ magma/gi, '溶岩湖'],
      [/vòng plasma/gi, 'プラズマ環'],
      [/tia phản lực/gi, '相対論的ジェット'],
      [/cận nhật/gi, '近日点'],
      [/đến/gi, '〜'],
      [/triệu km/gi, '百万 km'],
      [/tỷ km/gi, '十億 km'],
      [/mét/gi, 'm'],
      [/lõi/gi, '核'],
      [/Cực đại tương đối tính/gi, '相対論的極限'],
      [/Đường kính Chân trời/gi, '事象の地平面径'],
    ],
    zh: [
      [/quang cầu/gi, '光球层'],
      [/hồ magma/gi, '岩浆湖'],
      [/vòng plasma/gi, '等离子体环'],
      [/tia phản lực/gi, '相对论喷流'],
      [/cận nhật/gi, '近日点'],
      [/đến/gi, '至'],
      [/triệu km/gi, '百万 km'],
      [/tỷ km/gi, '十亿 km'],
      [/mét/gi, '米'],
      [/lõi/gi, '彗核'],
      [/Cực đại tương đối tính/gi, '相对论极限'],
      [/Đường kính Chân trời/gi, '事件视界直径'],
    ],
    ko: [
      [/quang cầu/gi, '광구'],
      [/hồ magma/gi, '마그마 호수'],
      [/vòng plasma/gi, '플라즈마 고리'],
      [/tia phản lực/gi, '상대론적 제트'],
      [/cận nhật/gi, '근일점'],
      [/đến/gi, '~'],
      [/triệu km/gi, '백만 km'],
      [/tỷ km/gi, '십억 km'],
      [/mét/gi, 'm'],
      [/lõi/gi, '핵'],
      [/Cực đại tương đối tính/gi, '상대론적 극한'],
      [/Đường kính Chân trời/gi, '사건의 지평선 직경'],
    ],
  };
  for (const [re, rep] of replacements[lang]) {
    out = out.replace(re, rep);
  }
  return out;
}

/**
 * Full 48-object telemetry localization table for en, ja, zh, ko.
 * Every catalog ID in INITIAL_MEMORIES is explicitly covered.
 */
const TELEMETRY_TABLE: Record<string, Record<NonViLang, TelemetryLocaleEntry>> = {
  'star-sol': {
    en: {
      planetType: 'G2V Yellow Main-Sequence Star · Solar System',
      surfaceTemp: '5,778 K (photosphere)',
      atmosphereComposition: 'Plasma H 73.5%, He 24.9%, Corona 1–3 million K',
      realInspiration: 'NASA SDO & Parker Solar Probe · The Sun',
      orbitalPeriod: '230 Myr (around Sgr A*)',
    },
    ja: {
      planetType: 'G2V型 黄色主系列星・太陽系',
      surfaceTemp: '5,778 K（光球）',
      atmosphereComposition: 'プラズマ H 73.5%、He 24.9%、コロナ 100〜300万 K',
      realInspiration: 'NASA SDO・パーカー・ソーラー・プローブ・太陽',
      orbitalPeriod: '2.3億年（いて座A*公転）',
    },
    zh: {
      planetType: 'G2V 黄主序星 · 太阳系',
      surfaceTemp: '5,778 K（光球层）',
      atmosphereComposition: '氢等离子体 73.5%、氦 24.9%，日冕 100–300 万 K',
      realInspiration: 'NASA SDO 与帕克太阳探测器 · 太阳',
      orbitalPeriod: '2.3 亿年（绕银心 Sgr A*）',
    },
    ko: {
      planetType: 'G2V 황색 주계열성 · 태양계',
      surfaceTemp: '5,778 K (광구)',
      atmosphereComposition: '플라즈마 H 73.5%, He 24.9%, 코로나 100~300만 K',
      realInspiration: 'NASA SDO · 파커 태양 탐사선 · 태양',
      orbitalPeriod: '2.3억 년 (Sgr A* 공전)',
    },
  },
  'star-alpha-cen': {
    en: {
      planetType: 'Closest Triple Star System to the Sun',
      atmosphereComposition: 'G2V photosphere 1.6× richer in metals than the Sun',
      realInspiration: 'ESA Gaia DR3 (l=315.72°, b=-0.67°)',
      orbitalPeriod: '79.9 yr (A–B binary)',
    },
    ja: {
      planetType: '太陽系に最も近い三重連星系',
      atmosphereComposition: '太陽の1.6倍の金属量を持つG2V型光球',
      realInspiration: 'ESA Gaia DR3 (l=315.72°, b=-0.67°)',
      orbitalPeriod: '79.9年（A-B連星）',
    },
    zh: {
      planetType: '距太阳最近的三合星系统',
      atmosphereComposition: '金属丰度为太阳 1.6 倍的 G2V 型光球层',
      realInspiration: 'ESA Gaia DR3 (l=315.72°, b=-0.67°)',
      orbitalPeriod: '79.9 年（A-B 双星）',
    },
    ko: {
      planetType: '태양에서 가장 가까운 삼중성계',
      atmosphereComposition: '태양보다 금속 함량이 1.6배 높은 G2V 광구',
      realInspiration: 'ESA Gaia DR3 (l=315.72°, b=-0.67°)',
      orbitalPeriod: '79.9년 (A-B 쌍성)',
    },
  },
  'star-sirius': {
    en: {
      planetType: 'Brightest Blue-White Main-Sequence Star in the Night Sky',
      atmosphereComposition: 'Hot A1V hydrogen photosphere + white dwarf Sirius B',
      realInspiration: 'ESA Gaia DR3 (l=227.11°, b=-8.89°)',
      orbitalPeriod: '50.13 yr (with Sirius B)',
    },
    ja: {
      planetType: '夜空で最も明るい青白色主系列星',
      atmosphereComposition: '高温A1V型水素光球＋白色矮星シリウスB',
      realInspiration: 'ESA Gaia DR3 (l=227.11°, b=-8.89°)',
      orbitalPeriod: '50.13年（シリウスBとの連星）',
    },
    zh: {
      planetType: '夜空最亮蓝白色主序星',
      atmosphereComposition: '高温 A1V 氢光球层 + 白矮星伴星天狼星 B',
      realInspiration: 'ESA Gaia DR3 (l=227.11°, b=-8.89°)',
      orbitalPeriod: '50.13 年（与天狼星 B）',
    },
    ko: {
      planetType: '밤하늘에서 가장 밝은 청백색 주계열성',
      atmosphereComposition: '고온 A1V 수소 광구 + 백색왜성 시리우스 B',
      realInspiration: 'ESA Gaia DR3 (l=227.11°, b=-8.89°)',
      orbitalPeriod: '50.13년 (시리우스 B와 쌍성)',
    },
  },
  'star-vega': {
    en: {
      planetType: 'Rapidly Rotating Photometric Standard Star',
      atmosphereComposition: 'Blue-white A0V photosphere + 100 AU debris disk',
      realInspiration: 'ESA Gaia DR3 & JWST (l=67.44°, b=+19.24°)',
      orbitalPeriod: '12.5 hr (rapid spin)',
    },
    ja: {
      planetType: '高速自転する測光標準星',
      atmosphereComposition: '青白色A0V型光球＋100 AUデブリ円盤',
      realInspiration: 'ESA Gaia DR3・JWST (l=67.44°, b=+19.24°)',
      orbitalPeriod: '12.5時間（高速自転）',
    },
    zh: {
      planetType: '高速自转光度标准星',
      atmosphereComposition: '蓝白色 A0V 光球层 + 100 AU 尘埃碎屑盘',
      realInspiration: 'ESA Gaia DR3 与 JWST (l=67.44°, b=+19.24°)',
      orbitalPeriod: '12.5 小时（高速自转）',
    },
    ko: {
      planetType: '고속 자전 측광 표준성',
      atmosphereComposition: '청백색 A0V 광구 + 100 AU 먼지 원반',
      realInspiration: 'ESA Gaia DR3 · JWST (l=67.44°, b=+19.24°)',
      orbitalPeriod: '12.5시간 (고속 자전)',
    },
  },
  'star-polaris': {
    en: {
      planetType: 'Yellow Supergiant Cepheid Variable',
      atmosphereComposition: 'Pulsating yellow supergiant atmosphere (3.97-day cycle)',
      realInspiration: 'ESA Gaia DR3 (l=123.28°, b=+26.46°)',
      orbitalPeriod: '3.97 days (pulsation)',
    },
    ja: {
      planetType: '黄色超巨星・セファイド変光星',
      atmosphereComposition: '周期3.97日で脈動する黄色超巨星大気',
      realInspiration: 'ESA Gaia DR3 (l=123.28°, b=+26.46°)',
      orbitalPeriod: '3.97日（脈動周期）',
    },
    zh: {
      planetType: '黄超巨星 · 造父变星',
      atmosphereComposition: '以 3.97 天周期脉动的黄超巨星大气',
      realInspiration: 'ESA Gaia DR3 (l=123.28°, b=+26.46°)',
      orbitalPeriod: '3.97 天（脉动周期）',
    },
    ko: {
      planetType: '황색 초거성 · 세페이드 변광성',
      atmosphereComposition: '3.97일 주기로 맥동하는 황색 초거성 대기',
      realInspiration: 'ESA Gaia DR3 (l=123.28°, b=+26.46°)',
      orbitalPeriod: '3.97일 (맥동 주기)',
    },
  },
  'star-antares': {
    en: {
      planetType: 'Red Supergiant · Scorpius',
      atmosphereComposition: 'Giant convective red plasma envelope rich in silicate dust',
      realInspiration: 'ESO VLTI & Gaia (l=351.95°, b=+15.06°)',
      orbitalPeriod: '~1,200 yr (with Antares B)',
    },
    ja: {
      planetType: '赤色超巨星・さそり座',
      atmosphereComposition: 'ケイ酸塩塵に富む巨大な赤色対流プラズマ大気',
      realInspiration: 'ESO VLTI・Gaia (l=351.95°, b=+15.06°)',
      orbitalPeriod: '約1,200年（アンタレスBとの連星）',
    },
    zh: {
      planetType: '红超巨星 · 天蝎座',
      atmosphereComposition: '富含硅酸盐尘埃的巨型红色对流等离子体包层',
      realInspiration: 'ESO VLTI 与 Gaia (l=351.95°, b=+15.06°)',
      orbitalPeriod: '约 1,200 年（与心宿二 B）',
    },
    ko: {
      planetType: '적색 초거성 · 전갈자리',
      atmosphereComposition: '규산염 먼지가 풍부한 거대 적색 대류 플라즈마 외피',
      realInspiration: 'ESO VLTI · Gaia (l=351.95°, b=+15.06°)',
      orbitalPeriod: '약 1,200년 (안타레스 B와 쌍성)',
    },
  },
  'star-betelgeuse': {
    en: {
      planetType: 'Red Supergiant · Orion',
      atmosphereComposition: 'Giant plasma convection cells & crimson dust shell',
      realInspiration: 'NASA Hubble & VLBA (l=199.79°, b=-8.96°)',
      orbitalPeriod: '400 days (pulsation cycle)',
    },
    ja: {
      planetType: '赤色超巨星・オリオン座',
      atmosphereComposition: '巨大なプラズマ対流セルと赤色塵外殻',
      realInspiration: 'NASA ハッブル・VLBA (l=199.79°, b=-8.96°)',
      orbitalPeriod: '400日（脈動周期）',
    },
    zh: {
      planetType: '红超巨星 · 猎户座',
      atmosphereComposition: '巨型等离子体对流胞与红色尘埃包层',
      realInspiration: 'NASA 哈勃与 VLBA (l=199.79°, b=-8.96°)',
      orbitalPeriod: '400 天（脉动周期）',
    },
    ko: {
      planetType: '적색 초거성 · 오리온자리',
      atmosphereComposition: '거대 플라즈마 대류 세포 및 붉은 먼지 외각',
      realInspiration: 'NASA 허블 · VLBA (l=199.79°, b=-8.96°)',
      orbitalPeriod: '400일 (맥동 주기)',
    },
  },
  'star-rigel': {
    en: {
      planetType: 'Luminous Blue Supergiant (120,000 L☉)',
      atmosphereComposition: 'Intense B8Ia ultraviolet stellar wind',
      realInspiration: 'ESA Gaia / VLBA (l=209.24°, b=-25.25°)',
      orbitalPeriod: 'Orion OB1 quadruple system',
    },
    ja: {
      planetType: '超高光度青色超巨星 (120,000 L☉)',
      atmosphereComposition: '強烈なB8Ia型紫外線恒星風',
      realInspiration: 'ESA Gaia / VLBA (l=209.24°, b=-25.25°)',
      orbitalPeriod: 'オリオンOB1四重星系',
    },
    zh: {
      planetType: '极亮蓝超巨星 (120,000 L☉)',
      atmosphereComposition: '极强 B8Ia 型紫外恒星风',
      realInspiration: 'ESA Gaia / VLBA (l=209.24°, b=-25.25°)',
      orbitalPeriod: '猎户座 OB1 四合星系统',
    },
    ko: {
      planetType: '초고광도 청색 초거성 (120,000 L☉)',
      atmosphereComposition: '강력한 B8Ia 자외선 항성풍',
      realInspiration: 'ESA Gaia / VLBA (l=209.24°, b=-25.25°)',
      orbitalPeriod: '오리온 OB1 사중성계',
    },
  },
  'star-uy-scuti': {
    en: {
      planetType: 'Red Hypergiant · Scutum–Centaurus Arm',
      atmosphereComposition: 'Enormous convective gas-dust envelope with rapid mass loss',
      realInspiration: 'ESA Gaia DR3 Revised (l=18.57°, b=-0.30°)',
      orbitalPeriod: '740 days (semiregular variable)',
    },
    ja: {
      planetType: '赤色極超巨星・たて・ケンタウルス腕',
      atmosphereComposition: '激しい質量放出を伴う巨大なガス・塵対流外層',
      realInspiration: 'ESA Gaia DR3 改訂値 (l=18.57°, b=-0.30°)',
      orbitalPeriod: '740日（半規則変光星）',
    },
    zh: {
      planetType: '红特超巨星 · 盾牌-半人马臂',
      atmosphereComposition: '剧烈质量损失的巨型对流气体尘埃包层',
      realInspiration: 'ESA Gaia DR3 修订数据 (l=18.57°, b=-0.30°)',
      orbitalPeriod: '740 天（半规则变星）',
    },
    ko: {
      planetType: '적색 극대거성 · 방패-센타우루스팔',
      atmosphereComposition: '격렬한 질량 손실을 동반하는 거대 가스·먼지 외피',
      realInspiration: 'ESA Gaia DR3 개정치 (l=18.57°, b=-0.30°)',
      orbitalPeriod: '740일 (반규칙 변광성)',
    },
  },
  'astro-ocean-01': {
    en: {
      planetType: 'Terrestrial Ocean Planet · Solar System',
      atmosphereComposition: 'N₂ 78%, O₂ 21%, Ar 0.9%, liquid H₂O cloud decks',
      realInspiration: 'NASA Blue Marble · Earth (Solar System)',
      orbitalPeriod: '365.256 days',
    },
    ja: {
      planetType: '地球型海洋惑星・太陽系',
      atmosphereComposition: 'N₂ 78%、O₂ 21%、Ar 0.9%、水蒸気雲層',
      realInspiration: 'NASA ブルーマーブル・地球（太陽系）',
      orbitalPeriod: '365.256日',
    },
    zh: {
      planetType: '类地海洋行星 · 太阳系',
      atmosphereComposition: 'N₂ 78%、O₂ 21%、Ar 0.9%，液态水云层',
      realInspiration: 'NASA 蓝色弹珠 · 地球（太阳系）',
      orbitalPeriod: '365.256 天',
    },
    ko: {
      planetType: '지구형 해양 행성 · 태양계',
      atmosphereComposition: 'N₂ 78%, O₂ 21%, Ar 0.9%, 수증기 구름층',
      realInspiration: 'NASA 블루 마블 · 지구 (태양계)',
      orbitalPeriod: '365.256일',
    },
  },
  'astro-ocean-02': {
    en: {
      planetType: 'Rocky & Oceanic Super-Earth',
      atmosphereComposition: 'Dense N₂, O₂, CO₂ with convective H₂O clouds',
      realInspiration: 'NASA Kepler Mission · Cygnus',
      orbitalPeriod: '384.8 days',
    },
    ja: {
      planetType: '岩石・海洋スーパーアース',
      atmosphereComposition: '濃密な N₂・O₂・CO₂ と対流性水蒸気雲',
      realInspiration: 'NASA ケプラー計画・はくちょう座',
      orbitalPeriod: '384.8日',
    },
    zh: {
      planetType: '岩石与海洋超级地球',
      atmosphereComposition: '致密 N₂、O₂、CO₂ 与对流水汽云层',
      realInspiration: 'NASA 开普勒任务 · 天鹅座',
      orbitalPeriod: '384.8 天',
    },
    ko: {
      planetType: '암석·해양 슈퍼지구',
      atmosphereComposition: '조밀한 N₂, O₂, CO₂ 및 대류성 수증기 구름',
      realInspiration: 'NASA 케플러 미션 · 백조자리',
      orbitalPeriod: '384.8일',
    },
  },
  'astro-ocean-03': {
    en: {
      planetType: 'Habitable-Zone Rocky Planet',
      atmosphereComposition: 'Secondary N₂ / CO₂ atmosphere · Liquid ocean candidate',
      realInspiration: 'NASA Spitzer & JWST · TRAPPIST-1 System',
      orbitalPeriod: '6.10 days',
    },
    ja: {
      planetType: 'ハビタブルゾーン岩石惑星',
      atmosphereComposition: '二次 N₂/CO₂ 大気・液体の海候補',
      realInspiration: 'NASA スピッツァー・JWST・TRAPPIST-1系',
      orbitalPeriod: '6.10日',
    },
    zh: {
      planetType: '宜居带类地岩石行星',
      atmosphereComposition: '次生 N₂ / CO₂ 大气 · 液态海洋候选体',
      realInspiration: 'NASA 斯皮策与 JWST · TRAPPIST-1 系统',
      orbitalPeriod: '6.10 天',
    },
    ko: {
      planetType: '생명체 거주 가능 영역 암석 행성',
      atmosphereComposition: '2차 N₂ / CO₂ 대기 · 액체 바다 후보',
      realInspiration: 'NASA 스피처 · JWST · TRAPPIST-1계',
      orbitalPeriod: '6.10일',
    },
  },
  'astro-ocean-04': {
    en: {
      planetType: 'Hycean Ocean World (Sub-Neptune)',
      atmosphereComposition: 'H₂-rich envelope with detected CH₄ & CO₂',
      realInspiration: 'NASA JWST NIRISS / NIRSpec · Leo',
      orbitalPeriod: '32.94 days',
    },
    ja: {
      planetType: 'ハイシアン海洋惑星（サブネプチューン）',
      atmosphereComposition: '水素主体の大気中に CH₄・CO₂ を検出',
      realInspiration: 'NASA JWST NIRISS / NIRSpec・しし座',
      orbitalPeriod: '32.94日',
    },
    zh: {
      planetType: '氢海行星（亚海王星）',
      atmosphereComposition: '富氢大气层，已探测到 CH₄ 与 CO₂',
      realInspiration: 'NASA JWST NIRISS / NIRSpec · 狮子座',
      orbitalPeriod: '32.94 天',
    },
    ko: {
      planetType: '하이시안 해양 행성 (서브-해왕성)',
      atmosphereComposition: '수소 풍부 대기, CH₄ 및 CO₂ 검출',
      realInspiration: 'NASA JWST NIRISS / NIRSpec · 사자자리',
      orbitalPeriod: '32.94일',
    },
  },
  'astro-ocean-05': {
    en: {
      planetType: 'Global Ocean World',
      atmosphereComposition: 'Dense water vapor, N₂, cyclonic ocean cloud bands',
      realInspiration: 'NASA Kepler Telescope · Cygnus',
      orbitalPeriod: '289.9 days',
    },
    ja: {
      planetType: '全球海洋惑星',
      atmosphereComposition: '濃密な水蒸気・N₂・渦巻く海洋雲帯',
      realInspiration: 'NASA ケプラー宇宙望遠鏡・はくちょう座',
      orbitalPeriod: '289.9日',
    },
    zh: {
      planetType: '全球海洋世界',
      atmosphereComposition: '致密水蒸气、N₂ 及海洋气旋云带',
      realInspiration: 'NASA 开普勒望远镜 · 天鹅座',
      orbitalPeriod: '289.9 天',
    },
    ko: {
      planetType: '전 지구 해양 행성',
      atmosphereComposition: '고밀도 수증기, N₂, 해양 소용돌이 구름대',
      realInspiration: 'NASA 케플러 망원경 · 백조자리',
      orbitalPeriod: '289.9일',
    },
  },
  'astro-ocean-06': {
    en: {
      planetType: 'Earth-Sized Rocky Planet Orbiting a Red Dwarf',
      atmosphereComposition: 'N₂, CO₂-rich greenhouse warming envelope',
      realInspiration: 'NASA Ames Research Center · Kepler-186',
      orbitalPeriod: '129.9 days',
    },
    ja: {
      planetType: '赤色矮星を公転する地球サイズ岩石惑星',
      atmosphereComposition: '温室効果をもたらす N₂・CO₂ 主体大気',
      realInspiration: 'NASA エイムズ研究センター・Kepler-186',
      orbitalPeriod: '129.9日',
    },
    zh: {
      planetType: '绕红矮星运行的地球尺寸岩石行星',
      atmosphereComposition: '富含温室效应气体的 N₂ / CO₂ 大气',
      realInspiration: 'NASA 艾姆斯研究中心 · Kepler-186',
      orbitalPeriod: '129.9 天',
    },
    ko: {
      planetType: '적색왜성 공전 지구 크기 암석 행성',
      atmosphereComposition: '온실 효과를 유지하는 N₂, CO₂ 풍부 대기',
      realInspiration: 'NASA 에임스 연구센터 · Kepler-186',
      orbitalPeriod: '129.9일',
    },
  },
  'astro-gas-01': {
    en: {
      planetType: 'Gas Giant with Colossal 37-Ring System',
      atmosphereComposition: 'H₂ 90%, He 9%, dusty-icy circumplanetary disk',
      realInspiration: 'SuperWASP / Leiden Observatory · Centaurus',
      orbitalPeriod: '~11 yr',
    },
    ja: {
      planetType: '巨大な37重環系を持つ巨大ガス惑星',
      atmosphereComposition: 'H₂ 90%、He 9%、塵と氷の周惑星円盤',
      realInspiration: 'SuperWASP / ライデン天文台・ケンタウルス座',
      orbitalPeriod: '約11年',
    },
    zh: {
      planetType: '拥有 37 重巨型星环的气态巨行星',
      atmosphereComposition: 'H₂ 90%、He 9%，尘埃与水冰周行星盘',
      realInspiration: 'SuperWASP / 莱顿天文台 · 半人马座',
      orbitalPeriod: '约 11 年',
    },
    ko: {
      planetType: '초거대 37중 고리 가스 행성',
      atmosphereComposition: 'H₂ 90%, He 9%, 먼지·얼음 행성 주위 원반',
      realInspiration: 'SuperWASP / 라이덴 천문대 · 센타우루스자리',
      orbitalPeriod: '약 11년',
    },
  },
  'astro-gas-02': {
    en: {
      planetType: 'Ringed Gas Giant · Solar System',
      atmosphereComposition: 'H₂ 96.3%, He 3.25%, golden-cream NH₃ crystal hazes',
      realInspiration: 'NASA Cassini–Huygens · Saturn',
      orbitalPeriod: '29.45 yr',
    },
    ja: {
      planetType: '氷の環を持つ巨大ガス惑星・太陽系',
      atmosphereComposition: 'H₂ 96.3%、He 3.25%、淡黄色の NH₃ 氷晶雲',
      realInspiration: 'NASA カッシーニ・ホイヘンス・土星',
      orbitalPeriod: '29.45年',
    },
    zh: {
      planetType: '冰环气态巨行星 · 太阳系',
      atmosphereComposition: 'H₂ 96.3%、He 3.25%，淡金色 NH₃ 冰晶云',
      realInspiration: 'NASA 卡西尼-惠更斯号 · 土星',
      orbitalPeriod: '29.45 年',
    },
    ko: {
      planetType: '얼음 고리 가스 거인 · 태양계',
      atmosphereComposition: 'H₂ 96.3%, He 3.25%, 크림색 NH₃ 결정 구름',
      realInspiration: 'NASA 카시니-호이겐스 · 토성',
      orbitalPeriod: '29.45년',
    },
  },
  'astro-gas-03': {
    en: {
      planetType: 'Largest Planet in the Solar System',
      atmosphereComposition: 'H₂ 89.8%, He 10.2%, ammonia storm bands & Great Red Spot',
      realInspiration: 'NASA Juno & Hubble · Jupiter (Great Red Spot)',
      orbitalPeriod: '11.86 yr',
    },
    ja: {
      planetType: '太陽系最大の巨大ガス惑星',
      atmosphereComposition: 'H₂ 89.8%、He 10.2%、アンモニア縞模様と大赤斑',
      realInspiration: 'NASA ジュノー・ハッブル・木星（大赤斑）',
      orbitalPeriod: '11.86年',
    },
    zh: {
      planetType: '太阳系最大行星',
      atmosphereComposition: 'H₂ 89.8%、He 10.2%，氨云风暴带与大红斑',
      realInspiration: 'NASA 朱诺号与哈勃 · 木星（大红斑）',
      orbitalPeriod: '11.86 年',
    },
    ko: {
      planetType: '태양계 최대 행성',
      atmosphereComposition: 'H₂ 89.8%, He 10.2%, 암모니아 폭풍대 및 대적점',
      realInspiration: 'NASA 주노 · 허블 · 목성 (대적점)',
      orbitalPeriod: '11.86년',
    },
  },
  'astro-gas-04': {
    en: {
      planetType: 'Cobalt-Blue Hot Jupiter · Molten Glass Rain',
      atmosphereComposition: 'H₂, He, supersonic silicate glass-particle clouds',
      realInspiration: 'NASA Hubble & JWST · Vulpecula',
      orbitalPeriod: '2.22 days',
    },
    ja: {
      planetType: 'コバルトブルーのホットジュピター・ガラスの雨',
      atmosphereComposition: 'H₂・He・超音速のケイ酸塩ガラス微粒子雲',
      realInspiration: 'NASA ハッブル・JWST・こぎつね座',
      orbitalPeriod: '2.22日',
    },
    zh: {
      planetType: '钴蓝色热木星 · 玻璃雨行星',
      atmosphereComposition: 'H₂、He，超音速硅酸盐玻璃颗粒云层',
      realInspiration: 'NASA 哈勃与 JWST · 狐狸座',
      orbitalPeriod: '2.22 天',
    },
    ko: {
      planetType: '코발트블루 뜨거운 목성 · 유리 비',
      atmosphereComposition: 'H₂, He, 초음속 규산염 유리 입자 구름',
      realInspiration: 'NASA 허블 · JWST · 여우자리',
      orbitalPeriod: '2.22일',
    },
  },
  'astro-gas-05': {
    en: {
      planetType: 'Tidally Distorted Ultra-Hot Jupiter',
      atmosphereComposition: 'Atomic H₂ & heavy-metal vapor absorbing 94% of starlight',
      realInspiration: 'NASA Hubble Cosmic Origins · Auriga',
      orbitalPeriod: '1.09 days',
    },
    ja: {
      planetType: '潮汐変形したウルトラホットジュピター',
      atmosphereComposition: '星の光を94%吸収する原子水素と重金属蒸気',
      realInspiration: 'NASA ハッブル COS・ぎょしゃ座',
      orbitalPeriod: '1.09日',
    },
    zh: {
      planetType: '潮汐变形超热木星',
      atmosphereComposition: '吸收 94% 恒星光的原子氢与重金属蒸汽',
      realInspiration: 'NASA 哈勃宇宙起源光谱仪 · 御夫座',
      orbitalPeriod: '1.09 天',
    },
    ko: {
      planetType: '조석 변형 초고온 목성',
      atmosphereComposition: '항성 빛 94%를 흡수하는 원자 수소 및 중금속 증기',
      realInspiration: 'NASA 허블 COS · 마차부자리',
      orbitalPeriod: '1.09일',
    },
  },
  'astro-gas-06': {
    en: {
      planetType: 'Gas Giant in an 8-Planet System',
      atmosphereComposition: 'H₂, He, water vapor clouds & NH₃ crystals',
      realInspiration: 'NASA Kepler + AI Discovery · Draco',
      orbitalPeriod: '331.6 days',
    },
    ja: {
      planetType: '8惑星系の巨大ガス惑星',
      atmosphereComposition: 'H₂・He・水蒸気雲と NH₃ 結晶層',
      realInspiration: 'NASA ケプラー・りゅう座',
      orbitalPeriod: '331.6日',
    },
    zh: {
      planetType: '八行星系统气态巨行星',
      atmosphereComposition: 'H₂、He，水汽云层与 NH₃ 冰晶',
      realInspiration: 'NASA 开普勒 · 天龙座',
      orbitalPeriod: '331.6 天',
    },
    ko: {
      planetType: '8행성계 가스 거인',
      atmosphereComposition: 'H₂, He, 수증기 구름 및 NH₃ 결정층',
      realInspiration: 'NASA 케플러 · 용자리',
      orbitalPeriod: '331.6일',
    },
  },
  'astro-lava-01': {
    en: {
      planetType: 'Magma-Ocean Super-Earth with CO₂ Atmosphere',
      atmosphereComposition: 'CO & CO₂ outgassed from a global silicate lava ocean',
      realInspiration: 'NASA JWST 2024 Observation · Cancer',
      orbitalPeriod: '17.7 hr',
    },
    ja: {
      planetType: 'マグマオーシャン＆CO₂大気スーパーアース',
      atmosphereComposition: 'ケイ酸塩溶岩海から放出される CO・CO₂',
      realInspiration: 'NASA JWST 2024年観測・かに座',
      orbitalPeriod: '17.7時間',
    },
    zh: {
      planetType: '岩浆海与 CO₂ 大气超级地球',
      atmosphereComposition: '由全球硅酸盐岩浆海释放的 CO 与 CO₂',
      realInspiration: 'NASA JWST 2024 观测 · 巨蟹座',
      orbitalPeriod: '17.7 小时',
    },
    ko: {
      planetType: '마그마 바다·CO₂ 대기 슈퍼지구',
      atmosphereComposition: '규산염 용암 바다에서 방출된 CO, CO₂',
      realInspiration: 'NASA JWST 2024 관측 · 게자리',
      orbitalPeriod: '17.7시간',
    },
  },
  'astro-lava-02': {
    en: {
      planetType: 'Silicate Rock-Rain World & 100 km Magma Sea',
      atmosphereComposition: 'Supersonic 5,000 km/h Na, SiO, SiO₂ rock-vapor winds',
      realInspiration: 'NASA K2 & Spitzer · Aquarius',
      orbitalPeriod: '6.7 hr',
    },
    ja: {
      planetType: 'ケイ酸塩の石の雨＆深さ100 kmの溶岩海惑星',
      atmosphereComposition: '時速5,000 kmの超音速 Na・SiO・SiO₂ 岩石蒸気風',
      realInspiration: 'NASA K2・スピッツァー・みずがめ座',
      orbitalPeriod: '6.7時間',
    },
    zh: {
      planetType: '硅酸盐岩雨与百公里岩浆海世界',
      atmosphereComposition: '时速 5,000 公里的超音速 Na、SiO、SiO₂ 岩石蒸汽风',
      realInspiration: 'NASA K2 与斯皮策 · 宝瓶座',
      orbitalPeriod: '6.7 小时',
    },
    ko: {
      planetType: '규산염 돌비·100 km 마그마 바다 행성',
      atmosphereComposition: '시속 5,000 km 초음속 Na, SiO, SiO₂ 암석 증기풍',
      realInspiration: 'NASA K2 · 스피처 · 물병자리',
      orbitalPeriod: '6.7시간',
    },
  },
  'astro-lava-03': {
    en: {
      planetType: 'Hottest Known Gas Giant in the Universe',
      atmosphereComposition: 'Free atomic Iron (Fe) & Titanium (Ti) vapor at 4,600 K',
      realInspiration: 'NASA Spitzer & TESS · Cygnus',
      orbitalPeriod: '1.48 days',
    },
    ja: {
      planetType: '既知で宇宙最高温の巨大ガス惑星',
      atmosphereComposition: '4,600 K の遊離鉄 (Fe)・チタン (Ti) 原子蒸気',
      realInspiration: 'NASA スピッツァー・TESS・はくちょう座',
      orbitalPeriod: '1.48日',
    },
    zh: {
      planetType: '已知宇宙最炽热气态巨行星',
      atmosphereComposition: '4,600 K 自由原子铁 (Fe) 与钛 (Ti) 金属蒸汽',
      realInspiration: 'NASA 斯皮策与 TESS · 天鹅座',
      orbitalPeriod: '1.48 天',
    },
    ko: {
      planetType: '알려진 우주 최고온 가스 거인',
      atmosphereComposition: '4,600 K 자유 원자 철(Fe) 및 티타늄(Ti) 증기',
      realInspiration: 'NASA 스피처 · TESS · 백조자리',
      orbitalPeriod: '1.48일',
    },
  },
  'astro-lava-04': {
    en: {
      planetType: 'Volcanic Moon · Jovian System',
      surfaceTemp: '130 K – 1,600 K (magma lakes)',
      atmosphereComposition: 'Tenuous SO₂ from 400 continuously active volcanoes',
      realInspiration: 'NASA Juno 2024 Flyby · Moon Io',
      orbitalPeriod: '1.77 days (around Jupiter)',
    },
    ja: {
      planetType: '火山衛星・木星系',
      surfaceTemp: '130 K – 1,600 K（溶岩湖）',
      atmosphereComposition: '400以上の活火山が噴出する希薄な SO₂ 大気',
      realInspiration: 'NASA ジュノー 2024年接近・衛星イオ',
      orbitalPeriod: '1.77日（木星公転）',
    },
    zh: {
      planetType: '火山卫星 · 木星系统',
      surfaceTemp: '130 K – 1,600 K（岩浆湖）',
      atmosphereComposition: '来自 400 座持续喷发火山的稀薄 SO₂ 大气',
      realInspiration: 'NASA 朱诺号 2024 飞掠 · 木卫一',
      orbitalPeriod: '1.77 天（绕木星）',
    },
    ko: {
      planetType: '화산 위성 · 목성계',
      surfaceTemp: '130 K – 1,600 K (마그마 호수)',
      atmosphereComposition: '400개 활화산에서 분출되는 희박한 SO₂ 대기',
      realInspiration: 'NASA 주노 2024 근접 통과 · 위성 이오',
      orbitalPeriod: '1.77일 (목성 공전)',
    },
  },
  'astro-lava-05': {
    en: {
      planetType: 'Rocky Pulsar Planet Orbiting a Neutron Star',
      atmosphereComposition: 'Intense X-ray radiation & relativistic pulsar particle wind',
      realInspiration: 'Arecibo Observatory 1992 · Virgo',
      orbitalPeriod: '66.54 days',
    },
    ja: {
      planetType: '中性子星パルサーを公転する岩石惑星',
      atmosphereComposition: 'パルサーからの強烈なX線と相対論的粒子風',
      realInspiration: 'アレシボ天文台 1992年・おとめ座',
      orbitalPeriod: '66.54日',
    },
    zh: {
      planetType: '绕脉冲中子星运行的岩石行星',
      atmosphereComposition: '来自脉冲星的强 X 射线辐射与相对论粒子风',
      realInspiration: '阿雷西博天文台 1992 · 室女座',
      orbitalPeriod: '66.54 天',
    },
    ko: {
      planetType: '중성자별 펄서 공전 암석 행성',
      atmosphereComposition: '펄서의 강렬한 X선 복사 및 상대론적 입자풍',
      realInspiration: '아레시보 천문대 1992 · 처녀자리',
      orbitalPeriod: '66.54일',
    },
  },
  'astro-lava-06': {
    en: {
      planetType: 'Runaway-Greenhouse Rocky Planet · Solar System',
      atmosphereComposition: 'CO₂ 96.5%, N₂ 3.5%, sulfuric acid (H₂SO₄) cloud deck',
      realInspiration: 'NASA Magellan & JAXA Akatsuki · Venus',
      orbitalPeriod: '224.7 days',
    },
    ja: {
      planetType: '暴走温室効果の岩石惑星・太陽系',
      atmosphereComposition: 'CO₂ 96.5%、N₂ 3.5%、硫酸 (H₂SO₄) の厚い雲層',
      realInspiration: 'NASA マゼラン・JAXA あかつき・金星',
      orbitalPeriod: '224.7日',
    },
    zh: {
      planetType: '极端温室岩石行星 · 太阳系',
      atmosphereComposition: 'CO₂ 96.5%、N₂ 3.5%，浓密硫酸 (H₂SO₄) 云层',
      realInspiration: 'NASA 麦哲伦号与 JAXA 拂晓号 · 金星',
      orbitalPeriod: '224.7 天',
    },
    ko: {
      planetType: '극한 온실 암석 행성 · 태양계',
      atmosphereComposition: 'CO₂ 96.5%, N₂ 3.5%, 황산(H₂SO₄) 구름층',
      realInspiration: 'NASA 마젤란 · JAXA 아카츠키 · 금성',
      orbitalPeriod: '224.7일',
    },
  },
  'astro-ice-01': {
    en: {
      planetType: 'The Red Planet · Solar System',
      atmosphereComposition: 'CO₂ 95.3%, N₂ 2.6%, iron-oxide dust & CO₂ polar caps',
      realInspiration: 'NASA Perseverance & MRO · Mars',
      orbitalPeriod: '686.98 days',
    },
    ja: {
      planetType: '赤い惑星・太陽系',
      atmosphereComposition: 'CO₂ 95.3%、N₂ 2.6%、酸化鉄塵と CO₂ 極冠',
      realInspiration: 'NASA パーサヴィアランス・MRO・火星',
      orbitalPeriod: '686.98日',
    },
    zh: {
      planetType: '红色行星 · 太阳系',
      atmosphereComposition: 'CO₂ 95.3%、N₂ 2.6%，氧化铁尘埃与干冰极冠',
      realInspiration: 'NASA 毅力号与 MRO · 火星',
      orbitalPeriod: '686.98 天',
    },
    ko: {
      planetType: '붉은 행성 · 태양계',
      atmosphereComposition: 'CO₂ 95.3%, N₂ 2.6%, 산화철 먼지 및 CO₂ 극관',
      realInspiration: 'NASA 퍼서비어런스 · MRO · 화성',
      orbitalPeriod: '686.98일',
    },
  },
  'astro-ice-02': {
    en: {
      planetType: 'Methane Ice Giant · Solar System',
      atmosphereComposition: 'H₂ 80%, He 19%, azure CH₄ haze & 2,100 km/h winds',
      realInspiration: 'NASA Voyager 2 & JWST · Neptune',
      orbitalPeriod: '164.8 yr',
    },
    ja: {
      planetType: 'メタン巨大氷惑星・太陽系',
      atmosphereComposition: 'H₂ 80%、He 19%、青い CH₄ 霞と時速2,100 kmの暴風',
      realInspiration: 'NASA ボイジャー2・JWST・海王星',
      orbitalPeriod: '164.8年',
    },
    zh: {
      planetType: '甲烷冰巨星 · 太阳系',
      atmosphereComposition: 'H₂ 80%、He 19%，湛蓝 CH₄ 与 2,100 km/h 狂风',
      realInspiration: 'NASA 旅行者 2 号与 JWST · 海王星',
      orbitalPeriod: '164.8 年',
    },
    ko: {
      planetType: '메탄 얼음 거인 · 태양계',
      atmosphereComposition: 'H₂ 80%, He 19%, 푸른 CH₄ 및 시속 2,100 km 강풍',
      realInspiration: 'NASA 보이저 2호 · JWST · 해왕성',
      orbitalPeriod: '164.8년',
    },
  },
  'astro-ice-03': {
    en: {
      planetType: '98° Axially Tilted Ice Giant · Solar System',
      atmosphereComposition: 'H₂ 83%, He 15%, cyan-turquoise CH₄ 2.3%',
      realInspiration: 'NASA Voyager 2 & JWST 2023 Rings · Uranus',
      orbitalPeriod: '84.02 yr',
    },
    ja: {
      planetType: '赤道傾斜角98°の巨大氷惑星・太陽系',
      atmosphereComposition: 'H₂ 83%、He 15%、青緑色の CH₄ 2.3%',
      realInspiration: 'NASA ボイジャー2・JWST 2023年環・天王星',
      orbitalPeriod: '84.02年',
    },
    zh: {
      planetType: '自转倾角 98° 冰巨星 · 太阳系',
      atmosphereComposition: 'H₂ 83%、He 15%，青蓝色 CH₄ 2.3%',
      realInspiration: 'NASA 旅行者 2 号与 JWST 2023 星环 · 天王星',
      orbitalPeriod: '84.02 年',
    },
    ko: {
      planetType: '98° 기울어진 얼음 거인 · 태양계',
      atmosphereComposition: 'H₂ 83%, He 15%, 청록색 CH₄ 2.3%',
      realInspiration: 'NASA 보이저 2호 · JWST 2023 고리 · 천왕성',
      orbitalPeriod: '84.02년',
    },
  },
  'astro-ice-04': {
    en: {
      planetType: 'Subsurface-Ocean Icy Moon · Jovian System',
      atmosphereComposition: 'Tenuous O₂ exosphere; fractured Lineae ice shell over 100 km ocean',
      realInspiration: 'NASA Europa Clipper Mission · Moon Europa',
      orbitalPeriod: '3.55 days (around Jupiter)',
    },
    ja: {
      planetType: '地下海を持つ氷衛星・木星系',
      atmosphereComposition: '極薄 O₂ 外気圏、深さ100 kmの海を覆う線状亀裂氷殻',
      realInspiration: 'NASA エウロパ・クリッパー計画・衛星エウロパ',
      orbitalPeriod: '3.55日（木星公転）',
    },
    zh: {
      planetType: '冰下海洋卫星 · 木星系统',
      atmosphereComposition: '极稀薄 O₂ 外逸层，裂纹冰壳下覆盖 100 公里深海',
      realInspiration: 'NASA 欧罗巴快船任务 · 木卫二',
      orbitalPeriod: '3.55 天（绕木星）',
    },
    ko: {
      planetType: '지하 바다 얼음 위성 · 목성계',
      atmosphereComposition: '희박한 O₂ 외기권, 100 km 심해를 덮은 균열 얼음 지각',
      realInspiration: 'NASA 유로파 클리퍼 · 위성 유로파',
      orbitalPeriod: '3.55일 (목성 공전)',
    },
  },
  'astro-ice-05': {
    en: {
      planetType: 'Liquid-Methane Sea Moon · Saturnian System',
      atmosphereComposition: 'N₂ 95%, CH₄ 5%, amber organic tholin haze',
      realInspiration: 'NASA Cassini–Huygens & Dragonfly · Titan',
      orbitalPeriod: '15.95 days (around Saturn)',
    },
    ja: {
      planetType: '液体メタンの海を持つ衛星・土星系',
      atmosphereComposition: 'N₂ 95%、CH₄ 5%、琥珀色の有機ソリン霞',
      realInspiration: 'NASA カッシーニ・ホイヘンス・ドラゴンフライ・タイタン',
      orbitalPeriod: '15.95日（土星公転）',
    },
    zh: {
      planetType: '液态甲烷海卫星 · 土星系统',
      atmosphereComposition: 'N₂ 95%、CH₄ 5%，琥珀色有机托林霾层',
      realInspiration: 'NASA 卡西尼-惠更斯与蜻蜓号 · 土卫六',
      orbitalPeriod: '15.95 天（绕土星）',
    },
    ko: {
      planetType: '액체 메탄 바다 위성 · 토성계',
      atmosphereComposition: 'N₂ 95%, CH₄ 5%, 호박색 유기 톨린 연무',
      realInspiration: 'NASA 카시니-호이겐스 · 드래곤플라이 · 타이탄',
      orbitalPeriod: '15.95일 (토성 공전)',
    },
  },
  'astro-ice-06': {
    en: {
      planetType: 'Cryogenic Ice Super-Earth Near Galactic Core',
      atmosphereComposition: 'Permanently frozen N₂ & CH₄ surface at -220°C',
      realInspiration: 'ESO / OGLE Microlensing · Galactic Bulge',
      orbitalPeriod: '~10 yr',
    },
    ja: {
      planetType: '銀河中心近傍の極寒氷スーパーアース',
      atmosphereComposition: '-220°C で永久凍結した N₂・CH₄ 地表',
      realInspiration: 'ESO / OGLE 重力マイクロレンズ・銀河バルジ',
      orbitalPeriod: '約10年',
    },
    zh: {
      planetType: '银心附近极寒冰冻超级地球',
      atmosphereComposition: '-220°C 下永久冻结的 N₂ 与 CH₄ 冰层',
      realInspiration: 'ESO / OGLE 微引力透镜 · 银河核球',
      orbitalPeriod: '约 10 年',
    },
    ko: {
      planetType: '은하 중심부 극저온 얼음 슈퍼지구',
      atmosphereComposition: '-220°C에서 영구 동결된 N₂ 및 CH₄ 표면',
      realInspiration: 'ESO / OGLE 미세중력렌즈 · 은하 팽대부',
      orbitalPeriod: '약 10년',
    },
  },
  'astro-bh-01': {
    en: {
      designation: 'S2 Orbit Beacon (Near Sgr A*)',
      planetType: 'Near-Horizon Relativistic Orbit Reference Beacon',
      diameterKm: '18,500 km (S-Star Orbit Marker)',
      atmosphereComposition: 'Magnetized plasma & synchrotron radiation near photon ring',
      realInspiration: 'ESO GRAVITY & EHT · Sagittarius A* Core Region',
      orbitalPeriod: '16.05 yr (around Sgr A*)',
    },
    ja: {
      designation: 'S2軌道ビーコン（いて座A*近傍）',
      planetType: '事象の地平面近傍・相対論的軌道観測マーカー',
      diameterKm: '18,500 km（S星軌道マーカー）',
      atmosphereComposition: '光子リング近傍の磁化プラズマとシンクロトロン放射',
      realInspiration: 'ESO GRAVITY・EHT・いて座A*中心領域',
      orbitalPeriod: '16.05年（いて座A*公転）',
    },
    zh: {
      designation: 'S2 轨道信标（人马座 A* 近区）',
      planetType: '事件视界近区相对论轨道观测标杆',
      diameterKm: '18,500 km（S 星轨道标记）',
      atmosphereComposition: '光子环附近的磁化等离子体与同步辐射',
      realInspiration: 'ESO GRAVITY 与 EHT · 人马座 A* 核心区',
      orbitalPeriod: '16.05 年（绕 Sgr A*）',
    },
    ko: {
      designation: 'S2 궤도 비콘 (Sgr A* 근접)',
      planetType: '사건의 지평선 근접 상대론적 궤도 관측 기준점',
      diameterKm: '18,500 km (S-별 궤도 마커)',
      atmosphereComposition: '광자 고리 부근의 자화 플라즈마 및 싱크로트론 복사',
      realInspiration: 'ESO GRAVITY · EHT · 궁수자리 A* 중심부',
      orbitalPeriod: '16.05년 (Sgr A* 공전)',
    },
  },
  'astro-bh-02': {
    en: {
      designation: 'Cygnus X-1 Companion (X-Ray Accretion Disk)',
      planetType: 'X-Ray Binary Black Hole System · Orion Spur',
      diameterKm: '86,000 km (Accretion Stream Region)',
      atmosphereComposition: 'Stellar plasma wind accreting onto a 21.2 M☉ black hole',
      realInspiration: 'NASA Chandra X-ray Observatory · Cygnus',
      orbitalPeriod: '5.6 days (with HDE 226868)',
    },
    ja: {
      designation: 'はくちょう座X-1伴星（X線降着円盤）',
      planetType: 'オリオン腕のX線連星ブラックホール系',
      diameterKm: '86,000 km（降着ガス流領域）',
      atmosphereComposition: '21.2 M☉ブラックホールへ落下する恒星プラズマ風',
      realInspiration: 'NASA チャンドラX線観測衛星・はくちょう座',
      orbitalPeriod: '5.6日（HDE 226868との連星）',
    },
    zh: {
      designation: '天鹅座 X-1 伴星（X 射线吸积盘）',
      planetType: '猎户支臂 X 射线双星黑洞系统',
      diameterKm: '86,000 km（吸积气流区）',
      atmosphereComposition: '被 21.2 M☉ 黑洞吸积的恒星等离子体风',
      realInspiration: 'NASA 钱德拉 X 射线天文台 · 天鹅座',
      orbitalPeriod: '5.6 天（与 HDE 226868）',
    },
    ko: {
      designation: '백조자리 X-1 동반성 (X선 강착원반)',
      planetType: '오리온팔 X선 쌍성 블랙홀 계',
      diameterKm: '86,000 km (강착 가스류 영역)',
      atmosphereComposition: '21.2 M☉ 블랙홀로 유입되는 항성 플라즈마풍',
      realInspiration: 'NASA 찬드라 X선 망원경 · 백조자리',
      orbitalPeriod: '5.6일 (HDE 226868과 쌍성)',
    },
  },
  'astro-bh-03': {
    en: {
      planetType: 'Closest Known Exoplanet to Earth (4.24 ly)',
      atmosphereComposition: 'Rocky-oceanic envelope bathed in red-dwarf stellar wind',
      realInspiration: 'ESO Pale Red Dot · Alpha Centauri System',
      orbitalPeriod: '11.186 days',
    },
    ja: {
      planetType: '地球に最も近い系外惑星 (4.24光年)',
      atmosphereComposition: '赤色矮星風を受ける岩石・海洋候補大気',
      realInspiration: 'ESO Pale Red Dot・アルファ・ケンタウリ系',
      orbitalPeriod: '11.186日',
    },
    zh: {
      planetType: '距地球最近系外行星 (4.24 光年)',
      atmosphereComposition: '承受红矮星恒星风的岩石-海洋大气候选体',
      realInspiration: 'ESO Pale Red Dot · 半人马座 α 星系',
      orbitalPeriod: '11.186 天',
    },
    ko: {
      planetType: '지구에서 가장 가까운 외계행성 (4.24광년)',
      atmosphereComposition: '적색왜성 항성풍에 노출된 암석·해양 후보 대기',
      realInspiration: 'ESO Pale Red Dot · 알파 센타우리계',
      orbitalPeriod: '11.186일',
    },
  },
  'astro-bh-04': {
    en: {
      planetType: 'Supermassive Black Hole at the Heart of the Milky Way',
      diameterKm: '25.4 million km (Sgr A* Event Horizon Ø)',
      surfaceTemp: '10¹⁰ K (plasma ring)',
      surfaceGravity: 'Relativistic extreme',
      atmosphereComposition: '10-billion-K magnetized plasma orbiting near light speed',
      realInspiration: 'Event Horizon Telescope (EHT 2022) · Sgr A*',
      orbitalPeriod: 'Galactic Center (0, 0, 0)',
    },
    ja: {
      planetType: '天の川銀河中心の超大質量ブラックホール',
      diameterKm: '2,540万 km（いて座A* 事象の地平面径）',
      surfaceTemp: '10¹⁰ K（プラズマ環）',
      surfaceGravity: '相対論的極限',
      atmosphereComposition: '光速近くで周回する100億 K 磁化プラズマ環',
      realInspiration: 'イベント・ホライズン・テレスコープ (EHT 2022)・いて座A*',
      orbitalPeriod: '銀河中心 (0, 0, 0)',
    },
    zh: {
      planetType: '银河系中心超大质量黑洞',
      diameterKm: '2,540 万 km（Sgr A* 事件视界直径）',
      surfaceTemp: '10¹⁰ K（等离子体环）',
      surfaceGravity: '相对论极限',
      atmosphereComposition: '以接近光速旋转的百亿开尔文磁化等离子体环',
      realInspiration: '事件视界望远镜 (EHT 2022) · Sgr A*',
      orbitalPeriod: '银河系中心 (0, 0, 0)',
    },
    ko: {
      planetType: '우리은하 중심 초대질량 블랙홀',
      diameterKm: '2,540만 km (Sgr A* 사건의 지평선 직경)',
      surfaceTemp: '10¹⁰ K (플라즈마 고리)',
      surfaceGravity: '상대론적 극한',
      atmosphereComposition: '광속에 가깝게 회전하는 100억 K 자화 플라즈마 고리',
      realInspiration: '사건지평선망원경 (EHT 2022) · Sgr A*',
      orbitalPeriod: '우리은하 중심 (0, 0, 0)',
    },
  },
  'astro-bh-05': {
    en: {
      planetType: 'Extragalactic Supermassive Black Hole Reference',
      diameterKm: '38 billion km (M87* Event Horizon Ø)',
      surfaceTemp: '10¹⁰ K (relativistic jet)',
      surfaceGravity: 'Relativistic extreme',
      atmosphereComposition: 'Collimated relativistic plasma jet spanning 5,000 light-years',
      realInspiration: 'Event Horizon Telescope (EHT 2019) · Messier 87',
      orbitalPeriod: 'Virgo Cluster Core (M87)',
    },
    ja: {
      planetType: '銀河外超大質量ブラックホール比較基準',
      diameterKm: '380億 km（M87* 事象の地平面径）',
      surfaceTemp: '10¹⁰ K（相対論的ジェット）',
      surfaceGravity: '相対論的極限',
      atmosphereComposition: '全長5,000光年に達する相対論的プラズマジェット',
      realInspiration: 'イベント・ホライズン・テレスコープ (EHT 2019)・M87',
      orbitalPeriod: 'おとめ座銀河団中心 (M87)',
    },
    zh: {
      planetType: '河外超大质量黑洞对比基准',
      diameterKm: '380 亿 km（M87* 事件视界直径）',
      surfaceTemp: '10¹⁰ K（相对论喷流）',
      surfaceGravity: '相对论极限',
      atmosphereComposition: '长达 5,000 光年的相对论等离子体喷流',
      realInspiration: '事件视界望远镜 (EHT 2019) · Messier 87',
      orbitalPeriod: '室女座星系团核心 (M87)',
    },
    ko: {
      planetType: '외부은하 초대질량 블랙홀 비교 기준',
      diameterKm: '380억 km (M87* 사건의 지평선 직경)',
      surfaceTemp: '10¹⁰ K (상대론적 제트)',
      surfaceGravity: '상대론적 극한',
      atmosphereComposition: '길이 5,000광년에 달하는 상대론적 플라즈마 제트',
      realInspiration: '사건지평선망원경 (EHT 2019) · Messier 87',
      orbitalPeriod: '처녀자리 은하단 중심 (M87)',
    },
  },
  'astro-bh-06': {
    en: {
      planetType: 'Smallest Planet in the Solar System',
      surfaceTemp: '100 K – 700 K (-173°C to 427°C)',
      atmosphereComposition: 'Ultra-thin O₂, Na, H₂ exosphere · Heavily cratered crust',
      realInspiration: 'NASA MESSENGER & ESA BepiColombo · Mercury',
      orbitalPeriod: '87.97 days',
    },
    ja: {
      planetType: '太陽系最小の岩石惑星',
      surfaceTemp: '100 K – 700 K（-173°C〜427°C）',
      atmosphereComposition: '極薄 O₂・Na・H₂ 外気圏・クレーター密集地殻',
      realInspiration: 'NASA メッセンジャー・ESA ベピコロンボ・水星',
      orbitalPeriod: '87.97日',
    },
    zh: {
      planetType: '太阳系最小行星',
      surfaceTemp: '100 K – 700 K（-173°C 至 427°C）',
      atmosphereComposition: '极稀薄 O₂、Na、H₂ 外逸层 · 密布陨石坑地表',
      realInspiration: 'NASA 信使号与 ESA 贝皮科伦布号 · 水星',
      orbitalPeriod: '87.97 天',
    },
    ko: {
      planetType: '태양계 최소 행성',
      surfaceTemp: '100 K – 700 K (-173°C ~ 427°C)',
      atmosphereComposition: '극희박 O₂, Na, H₂ 외기권 · 크레이터 밀집 지각',
      realInspiration: 'NASA 메신저 · ESA 베피콜롬보 · 수성',
      orbitalPeriod: '87.97일',
    },
  },
  'small-moon': {
    en: {
      planetType: 'Natural Satellite · Basaltic Maria & Highlands',
      atmosphereComposition: 'Ultra-thin He, Ar, Ne exosphere · Impact-cratered regolith',
      realInspiration: 'NASA LRO & Apollo / Artemis · The Moon',
      orbitalPeriod: '27.32 days (around Earth)',
    },
    ja: {
      planetType: '自然衛星・玄武岩の海と高地',
      atmosphereComposition: '極薄 He・Ar・Ne 外気圏・クレーター密集レゴリス',
      realInspiration: 'NASA LRO・アポロ / アルテミス・月',
      orbitalPeriod: '27.32日（地球公転）',
    },
    zh: {
      planetType: '自然卫星 · 玄武岩月海与高地',
      atmosphereComposition: '极稀薄 He、Ar、Ne 外逸层 · 密布撞击坑月壤',
      realInspiration: 'NASA LRO 与阿波罗 / 阿尔忒弥斯 · 月球',
      orbitalPeriod: '27.32 天（绕地球）',
    },
    ko: {
      planetType: '자연 위성 · 현무암 바다 및 고지대',
      atmosphereComposition: '극희박 He, Ar, Ne 외기권 · 충돌구 밀집 표토',
      realInspiration: 'NASA LRO · 아폴로 / 아르테미스 · 달',
      orbitalPeriod: '27.32일 (지구 공전)',
    },
  },
  'small-ganymede': {
    en: {
      planetType: 'Largest Moon in the Solar System (Intrinsic Magnetosphere)',
      atmosphereComposition: 'Tenuous O₂ exosphere; grooved ice shell + subsurface ocean',
      realInspiration: 'NASA Juno & ESA JUICE · Ganymede',
      orbitalPeriod: '7.15 days (around Jupiter)',
    },
    ja: {
      planetType: '太陽系最大の衛星（固有磁場あり）',
      atmosphereComposition: '極薄 O₂ 外気圏・明暗の溝地形氷殻＋地下海',
      realInspiration: 'NASA ジュノー・ESA JUICE・ガニメデ',
      orbitalPeriod: '7.15日（木星公転）',
    },
    zh: {
      planetType: '太阳系最大卫星（具固有磁场）',
      atmosphereComposition: '极稀薄 O₂ 外逸层，明暗沟槽冰壳与地下海洋',
      realInspiration: 'NASA 朱诺号与 ESA JUICE · 木卫三',
      orbitalPeriod: '7.15 天（绕木星）',
    },
    ko: {
      planetType: '태양계 최대 위성 (고유 자기장 보유)',
      atmosphereComposition: '희박한 O₂ 외기권, 명암 홈 얼음 지각 + 지하 바다',
      realInspiration: 'NASA 주노 · ESA JUICE · 가니메데',
      orbitalPeriod: '7.15일 (목성 공전)',
    },
  },
  'small-pluto': {
    en: {
      planetType: 'Kuiper Belt Dwarf Planet · Nitrogen Ice',
      atmosphereComposition: 'Thin N₂, CH₄, CO envelope forming blue photochemical haze',
      realInspiration: 'NASA New Horizons · Sputnik Planitia',
      orbitalPeriod: '247.94 yr',
    },
    ja: {
      planetType: 'カイパーベルト準惑星・窒素氷世界',
      atmosphereComposition: '青い光化学もやを生む希薄な N₂・CH₄・CO 大気',
      realInspiration: 'NASA ニュー・ホライズンズ・スプートニク平原',
      orbitalPeriod: '247.94年',
    },
    zh: {
      planetType: '柯伊伯带矮行星 · 固态氮冰世界',
      atmosphereComposition: '稀薄 N₂、CH₄、CO 大气，形成蓝色光化学霾层',
      realInspiration: 'NASA 新视野号 · 斯普特尼克平原',
      orbitalPeriod: '247.94 年',
    },
    ko: {
      planetType: '카이퍼 벨트 왜행성 · 질소 얼음 세계',
      atmosphereComposition: '푸른 광화학 연무를 만드는 얇은 N₂, CH₄, CO 대기',
      realInspiration: 'NASA 뉴 호라이즌스 · 스푸트니크 평원',
      orbitalPeriod: '247.94년',
    },
  },
  'small-eris': {
    en: {
      planetType: 'High-Albedo Methane-Ice Dwarf Planet',
      atmosphereComposition: 'Bright frozen CH₄ & N₂ frost surface (albedo 0.96)',
      realInspiration: 'NASA JPL SSD & JWST 2024 · Eris',
      orbitalPeriod: '559 yr',
    },
    ja: {
      planetType: '高アルベド・メタン氷準惑星',
      atmosphereComposition: '高反射率 (0.96) の凍結 CH₄・N₂ 霜地表',
      realInspiration: 'NASA JPL SSD・JWST 2024・エリス',
      orbitalPeriod: '559年',
    },
    zh: {
      planetType: '高反照率甲烷冰矮行星',
      atmosphereComposition: '极高反照率 (0.96) 的冻结 CH₄ 与 N₂ 霜冻地表',
      realInspiration: 'NASA JPL SSD 与 JWST 2024 · 阋神星',
      orbitalPeriod: '559 年',
    },
    ko: {
      planetType: '고반사율 메탄 얼음 왜행성',
      atmosphereComposition: '반사율 0.96의 동결 CH₄·N₂ 서리 표면',
      realInspiration: 'NASA JPL SSD · JWST 2024 · 에리스',
      orbitalPeriod: '559년',
    },
  },
  'small-ceres': {
    en: {
      planetType: 'Main Asteroid Belt Dwarf Planet',
      atmosphereComposition: 'Localized transient water vapor; hydrated clay & salt crust',
      realInspiration: 'NASA Dawn Mission · Occator Salt Crater',
      orbitalPeriod: '4.60 yr',
    },
    ja: {
      planetType: 'メイン小惑星帯の準惑星',
      atmosphereComposition: '局所的な希薄水蒸気、含水粘土・塩類地殻',
      realInspiration: 'NASA ドーン探査機・オッカトル塩クレーター',
      orbitalPeriod: '4.60年',
    },
    zh: {
      planetType: '主小行星带矮行星',
      atmosphereComposition: '局部稀薄水蒸气，含水黏土与碳酸盐地壳',
      realInspiration: 'NASA 黎明号任务 · 奥卡托盐坑',
      orbitalPeriod: '4.60 年',
    },
    ko: {
      planetType: '주 소행성대 왜행성',
      atmosphereComposition: '국지적 희박 수증기, 함수 점토 및 염분 지각',
      realInspiration: 'NASA 돈 탐사선 · 오카토르 염분 충돌구',
      orbitalPeriod: '4.60년',
    },
  },
  'small-vesta': {
    en: {
      planetType: 'Differentiated Rocky Protoplanet (Irregular)',
      atmosphereComposition: 'Airless · Basaltic crust & iron-nickel metallic core',
      realInspiration: 'NASA Dawn Mission · 22 km Rheasilvia Peak',
      orbitalPeriod: '3.63 yr',
    },
    ja: {
      planetType: '分化した岩石原始惑星（不規則形状）',
      atmosphereComposition: '大気なし・玄武岩地殻と鉄ニッケル金属核',
      realInspiration: 'NASA ドーン探査機・レアシルヴィア中央丘 22 km',
      orbitalPeriod: '3.63年',
    },
    zh: {
      planetType: '分异岩石原行星（不规则形态）',
      atmosphereComposition: '无大气 · 分异玄武岩地壳与铁镍金属核心',
      realInspiration: 'NASA 黎明号任务 · 22 km 雷亚西尔维亚峰',
      orbitalPeriod: '3.63 年',
    },
    ko: {
      planetType: '분화된 암석 원시행성 (불규칙형)',
      atmosphereComposition: '대기 없음 · 현무암 지각 및 철-니켈 금속 핵',
      realInspiration: 'NASA 돈 탐사선 · 22 km 레아실비아 봉우리',
      orbitalPeriod: '3.63년',
    },
  },
  'small-bennu': {
    en: {
      planetType: 'Near-Earth Carbonaceous Asteroid (B-Type)',
      diameterKm: '0.49 km (490 m · 500×490×460 m)',
      atmosphereComposition: 'Airless · Carbon-rich rubble pile with hydrated minerals',
      realInspiration: 'NASA OSIRIS-REx Sample Return (2023)',
      orbitalPeriod: '1.20 yr (436.6 days)',
    },
    ja: {
      planetType: '地球近傍炭素質小惑星（B型）',
      diameterKm: '0.49 km（490 m・500×490×460 m）',
      atmosphereComposition: '大気なし・炭素と含水鉱物に富むラブルパイル構造',
      realInspiration: 'NASA オシリス・レックス サンプルリターン (2023)',
      orbitalPeriod: '1.20年（436.6日）',
    },
    zh: {
      planetType: '近地富碳小行星（B 型）',
      diameterKm: '0.49 km（490 米 · 500×490×460 m）',
      atmosphereComposition: '无大气 · 富含碳与含水矿物的碎石堆天体',
      realInspiration: 'NASA 冥王号采样返回任务 (2023)',
      orbitalPeriod: '1.20 年（436.6 天）',
    },
    ko: {
      planetType: '근지구 탄소질 소행성 (B형)',
      diameterKm: '0.49 km (490 m · 500×490×460 m)',
      atmosphereComposition: '대기 없음 · 탄소·함수 광물이 풍부한 자갈더미 천체',
      realInspiration: 'NASA 오시리스-렉스 시료 회수 (2023)',
      orbitalPeriod: '1.20년 (436.6일)',
    },
  },
  'small-halley': {
    en: {
      planetType: 'Active Periodic Comet · Icy Nucleus & Ion Tail',
      diameterKm: '11 km (nucleus 15 × 8 × 8 km)',
      surfaceTemp: '170 K – 360 K (perihelion)',
      atmosphereComposition: 'Coma of H₂O 80%, CO 10%, organic dust & blue ion tail',
      realInspiration: 'ESA Giotto & NASA JPL · Comet Halley',
      orbitalPeriod: '75.3 yr (Perihelion 2061)',
    },
    ja: {
      planetType: '活動的周期彗星・氷核＆イオンの尾',
      diameterKm: '11 km（核 15 × 8 × 8 km）',
      surfaceTemp: '170 K – 360 K（近日点）',
      atmosphereComposition: 'H₂O 80%・CO 10% のコマ、有機塵と青いイオンの尾',
      realInspiration: 'ESA ジオット・NASA JPL・ハレー彗星',
      orbitalPeriod: '75.3年（次回近日点 2061年）',
    },
    zh: {
      planetType: '活跃周期彗星 · 冰核与离子尾',
      diameterKm: '11 km（彗核 15 × 8 × 8 km）',
      surfaceTemp: '170 K – 360 K（近日点）',
      atmosphereComposition: 'H₂O 80%、CO 10% 彗发，有机尘埃与蓝色离子尾',
      realInspiration: 'ESA 乔托号与 NASA JPL · 哈雷彗星',
      orbitalPeriod: '75.3 年（2061 年过近日点）',
    },
    ko: {
      planetType: '활동 주기혜성 · 얼음 핵 및 이온 꼬리',
      diameterKm: '11 km (핵 15 × 8 × 8 km)',
      surfaceTemp: '170 K – 360 K (근일점)',
      atmosphereComposition: 'H₂O 80%, CO 10% 코마, 유기 먼지 및 푸른 이온 꼬리',
      realInspiration: 'ESA 지오토 · NASA JPL · 핼리 혜성',
      orbitalPeriod: '75.3년 (2061년 근일점)',
    },
  },
  'small-oumuamua': {
    en: {
      planetType: 'Elongated Interstellar Object (e = 1.20)',
      diameterKm: '0.23 km (230 × 35 m)',
      atmosphereComposition: 'Subtle H₂ / N₂ outgassing producing non-gravitational acceleration',
      realInspiration: 'Pan-STARRS / NASA JPL · 1I/2017 U1',
      orbitalPeriod: 'Non-periodic (e = 1.20)',
    },
    ja: {
      planetType: '細長い恒星間天体 (e = 1.20)',
      diameterKm: '0.23 km（230 × 35 m）',
      atmosphereComposition: '非重力加速を生む微弱な H₂ / N₂ ガス放出',
      realInspiration: 'Pan-STARRS / NASA JPL・1I/2017 U1',
      orbitalPeriod: '非周期（双曲線 e = 1.20）',
    },
    zh: {
      planetType: '细长星际访客天体 (e = 1.20)',
      diameterKm: '0.23 km（230 × 35 米）',
      atmosphereComposition: '微弱 H₂ / N₂ 挥发产生非引力加速度',
      realInspiration: 'Pan-STARRS / NASA JPL · 1I/2017 U1',
      orbitalPeriod: '非周期（双曲线 e = 1.20）',
    },
    ko: {
      planetType: '길쭉한 성간 천체 (e = 1.20)',
      diameterKm: '0.23 km (230 × 35 m)',
      atmosphereComposition: '비중력 가속을 유발하는 미세 H₂ / N₂ 탈기',
      realInspiration: 'Pan-STARRS / NASA JPL · 1I/2017 U1',
      orbitalPeriod: '비주기 (쌍곡선 e = 1.20)',
    },
  },
};

/**
 * Archetype-level fallback telemetry for user-created custom worlds in World Lab,
 * keyed by `PlanetSpec.archetypeId` (0..9) so custom worlds also have 0 Vietnamese leaks.
 */
const ARCHETYPE_FALLBACK_LOCALES: Record<number, Record<NonViLang, Omit<TelemetryLocaleEntry, 'orbitalPeriod'>>> = {
  0: {
    en: {
      planetType: 'Terrestrial Ocean Exoplanet',
      atmosphereComposition: 'N₂, O₂, and convective H₂O vapor clouds',
      realInspiration: 'NASA Exoplanet Archive · Habitable Ocean Analog',
    },
    ja: {
      planetType: '地球型海洋系外惑星',
      atmosphereComposition: 'N₂・O₂・対流性水蒸気雲',
      realInspiration: 'NASA 系外惑星アーカイブ・海洋惑星モデル',
    },
    zh: {
      planetType: '类地海洋系外行星',
      atmosphereComposition: 'N₂、O₂ 与对流水汽云层',
      realInspiration: 'NASA 系外行星档案馆 · 宜居海洋模型',
    },
    ko: {
      planetType: '지구형 해양 외계행성',
      atmosphereComposition: 'N₂, O₂ 및 대류성 수증기 구름',
      realInspiration: 'NASA 외계행성 아카이브 · 해양 행성 모델',
    },
  },
  1: {
    en: {
      planetType: 'Ringed Gas Giant',
      atmosphereComposition: 'H₂, He, and banded ammonia crystal clouds',
      realInspiration: 'NASA Cassini / Exoplanet Ring Analog',
    },
    ja: {
      planetType: '環を持つ巨大ガス惑星',
      atmosphereComposition: 'H₂・He・帯状アンモニア結晶雲',
      realInspiration: 'NASA カッシーニ・環状ガス惑星モデル',
    },
    zh: {
      planetType: '星环气态巨行星',
      atmosphereComposition: 'H₂、He 与带状氨冰晶云',
      realInspiration: 'NASA 卡西尼 · 星环气态巨行星模型',
    },
    ko: {
      planetType: '고리형 가스 거인',
      atmosphereComposition: 'H₂, He 및 띠 모양 암모니아 결정 구름',
      realInspiration: 'NASA 카시니 · 고리 가스 행성 모델',
    },
  },
  2: {
    en: {
      planetType: 'Volcanic Magma World',
      atmosphereComposition: 'Silicate vapor, SO₂, and outgassed CO₂',
      realInspiration: 'NASA JWST Lava World Analog',
    },
    ja: {
      planetType: '火山・マグマ惑星',
      atmosphereComposition: 'ケイ酸塩蒸気・SO₂・CO₂',
      realInspiration: 'NASA JWST 溶岩惑星モデル',
    },
    zh: {
      planetType: '火山岩浆世界',
      atmosphereComposition: '硅酸盐蒸汽、SO₂ 与释放 CO₂',
      realInspiration: 'NASA JWST 岩浆世界模型',
    },
    ko: {
      planetType: '화산 마그마 행성',
      atmosphereComposition: '규산염 증기, SO₂ 및 CO₂',
      realInspiration: 'NASA JWST 용암 행성 모델',
    },
  },
  3: {
    en: {
      planetType: 'Cryogenic Ice World',
      atmosphereComposition: 'Frozen N₂, CH₄ frost & tenuous icy haze',
      realInspiration: 'NASA Outer Solar System Ice Analog',
    },
    ja: {
      planetType: '極低温氷惑星',
      atmosphereComposition: '凍結 N₂・CH₄ 霜と希薄な氷霞',
      realInspiration: 'NASA 外太陽系氷天体モデル',
    },
    zh: {
      planetType: '极寒冰冻世界',
      atmosphereComposition: '冻结 N₂、CH₄ 霜层与稀薄冰霾',
      realInspiration: 'NASA 外太阳系冰冻天体模型',
    },
    ko: {
      planetType: '극저온 얼음 행성',
      atmosphereComposition: '동결 N₂, CH₄ 서리 및 희박한 얼음 연무',
      realInspiration: 'NASA 외태양계 얼음 천체 모델',
    },
  },
  4: {
    en: {
      planetType: 'Methane Ice Giant',
      atmosphereComposition: 'H₂, He, and deep azure CH₄ storm bands',
      realInspiration: 'NASA Voyager 2 Ice Giant Analog',
    },
    ja: {
      planetType: 'メタン巨大氷惑星',
      atmosphereComposition: 'H₂・He・濃青の CH₄ 嵐帯',
      realInspiration: 'NASA ボイジャー2 氷惑星モデル',
    },
    zh: {
      planetType: '甲烷冰巨星',
      atmosphereComposition: 'H₂、He 与深蓝 CH₄ 风暴带',
      realInspiration: 'NASA 旅行者 2 号冰巨星模型',
    },
    ko: {
      planetType: '메탄 얼음 거인',
      atmosphereComposition: 'H₂, He 및 짙은 푸른 CH₄ 폭풍대',
      realInspiration: 'NASA 보이저 2호 얼음 거인 모델',
    },
  },
  5: {
    en: {
      planetType: 'Ultra-Hot Gas Giant',
      atmosphereComposition: 'H₂, He, and supersonic metallic vapor clouds',
      realInspiration: 'NASA Hubble / TESS Hot Jupiter Analog',
    },
    ja: {
      planetType: '超高温巨大ガス惑星',
      atmosphereComposition: 'H₂・He・超音速金属蒸気雲',
      realInspiration: 'NASA ハッブル / TESS ホットジュピターモデル',
    },
    zh: {
      planetType: '超热气态巨行星',
      atmosphereComposition: 'H₂、He 与超音速金属蒸汽云',
      realInspiration: 'NASA 哈勃 / TESS 热木星模型',
    },
    ko: {
      planetType: '초고온 가스 거인',
      atmosphereComposition: 'H₂, He 및 초음속 금속 증기 구름',
      realInspiration: 'NASA 허블 / TESS 뜨거운 목성 모델',
    },
  },
  6: {
    en: {
      planetType: 'Arid Rocky Desert World',
      atmosphereComposition: 'Thin CO₂, N₂, and iron-oxide dust plumes',
      realInspiration: 'NASA Mars Reconnaissance Analog',
    },
    ja: {
      planetType: '乾燥岩石砂漠惑星',
      atmosphereComposition: '希薄な CO₂・N₂・酸化鉄ダスト',
      realInspiration: 'NASA 火星探査モデル',
    },
    zh: {
      planetType: '干旱岩石沙漠行星',
      atmosphereComposition: '稀薄 CO₂、N₂ 与氧化铁尘暴',
      realInspiration: 'NASA 火星探测模型',
    },
    ko: {
      planetType: '건조 암석 사막 행성',
      atmosphereComposition: '희박한 CO₂, N₂ 및 산화철 먼지',
      realInspiration: 'NASA 화성 탐사 모델',
    },
  },
  7: {
    en: {
      planetType: 'Cratered Rocky World',
      atmosphereComposition: 'Ultra-thin exosphere over heavily cratered regolith',
      realInspiration: 'NASA LRO / MESSENGER Rocky Analog',
    },
    ja: {
      planetType: 'クレーター密集岩石天体',
      atmosphereComposition: '極薄外気圏とクレーター密集地殻',
      realInspiration: 'NASA LRO / メッセンジャー岩石モデル',
    },
    zh: {
      planetType: '陨坑岩石天体',
      atmosphereComposition: '极稀薄外逸层与密布撞击坑地表',
      realInspiration: 'NASA LRO / 信使号岩石模型',
    },
    ko: {
      planetType: '충돌구 밀집 암석 천체',
      atmosphereComposition: '극희박 외기권 및 충돌구 밀집 지각',
      realInspiration: 'NASA LRO / 메신저 암석 모델',
    },
  },
  8: {
    en: {
      planetType: 'Relativistic Compact Object / Galactic Anomaly',
      atmosphereComposition: 'Magnetized relativistic plasma & high-energy radiation',
      realInspiration: 'Event Horizon Telescope / Chandra Reference',
    },
    ja: {
      planetType: '相対論的コンパクト天体・銀河中心現象',
      atmosphereComposition: '磁化相対論的プラズマと高エネルギー放射',
      realInspiration: 'EHT / チャンドラX線観測リファレンス',
    },
    zh: {
      planetType: '相对论致密天体 / 银心现象',
      atmosphereComposition: '磁化相对论等离子体与高能辐射',
      realInspiration: 'EHT / 钱德拉 X 射线观测参考',
    },
    ko: {
      planetType: '상대론적 밀집 천체 / 은하 중심 현상',
      atmosphereComposition: '자화 상대론적 플라즈마 및 고에너지 복사',
      realInspiration: 'EHT / 찬드라 X선 관측 레퍼런스',
    },
  },
  9: {
    en: {
      planetType: 'Main-Sequence / Supergiant Star',
      atmosphereComposition: 'Incandescent hydrogen-helium photospheric plasma',
      realInspiration: 'ESA Gaia DR3 Stellar Catalog',
    },
    ja: {
      planetType: '主系列星 / 超巨星',
      atmosphereComposition: '高温水素・ヘリウム光球プラズマ',
      realInspiration: 'ESA Gaia DR3 恒星カタログ',
    },
    zh: {
      planetType: '主序星 / 超巨星',
      atmosphereComposition: '炽热氢氦光球等离子体',
      realInspiration: 'ESA Gaia DR3 恒星星表',
    },
    ko: {
      planetType: '주계열성 / 초거성',
      atmosphereComposition: '고온 수소·헬륨 광구 플라즈마',
      realInspiration: 'ESA Gaia DR3 항성 카탈로그',
    },
  },
};

const FALLBACK_ORBITAL_PERIOD: Record<LanguageCode, string> = {
  vi: 'Quỹ đạo Ngân Hà',
  en: 'Galactic Orbit',
  ja: '銀河周回軌道',
  zh: '银河系轨道',
  ko: '은하 공전 궤도',
};

/**
 * Returns 100% localized planet/star physical telemetry for any catalog or custom node.
 * Guaranteed zero Vietnamese diacritics when lang !== 'vi'.
 */
export function getLocalizedPlanetSpec(
  node: MemoryNode,
  lang: LanguageCode
): LocalizedPlanetSpec {
  const base = getPlanetSpecForNode(node);

  if (lang === 'vi') {
    return {
      designation: base.designation,
      planetType: base.planetTypeVi,
      diameterKm: base.diameterKm,
      surfaceTemp: base.surfaceTemp,
      surfaceGravity: base.surfaceGravity,
      atmosphereComposition: base.atmosphereComposition,
      realInspiration: base.realInspiration,
      hasRings: base.hasRings,
      earthRadiusRatio: base.earthRadiusRatio,
      base,
    };
  }

  const entry = TELEMETRY_TABLE[node.id]?.[lang];
  if (entry) {
    return {
      designation: entry.designation ?? sanitizeUnitsForNonVi(base.designation, lang),
      planetType: entry.planetType,
      diameterKm: entry.diameterKm ?? sanitizeUnitsForNonVi(base.diameterKm, lang),
      surfaceTemp: entry.surfaceTemp ?? sanitizeUnitsForNonVi(base.surfaceTemp, lang),
      surfaceGravity: entry.surfaceGravity ?? sanitizeUnitsForNonVi(base.surfaceGravity, lang),
      atmosphereComposition: entry.atmosphereComposition,
      realInspiration: entry.realInspiration,
      hasRings: base.hasRings,
      earthRadiusRatio: base.earthRadiusRatio,
      base,
    };
  }

  const fallback =
    ARCHETYPE_FALLBACK_LOCALES[base.archetypeId]?.[lang] ??
    ARCHETYPE_FALLBACK_LOCALES[0][lang];

  return {
    designation: sanitizeUnitsForNonVi(base.designation, lang),
    planetType: fallback.planetType,
    diameterKm: sanitizeUnitsForNonVi(base.diameterKm, lang),
    surfaceTemp: sanitizeUnitsForNonVi(base.surfaceTemp, lang),
    surfaceGravity: sanitizeUnitsForNonVi(base.surfaceGravity, lang),
    atmosphereComposition: fallback.atmosphereComposition,
    realInspiration: fallback.realInspiration,
    hasRings: base.hasRings,
    earthRadiusRatio: base.earthRadiusRatio,
    base,
  };
}

/**
 * Returns a 100% localized orbital/spin period string for any catalog or custom node.
 */
export function getLocalizedOrbitalPeriod(
  nodeId: string,
  rawPeriodVi: string,
  lang: LanguageCode
): string {
  if (lang === 'vi') return rawPeriodVi || FALLBACK_ORBITAL_PERIOD.vi;

  const entry = TELEMETRY_TABLE[nodeId]?.[lang];
  if (entry?.orbitalPeriod) return entry.orbitalPeriod;

  if (!rawPeriodVi || rawPeriodVi === 'Quỹ đạo Ngân Hà') {
    return FALLBACK_ORBITAL_PERIOD[lang];
  }

  // Generic unit translation safety net for any ad-hoc period string
  const units: Record<NonViLang, Array<[RegExp, string]>> = {
    en: [
      [/triệu năm/gi, 'Myr'],
      [/năm/gi, 'yr'],
      [/ngày/gi, 'days'],
      [/giờ/gi, 'hr'],
    ],
    ja: [
      [/triệu năm/gi, '百万年'],
      [/năm/gi, '年'],
      [/ngày/gi, '日'],
      [/giờ/gi, '時間'],
    ],
    zh: [
      [/triệu năm/gi, '百万年'],
      [/năm/gi, '年'],
      [/ngày/gi, '天'],
      [/giờ/gi, '小时'],
    ],
    ko: [
      [/triệu năm/gi, '백만 년'],
      [/năm/gi, '년'],
      [/ngày/gi, '일'],
      [/giờ/gi, '시간'],
    ],
  };
  let out = sanitizeUnitsForNonVi(rawPeriodVi, lang);
  for (const [re, rep] of units[lang]) {
    out = out.replace(re, rep);
  }
  return out;
}

/**
 * Extra 5-language UI labels for the floating instrument strip, toolbar tooltips,
 * modals, and hardware telemetry units.
 */
export interface ObservatoryExtraCopy {
  toursBtn: string;
  stopsUnit: string;
  copiedLabel: string;
  shareTooltip: string;
  shareAria: string;
  captureTooltip: string;
  captureAria: string;
  shortcutsTooltip: string;
  shortcutsAria: string;
  scaleTrue1to1: string;
  scaleAtlas: string;
  graphicsAria: string;
  aiAutoDetect: string;
  threadsUnit: string;
  stepsUnit: string;
  segUnit: string;
  close: string;
  clearSearch: string;
  zoomInAria: string;
  zoomOutAria: string;
  solOrigin: string;
  autoBadge: string;
  autoLabel: string;
}

export const OBSERVATORY_EXTRA_COPY: Record<LanguageCode, ObservatoryExtraCopy> = {
  en: {
    toursBtn: 'Tours',
    stopsUnit: 'stops',
    copiedLabel: 'Copied',
    shareTooltip: 'Copy shareable cosmic coordinate link',
    shareAria: 'Share current observatory view',
    captureTooltip: 'Save clean HUD-free WebGL2 PNG',
    captureAria: 'Capture clean PNG snapshot',
    shortcutsTooltip: 'Keyboard shortcuts (?)',
    shortcutsAria: 'Keyboard shortcuts',
    scaleTrue1to1: '1:1 True Scale',
    scaleAtlas: 'Atlas Scale',
    graphicsAria: 'Graphics settings',
    aiAutoDetect: 'AI Auto-Detect',
    threadsUnit: 'threads',
    stepsUnit: 'steps',
    segUnit: 'seg',
    close: 'Close',
    clearSearch: 'Clear search',
    zoomInAria: 'Zoom in',
    zoomOutAria: 'Zoom out',
    solOrigin: '0.00 ly (Sol)',
    autoBadge: '★ Auto',
    autoLabel: 'Auto',
  },
  vi: {
    toursBtn: 'Hành trình',
    stopsUnit: 'chặng',
    copiedLabel: 'Đã chép',
    shareTooltip: 'Sao chép liên kết tọa độ vũ trụ hiện tại',
    shareAria: 'Chia sẻ góc nhìn đài quan sát hiện tại',
    captureTooltip: 'Lưu ảnh WebGL2 PNG sạch không HUD',
    captureAria: 'Chụp ảnh PNG sạch không HUD',
    shortcutsTooltip: 'Phím tắt điều khiển (?)',
    shortcutsAria: 'Phím tắt điều khiển',
    scaleTrue1to1: '1:1 Thực tế',
    scaleAtlas: 'Tỷ lệ Khám phá',
    graphicsAria: 'Cài đặt đồ họa',
    aiAutoDetect: 'AI Tự động nhận diện',
    threadsUnit: 'luồng',
    stepsUnit: 'bước',
    segUnit: 'phân đoạn',
    close: 'Đóng',
    clearSearch: 'Xóa tìm kiếm',
    zoomInAria: 'Phóng to',
    zoomOutAria: 'Thu nhỏ',
    solOrigin: '0.00 ly (Mặt Trời)',
    autoBadge: '★ Tự động',
    autoLabel: 'Tự động',
  },
  ja: {
    toursBtn: 'ツアー',
    stopsUnit: '地点',
    copiedLabel: 'コピー済',
    shareTooltip: '宇宙座標リンクをコピー',
    shareAria: '現在の観測ビューを共有',
    captureTooltip: 'HUDなしWebGL2 PNG画像を保存',
    captureAria: 'クリーンPNGスナップショットを保存',
    shortcutsTooltip: 'キーボードショートカット (?)',
    shortcutsAria: 'キーボードショートカット',
    scaleTrue1to1: '1:1 実寸モード',
    scaleAtlas: '探索スケール',
    graphicsAria: 'グラフィック設定',
    aiAutoDetect: 'AI 自動判定',
    threadsUnit: 'スレッド',
    stepsUnit: 'ステップ',
    segUnit: '分割',
    close: '閉じる',
    clearSearch: '検索をクリア',
    zoomInAria: '拡大',
    zoomOutAria: '縮小',
    solOrigin: '0.00 ly（太陽）',
    autoBadge: '★ 自動',
    autoLabel: '自動',
  },
  zh: {
    toursBtn: '导览',
    stopsUnit: '站',
    copiedLabel: '已复制',
    shareTooltip: '复制当前宇宙坐标分享链接',
    shareAria: '分享当前天文台视角',
    captureTooltip: '保存无 HUD 纯净 WebGL2 PNG 截图',
    captureAria: '截取纯净 PNG 图像',
    shortcutsTooltip: '键盘快捷键 (?)',
    shortcutsAria: '键盘快捷键',
    scaleTrue1to1: '1:1 真实比例',
    scaleAtlas: '星图比例',
    graphicsAria: '图形设置',
    aiAutoDetect: 'AI 自动识别',
    threadsUnit: '线程',
    stepsUnit: '步',
    segUnit: '细分',
    close: '关闭',
    clearSearch: '清除搜索',
    zoomInAria: '放大',
    zoomOutAria: '缩小',
    solOrigin: '0.00 ly（太阳）',
    autoBadge: '★ 自动',
    autoLabel: '自动',
  },
  ko: {
    toursBtn: '투어',
    stopsUnit: '챕터',
    copiedLabel: '복사됨',
    shareTooltip: '현재 우주 좌표 공유 링크 복사',
    shareAria: '현재 천문대 시점 공유',
    captureTooltip: 'HUD 없는 순수 WebGL2 PNG 저장',
    captureAria: '순수 PNG 스냅샷 저장',
    shortcutsTooltip: '키보드 단축키 (?)',
    shortcutsAria: '키보드 단축키',
    scaleTrue1to1: '1:1 실제 비율',
    scaleAtlas: '탐험 비율',
    graphicsAria: '그래픽 설정',
    aiAutoDetect: 'AI 자동 감지',
    threadsUnit: '스레드',
    stepsUnit: '스텝',
    segUnit: '세그',
    close: '닫기',
    clearSearch: '검색 지우기',
    zoomInAria: '확대',
    zoomOutAria: '축소',
    solOrigin: '0.00 ly (태양)',
    autoBadge: '★ 자동',
    autoLabel: '자동',
  },
};
