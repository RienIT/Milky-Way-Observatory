import { LanguageCode } from './i18n';
import { LocalizedNodeCopy } from './celestial-translations';

type ExtraTranslationMap = Record<
  Exclude<LanguageCode, 'vi'>,
  Record<string, LocalizedNodeCopy>
>;

export const EXTRA_CELESTIAL_TRANSLATIONS: ExtraTranslationMap = {
  en: {
    'star-sol': {
      title: 'The Sun (Sol · G2V) — Yellow Main-Sequence Star of the Orion Spur',
      createdAt: 'Orion Spur (0.00 ly)',
      summary: [
        'Diameter 1,392,700 km (109.3 R⊕), containing 99.86% of the entire Solar System’s mass.',
        'Located 26,670 light-years (8.18 kpc) from Sagittarius A* inside the Orion-Cygnus Spur.',
        'Orbits the Milky Way center every 230 million years at 230 km/s.',
      ],
      content:
        'Sol is a 4.6-billion-year-old G2V star situated ~55 light-years north of the galactic midplane. Core hydrogen fusion at 15 million Kelvin sustains Earth’s biosphere and gravitationally anchors 8 planets, dwarf planets, asteroid belts, and comets.',
    },
    'star-alpha-cen': {
      title: 'Alpha Centauri A/B (Rigil Kentaurus) — Closest Star System to the Sun',
      createdAt: 'Gaia DR3 (4.37 ly)',
      summary: [
        'ESA Gaia DR3 galactic coordinates: l = 315.72°, b = -0.67°, distance 4.37 light-years.',
        'Triple system comprising Sun-like G2V Alpha Centauri A, K1V B, and red dwarf Proxima Centauri.',
        'Alpha Centauri A measures 1,702,000 km across (1.22 R☉) and shines 1.5× brighter than the Sun.',
      ],
      content:
        'Alpha Centauri is our nearest stellar neighbor in the Milky Way, lying almost directly on the galactic plane in Centaurus and serving as the premier target for future interstellar probes.',
    },
    'star-sirius': {
      title: 'Sirius A (α Canis Majoris) — Brightest Star in Earth’s Night Sky',
      createdAt: 'Gaia DR3 (8.60 ly)',
      summary: [
        'ESA Gaia DR3 coordinates: l = 227.11°, b = -8.89°, distance 8.60 light-years in Canis Major.',
        'Hot blue-white A1V star (9,940 K) with diameter 2,380,000 km and 25.4× solar luminosity.',
        'Orbited by dense white dwarf Sirius B, packing a solar mass into an Earth-sized sphere.',
      ],
      content:
        'Sirius A dominates the night sky at apparent magnitude -1.46. High-precision Gaia astrometry confirms its gradual approach toward the Solar System over the next 60,000 years.',
    },
    'star-vega': {
      title: 'Vega (α Lyrae) — Rapidly Rotating Photometric Standard Star',
      createdAt: 'Gaia DR3 (25.04 ly)',
      summary: [
        'ESA Gaia DR3 coordinates: l = 67.44°, b = +19.24°, distance 25.04 light-years in Lyra.',
        'Spins once every 12.5 hours, flattening its poles and bulging its equator by 23%.',
        'JWST 2024 observations revealed an extraordinarily smooth 100-AU debris disk encircling Vega.',
      ],
      content:
        'Vega served as the zero-magnitude calibration standard of modern astronomy and will become Earth’s North Star around AD 13,727 due to axial precession.',
    },
    'star-polaris': {
      title: 'Polaris (North Star · α Ursae Minoris) — Classical Cepheid Supergiant',
      createdAt: 'Gaia DR3 (446 ly)',
      summary: [
        'ESA Gaia DR3 coordinates: l = 123.28°, b = +26.46°, distance ~446 light-years.',
        'Yellow supergiant (F7Ib) spanning 52.2 million km (37.5 R☉) and radiating 1,260 L☉.',
        'Nearest classical Cepheid variable star, calibrating the extragalactic cosmic distance ladder.',
      ],
      content:
        'Aligned within 0.7° of Earth’s north celestial pole, Polaris Aa pulsates rhythmically every 3.97 days within a triple star system measured precisely by ESA Gaia DR3.',
    },
    'star-antares': {
      title: 'Antares (α Scorpii) — Red Supergiant Heart of Scorpius',
      createdAt: 'VLTI / Gaia (550 ly)',
      summary: [
        'Galactic coordinates: l = 351.95°, b = +15.06°, distance ~550 light-years in Scorpius.',
        'Enormous 946-million-km diameter (~680 R☉)—large enough to engulf Mars’s orbit.',
        'ESO VLTI interferometry mapped giant turbulent convection plumes boiling off its surface.',
      ],
      content:
        'Antares is an evolved M1.5Iab red supergiant inside the Upper Scorpius OB association, destined to end its life in a core-collapse Type II supernova.',
    },
    'star-betelgeuse': {
      title: 'Betelgeuse (α Orionis) — Iconic Red Supergiant of Orion',
      createdAt: 'VLBA / Hubble (642 ly)',
      summary: [
        'Galactic coordinates: l = 199.79°, b = -8.96°, radio/VLBA distance ~642 light-years.',
        'Diameter ~1.064 billion km (~764 R☉), holding over 400 million Solar volumes.',
        'Hubble confirmed its 2019–2020 Great Dimming was triggered by a massive surface dust ejection.',
      ],
      content:
        'Too bright for standard Gaia sensors without saturation, Betelgeuse’s distance and massive convective cells are tracked via VLBA radio parallax and Hubble UV observations.',
    },
    'star-rigel': {
      title: 'Rigel (β Orionis) — Luminous Blue Supergiant of Orion',
      createdAt: 'Gaia / VLBA (860 ly)',
      summary: [
        'Galactic coordinates: l = 209.24°, b = -25.25°, distance ~860 light-years.',
        'B8Ia blue supergiant shining 120,000× brighter than the Sun at 12,100 K surface temperature.',
        'Illuminates the nearby Witch Head reflection nebula with intense ultraviolet radiation.',
      ],
      content:
        'Weighing 21 solar masses with a diameter of ~109.8 million km (79 R☉), Rigel is the brightest star in Orion and the 7th brightest star in Earth’s sky.',
    },
    'star-uy-scuti': {
      title: 'UY Scuti — Extreme Red Hypergiant in the Scutum-Centaurus Arm',
      createdAt: 'Gaia DR3 (5,900 ly)',
      summary: [
        'ESA Gaia DR3 coordinates: l = 18.57°, b = -0.30°, revised Gaia DR3 distance ~5,900 light-years.',
        'Gaia DR3 parallax revised its diameter to ~1.26 billion km (~905 R☉)—still among the largest stars known.',
        'Surrounded by a dense silicate dust shell shed by vigorous stellar winds.',
      ],
      content:
        'Located toward the rich Scutum star cloud near the galactic plane, UY Scuti demonstrates how ESA Gaia DR3 astrometry sharpened our true scale of Milky Way hypergiants.',
    },
    'small-moon': {
      title: 'The Moon (Luna) — Earth’s Tidally Locked Natural Satellite',
      createdAt: 'Solar System (1.00 AU)',
      summary: [
        'Diameter 3,474.8 km (0.273 R⊕), orbiting Earth at 384,400 km (1.00 AU from the Sun).',
        'Stabilizes Earth’s 23.4° axial obliquity and drives oceanic tides.',
        'Destination of NASA Apollo and Artemis human lunar exploration programs.',
      ],
      content:
        'Formed ~4.5 billion years ago from giant impact debris, the Moon preserves ancient cratered highlands, dark basaltic maria, and permanently shadowed polar water-ice craters.',
    },
    'small-ganymede': {
      title: 'Ganymede (Jupiter III) — Largest Moon in the Solar System',
      createdAt: 'Jupiter System (5.20 AU)',
      summary: [
        'Diameter 5,268 km (0.413 R⊕)—physically larger than planet Mercury (4,879 km).',
        'Only moon in the Solar System generating its own intrinsic magnetic field.',
        'Primary target of ESA’s JUICE mission probing its deep subsurface saltwater ocean.',
      ],
      content:
        'Orbiting Jupiter at 5.20 AU, Ganymede displays bright grooved ice terrains, dark cratered regions, and Hubble-detected auroral belts confirming a vast buried ocean.',
    },
    'small-pluto': {
      title: 'Pluto (134340 Pluto) — Kuiper Belt Dwarf Planet',
      createdAt: 'Kuiper Belt (39.48 AU)',
      summary: [
        'NASA New Horizons diameter: 2,376.6 km (0.186 R⊕); semi-major axis 39.48 AU (29.66–49.31 AU).',
        'Features the heart-shaped Sputnik Planitia nitrogen-ice glacier and 3.5-km water-ice mountains.',
        'Forms a binary system with large moon Charon orbiting a shared external barycenter.',
      ],
      content:
        'Revealed in crisp detail by NASA’s New Horizons flyby in 2015, Pluto displays active glacial convection, blue photochemical haze layers, and evidence of a subsurface ocean.',
    },
    'small-eris': {
      title: 'Eris (136199 Eris) — Massive Scattered-Disc Dwarf Planet',
      createdAt: 'Scattered Disc (67.9 AU)',
      summary: [
        'Diameter 2,326 km (0.183 R⊕), yet 27% more massive than Pluto due to a dense rocky interior.',
        'Highly eccentric orbit: 67.9 AU semi-major axis (37.9–97.5 AU), 559-year period.',
        'Its 2005 discovery prompted the IAU to establish the official Dwarf Planet classification.',
      ],
      content:
        'Covered in ultra-bright frozen methane snow (albedo 0.96), Eris was recently analyzed by JWST (2024), revealing isotopic evidence of internal geochemical warmth.',
    },
    'small-ceres': {
      title: 'Ceres (1 Ceres) — Largest Object in the Main Asteroid Belt',
      createdAt: 'Asteroid Belt (2.77 AU)',
      summary: [
        'Diameter 939.4 km (0.074 R⊕), semi-major axis 2.77 AU (2.55–2.98 AU) between Mars and Jupiter.',
        'Accounts for nearly one-third of the entire Main Asteroid Belt’s mass.',
        'NASA Dawn discovered bright sodium-carbonate brine deposits inside Occator Crater.',
      ],
      content:
        'Ceres is the only dwarf planet in the inner Solar System, showing cryovolcanic dome Ahuna Mons and hydrated clay minerals mapped by NASA’s Dawn orbiter.',
    },
    'small-vesta': {
      title: '4 Vesta — Differentiated Protoplanet of the Main Asteroid Belt',
      createdAt: 'Asteroid Belt (2.36 AU)',
      summary: [
        'Mean diameter 525.4 km (irregular ellipsoid 572.6 × 557.2 × 446.4 km), semi-major axis 2.36 AU.',
        'Scarred by the 500-km Rheasilvia impact basin with a 22-km central peak.',
        'Possesses a differentiated iron-nickel core, mantle, and basaltic crust like a mini terrestrial planet.',
      ],
      content:
        'Explored up close by NASA’s Dawn spacecraft (2011–2012), 4 Vesta is the second-most-massive asteroid belt body and source of HED meteorites found on Earth.',
    },
    'small-bennu': {
      title: '101955 Bennu — Carbon-Rich Near-Earth Asteroid (OSIRIS-REx)',
      createdAt: 'Near-Earth (1.13 AU)',
      summary: [
        'Mean diameter just 490 meters (0.49 km · 500 × 490 × 460 m); semi-major axis 1.13 AU (0.90–1.36 AU).',
        'Spinning-top rubble-pile B-type carbonaceous asteroid preserving 4.5-billion-year-old material.',
        'NASA’s OSIRIS-REx returned 121.6 grams of pristine Bennu regolith to Earth in September 2023.',
      ],
      content:
        'Laboratory analysis of NASA OSIRIS-REx samples from Bennu revealed abundant carbon, water-bearing clays, and prebiotic organic compounds from the dawn of the Solar System.',
    },
    'small-halley': {
      title: "Halley's Comet (1P/Halley) — Iconic Short-Period Active Comet",
      createdAt: 'Elliptical Orbit (0.58–35.3 AU)',
      summary: [
        'Dark icy-rock nucleus 15 × 8 × 8 km (~11 km mean); semi-major axis 17.9 AU (0.58–35.3 AU).',
        'Returns to the inner Solar System every 75–76 years; next perihelion in July 2061.',
        'Sublimating water & CO ices produce a luminous coma and blue ion tail stretching millions of km.',
      ],
      content:
        'Imaged up close by ESA’s Giotto probe in 1986, 1P/Halley is the parent body of the annual Eta Aquariid and Orionid meteor showers.',
    },
    'small-oumuamua': {
      title: '1I/ʻOumuamua — First Confirmed Interstellar Visitor',
      createdAt: 'Hyperbolic Orbit (e = 1.20)',
      summary: [
        'Estimated elongated dimensions ~230 × 35 meters, arriving from the direction of Vega.',
        'Hyperbolic trajectory (e = 1.20) with 26.3 km/s excess interstellar velocity.',
        'Discovered in 2017 by Pan-STARRS in Hawaii, exhibiting mild non-gravitational outgassing acceleration.',
      ],
      content:
        '1I/2017 U1 (ʻOumuamua) marked humanity’s first direct detection of a macroscopic object originating from another planetary system within the Milky Way.',
    },
  },
  ja: {
    'star-sol': {
      title: '太陽 (Sol · G2V) — オリオン腕の黄色主系列星',
      createdAt: 'オリオン腕 (0.00 光年)',
      summary: ['直径1,392,700 km（地球の109.3倍）、太陽系質量の99.86%を占める恒星。', 'いて座A*から26,670光年（8.18 kpc）離れたオリオン腕に位置。', '秒速230 kmで約2億3000万年かけて天の川銀河を1周します。'],
      content: '46億歳のG2V型主系列星。中心核の核融合反応が太陽系8惑星・準惑星・小惑星帯・彗星を支えています。',
    },
    'star-alpha-cen': {
      title: 'アルファ・ケンタウリ A/B — 太陽系に最も近い恒星系',
      createdAt: 'Gaia DR3 (4.37 光年)',
      summary: ['Gaia DR3銀河座標：l = 315.72°、b = -0.67°、距離4.37光年。', '太陽に似たA星(G2V)・B星(K1V)と赤色矮星プロキシマからなる三重星系。', 'A星の直径は1,702,000 km（1.22 R☉）で太陽の1.5倍の光度を持ちます。'],
      content: 'ESA Gaia DR3の精密位置天文データで測定された太陽系最寄りの恒星系です。',
    },
    'star-sirius': {
      title: 'シリウス A (おおいぬ座α星) — 夜空で最も明るい恒星',
      createdAt: 'Gaia DR3 (8.60 光年)',
      summary: ['Gaia DR3銀河座標：l = 227.11°、b = -8.89°、距離8.60光年。', '表面温度9,940 Kの青白いA1V型主系列星（直径238万 km、光度25.4 L☉）。', '地球サイズに太陽質量を詰め込んだ白色矮星シリウスBと連星系を形成。'],
      content: '見かけの等級-1.46を誇る全天一の輝星。Gaia観測により太陽系へ緩やかに接近中であることが確認されています。',
    },
    'star-vega': {
      title: 'ベガ (こと座α星) — 高速自転する測光標準星',
      createdAt: 'Gaia DR3 (25.04 光年)',
      summary: ['Gaia DR3銀河座標：l = 67.44°、b = +19.24°、距離25.04光年。', '12.5時間で自転し、赤道が極より23%膨らんだA0V型恒星。', '2024年のJWST観測で半径100 AUの極めて滑らかな塵円盤が確認されました。'],
      content: '等級0.0の基準星として知られ、歳差運動により西暦13,727年頃に地球の北極星となります。',
    },
    'star-polaris': {
      title: 'ポラリス (北極星 · こぐま座α星) — セファイド変光超巨星',
      createdAt: 'Gaia DR3 (446 光年)',
      summary: ['Gaia DR3銀河座標：l = 123.28°、b = +26.46°、距離約446光年。', '直径5,220万 km（37.5 R☉）、太陽の1,260倍輝く黄色超巨星(F7Ib)。', '地球に最も近い古典的セファイド変光星として宇宙距離梯子を校正します。'],
      content: '天の北極から0.7°以内に位置し、3.97日周期で脈動する三重星系です。',
    },
    'star-antares': {
      title: 'アンタレス (さそり座α星) — さそり座の赤色超巨星',
      createdAt: 'VLTI / Gaia (550 光年)',
      summary: ['銀河座標：l = 351.95°、b = +15.06°、距離約550光年。', '直径約9億4,600万 km（680 R☉）— 太陽の位置に置けば火星軌道を飲み込みます。', 'ESO VLTI干渉計により巨大な対流ガス流の速度マップが撮影されました。'],
      content: 'さそり座OBアソシエーションに属するM1.5Iab型赤色超巨星で、将来II型超新星爆発を起こします。',
    },
    'star-betelgeuse': {
      title: 'ベテルギウス (オリオン座α星) — オリオン座の赤色超巨星',
      createdAt: 'VLBA / Hubble (642 光年)',
      summary: ['銀河座標：l = 199.79°、b = -8.96°、電波視差距離約642光年。', '直径約10.6億 km（約764 R☉）、太陽4億個以上の体積を誇ります。', '2019〜2020年の大減光は表面からの巨大な塵放出によるものとハッブルが確認。'],
      content: 'オリオン腕の代表的な赤色超巨星。10万年以内に超新星爆発を迎えると考えられています。',
    },
    'star-rigel': {
      title: 'リゲル (オリオン座β星) — 超高輝度の青色超巨星',
      createdAt: 'Gaia / VLBA (860 光年)',
      summary: ['銀河座標：l = 209.24°、b = -25.25°、距離約860光年。', '表面温度12,100 K、太陽の12万倍の光度を放つB8Ia型青色超巨星。', '強力な紫外線で近隣の魔女の横顔星雲を照らし出しています。'],
      content: '質量は太陽の21倍、直径約1.1億 km（79 R☉）に達するオリオン座最輝星です。',
    },
    'star-uy-scuti': {
      title: 'たて座UY星 — たて・ケンタウルス腕の赤色極超巨星',
      createdAt: 'Gaia DR3 (5,900 光年)',
      summary: ['Gaia DR3銀河座標：l = 18.57°、b = -0.30°、Gaia DR3改訂距離約5,900光年。', 'Gaia DR3視差により直径約12.6億 km（約905 R☉）へ精密改訂。', '激しい恒星風により周囲に厚い珪酸塩ダスト殻を形成しています。'],
      content: 'Gaia DR3の精密観測によって距離と実サイズが再評価された銀河最大級の赤色超巨星です。',
    },
    'small-moon': {
      title: '月 (The Moon) — 地球の自然衛星',
      createdAt: '太陽系 (1.00 AU)',
      summary: ['直径3,474.8 km（0.273 R⊕）、地球から平均384,400 kmを公転。', '地球の自転軸傾き（23.4°）を安定させ潮汐を生み出します。', 'アポロ計画およびNASAアルテミス計画の有人探査目標天体。'],
      content: '約45億年前の巨大衝突で誕生。南極の永久影クレーターには水氷が存在します。',
    },
    'small-ganymede': {
      title: 'ガニメデ (木星第3衛星) — 太陽系最大の衛星',
      createdAt: '木星系 (5.20 AU)',
      summary: ['直径5,268 km（0.413 R⊕）— 惑星である水星（4,879 km）より大型。', '太陽系の衛星で唯一、固有の磁場を生成しています。', 'ESAのJUICE探査機が氷殻下の広大な塩水海を調査予定。'],
      content: '木星を公転するガリレオ衛星最大天体。ハッブル観測によりオーロラ帯と地下海が裏付けられました。',
    },
    'small-pluto': {
      title: '冥王星 (134340 Pluto) — カイパーベルトの準惑星',
      createdAt: 'カイパーベルト (39.48 AU)',
      summary: ['NASAニュー・ホライズンズ実測直径2,376.6 km（0.186 R⊕）、軌道長半径39.48 AU。', 'ハート型の窒素氷平原スプートニク平原と高さ3,500 mの水氷山脈を持ちます。', '巨大衛星カロンと共通重心の周りを回る二重天体系を形成。'],
      content: '2015年のフライバイで活発な氷河対流と青いメタン霧の大気が明らかになりました。',
    },
    'small-eris': {
      title: 'エリス (136199 Eris) — 散乱円盤の巨大準惑星',
      createdAt: '散乱円盤 (67.9 AU)',
      summary: ['直径2,326 km（0.183 R⊕）ながら高密度な岩石核により冥王星より27%重い。', '軌道長半径67.9 AU（近日点37.9 AU〜遠日点97.5 AU）、公転周期559年。', '2005年の発見がIAUによる「準惑星」定義の直接的契機となりました。'],
      content: 'アルベド0.96の真っ白なメタン霜に覆われ、JWST観測で内部地熱活動の痕跡が示されました。',
    },
    'small-ceres': {
      title: 'ケレス (1 Ceres) — 小惑星帯最大の準惑星',
      createdAt: '小惑星帯 (2.77 AU)',
      summary: ['直径939.4 km（0.074 R⊕）、軌道長半径2.77 AU（火星と木星の間）。', 'メインベルト全質量の約3分の1を占める内側太陽系唯一の準惑星。', 'NASAドーン探査機がオッカトル・クレーターの明るい炭酸ナトリウム塩斑を発見。'],
      content: '含水粘土鉱物と氷火山アフナ山を持つ地質学的に活発な氷・岩石天体です。',
    },
    'small-vesta': {
      title: '小惑星 4 ベスタ — 巨大な原始惑星',
      createdAt: '小惑星帯 (2.36 AU)',
      summary: ['平均直径525.4 km（不規則楕円体572.6×557.2×446.4 km）、軌道長半径2.36 AU。', '直径500 km・中央丘高さ22 kmの巨大クレーター「レアシルヴィア」を刻みます。', '鉄・ニッケル核と玄武岩地殻に分化した原始惑星構造を保持。'],
      content: 'NASAドーン探査機により詳細にマッピングされ、地球に落下するHED隕石の母天体と確認されました。',
    },
    'small-bennu': {
      title: '小惑星 101955 ベンヌ — OSIRIS-REx サンプル帰還天体',
      createdAt: '地球近傍 (1.13 AU)',
      summary: ['直径わずか490メートル（0.49 km）、軌道長半径1.13 AU（0.90〜1.36 AU）。', '45億年前の炭素質物質を保存するラブルパイル（瓦礫集積）型B型小惑星。', 'NASA OSIRIS-RExが2023年9月に121.6gの試料を地球へ帰還させました。'],
      content: '帰還試料から豊富な炭素・含水鉱物・生命前駆有機化合物が検出されています。',
    },
    'small-halley': {
      title: 'ハレー彗星 (1P/Halley) — 最も有名な短周期彗星',
      createdAt: '楕円軌道 (0.58–35.3 AU)',
      summary: ['核サイズ15×8×8 km（平均約11 km）、軌道長半径17.9 AU（0.58〜35.3 AU）。', '75〜76年周期で回帰し、次回近日点通過は2061年7月。', '太陽接近時に水氷と一酸化炭素が昇華し壮大なコマと青いイオン尾を形成。'],
      content: '1986年にESAジオット探査機が至近距離撮影に成功。みずがめ座η流星群とオリオン座流星群の母彗星です。',
    },
    'small-oumuamua': {
      title: '恒星間天体 1I/オウムアムア — 史上初の太陽系外からの来訪者',
      createdAt: '双曲線軌道 (e = 1.20)',
      summary: ['推定サイズ約230×35メートルの細長い葉巻・円盤状天体。こと座ベガ方向から飛来。', '離心率e = 1.20の双曲線軌道、恒星間超過速度26.3 km/sで太陽系を通過。', '2017年にハワイPan-STARRSが発見し、微弱な非重力加速が観測されました。'],
      content: '天の川銀河の別恒星系から飛来したことが確認された人類史上初の恒星間天体です。',
    },
  },
  zh: {
    'star-sol': {
      title: '太阳 (Sol · G2V) — 猎户臂黄矮星与太阳系核心',
      createdAt: '猎户臂 (0.00 光年)',
      summary: ['直径 1,392,700 km（地球的 109.3 倍），占据太阳系总质量的 99.86%。', '位于距人马座 A* 26,670 光年（8.18 kpc）的猎户-天鹅支臂。', '以 230 km/s 速度每 2.3 亿年绕银河系中心公转一周。'],
      content: '太阳是一颗 46 亿岁的 G2V 主序星，核心 1500 万 K 核聚变维系着八大行星、矮行星、小行星带与彗星的引力系统。',
    },
    'star-alpha-cen': {
      title: '半人马座 α 星 A/B（南门二）— 距太阳最近的恒星系统',
      createdAt: 'Gaia DR3 (4.37 光年)',
      summary: ['ESA Gaia DR3 银道坐标：l = 315.72°，b = -0.67°，距离 4.37 光年。', '由类太阳双星 α Cen A/B 与红矮星比邻星组成的三合星系统。', 'A 星直径 1,702,000 km（1.22 R☉），光度为太阳的 1.5 倍。'],
      content: '距离太阳系最近的恒星邻居，位于银道面附近，是未来星际航行的首要目的地。',
    },
    'star-sirius': {
      title: '天狼星 A (Sirius A · A1V) — 夜空中最亮的恒星',
      createdAt: 'Gaia DR3 (8.60 光年)',
      summary: ['Gaia DR3 银道坐标：l = 227.11°，b = -8.89°，距离 8.60 光年。', '表面温度 9,940 K 的蓝白色 A1V 恒星，直径 238 万 km，光度达太阳 25.4 倍。', '与地球大小的致密白矮星天狼星 B 构成双星系统。'],
      content: '视星等达 -1.46，Gaia 高精度视差测量证实它正缓慢向太阳系靠近。',
    },
    'star-vega': {
      title: '织女星 (Vega · 天琴座 α) — 高速自转的天文测光标准星',
      createdAt: 'Gaia DR3 (25.04 光年)',
      summary: ['Gaia DR3 银道坐标：l = 67.44°，b = +19.24°，距离 25.04 光年。', '自转周期仅 12.5 小时，赤道比两极隆起 23%。', 'JWST 2024 年观测揭示其周围存在极其平滑的 100 AU 尘埃碎屑盘。'],
      content: '现代天文学 0 等星校准基准，受岁差影响将在公元 13,727 年成为地球北极星。',
    },
    'star-polaris': {
      title: '北极星 (Polaris · 勾陈一) — 经典造父变星超巨星',
      createdAt: 'Gaia DR3 (446 光年)',
      summary: ['Gaia DR3 银道坐标：l = 123.28°，b = +26.46°，距离约 446 光年。', '直径 5,220 万 km（37.5 R☉）、光度达太阳 1,260 倍的 F7Ib 黄色超巨星。', '距地球最近的造父变星，用于校准河外星系宇宙距离阶梯。'],
      content: '位于天北极 0.7° 以内，以 3.97 天周期规律脉动的三合星系统。',
    },
    'star-antares': {
      title: '心宿二 (Antares · 天蝎座 α) — 天蝎座红超巨星',
      createdAt: 'VLTI / Gaia (550 光年)',
      summary: ['银道坐标：l = 351.95°，b = +15.06°，距离约 550 光年。', '直径约 9.46 亿 km（680 R☉）——若置于太阳位置可吞没火星轨道。', 'ESO VLTI 干涉仪绘制了其沸腾对流大气的速度图。'],
      content: '上天蝎座 OB 星协中的 M1.5Iab 红超巨星，未来将以 II 型超新星爆发谢幕。',
    },
    'star-betelgeuse': {
      title: '参宿四 (Betelgeuse · 猎户座 α) — 猎户座红超巨星',
      createdAt: 'VLBA / Hubble (642 光年)',
      summary: ['银道坐标：l = 199.79°，b = -8.96°，射电视差距离约 642 光年。', '直径约 10.64 亿 km（~764 R☉），体积可容纳超过 4 亿个太阳。', '哈勃证实 2019–2020 年“大变暗”源于表面喷发的巨型尘埃云。'],
      content: '位于猎户臂的著名红超巨星，预计在未来 10 万年内爆发为超新星。',
    },
    'star-rigel': {
      title: '参宿七 (Rigel · 猎户座 β) — 超高光度蓝超巨星',
      createdAt: 'Gaia / VLBA (860 光年)',
      summary: ['银道坐标：l = 209.24°，b = -25.25°，距离约 860 光年。', 'B8Ia 蓝超巨星，表面温度 12,100 K，亮度高达太阳的 12 万倍。', '强烈紫外辐射照亮邻近的女巫头反射星云。'],
      content: '质量为太阳 21 倍、直径约 1.1 亿 km（79 R☉），是猎户座最亮恒星。',
    },
    'star-uy-scuti': {
      title: '盾牌座 UY (UY Scuti) — 盾牌-半人马臂红特超巨星',
      createdAt: 'Gaia DR3 (5,900 光年)',
      summary: ['Gaia DR3 银道坐标：l = 18.57°，b = -0.30°，Gaia DR3 修订距离约 5,900 光年。', '依据 Gaia DR3 视差修订直径约 12.6 亿 km（~905 R☉），仍是银河系最大恒星之一。', '猛烈星风在周围抛射出厚重的硅酸盐尘埃包层。'],
      content: 'ESA Gaia DR3 精密天体测量重新标定了这颗银河巨兽的真实距离与尺度。',
    },
    'small-moon': {
      title: '月球 (The Moon) — 地球的天然卫星',
      createdAt: '太阳系 (1.00 AU)',
      summary: ['直径 3,474.8 km（0.273 R⊕），距地球平均 384,400 km。', '稳定地球 23.4° 自转倾角并引发海洋潮汐。', '阿波罗计划与 NASA 阿尔忒弥斯载人登月目标。'],
      content: '约 45 亿年前大碰撞形成，保留古老撞击高地、玄武岩月海与南极永久阴影水冰。',
    },
    'small-ganymede': {
      title: '木卫三 (Ganymede) — 太阳系最大的卫星',
      createdAt: '木星系 (5.20 AU)',
      summary: ['直径 5,268 km（0.413 R⊕）——比水星（4,879 km）更大。', '太阳系唯一拥有自身内禀磁场的卫星。', 'ESA JUICE 探测器正在前往勘测其冰壳下巨型咸水海洋。'],
      content: '绕木星公转于 5.20 AU，哈勃观测到极光带证实其地下深海的存在。',
    },
    'small-pluto': {
      title: '冥王星 (134340 Pluto) — 柯伊伯带矮行星',
      createdAt: '柯伊伯带 (39.48 AU)',
      summary: ['NASA 新视野号实测直径 2,376.6 km（0.186 R⊕），半长轴 39.48 AU（29.66–49.31 AU）。', '拥有心形氮冰平原斯普特尼克平原与 3,500 米高水冰山脉。', '与大卫星卡戎构成双天体系统，绕外部共同质心旋转。'],
      content: '2015 年新视野号飞掠揭示了冥王星活跃的冰川对流与蓝色甲烷薄雾大气。',
    },
    'small-eris': {
      title: '阋神星 (136199 Eris) — 离散盘冰封矮行星',
      createdAt: '离散盘 (67.9 AU)',
      summary: ['直径 2,326 km（0.183 R⊕），但因致密岩石核比冥王星重 27%。', '高偏心率轨道：半长轴 67.9 AU（37.9–97.5 AU），公转周期 559 年。', '2005 年的发现促使 IAU 正式确立“矮行星”分类。'],
      content: '表面覆盖反照率高达 0.96 的甲烷冰霜，JWST 2024 年观测揭示其内部地热活动线索。',
    },
    'small-ceres': {
      title: '谷神星 (1 Ceres) — 主小行星带最大矮行星',
      createdAt: '主小行星带 (2.77 AU)',
      summary: ['直径 939.4 km（0.074 R⊕），半长轴 2.77 AU（火星与木星之间）。', '占整个主小行星带总质量的近三分之一，是内太阳系唯一矮行星。', 'NASA 黎明号在奥卡托陨石坑发现明亮的碳酸钠盐水冰火山沉积。'],
      content: '拥有含水粘土外壳、冰火山阿胡纳山与地下卤水囊。',
    },
    'small-vesta': {
      title: '灶神星 (4 Vesta) — 分异岩石原行星',
      createdAt: '主小行星带 (2.36 AU)',
      summary: ['平均直径 525.4 km（不规则椭球 572.6 × 557.2 × 446.4 km），半长轴 2.36 AU。', '南极拥有宽 500 km、中央峰高达 22 km 的雷亚西尔维亚撞击盆地。', '具备类似类地行星的铁镍核心、地幔与玄武岩地壳。'],
      content: 'NASA 黎明号探测器证实灶神星是地球上 HED 陨石的母体。',
    },
    'small-bennu': {
      title: '贝努小行星 (101955 Bennu) — OSIRIS-REx 采样返回近地小行星',
      createdAt: '近地轨道 (1.13 AU)',
      summary: ['直径仅 490 米（0.49 km），半长轴 1.13 AU（0.90–1.36 AU）。', '保存 45 亿年太阳系原始物质的 B 型富碳碎石堆小行星。', 'NASA OSIRIS-REx 于 2023 年 9 月成功带回 121.6 克贝努样本。'],
      content: '样本分析发现了丰富的碳元素、含水粘土与生命前驱有机物。',
    },
    'small-halley': {
      title: '哈雷彗星 (1P/Halley) — 最著名的短周期活跃彗星',
      createdAt: '椭圆轨道 (0.58–35.3 AU)',
      summary: ['冰岩彗核尺寸 15 × 8 × 8 km（均值约 11 km），半长轴 17.9 AU（0.58–35.3 AU）。', '每 75–76 年回归一次，下次过近日点为 2061 年 7 月。', '接近太阳时水冰与 CO 升华形成明亮彗发与数千万公里蓝离子尾。'],
      content: '1986 年 ESA 乔托号近距成像，是宝瓶座 η 流星雨与猎户座流星雨的母彗星。',
    },
    'small-oumuamua': {
      title: '星际天体奥陌陌 (1I/ʻOumuamua) — 人类首次确认的系外来客',
      createdAt: '双曲线轨道 (e = 1.20)',
      summary: ['估算尺寸约 230 × 35 米的细长雪茄/薄盘外形，来自织女星方向。', '偏心率 e = 1.20 的双曲线轨道，星际超额速度 26.3 km/s。', '2017 年由夏威夷 Pan-STARRS 发现，观测到微弱非引力排气加速。'],
      content: '人类首次直接探测到来自银河系另一恒星系统的宏观天体。',
    },
  },
  ko: {
    'star-sol': {
      title: '태양 (Sol · G2V) — 오리온 팔의 황색 주계열성',
      createdAt: '오리온 팔 (0.00 광년)',
      summary: ['지름 1,392,700 km(지구의 109.3배), 태양계 전체 질량의 99.86%를 차지합니다.', '은하 중심 궁수자리 A*에서 26,670광년(8.18 kpc) 떨어진 오리온 팔에 위치합니다.', '초속 230 km로 2억 3천만 년마다 우리은하를 한 바퀴 공전합니다.'],
      content: '46억 살의 G2V 주계열성으로 8개 행성, 왜행성, 소행성대, 혜성을 중력으로 묶고 있습니다.',
    },
    'star-alpha-cen': {
      title: '알파 센타우리 A/B — 태양에서 가장 가까운 항성계',
      createdAt: 'Gaia DR3 (4.37 광년)',
      summary: ['ESA Gaia DR3 은하좌표: l = 315.72°, b = -0.67°, 거리 4.37광년.', '태양과 유사한 A(G2V)·B(K1V) 쌍성과 적색왜성 프록시마로 구성된 삼중성계.', '알파 센타우리 A 지름은 1,702,000 km(1.22 R☉)로 태양보다 1.5배 밝습니다.'],
      content: '우리은하에서 태양계와 가장 가까운 이웃 항성계로 미래 성간 탐사의 최우선 목표입니다.',
    },
    'star-sirius': {
      title: '시리우스 A (큰개자리 α) — 밤하늘에서 가장 밝은 별',
      createdAt: 'Gaia DR3 (8.60 광년)',
      summary: ['Gaia DR3 은하좌표: l = 227.11°, b = -8.89°, 거리 8.60광년.', '표면온도 9,940 K의 청백색 A1V 주계열성(지름 238만 km, 태양 광도의 25.4배).', '지구 크기에 태양 질량을 응축한 백색왜성 시리우스 B와 쌍성을 이룹니다.'],
      content: '겉보기 등급 -1.46의 전천 최고 밝기 항성으로 Gaia 시차 관측으로 정밀 측정되었습니다.',
    },
    'star-vega': {
      title: '베가 (직녀성 · 거문고자리 α) — 고속 자전 측광 기준별',
      createdAt: 'Gaia DR3 (25.04 광년)',
      summary: ['Gaia DR3 은하좌표: l = 67.44°, b = +19.24°, 거리 25.04광년.', '12.5시간 만에 1회 자전해 적도가 극보다 23% 부푼 A0V 별입니다.', 'JWST 2024 관측으로 반경 100 AU의 매끄러운 먼지 원반이 확인되었습니다.'],
      content: '현대 천문학 0등급 기준별이며 세차운동으로 서기 13,727년경 지구의 북극성이 됩니다.',
    },
    'star-polaris': {
      title: '폴라리스 (북극성 · 작은곰자리 α) — 세페이드 변광 초거성',
      createdAt: 'Gaia DR3 (446 광년)',
      summary: ['Gaia DR3 은하좌표: l = 123.28°, b = +26.46°, 거리 약 446광년.', '지름 5,220만 km(37.5 R☉), 태양의 1,260배 광도를 지닌 황색 초거성(F7Ib).', '지구에서 가장 가까운 고전적 세페이드 변광성으로 우주 거리 사다리를 보정합니다.'],
      content: '천구의 북극에서 0.7° 이내에 위치하며 3.97일 주기로 맥동하는 삼중성계입니다.',
    },
    'star-antares': {
      title: '안타레스 (전갈자리 α) — 전갈자리의 적색 초거성',
      createdAt: 'VLTI / Gaia (550 광년)',
      summary: ['은하좌표: l = 351.95°, b = +15.06°, 거리 약 550광년.', '지름 약 9억 4,600만 km(680 R☉)로 태양 자리에 놓으면 화성 궤도를 삼킵니다.', 'ESO VLTI 간섭계로 거대 대류 대기 흐름이 직접 영상화되었습니다.'],
      content: '전갈자리 OB 성협에 속한 M1.5Iab 적색 초거성으로 향후 II형 초신성 폭발을 맞이합니다.',
    },
    'star-betelgeuse': {
      title: '베텔게우스 (오리온자리 α) — 오리온의 적색 초거성',
      createdAt: 'VLBA / Hubble (642 광년)',
      summary: ['은하좌표: l = 199.79°, b = -8.96°, 전파 시차 거리 약 642광년.', '지름 약 10.64억 km(~764 R☉), 태양 4억 개 이상을 담는 초대형 부피.', '허블 망원경은 2019~2020년 대감광이 표면 먼지 구름 분출 때문임을 규명했습니다.'],
      content: '오리온 팔의 대표적인 적색 초거성으로 10만 년 이내 초신성 폭발이 예상됩니다.',
    },
    'star-rigel': {
      title: '리겔 (오리온자리 β) — 초고광도 청색 초거성',
      createdAt: 'Gaia / VLBA (860 광년)',
      summary: ['은하좌표: l = 209.24°, b = -25.25°, 거리 약 860광년.', '표면온도 12,100 K, 태양의 12만 배 밝기로 빛나는 B8Ia 청색 초거성.', '강렬한 자외선으로 인근 마녀머리 성운을 밝히고 있습니다.'],
      content: '태양 질량의 21배, 지름 약 1.1억 km(79 R☉)에 달하는 오리온자리 최고 밝기 별입니다.',
    },
    'star-uy-scuti': {
      title: '방패자리 UY (UY Scuti) — 방패-센타우루스 팔 적색 극대거성',
      createdAt: 'Gaia DR3 (5,900 광년)',
      summary: ['Gaia DR3 은하좌표: l = 18.57°, b = -0.30°, Gaia DR3 개정 거리 약 5,900광년.', 'Gaia DR3 시차로 지름 약 12.6억 km(~905 R☉)로 정밀 재산정.', '강력한 항성풍으로 두꺼운 규산염 먼지 껍질을 방출하고 있습니다.'],
      content: 'ESA Gaia DR3 정밀 측정으로 실제 거리와 규모가 새롭게 보정된 우리은하 대표 극대거성입니다.',
    },
    'small-moon': {
      title: '달 (The Moon) — 지구의 자연 위성',
      createdAt: '태양계 (1.00 AU)',
      summary: ['지름 3,474.8 km(0.273 R⊕), 지구에서 평균 384,400 km 궤도를 공전.', '지구의 23.4° 자전축을 안정화하고 해양 조석을 일으킵니다.', '아폴로 및 NASA 아르테미스 유인 달 탐사 목표 천체입니다.'],
      content: '약 45억 년 전 거대 충돌로 형성되었으며 남극 영구음영 분화구에 물 얼음이 보존되어 있습니다.',
    },
    'small-ganymede': {
      title: '가니메데 (목성 III) — 태양계에서 가장 큰 위성',
      createdAt: '목성계 (5.20 AU)',
      summary: ['지름 5,268 km(0.413 R⊕)로 행성인 수성(4,879 km)보다 큽니다.', '태양계 위성 중 유일하게 자체 고유 자기장을 생성합니다.', 'ESA JUICE 탐사선이 얼음 지각 아래 거대 지하 바다를 탐사할 예정입니다.'],
      content: '목성을 공전하는 갈릴레이 최대 위성으로 허블 오로라 관측이 지하 해수의 존재를 뒷받침합니다.',
    },
    'small-pluto': {
      title: '명왕성 (134340 Pluto) — 카이퍼 벨트 왜행성',
      createdAt: '카이퍼 벨트 (39.48 AU)',
      summary: ['NASA 뉴호라이즌스 실측 지름 2,376.6 km(0.186 R⊕), 장반경 39.48 AU(29.66~49.31 AU).', '하트 모양 질소 얼음 평원 스푸트니크 평원과 높이 3.5 km 물얼음 산맥이 특징.', '대형 위성 카론과 외부 공통질량중심을 도는 이중 천체계를 이룹니다.'],
      content: '2015년 뉴호라이즌스 근접 비행으로 활발한 빙하 대류와 푸른 메탄 연무 대기가 밝혀졌습니다.',
    },
    'small-eris': {
      title: '에리스 (136199 Eris) — 산란원반 대형 왜행성',
      createdAt: '산란원반 (67.9 AU)',
      summary: ['지름 2,326 km(0.183 R⊕)이나 고밀도 암석 핵으로 명왕성보다 27% 무겁습니다.', '고이심률 궤도: 장반경 67.9 AU(37.9~97.5 AU), 공전주기 559년.', '2005년 발견이 IAU의 공식 왜행성 정의 수립을 이끌었습니다.'],
      content: '반사율 0.96의 밝은 메탄 서리로 덮여 있으며 JWST 2024 관측이 내부 지열 흔적을 포착했습니다.',
    },
    'small-ceres': {
      title: '세레스 (1 Ceres) — 소행성대 최대 왜행성',
      createdAt: '소행성대 (2.77 AU)',
      summary: ['지름 939.4 km(0.074 R⊕), 장반경 2.77 AU(화성과 목성 사이).', '메인 소행성대 전체 질량의 약 1/3을 차지하는 내태양계 유일의 왜행성.', 'NASA 돈(Dawn) 탐사선이 오카토르 분화구의 밝은 탄산나트륨 염수 퇴적물을 발견했습니다.'],
      content: '함수 점토 지각, 얼음 화산 아후나 몬스, 지하 염수층을 지닌 천체입니다.',
    },
    'small-vesta': {
      title: '4 베스타 — 소행성대의 분화된 원시행성',
      createdAt: '소행성대 (2.36 AU)',
      summary: ['평균 지름 525.4 km(불규칙 타원체 572.6×557.2×446.4 km), 장반경 2.36 AU.', '남극에 지름 500 km, 중앙봉 높이 22 km의 거대 레아실비아 분화구가 있습니다.', '철-니켈 핵과 현무암 지각으로 분화된 지구형 원시행성 구조를 지닙니다.'],
      content: 'NASA 돈 탐사선이 정밀 촬영했으며 지구에 떨어지는 HED 운석의 모천체로 확인되었습니다.',
    },
    'small-bennu': {
      title: '101955 베누 — OSIRIS-REx 샘플 귀환 근지구 소행성',
      createdAt: '근지구 (1.13 AU)',
      summary: ['지름 불과 490m(0.49 km), 장반경 1.13 AU(0.90~1.36 AU).', '45억 년 전 원시 탄소를 간직한 B형 자갈더미(rubble-pile) 소행성.', 'NASA OSIRIS-REx가 2023년 9월 121.6g의 표토 시료를 지구로 귀환시켰습니다.'],
      content: '시료 분석에서 풍부한 탄소, 함수 광물 및 생명 기원 유기 분자가 검출되었습니다.',
    },
    'small-halley': {
      title: '핼리 혜성 (1P/Halley) — 가장 유명한 단주기 활성 혜성',
      createdAt: '타원 궤도 (0.58–35.3 AU)',
      summary: ['핵 크기 15×8×8 km(평균 약 11 km), 장반경 17.9 AU(0.58~35.3 AU).', '75~76년 주기로 태양에 접근하며 다음 근일점 통과는 2061년 7월입니다.', '태양 근접 시 얼음이 승화해 거대한 코마와 푸른 이온 꼬리를 형성합니다.'],
      content: '1986년 ESA 조토 탐사선이 근접 촬영했으며 물병자리 에타 및 오리온자리 유성우의 모혜성입니다.',
    },
    'small-oumuamua': {
      title: '성간 천체 1I/오우무아무아 — 최초 확인된 태양계 외부 방문객',
      createdAt: '쌍곡선 궤도 (e = 1.20)',
      summary: ['추정 크기 약 230×35m의 길쭉한 시가형 천체로 베가 방향에서 진입.', '이심률 e = 1.20의 쌍곡선 궤도, 성간 초과 속도 26.3 km/s.', '2017년 하와이 Pan-STARRS가 발견했으며 미세한 비중력 가속이 관측되었습니다.'],
      content: '우리은하 내 다른 항성계에서 날아온 것이 확인된 인류 최초의 성간 천체입니다.',
    },
  },
};
