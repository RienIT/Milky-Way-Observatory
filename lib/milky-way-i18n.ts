import { LanguageCode } from './i18n';

export interface MilkyWayArmLocalized {
  id:
    | 'scutum-centaurus'
    | 'perseus'
    | 'sagittarius-carina'
    | 'norma-outer'
    | 'orion-spur';
  name: string;
  role: string;
  detail: string;
}

export interface MilkyWayLocalizedData {
  diskToggleLabel: string;
  nasaBadge: string;
  structureHeading: string;
  structureSubtitle: string;
  typeLabel: string;
  typeValue: string;
  diameterLabel: string;
  diameterValue: string;
  starsLabel: string;
  starsValue: string;
  barLabel: string;
  barValue: string;
  sunDistanceLabel: string;
  sunDistanceValue: string;
  galacticYearLabel: string;
  galacticYearValue: string;
  armsHeading: string;
  arms: MilkyWayArmLocalized[];
  solarBeaconTitle: string;
  solarBeaconCategory: string;
  solarBeaconDetail: string;
  solarBeaconTag: string;
  zeroEnvNote: string;
}

export const MILKY_WAY_I18N: Record<LanguageCode, MilkyWayLocalizedData> = {
  vi: {
    diskToggleLabel: 'Dải Ngân Hà',
    nasaBadge: 'Dữ liệu chuẩn NASA Spitzer · ESA Gaia DR3 · EHT',
    structureHeading: 'Cấu Trúc Dải Ngân Hà (Milky Way)',
    structureSubtitle:
      'Thiên hà xoắn ốc có thanh chắn (SBbc) chứa Hệ Mặt Trời của chúng ta, xoay quanh hố đen siêu khối lượng Sagittarius A* tại tâm.',
    typeLabel: 'Phân loại Hubble',
    typeValue: 'Xoắn ốc có thanh chắn (SBbc)',
    diameterLabel: 'Đường kính đĩa sao',
    diameterValue: '105.700 năm ánh sáng',
    starsLabel: 'Số lượng ngôi sao',
    starsValue: '100 – 400 Tỷ ngôi sao',
    barLabel: 'Thanh chắn trung tâm',
    barValue: '~27.000 năm ánh sáng (nghiêng 27°)',
    sunDistanceLabel: 'Vị trí Hệ Mặt Trời',
    sunDistanceValue: '26.670 ly · Nhánh phụ Lạp Hộ',
    galacticYearLabel: '1 Năm Thiên Hà',
    galacticYearValue: '~230 Triệu năm (230 km/s)',
    armsHeading: '4 Nhánh Xoắn Ốc Chính & Nhánh Phụ (NASA/JPL)',
    arms: [
      {
        id: 'scutum-centaurus',
        name: 'Nhánh Thuẫn – Nhân Mã (Scutum–Centaurus)',
        role: 'Nhánh chính',
        detail:
          'Một trong hai nhánh xoắn ốc lớn nhất vươn ra từ đầu gần của thanh chắn trung tâm, dày đặc sao xanh trẻ.',
      },
      {
        id: 'perseus',
        name: 'Nhánh Anh Tiên (Perseus Arm)',
        role: 'Nhánh chính',
        detail:
          'Nhánh chính đối xứng bên ngoài Hệ Mặt Trời, chứa các cụm sao siêu khổng lồ và tinh vân tạo sao dày đặc.',
      },
      {
        id: 'sagittarius-carina',
        name: 'Nhánh Nhân Mã – Thuyền Để (Sagittarius–Carina)',
        role: 'Nhánh phụ',
        detail:
          'Nằm ngay phía trong quỹ đạo Hệ Mặt Trời, nổi tiếng với Tinh vân Thuyền Để (Carina), Đại Bàng (M16) và Đầm Phá (M8).',
      },
      {
        id: 'norma-outer',
        name: 'Nhánh Thước Ê-ke – Nhánh Ngoài (Norma–Outer)',
        role: 'Nhánh phụ',
        detail:
          'Kéo dài từ vùng trong gần lõi hố đen vươn ra tận rìa ngoài cùng của đĩa Dải Ngân Hà.',
      },
      {
        id: 'orion-spur',
        name: 'Nhánh Phụ Lạp Hộ (Orion–Cygnus Spur)',
        role: 'Nơi chứa Trái Đất',
        detail:
          'Nhánh xoắn ốc cục bộ dài ~10.000 năm ánh sáng nằm giữa nhánh Nhân Mã và Anh Tiên — quê hương của Hệ Mặt Trời.',
      },
    ],
    solarBeaconTitle: 'Hệ Mặt Trời (Solar System · Trái Đất)',
    solarBeaconCategory: 'Nhánh phụ Lạp Hộ (Orion–Cygnus Spur)',
    solarBeaconDetail:
      'Cách Sagittarius A* 26.670 năm ánh sáng · Quay 230 km/s (1 Năm Thiên Hà = 230 triệu năm)',
    solarBeaconTag: 'Mặt Trời G2V · 26.670 ly',
    zeroEnvNote:
      'Chế độ mô phỏng Dải Ngân Hà chuẩn NASA hoạt động mặc định 100% cục bộ, không cần cấu hình biến môi trường (.env).',
  },

  en: {
    diskToggleLabel: 'Milky Way Disk',
    nasaBadge: 'NASA Spitzer · ESA Gaia DR3 · EHT Reference Model',
    structureHeading: 'Milky Way Galactic Architecture',
    structureSubtitle:
      'Our home Barred Spiral Galaxy (SBbc), spanning 105,700 light-years around the central supermassive black hole Sagittarius A*.',
    typeLabel: 'Hubble Type',
    typeValue: 'Barred Spiral (SBbc)',
    diameterLabel: 'Stellar Disk Diameter',
    diameterValue: '105,700 light-years',
    starsLabel: 'Stellar Population',
    starsValue: '100 – 400 Billion Stars',
    barLabel: 'Central Galactic Bar',
    barValue: '~27,000 ly (27° orientation)',
    sunDistanceLabel: 'Solar System Position',
    sunDistanceValue: '26,670 ly · Orion Spur',
    galacticYearLabel: '1 Galactic Year',
    galacticYearValue: '~230 Million yrs (230 km/s)',
    armsHeading: 'NASA/JPL Spiral Arms & Local Spur',
    arms: [
      {
        id: 'scutum-centaurus',
        name: 'Scutum–Centaurus Arm',
        role: 'Major Arm',
        detail:
          'One of the two primary spiral arms emerging from the near end of the central stellar bar, packed with young O/B stars.',
      },
      {
        id: 'perseus',
        name: 'Perseus Arm',
        role: 'Major Arm',
        detail:
          'The opposite primary spiral arm sweeping outside the Solar System with massive star-forming clusters.',
      },
      {
        id: 'sagittarius-carina',
        name: 'Sagittarius–Carina Arm',
        role: 'Secondary Arm',
        detail:
          'Inner secondary arm hosting the Carina Nebula, Eagle Nebula (Pillars of Creation), and Lagoon Nebula.',
      },
      {
        id: 'norma-outer',
        name: 'Norma–Outer Arm',
        role: 'Secondary Arm',
        detail:
          'Winds from the inner galactic core region out to the faint distant rim of the Milky Way disk.',
      },
      {
        id: 'orion-spur',
        name: 'Orion–Cygnus Spur',
        role: 'Solar System Home',
        detail:
          'Our local ~10,000-ly spiral bridge between Sagittarius and Perseus arms — home to the Sun, Earth, and Orion Nebula.',
      },
    ],
    solarBeaconTitle: 'Solar System (Sun & Earth)',
    solarBeaconCategory: 'Orion–Cygnus Local Spur',
    solarBeaconDetail:
      '26,670 light-years from Sagittarius A* · Orbiting at 230 km/s (230M yr Galactic Year)',
    solarBeaconTag: 'G2V Sun · 26,670 ly',
    zeroEnvNote:
      'NASA Milky Way simulation runs 100% locally by default with zero .env variables required.',
  },

  ja: {
    diskToggleLabel: '天の川銀河円盤',
    nasaBadge: 'NASA スピッツァー · ESA ガイア DR3 · EHT 公式データ準拠',
    structureHeading: '天の川銀河（ミルキーウェイ）の構造',
    structureSubtitle:
      '太陽系が属する棒渦巻銀河（SBbc型）。中心の超大質量ブラックホール「いて座A*」を軸に直径約10万5,700光年に広がります。',
    typeLabel: '銀河分類',
    typeValue: '棒渦巻銀河（SBbc）',
    diameterLabel: '銀河円盤の直径',
    diameterValue: '約 105,700 光年',
    starsLabel: '恒星の数',
    starsValue: '1,000億 ～ 4,000億個',
    barLabel: '中心バルジ・棒構造',
    barValue: '約 27,000 光年（傾斜角 27°）',
    sunDistanceLabel: '太陽系の位置',
    sunDistanceValue: '26,670 光年 · オリオン腕',
    galacticYearLabel: '銀河年（公転周期）',
    galacticYearValue: '約 2億3,000万年（秒速 230 km）',
    armsHeading: 'NASA/JPL 観測による4大渦状腕とオリオン腕',
    arms: [
      {
        id: 'scutum-centaurus',
        name: 'たて・ケンタウルス腕 (Scutum–Centaurus)',
        role: '主要腕',
        detail:
          '中心棒構造の手前側から伸びる2大主要渦状腕の1つ。若い青白色の恒星が密集しています。',
      },
      {
        id: 'perseus',
        name: 'ペルセウス腕 (Perseus Arm)',
        role: '主要腕',
        detail:
          '太陽系の外側を巡るもう1つの主要腕。大規模な星形成領域を多数抱えています。',
      },
      {
        id: 'sagittarius-carina',
        name: 'いて・りゅうこつ腕 (Sagittarius–Carina)',
        role: '副腕',
        detail:
          '太陽系の内側に位置し、イータカリーナ星雲や鷲星雲（創造の柱）を含む美しい腕です。',
      },
      {
        id: 'norma-outer',
        name: 'じょうぎ・外縁腕 (Norma–Outer)',
        role: '副腕',
        detail:
          '銀河中心付近から天の川銀河の最外縁部へと巻き付く副渦状腕です。',
      },
      {
        id: 'orion-spur',
        name: 'オリオン腕 (Orion–Cygnus Spur)',
        role: '太陽系の所在地',
        detail:
          'いて腕とペルセウス腕の間にある局所腕。太陽系・地球・オリオン大星雲が位置しています。',
      },
    ],
    solarBeaconTitle: '太陽系（太陽・地球）',
    solarBeaconCategory: 'オリオン腕（局所渦状腕）',
    solarBeaconDetail:
      'いて座A*から 26,670 光年 · 秒速 230 km で公転中（銀河年 2.3億年）',
    solarBeaconTag: 'G2V 太陽 · 26,670 光年',
    zeroEnvNote:
      '環境変数（.env）未設定でも、NASA準拠の天の川銀河シミュレーションが標準で完全動作します。',
  },

  zh: {
    diskToggleLabel: '银河系旋臂',
    nasaBadge: '基于 NASA 斯皮策 · ESA 盖亚 DR3 · EHT 公布数据',
    structureHeading: '银河系（Milky Way）天体结构',
    structureSubtitle:
      '太阳系所在的棒旋星系（SBbc型），直径约 105,700 光年，围绕银心超大质量黑洞人马座 A* 旋转。',
    typeLabel: '哈勃分类',
    typeValue: '棒旋星系（SBbc）',
    diameterLabel: '银盘直径',
    diameterValue: '105,700 光年',
    starsLabel: '恒星总数',
    starsValue: '1,000亿 – 4,000亿 颗',
    barLabel: '中心恒星棒',
    barValue: '约 27,000 光年（倾角 27°）',
    sunDistanceLabel: '太阳系位置',
    sunDistanceValue: '26,670 光年 · 猎户座支臂',
    galacticYearLabel: '银河年周期',
    galacticYearValue: '约 2.3 亿年（230 km/s）',
    armsHeading: 'NASA/JPL 公布的四大旋臂与猎户支臂',
    arms: [
      {
        id: 'scutum-centaurus',
        name: '盾牌–半人马臂 (Scutum–Centaurus)',
        role: '主旋臂',
        detail:
          '从银心恒星棒近端延伸出的两大主旋臂之一，富含炽热的年轻蓝白恒星。',
      },
      {
        id: 'perseus',
        name: '英仙臂 (Perseus Arm)',
        role: '主旋臂',
        detail:
          '环绕在太阳系外侧的另一条主旋臂，拥有密集的大质量星团与电离氢区。',
      },
      {
        id: 'sagittarius-carina',
        name: '人马–船底臂 (Sagittarius–Carina)',
        role: '次旋臂',
        detail:
          '位于太阳系内侧，孕育了著名的船底座星云、鹰状星云（创生之柱）与礁湖星云。',
      },
      {
        id: 'norma-outer',
        name: '矩尺–外臂 (Norma–Outer)',
        role: '次旋臂',
        detail:
          '从银心内区蜿蜒延伸至银河系最外缘的螺旋结构。',
      },
      {
        id: 'orion-spur',
        name: '猎户–天鹅支臂 (Orion–Cygnus Spur)',
        role: '太阳系家园',
        detail:
          '夹在人马臂与英仙臂之间长约 10,000 光年的局域支臂，太阳系与地球正位于此。',
      },
    ],
    solarBeaconTitle: '太阳系（太阳与地球）',
    solarBeaconCategory: '猎户–天鹅支臂',
    solarBeaconDetail:
      '距人马座 A* 26,670 光年 · 公转速度 230 km/s（1 银河年 ≈ 2.3 亿年）',
    solarBeaconTag: 'G2V 太阳 · 26,670 光年',
    zeroEnvNote:
      '无需配置任何 .env 环境变量，默认即完整呈现 NASA 标准的银河系三维模拟。',
  },

  ko: {
    diskToggleLabel: '우리 은하 원반',
    nasaBadge: 'NASA 스피처 · ESA 가이아 DR3 · EHT 공식 데이터 기반',
    structureHeading: '우리 은하(Milky Way) 구조',
    structureSubtitle:
      '태양계가 속한 막대나선은하(SBbc)로, 중심의 초대질량 블랙홀 궁수자리 A* 주위를 지름 105,700광년에 걸쳐 회전합니다.',
    typeLabel: '허블 분류',
    typeValue: '막대나선은하 (SBbc)',
    diameterLabel: '은하 원반 지름',
    diameterValue: '105,700 광년',
    starsLabel: '항성 수',
    starsValue: '1,000억 – 4,000억 개',
    barLabel: '중심 막대 구조',
    barValue: '약 27,000 광년 (기울기 27°)',
    sunDistanceLabel: '태양계 위치',
    sunDistanceValue: '26,670 광년 · 오리온 팔',
    galacticYearLabel: '은하년 (공전 주기)',
    galacticYearValue: '약 2억 3,000만 년 (230 km/s)',
    armsHeading: 'NASA/JPL 발표 4대 나선팔 및 오리온 팔',
    arms: [
      {
        id: 'scutum-centaurus',
        name: '방패–센타우루스 팔 (Scutum–Centaurus)',
        role: '주 나선팔',
        detail:
          '중심 막대의 가까운 끝에서 뻗어 나오는 두 주 나선팔 중 하나로, 젊은 청백색 별들이 밀집해 있습니다.',
      },
      {
        id: 'perseus',
        name: '페르세우스 팔 (Perseus Arm)',
        role: '주 나선팔',
        detail:
          '태양계 바깥쪽을 감싸며 뻗어 있는 또 다른 주 나선팔로, 거대한 별 탄생 성운이 풍부합니다.',
      },
      {
        id: 'sagittarius-carina',
        name: '궁수–용골자리 팔 (Sagittarius–Carina)',
        role: '부 나선팔',
        detail:
          '태양계 안쪽을 지나는 나선팔로 용골자리 성운, 독수리 성운(창조의 기둥) 등이 위치합니다.',
      },
      {
        id: 'norma-outer',
        name: '직각자–외곽 팔 (Norma–Outer)',
        role: '부 나선팔',
        detail:
          '은하 중심부에서 시작해 우리 은하 가장 바깥쪽 원반까지 감아 도는 구조입니다.',
      },
      {
        id: 'orion-spur',
        name: '오리온–백조자리 팔 (Orion–Cygnus Spur)',
        role: '태양계 위치',
        detail:
          '궁수자리 팔과 페르세우스 팔 사이에 위치한 국부 나선팔로, 태양계와 지구가 속해 있습니다.',
      },
    ],
    solarBeaconTitle: '태양계 (태양 · 지구)',
    solarBeaconCategory: '오리온–백조자리 국부 팔',
    solarBeaconDetail:
      '궁수자리 A*에서 26,670광년 · 시속 약 828,000km (230 km/s) 공전 중',
    solarBeaconTag: 'G2V 태양 · 26,670 광년',
    zeroEnvNote:
      '별도의 .env 환경 변수 없이 기본값으로 NASA 공식 기준 우리 은하 시뮬레이션이 100% 로컬 실행됩니다.',
  },
};
