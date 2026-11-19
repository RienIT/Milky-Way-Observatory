import { MemoryCategory, RealBlackHoleComparison } from './memory-types';

export type LanguageCode = 'vi' | 'en' | 'ja' | 'zh' | 'ko';

export interface LanguageOption {
  code: LanguageCode;
  nativeLabel: string;
  shortCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', nativeLabel: 'Tiếng Việt', shortCode: 'VI' },
  { code: 'en', nativeLabel: 'English', shortCode: 'EN' },
  { code: 'ja', nativeLabel: '日本語', shortCode: 'JA' },
  { code: 'zh', nativeLabel: '中文', shortCode: 'ZH' },
  { code: 'ko', nativeLabel: '한국어', shortCode: 'KO' },
];

export interface BlackHoleAnatomyItem {
  code: string;
  title: string;
  detail: string;
}

export interface LocalizedPlanetSpec {
  designation: string;
  planetType: string;
  realInspiration: string;
  atmosphereComposition: string;
}

export interface UIStrings {
  brandTitle: string;
  navExplorer: string;
  navBlackHole: string;
  navCatalog: string;
  navSimulator: string;
  languageLabel: string;

  // Sidebar & Search
  sidebarTitle: string;
  searchPlaceholder: string;
  allCategories: string;
  objectsCountUnit: string;
  featuredBlackHoleTitle: string;
  featuredBlackHoleSubtitle: string;
  inspectCoreAction: string;
  noSearchResults: string;
  resetFilters: string;
  hideSidebar: string;
  showSidebar: string;
  restoreAtlas: string;

  // 3D Stage Controls
  pauseOrbit: string;
  resumeOrbit: string;
  constellationLines: string;
  orbitRings: string;
  onLabel: string;
  offLabel: string;
  resetCamera: string;
  canvasHint: string;
  webglFallbackTitle: string;
  webglFallbackDesc: string;

  // Hover Tooltip
  bhTooltipTitle: string;
  bhTooltipCategory: string;
  bhTooltipAction: string;

  // Inspector Drawer — Black Hole Lab
  bhBadge: string;
  bhHeadline: string;
  bhCompareLabel: string;
  bhMassLabel: string;
  bhHorizonLabel: string;
  bhSpinLabel: string;
  bhDistanceLabel: string;
  bhAnatomyHeading: string;
  bhInnerPlanetsHeading: string;
  closeInspector: string;

  // Inspector Drawer — Planet Dossier
  planetSpecsHeading: string;
  planetClassLabel: string;
  planetInspirationLabel: string;
  planetTempLabel: string;
  planetGravityLabel: string;
  planetAtmoLabel: string;
  planetRingsLabel: string;
  planetRingsYes: string;
  planetRingsNo: string;
  planetOrbitLabel: string;
  planetKeyFindings: string;
  planetOverviewHeading: string;
  planetTagsHeading: string;
  planetRelatedHeading: string;
  deleteObjectBtn: string;
  viewIn3DBtn: string;

  // Catalog View
  catalogHeroKicker: string;
  catalogHeroTitle: string;
  catalogHeroSubtitle: string;
  catalogOpenBhLab: string;
  catalogAddAiBtn: string;
  catalogShowingText: string;

  // AI Simulator Modal
  modalTitle: string;
  modalSubtitle: string;
  modalPresetsLabel: string;
  modalNameLabel: string;
  modalNamePlaceholder: string;
  modalCategoryLabel: string;
  modalDescLabel: string;
  modalDescPlaceholder: string;
  modalCharCount: string;
  modalErrorMinChars: string;
  modalErrorGeneric: string;
  modalCancelBtn: string;
  modalSubmitBtn: string;
  modalLoadingBtn: string;
  modalFooterNote: string;
  modalPresets: Array<{
    label: string;
    title: string;
    category: MemoryCategory;
    content: string;
  }>;

  // Categories
  categories: Record<
    MemoryCategory,
    { label: string; shortLabel: string; description: string }
  >;

  // Black Hole Anatomy & Comparisons
  blackHoleAnatomy: BlackHoleAnatomyItem[];
  famousBlackHoles: RealBlackHoleComparison[];

  // Archetype specs (keyed by original designation)
  planetSpecOverrides: Record<string, LocalizedPlanetSpec>;
}

export const UI_STRINGS: Record<LanguageCode, UIStrings> = {
  vi: {
    brandTitle: 'Milky Way Observatory',
    navExplorer: 'Dải Ngân Hà 3D',
    navBlackHole: 'Tâm Sgr A* & NASA',
    navCatalog: 'Thư viện Hành tinh',
    navSimulator: 'Mô phỏng AI',
    languageLabel: 'Ngôn ngữ',

    sidebarTitle: 'Danh mục Thiên thể',
    searchPlaceholder: 'Tìm hành tinh, hố đen, từ khóa...',
    allCategories: 'Tất cả',
    objectsCountUnit: 'thiên thể',
    featuredBlackHoleTitle: 'Tâm Dải Ngân Hà · Sgr A*',
    featuredBlackHoleSubtitle: '4,3 Triệu M☉ · Mô phỏng NASA Milky Way',
    inspectCoreAction: 'Phân tích',
    noSearchResults: 'Không tìm thấy thiên thể nào phù hợp.',
    resetFilters: 'Xóa bộ lọc',
    hideSidebar: 'Thu gọn danh sách',
    showSidebar: 'Mở danh sách',
    restoreAtlas: 'Khôi phục 48 thiên thể gốc',

    pauseOrbit: 'Tạm dừng',
    resumeOrbit: 'Tiếp tục',
    constellationLines: 'Tuyến quang phổ',
    orbitRings: 'Quỹ đạo tròn',
    onLabel: 'Bật',
    offLabel: 'Tắt',
    resetCamera: 'Góc nhìn toàn cảnh',
    canvasHint: 'Kéo để xoay 360° · Cuộn để thu phóng · Nhấp vào lõi Sagittarius A*, Hệ Mặt Trời hoặc hành tinh để xem hồ sơ NASA',
    webglFallbackTitle: 'Chế độ Thư viện Thiên văn',
    webglFallbackDesc: 'Trình duyệt hiện chưa bật WebGL, hãy dùng tab Thư viện Hành tinh để khám phá toàn bộ 48 thiên thể.',

    bhTooltipTitle: 'Hố Đen Siêu Khối Lượng Sagittarius A* (4,3 Triệu M☉)',
    bhTooltipCategory: 'Tâm Dải Ngân Hà (Milky Way · EHT/NASA)',
    bhTooltipAction: 'Nhấp để mở Hồ sơ Dải Ngân Hà NASA & Vật lý Hố Đen',

    bhBadge: 'Tâm Dải Ngân Hà · Chuẩn NASA Spitzer / Gaia / EHT',
    bhHeadline: 'Dải Ngân Hà (Milky Way) & Lõi Sagittarius A*',
    bhCompareLabel: 'Đối chiếu các Hố đen Thực tế trong Vũ trụ',
    bhMassLabel: 'Khối lượng',
    bhHorizonLabel: 'Bán kính Chân trời',
    bhSpinLabel: 'Tốc độ quay Kerr (a*)',
    bhDistanceLabel: 'Khoảng cách',
    bhAnatomyHeading: 'Giải phẫu Quang học 4 tầng',
    bhInnerPlanetsHeading: 'Các Hành tinh trên Quỹ đạo Gần Nhất',
    closeInspector: 'Đóng hồ sơ',

    planetSpecsHeading: 'Thông số Vật lý & Khí quyển',
    planetClassLabel: 'Phân loại bề mặt',
    planetInspirationLabel: 'Thiên thể thực tế',
    planetTempLabel: 'Nhiệt độ bề mặt',
    planetGravityLabel: 'Trọng lực bề mặt',
    planetAtmoLabel: 'Thành phần khí quyển',
    planetRingsLabel: 'Hệ thống vành đai',
    planetRingsYes: 'Có vành đai băng / bụi',
    planetRingsNo: 'Không có vành đai',
    planetOrbitLabel: 'Bán kính quỹ đạo',
    planetKeyFindings: '3 Đặc điểm Khoa học Cốt lõi',
    planetOverviewHeading: 'Hồ sơ Nghiên cứu Thiên văn',
    planetTagsHeading: 'Từ khóa Quang phổ',
    planetRelatedHeading: 'Thiên thể Liên quan',
    deleteObjectBtn: 'Xóa khỏi bản đồ',
    viewIn3DBtn: 'Xem trong 3D',

    catalogHeroKicker: 'Đài Quan Sát Dải Ngân Hà Chuẩn NASA (Mặc định Không Cần .env)',
    catalogHeroTitle: 'Thư Viện Dải Ngân Hà, Ngoại Hành Tinh & Hố Đen',
    catalogHeroSubtitle:
      'Khám phá thiên hà xoắn ốc có thanh chắn Milky Way (đường kính 105.700 năm ánh sáng) theo dữ liệu NASA Spitzer, ESA Gaia & EHT cùng 30 thế giới thực tế.',
    catalogOpenBhLab: 'Phân tích Dải Ngân Hà & Sgr A*',
    catalogAddAiBtn: 'Mô phỏng Thiên thể AI',
    catalogShowingText: 'Hiển thị',

    modalTitle: 'Mô Phỏng & Khám Phá Thiên Thể Mới (AI)',
    modalSubtitle: 'Nhập tên hoặc mô tả ngoại hành tinh, mặt trăng hay hố đen để đưa vào quỹ đạo 3D',
    modalPresetsLabel: 'Chọn nhanh thiên thể nổi bật:',
    modalNameLabel: 'Tên thiên thể (Tùy chọn)',
    modalNamePlaceholder: 'VD: Ngoại hành tinh Proxima Centauri b...',
    modalCategoryLabel: 'Phân loại Vật lý Thiên văn',
    modalDescLabel: 'Dữ liệu quan sát / Mô tả thiên văn',
    modalDescPlaceholder: 'Mô tả thành phần khí quyển, nhiệt độ, quỹ đạo hoặc hiện tượng vật lý...',
    modalCharCount: 'ký tự',
    modalErrorMinChars: 'Vui lòng nhập mô tả tối thiểu 12 ký tự để AI phân tích.',
    modalErrorGeneric: 'Không thể tạo mô phỏng lúc này. Vui lòng thử lại.',
    modalCancelBtn: 'Hủy',
    modalSubmitBtn: 'Phân tích & Đưa vào Quỹ đạo 3D',
    modalLoadingBtn: 'Đang tính toán quỹ đạo...',
    modalFooterNote: 'Dữ liệu thiên thể mới được lưu tự động trên trình duyệt.',
    modalPresets: [
      {
        label: 'Quasar TON 618',
        title: 'TON 618 — Quasar & Hố Đen 66 Tỷ Lần Mặt Trời',
        category: 'Hố đen & Hiện tượng Thiên hà',
        content:
          'TON 618 là một chuẩn tinh (quasar) siêu sáng nằm cách Trái Đất 10,4 tỷ năm ánh sáng trong chòm sao Lạp Khuyển, chứa một trong những hố đen lớn nhất từng được phát hiện với khối lượng ước tính 66 tỷ lần Mặt Trời. Bán kính chân trời sự kiện của nó rộng hơn 1.300 AU, đủ sức chứa trọn hơn 40 Hệ Mặt Trời đặt cạnh nhau.',
      },
      {
        label: 'LHS 1140b (JWST)',
        title: 'Ngoại hành tinh LHS 1140b — Thế Giới Băng & Đại Dương Mắt Bò',
        category: 'Hành tinh Đại dương & Sự sống',
        content:
          'Quan sát mới nhất từ Kính viễn vọng Không gian James Webb (JWST) cho thấy ngoại hành tinh LHS 1140b (cách Trái Đất 48 năm ánh sáng) nhiều khả năng là một thế giới băng sở hữu bầu khí quyển giàu Nitơ. Do bị khóa thủy triều với sao lùn đỏ mẹ, tâm bán cầu ngày tan chảy tạo thành đại dương nước lỏng hình tròn rộng 4.000 km ở khoảng 20°C.',
      },
      {
        label: 'Mặt trăng Enceladus',
        title: 'Mặt trăng Enceladus — Mạch Phun Băng & Đại Dương Thủy Nhiệt',
        category: 'Thế giới Băng giá & Kỳ dị',
        content:
          'Mặt trăng băng Enceladus của Sao Thổ phản xạ gần như 100% ánh sáng mặt trời. Tại cực Nam, các vết nứt Vằn Hổ phun ra cột hơi nước, tinh thể băng và phân tử hữu cơ cao hàng trăm km vào không gian, chứng minh sự tồn tại của đại dương nước ấm có miệng phun thủy nhiệt dưới lớp vỏ băng.',
      },
    ],

    categories: {
      'Hành tinh Đại dương & Sự sống': {
        label: 'Hành tinh Đại dương & Sự sống',
        shortLabel: 'Đại dương & Sự sống',
        description: 'Ngoại hành tinh trong vùng sống được, thế giới đại dương Hycean & hành tinh giống Trái Đất.',
      },
      'Khổng lồ Khí & Siêu Vành Đai': {
        label: 'Khổng lồ Khí & Siêu Vành Đai',
        shortLabel: 'Khổng lồ Khí',
        description: 'Hành tinh khí khổng lồ, siêu Sao Thổ J1407b và các hệ vành đai băng bụi vĩ đại.',
      },
      'Hành tinh Dung nham & Cực đoan': {
        label: 'Hành tinh Dung nham & Cực đoan',
        shortLabel: 'Dung nham',
        description: 'Thế giới khóa thủy triều, đại dương magma 2.300K, mưa đá silicat và hành tinh quanh sao pulsar.',
      },
      'Thế giới Băng giá & Kỳ dị': {
        label: 'Thế giới Băng giá & Kỳ dị',
        shortLabel: 'Thế giới Băng',
        description: 'Khổng lồ băng Methane, mặt trăng đại dương ngầm dưới băng vĩnh cửu và hành tinh cực hàn.',
      },
      'Hố đen & Hiện tượng Thiên hà': {
        label: 'Hố đen & Hiện tượng Thiên hà',
        shortLabel: 'Hố đen & Thiên hà',
        description: 'Chân trời sự kiện, đĩa bồi tụ tương đối tính, thấu kính hấp dẫn Einstein và các hố đen siêu khối lượng.',
      },
      'Ngôi sao Dải Ngân Hà': {
        label: 'Ngôi sao Dải Ngân Hà (ESA Gaia DR3)',
        shortLabel: 'Ngôi sao',
        description: 'Mặt Trời, Alpha Centauri, Sirius, Vega, Polaris, Antares, Betelgeuse, Rigel và UY Scuti theo tọa độ Gaia DR3.',
      },
      'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
        label: 'Tiểu hành tinh, Hành tinh Lùn & Sao chổi',
        shortLabel: 'Tiểu hành tinh & Sao chổi',
        description: 'Mặt Trăng, Ganymede, Pluto, Eris, Ceres, 4 Vesta, 101955 Bennu, Sao chổi 1P/Halley và 1I/ʻOumuamua.',
      },
    },

    blackHoleAnatomy: [
      {
        code: '01',
        title: 'Chân trời Sự kiện & Bóng Hố Đen (Event Horizon)',
        detail:
          'Biên giới một chiều của không-thời gian nơi vận tốc thoát vượt tốc độ ánh sáng (c = 299.792 km/s). Bóng tối trung tâm mà mắt thấy thực chất được phóng đại ~2,6 lần bán kính Schwarzschild do các tia sáng đi gần bị hút vào trong.',
      },
      {
        code: '02',
        title: 'Cầu Photon & Viền Xanh Tán Xạ (Photon Sphere)',
        detail:
          'Ngay sát ngoài bóng tối, trường hấp dẫn bẻ cong ánh sáng quay nhiều vòng trước khi thoát tới mắt người quan sát, tạo nên vành sáng rực rỡ và lớp tán xạ xanh thép mảnh đặc trưng ôm lấy mép bóng hố đen.',
      },
      {
        code: '03',
        title: 'Đĩa Bồi Tụ 3D Dày & Đai Bụi Hấp Thụ (Volumetric Accretion Disk)',
        detail:
          'Khối khí và bụi vũ trụ xoay xoáy tốc độ tương đối tính tạo thành cấu trúc đĩa 3D dày đặc, với lớp plasma trắng kem nóng 6.000 K rực sáng phía trên và dải bụi sẫm màu hấp thụ ánh sáng chạy ngang rìa trước.',
      },
      {
        code: '04',
        title: 'Vần Cực Thấu Kính Hấp Dẫn Kép (Thick Polar Lensing Arches)',
        detail:
          'Ánh sáng từ mặt sau đĩa bồi tụ bị không-thời gian cong uốn vồng qua cả cực Bắc lẫn cực Nam của hố đen, tạo nên hai vần cực dày, đa lớp và nối liền mượt mà xuống hai vai đĩa bồi tụ.',
      },
    ],

    famousBlackHoles: [
      {
        id: 'gargantua',
        name: 'Gargantua (Lõi đang quan sát)',
        galaxy: 'Mô hình vật lý tương đối rộng Kip Thorne',
        massSolar: '100 triệu M☉',
        eventHorizonRadius: '150 triệu km (~1 AU)',
        spinParameter: 'a* = 0.99999999999999',
        distanceFromEarth: '10 tỷ năm ánh sáng',
        highlightFact:
          'Tốc độ quay gần chạm giới hạn tốc độ ánh sáng giúp quỹ đạo ổn định trong cùng tiến sát Chân trời sự kiện, tạo giãn nở thời gian 1 giờ = 7 năm.',
      },
      {
        id: 'sgr-a',
        name: 'Sagittarius A* (Sgr A*)',
        galaxy: 'Trung tâm Dải Ngân Hà (Milky Way)',
        massSolar: '4,3 triệu M☉',
        eventHorizonRadius: '12,7 triệu km',
        spinParameter: 'a* ≈ 0.84 – 0.90',
        distanceFromEarth: '26.670 năm ánh sáng',
        highlightFact:
          'Hố đen siêu khối lượng tại tâm thiên hà chúng ta, được Kính thiên văn Chân trời Sự kiện (EHT) chụp ảnh trực tiếp năm 2022.',
      },
      {
        id: 'm87-star',
        name: 'M87* (Powehi)',
        galaxy: 'Thiên hà Elip khổng lồ Messier 87',
        massSolar: '6,5 tỷ M☉',
        eventHorizonRadius: '19 tỷ km (~127 AU)',
        spinParameter: 'a* ≈ 0.90',
        distanceFromEarth: '53,5 triệu năm ánh sáng',
        highlightFact:
          'Hố đen đầu tiên trong lịch sử được chụp ảnh bóng Chân trời sự kiện (2019), phóng tia phản lực plasma dài 5.000 năm ánh sáng.',
      },
      {
        id: 'ton-618',
        name: 'TON 618 (Quasar Cực Đại)',
        galaxy: 'Chuẩn tinh chòm sao Lạp Khuyển',
        massSolar: '66 tỷ M☉',
        eventHorizonRadius: '195 tỷ km (~1.300 AU)',
        spinParameter: 'a* > 0.95',
        distanceFromEarth: '10,4 tỷ năm ánh sáng',
        highlightFact:
          'Một trong những hố đen lớn nhất từng biết trong vũ trụ; đĩa bồi tụ sáng gấp 140 nghìn tỷ lần Mặt Trời.',
      },
    ],

    planetSpecOverrides: {},
  },

  en: {
    brandTitle: 'Milky Way Observatory',
    navExplorer: 'Milky Way 3D',
    navBlackHole: 'Sgr A* & NASA Lab',
    navCatalog: 'Planet Catalog',
    navSimulator: 'AI Simulator',
    languageLabel: 'Language',

    sidebarTitle: 'Celestial Atlas',
    searchPlaceholder: 'Search planets, black holes, tags...',
    allCategories: 'All',
    objectsCountUnit: 'objects',
    featuredBlackHoleTitle: 'Milky Way Core · Sgr A*',
    featuredBlackHoleSubtitle: '4.3M M☉ · NASA Barred Spiral Galaxy',
    inspectCoreAction: 'Inspect',
    noSearchResults: 'No celestial objects match your search.',
    resetFilters: 'Reset filters',
    hideSidebar: 'Collapse sidebar',
    showSidebar: 'Open catalog list',
    restoreAtlas: 'Restore 48 default objects',

    pauseOrbit: 'Pause',
    resumeOrbit: 'Resume',
    constellationLines: 'Spectral Links',
    orbitRings: 'Orbit Rings',
    onLabel: 'On',
    offLabel: 'Off',
    resetCamera: 'Overview Camera',
    canvasHint: 'Drag to orbit 360° · Scroll to zoom · Click Sagittarius A*, the Solar System, or any planet to inspect NASA data',
    webglFallbackTitle: 'Astronomical Catalog Mode',
    webglFallbackDesc: 'WebGL is unavailable in this browser. Switch to the Planet Catalog tab to browse all 48 celestial bodies.',

    bhTooltipTitle: 'Supermassive Black Hole Sagittarius A* (4.3 Million M☉)',
    bhTooltipCategory: 'Milky Way Galactic Center (NASA / EHT)',
    bhTooltipAction: 'Click to inspect NASA Milky Way Architecture & Black Hole Physics',

    bhBadge: 'Milky Way Core · NASA Spitzer / Gaia / EHT Model',
    bhHeadline: 'Milky Way Galaxy & Sagittarius A* Core',
    bhCompareLabel: 'Compare Real Supermassive Black Holes',
    bhMassLabel: 'Mass',
    bhHorizonLabel: 'Event Horizon Radius',
    bhSpinLabel: 'Kerr Spin (a*)',
    bhDistanceLabel: 'Distance',
    bhAnatomyHeading: '4-Layer Optical Anatomy',
    bhInnerPlanetsHeading: 'Closest Orbiting Worlds',
    closeInspector: 'Close panel',

    planetSpecsHeading: 'Astrophysical & Atmospheric Telemetry',
    planetClassLabel: 'Surface Class',
    planetInspirationLabel: 'Real-World Reference',
    planetTempLabel: 'Surface Temperature',
    planetGravityLabel: 'Surface Gravity',
    planetAtmoLabel: 'Atmosphere',
    planetRingsLabel: 'Ring System',
    planetRingsYes: 'Icy / Dusty Ring System',
    planetRingsNo: 'No Ring System',
    planetOrbitLabel: 'Orbital Radius',
    planetKeyFindings: '3 Core Scientific Highlights',
    planetOverviewHeading: 'Astrophysical Dossier',
    planetTagsHeading: 'Spectral Tags',
    planetRelatedHeading: 'Spectrally Related Objects',
    deleteObjectBtn: 'Remove from Atlas',
    viewIn3DBtn: 'View in 3D',

    catalogHeroKicker: 'NASA-Accurate Milky Way Observatory (Zero .env Required)',
    catalogHeroTitle: 'Milky Way Galaxy, Exoplanet & Black Hole Encyclopedia',
    catalogHeroSubtitle:
      'Explore our 105,700-light-year Barred Spiral Galaxy modeled on NASA Spitzer, ESA Gaia DR3, and EHT observations alongside 30 real exoplanets and cosmic phenomena.',
    catalogOpenBhLab: 'Inspect Milky Way & Sgr A*',
    catalogAddAiBtn: 'AI Celestial Simulator',
    catalogShowingText: 'Showing',

    modalTitle: 'AI Celestial Body & Phenomenon Simulator',
    modalSubtitle: 'Describe any exoplanet, moon, or black hole phenomenon to generate and place it in 3D orbit',
    modalPresetsLabel: 'Quick astrophysics presets:',
    modalNameLabel: 'Object Name (Optional)',
    modalNamePlaceholder: 'e.g. Proxima Centauri b...',
    modalCategoryLabel: 'Astrophysical Classification',
    modalDescLabel: 'Observational Notes / Description',
    modalDescPlaceholder: 'Describe atmosphere, surface temperature, orbital period, or gravitational physics...',
    modalCharCount: 'chars',
    modalErrorMinChars: 'Please enter at least 12 characters for astrophysical analysis.',
    modalErrorGeneric: 'Unable to simulate this celestial object right now. Please try again.',
    modalCancelBtn: 'Cancel',
    modalSubmitBtn: 'Analyze & Launch into 3D Orbit',
    modalLoadingBtn: 'Computing orbit...',
    modalFooterNote: 'Custom simulated objects are saved automatically in your browser.',
    modalPresets: [
      {
        label: 'Quasar TON 618',
        title: 'TON 618 — Hyperluminous Quasar & 66 Billion Solar Mass Black Hole',
        category: 'Hố đen & Hiện tượng Thiên hà',
        content:
          'TON 618 is an ultra-luminous quasar located 10.4 billion light-years away in Canes Venatici, powered by one of the largest black holes ever measured at 66 billion solar masses. Its event horizon spans over 1,300 AU, wide enough to fit 40 entire Solar Systems side by side.',
      },
      {
        label: 'LHS 1140b (JWST)',
        title: 'Exoplanet LHS 1140b — Eyeball Ocean & Nitrogen Atmosphere World',
        category: 'Hành tinh Đại dương & Sự sống',
        content:
          'Recent James Webb Space Telescope (JWST) observations indicate LHS 1140b, 48 light-years away, is likely an ice-covered super-Earth with a nitrogen-rich atmosphere. Tidally locked to its red dwarf star, its substellar point melts into a circular 4,000-km liquid ocean at roughly 20°C.',
      },
      {
        label: 'Saturn Moon Enceladus',
        title: 'Enceladus — Cryovolcanic Plumes & Hydrothermal Subsurface Ocean',
        category: 'Thế giới Băng giá & Kỳ dị',
        content:
          'Saturn’s icy moon Enceladus reflects nearly 100% of incoming sunlight. Along its south polar Tiger Stripe fractures, towering geysers vent water vapor, ice grains, and organic molecules hundreds of kilometers into space, confirming a warm hydrothermal ocean beneath its frozen crust.',
      },
    ],

    categories: {
      'Hành tinh Đại dương & Sự sống': {
        label: 'Ocean & Habitable Worlds',
        shortLabel: 'Ocean & Life',
        description: 'Habitable-zone exoplanets, Hycean ocean worlds, and Earth analogs.',
      },
      'Khổng lồ Khí & Siêu Vành Đai': {
        label: 'Gas Giants & Super Rings',
        shortLabel: 'Gas Giants',
        description: 'Massive gas giants, Super-Saturn J1407b, and expansive icy ring systems.',
      },
      'Hành tinh Dung nham & Cực đoan': {
        label: 'Lava & Extreme Worlds',
        shortLabel: 'Lava Worlds',
        description: 'Tidally locked magma oceans, silicate rock rain, and pulsar planets.',
      },
      'Thế giới Băng giá & Kỳ dị': {
        label: 'Ice & Exotic Worlds',
        shortLabel: 'Ice Worlds',
        description: 'Cryogenic methane ice giants, subsurface-ocean moons, and frozen super-Earths.',
      },
      'Hố đen & Hiện tượng Thiên hà': {
        label: 'Black Holes & Galactic Phenomena',
        shortLabel: 'Black Holes',
        description: 'Event horizons, relativistic accretion disks, Einstein lensing, and supermassive cores.',
      },
      'Ngôi sao Dải Ngân Hà': {
        label: 'Milky Way Stars (ESA Gaia DR3)',
        shortLabel: 'Stars',
        description: 'The Sun, Alpha Centauri, Sirius, Vega, Polaris, Antares, Betelgeuse, Rigel & UY Scuti.',
      },
      'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
        label: 'Dwarf Planets, Asteroids & Comets',
        shortLabel: 'Asteroids & Comets',
        description: 'Moon, Ganymede, Pluto, Eris, Ceres, 4 Vesta, 101955 Bennu, 1P/Halley & 1I/ʻOumuamua.',
      },
    },

    blackHoleAnatomy: [
      {
        code: '01',
        title: 'Event Horizon & Black Hole Shadow',
        detail:
          'The one-way spacetime boundary where escape velocity exceeds the speed of light (c = 299,792 km/s). The dark shadow appears ~2.6× wider than the Schwarzschild radius as grazing photons plunge inward.',
      },
      {
        code: '02',
        title: 'Photon Sphere & Cool Slate-Blue Rim',
        detail:
          'Just outside the shadow, extreme gravity forces photons into unstable circular orbits before escaping toward the observer, creating a luminous razor ring and delicate cool steel-blue inner scattering rim.',
      },
      {
        code: '03',
        title: 'Volumetric 3D Accretion Disk & Dust Belt',
        detail:
          'Superheated plasma and cosmic dust spiral at relativistic speeds, forming a thick 3D turbulent disk glowing at 4,500–6,500 K with incandescent cream-gold upper filaments and dark absorbing dust lanes along the front lip.',
      },
      {
        code: '04',
        title: 'Thick Polar Gravitational Lensing Arches',
        detail:
          'Light emitted from the far side of the accretion disk is bent over both the North and South poles by warped spacetime, forming wide, multi-layered polar arches sweeping continuously into the equatorial shoulders.',
      },
    ],

    famousBlackHoles: [
      {
        id: 'gargantua',
        name: 'Gargantua (Active Core)',
        galaxy: 'Kip Thorne General Relativity Model',
        massSolar: '100 Million M☉',
        eventHorizonRadius: '150 Million km (~1 AU)',
        spinParameter: 'a* = 0.99999999999999',
        distanceFromEarth: '10 Billion light-years',
        highlightFact:
          'Near-maximal Kerr spin pulls the innermost stable circular orbit (ISCO) right next to the Event Horizon, producing extreme 1 hr = 7 yrs time dilation.',
      },
      {
        id: 'sgr-a',
        name: 'Sagittarius A* (Sgr A*)',
        galaxy: 'Milky Way Galactic Center',
        massSolar: '4.3 Million M☉',
        eventHorizonRadius: '12.7 Million km',
        spinParameter: 'a* ≈ 0.84 – 0.90',
        distanceFromEarth: '26,670 light-years',
        highlightFact:
          'The supermassive black hole anchoring our own galaxy, directly imaged by the Event Horizon Telescope (EHT) collaboration in 2022.',
      },
      {
        id: 'm87-star',
        name: 'M87* (Powehi)',
        galaxy: 'Giant Elliptical Galaxy Messier 87',
        massSolar: '6.5 Billion M☉',
        eventHorizonRadius: '19 Billion km (~127 AU)',
        spinParameter: 'a* ≈ 0.90',
        distanceFromEarth: '53.5 Million light-years',
        highlightFact:
          'The first black hole shadow ever captured in human history (2019), launching a relativistic plasma jet spanning 5,000 light-years.',
      },
      {
        id: 'ton-618',
        name: 'TON 618 (Ultramassive Quasar)',
        galaxy: 'Canes Venatici Quasar',
        massSolar: '66 Billion M☉',
        eventHorizonRadius: '195 Billion km (~1,300 AU)',
        spinParameter: 'a* > 0.95',
        distanceFromEarth: '10.4 Billion light-years',
        highlightFact:
          'One of the largest black holes ever discovered; its blinding accretion disk outshines 140 trillion Suns.',
      },
    ],

    planetSpecOverrides: {
      'Miller-104b (Hành tinh Đại dương)': {
        designation: 'Miller-104b (Ocean World)',
        planetType: 'Oceanic Super-Earth',
        realInspiration: "Miller's Planet & Kepler-22b",
        atmosphereComposition: '78% N₂, 19% O₂, dense marine H₂O vapor',
      },
      'Kepler-452b (Hành tinh Địa cầu)': {
        designation: 'Kepler-452b (Earth Analog)',
        planetType: 'Habitable Terrestrial Planet',
        realInspiration: 'Earth, Kepler-452b & TRAPPIST-1e',
        atmosphereComposition: '77% N₂, 21% O₂, 1% Ar, convective H₂O clouds',
      },
      'J1407b-Prime (Siêu Sao Thổ)': {
        designation: 'J1407b-Prime (Super-Saturn)',
        planetType: 'Ringed Gas Giant',
        realInspiration: 'Saturn & Exoplanet J1407b',
        atmosphereComposition: '96% H₂, 3% He, golden NH₃ crystal bands',
      },
      'Kepler-90h (Khổng lồ Khí Bão Từ)': {
        designation: 'Kepler-90h (Storm Gas Giant)',
        planetType: 'Banded Anticyclonic Gas Giant',
        realInspiration: 'Jupiter & Kepler-90h',
        atmosphereComposition: '89% H₂, 10% He, Great Amber Storm bands',
      },
      '55 Cancri e (Thế giới Dung nham)': {
        designation: '55 Cancri e (Lava World)',
        planetType: 'Tidally Locked Magma Super-Earth',
        realInspiration: '55 Cancri e & CoRoT-7b',
        atmosphereComposition: 'Vaporized silicates, CO, SO₂ & volcanic ash',
      },
      'K2-141b (Hành tinh Mưa Đá Nóng)': {
        designation: 'K2-141b (Rock-Rain World)',
        planetType: 'Basalt & Magma River Exoplanet',
        realInspiration: 'K2-141b & Jupiter Moon Io',
        atmosphereComposition: 'Na, SiO, incandescent mineral vapor (2,100 K)',
      },
      'Mann-Draconis (Hành tinh Băng Amoniac)': {
        designation: 'Mann-Draconis (Ice Giant)',
        planetType: 'Cryogenic Methane & Ammonia World',
        realInspiration: "Mann's Planet, Neptune & Uranus",
        atmosphereComposition: '80% H₂, 18% He, deep sapphire CH₄ haze',
      },
      'OGLE-390Lb (Siêu Trái Đất Băng Giá)': {
        designation: 'OGLE-390Lb (Frozen Super-Earth)',
        planetType: 'Permafrost & Subsurface Ocean World',
        realInspiration: 'OGLE-2005-BLG-390Lb & Europa',
        atmosphereComposition: 'Frozen N₂, CH₄, crystalline ice haze',
      },
      'EDMUNDS-Prime (Trạm Quan sát Quỹ đạo)': {
        designation: 'EDMUNDS-Prime (Orbital Station)',
        planetType: 'Outer Event-Horizon Rocky World',
        realInspiration: "Edmunds' Planet & Gargantua System",
        atmosphereComposition: 'N₂, O₂, refracted accretion-disk twilight',
      },
      'ISCO-Sentinel (Thiên thể Cận Photon)': {
        designation: 'ISCO-Sentinel (Near-Photon World)',
        planetType: 'Innermost Stable Circular Orbit World',
        realInspiration: 'Relativistic Kerr Orbit around Gargantua',
        atmosphereComposition: 'Lightly ionized accretion-heated atmosphere',
      },
    },
  },

  ja: {
    brandTitle: 'Milky Way Observatory',
    navExplorer: '天の川銀河 3D',
    navBlackHole: 'いて座A* 解析',
    navCatalog: '惑星カタログ',
    navSimulator: 'AIシミュレーター',
    languageLabel: '言語',

    sidebarTitle: '天体カタログ',
    searchPlaceholder: '惑星、ブラックホール、タグを検索...',
    allCategories: 'すべて',
    objectsCountUnit: '天体',
    featuredBlackHoleTitle: '天の川中心核 · いて座A*',
    featuredBlackHoleSubtitle: '太陽430万倍 · NASA準拠 棒渦巻銀河モデル',
    inspectCoreAction: '解析',
    noSearchResults: '該当する天体が見つかりません。',
    resetFilters: 'フィルター解除',
    hideSidebar: 'リストを隠す',
    showSidebar: '天体リストを開く',
    restoreAtlas: '初期48天体を復元',

    pauseOrbit: '一時停止',
    resumeOrbit: '再開',
    constellationLines: 'スペクトル線',
    orbitRings: '公転軌道',
    onLabel: '表示',
    offLabel: '非表示',
    resetCamera: '全体ビュー',
    canvasHint: 'ドラッグで360°回転 · スクロールでズーム · いて座A*・太陽系・惑星をクリックしてNASAデータを表示',
    webglFallbackTitle: '天文カタログモード',
    webglFallbackDesc: 'WebGLが無効です。「惑星カタログ」タブから48天体の詳細をご覧いただけます。',

    bhTooltipTitle: '超大質量ブラックホール いて座A* (430万 M☉)',
    bhTooltipCategory: '天の川銀河中心核 (NASA / EHT)',
    bhTooltipAction: 'クリックして天の川銀河構造とブラックホール物理を表示',

    bhBadge: '天の川銀河中心核 · NASA スピッツァー / ガイア / EHT',
    bhHeadline: '天の川銀河（ミルキーウェイ）＆ いて座A*',
    bhCompareLabel: '実在する超大質量ブラックホールの比較',
    bhMassLabel: '質量',
    bhHorizonLabel: '事象の地平面半径',
    bhSpinLabel: 'カー回転パラメータ (a*)',
    bhDistanceLabel: '地球からの距離',
    bhAnatomyHeading: '4層光学構造の解剖',
    bhInnerPlanetsHeading: '最接近軌道の惑星',
    closeInspector: '閉じる',

    planetSpecsHeading: '物理・大気テレメトリ',
    planetClassLabel: '天体分類',
    planetInspirationLabel: 'モデルとなった実天体',
    planetTempLabel: '表面温度',
    planetGravityLabel: '表面重力',
    planetAtmoLabel: '大気組成',
    planetRingsLabel: '環（リング）構造',
    planetRingsYes: '氷・塵の環システムあり',
    planetRingsNo: '環なし',
    planetOrbitLabel: '軌道半径',
    planetKeyFindings: '3つの科学的ハイライト',
    planetOverviewHeading: '天体観測レポート',
    planetTagsHeading: 'スペクトルタグ',
    planetRelatedHeading: '関連する天体',
    deleteObjectBtn: 'マップから削除',
    viewIn3DBtn: '3Dで見る',

    catalogHeroKicker: 'NASA準拠 天の川銀河ポータル（.env不要で標準動作）',
    catalogHeroTitle: '天の川銀河・系外惑星・ブラックホール図鑑',
    catalogHeroSubtitle:
      'NASAスピッツァー・ESAガイア・EHTの観測に基づく直径105,700光年の棒渦巻銀河「天の川銀河」と30の実在天体を探索できます。',
    catalogOpenBhLab: '天の川銀河・いて座A*を解析',
    catalogAddAiBtn: 'AI天体シミュレーター',
    catalogShowingText: '表示中',

    modalTitle: 'AI天体・現象シミュレーター',
    modalSubtitle: '系外惑星や衛星、ブラックホール現象を入力するとAIが解析して3D軌道に追加します',
    modalPresetsLabel: '注目天体プリセット:',
    modalNameLabel: '天体名（任意）',
    modalNamePlaceholder: '例: プロキシマ・ケンタウリb...',
    modalCategoryLabel: '天体物理カテゴリ',
    modalDescLabel: '観測メモ・特徴の説明',
    modalDescPlaceholder: '大気成分、表面温度、軌道周期、重力現象などを入力...',
    modalCharCount: '文字',
    modalErrorMinChars: 'AI解析のため12文字以上で入力してください。',
    modalErrorGeneric: '現在シミュレーションを生成できません。再試行してください。',
    modalCancelBtn: 'キャンセル',
    modalSubmitBtn: '解析して3D軌道に追加',
    modalLoadingBtn: '軌道計算中...',
    modalFooterNote: '作成した天体はブラウザに自動保存されます。',
    modalPresets: [
      {
        label: 'クエーサー TON 618',
        title: 'TON 618 — 太陽660億倍の超大質量ブラックホール',
        category: 'Hố đen & Hiện tượng Thiên hà',
        content:
          'TON 618はりょうけん座の方向104億光年先にある極超光度クエーサーで、太陽質量の660億倍という宇宙最大級のブラックホールを宿しています。事象の地平面半径は1,300 AUを超え、太陽系が40個以上並ぶ規模です。',
      },
      {
        label: 'LHS 1140b (JWST)',
        title: '系外惑星 LHS 1140b — 窒素大気と目玉状海洋の氷惑星',
        category: 'Hành tinh Đại dương & Sự sống',
        content:
          'ジェイムズ・ウェッブ宇宙望遠鏡（JWST）の観測により、地球から48光年先のLHS 1140bは窒素豊富な大気を持つ氷のスーパーアースである可能性が高まりました。主星に向いた面には直径4,000km・水温約20℃の液体の海が広がると考えられています。',
      },
      {
        label: '土星衛星エンケラドゥス',
        title: '衛星エンケラドゥス — 氷の間欠泉と熱水地下海',
        category: 'Thế giới Băng giá & Kỳ dị',
        content:
          '土星の氷衛星エンケラドゥスは太陽光のほぼ100%を反射します。南極の「タイガーストライプ」と呼ばれる亀裂から水蒸気・氷粒・有機分子が数百km上空へ噴出しており、氷殻の下に熱水噴出孔を持つ暖かい海が存在する証拠となっています。',
      },
    ],

    categories: {
      'Hành tinh Đại dương & Sự sống': {
        label: '海洋・生命居住可能惑星',
        shortLabel: '海洋・生命',
        description: 'ハビタブルゾーンの系外惑星、ハイセアン海洋惑星、地球型惑星。',
      },
      'Khổng lồ Khí & Siêu Vành Đai': {
        label: '巨大ガス惑星・超リング',
        shortLabel: '巨大ガス惑星',
        description: '木星・土星型ガス惑星、スーパーサターンJ1407bと壮大な氷の環。',
      },
      'Hành tinh Dung nham & Cực đoan': {
        label: '溶岩・極限環境惑星',
        shortLabel: '溶岩・極限',
        description: '潮汐固定されたマグマオーシャン、岩石の雨が降る灼熱惑星、パルサー惑星。',
      },
      'Thế giới Băng giá & Kỳ dị': {
        label: '氷惑星・異形天体',
        shortLabel: '氷の世界',
        description: 'メタン氷巨星、氷殻の下に海を持つ衛星、極寒スーパーアース。',
      },
      'Hố đen & Hiện tượng Thiên hà': {
        label: 'ブラックホール・銀河現象',
        shortLabel: 'ブラックホール',
        description: '事象の地平面、相対論的降着円盤、アインシュタイン重力レンズ、超大質量核。',
      },
      'Ngôi sao Dải Ngân Hà': {
        label: '天の川銀河の恒星 (ESA Gaia DR3)',
        shortLabel: '恒星',
        description: '太陽、アルファ・ケンタウリ、シリウス、ベガ、ポラリス、アンタレス、ベテルギウス、リゲル、たて座UY星。',
      },
      'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
        label: '準惑星・小惑星・彗星',
        shortLabel: '小惑星・彗星',
        description: '月、ガニメデ、冥王星、エリス、ケレス、ベスタ、ベンヌ、ハレー彗星、オウムアムア。',
      },
    },

    blackHoleAnatomy: [
      {
        code: '01',
        title: '事象の地平面とブラックホール・シャドウ',
        detail:
          '脱出速度が光速（299,792 km/s）を超える一方向の時空境界。観測される黒い影は光の重力捕獲によりシュヴァルツシルト半径の約2.6倍に拡大されます。',
      },
      {
        code: '02',
        title: '光子球と青灰色の内縁散乱リム',
        detail:
          '影のすぐ外側では強烈な重力により光子が円軌道を何周も回ってから脱出するため、鋭い光のリングと繊細なブルーグレーの内縁ハローが生まれます。',
      },
      {
        code: '03',
        title: '立体的3D降着円盤と暗黒ダスト帯',
        detail:
          '亜光速で渦巻くプラズマと宇宙塵が厚みのある3Dガス円盤を形成。4,500〜6,500Kのクリームゴールドの輝層と、手前縁を横切る暗い吸収ダスト帯が重なります。',
      },
      {
        code: '04',
        title: '厚い南北極の重力レンズ・アーチ',
        detail:
          'ブラックホールの裏側にある降着円盤の光が歪んだ時空に沿って北極側・南極側へ回り込み、多重の光の帯となって極方向へ厚くアーチ状に広がります。',
      },
    ],

    famousBlackHoles: [
      {
        id: 'gargantua',
        name: 'ガルガンチュア (観測中心核)',
        galaxy: 'キップ・ソーン一般相対論モデル',
        massSolar: '太陽の1億倍',
        eventHorizonRadius: '1億5,000万 km (~1 AU)',
        spinParameter: 'a* = 0.99999999999999',
        distanceFromEarth: '100億光年',
        highlightFact:
          '光速限界に近いカー回転により最内安定円軌道（ISCO）が地平面直近まで近づき、1時間＝7年という極端な時間の遅れが生じます。',
      },
      {
        id: 'sgr-a',
        name: 'いて座A* (Sgr A*)',
        galaxy: '天の川銀河の中心',
        massSolar: '太陽の430万倍',
        eventHorizonRadius: '1,270万 km',
        spinParameter: 'a* ≈ 0.84 – 0.90',
        distanceFromEarth: '26,670光年',
        highlightFact:
          '私たちが暮らす天の川銀河の中心核。2022年にイベント・ホライズン・テレスコープ（EHT）によって直接撮影されました。',
      },
      {
        id: 'm87-star',
        name: 'M87* (ポヴェヒ)',
        galaxy: '巨大楕円銀河 メシエ87',
        massSolar: '太陽の65億倍',
        eventHorizonRadius: '190億 km (~127 AU)',
        spinParameter: 'a* ≈ 0.90',
        distanceFromEarth: '5,350万光年',
        highlightFact:
          '人類史上初めて影が撮影されたブラックホール（2019年）。全長5,000光年もの相対論的プラズマジェットを噴出しています。',
      },
      {
        id: 'ton-618',
        name: 'TON 618 (極超大質量クエーサー)',
        galaxy: 'りょうけん座クエーサー',
        massSolar: '太陽の660億倍',
        eventHorizonRadius: '1,950億 km (~1,300 AU)',
        spinParameter: 'a* > 0.95',
        distanceFromEarth: '104億光年',
        highlightFact:
          '宇宙で観測された最大級のブラックホール。降着円盤は太陽140兆個分の明るさで輝いています。',
      },
    ],

    planetSpecOverrides: {
      'Miller-104b (Hành tinh Đại dương)': {
        designation: 'Miller-104b (海洋惑星)',
        planetType: '海洋型スーパーアース',
        realInspiration: 'ミラーの星 & ケプラー22b',
        atmosphereComposition: 'N₂ 78%, O₂ 19%, 濃密な水蒸気',
      },
      'Kepler-452b (Hành tinh Địa cầu)': {
        designation: 'Kepler-452b (地球型惑星)',
        planetType: '大陸・海洋を持つ岩石惑星',
        realInspiration: '地球、ケプラー452b & TRAPPIST-1e',
        atmosphereComposition: 'N₂ 77%, O₂ 21%, Ar 1%, 対流雲',
      },
      'J1407b-Prime (Siêu Sao Thổ)': {
        designation: 'J1407b-Prime (超土星)',
        planetType: '巨大リングを持つガス惑星',
        realInspiration: '土星 & 系外惑星 J1407b',
        atmosphereComposition: 'H₂ 96%, He 3%, 黄金色のNH₃雲帯',
      },
      'Kepler-90h (Khổng lồ Khí Bão Từ)': {
        designation: 'Kepler-90h (巨大嵐ガス惑星)',
        planetType: '高気圧嵐帯を持つガス巨星',
        realInspiration: '木星 & ケプラー90h',
        atmosphereComposition: 'H₂ 89%, He 10%, 大赤斑型嵐帯',
      },
      '55 Cancri e (Thế giới Dung nham)': {
        designation: '55 Cancri e (溶岩惑星)',
        planetType: '潮汐固定マグマ・スーパーアース',
        realInspiration: 'かに座55番星e & CoRoT-7b',
        atmosphereComposition: '蒸発ケイ酸塩, CO, SO₂, 火山灰',
      },
      'K2-141b (Hành tinh Mưa Đá Nóng)': {
        designation: 'K2-141b (岩石雨惑星)',
        planetType: '玄武岩・マグマ河川惑星',
        realInspiration: 'K2-141b & 木星衛星イオ',
        atmosphereComposition: 'Na, SiO, 2,100K鉱物蒸気',
      },
      'Mann-Draconis (Hành tinh Băng Amoniac)': {
        designation: 'Mann-Draconis (氷巨星)',
        planetType: '極低温メタン・アンモニア氷惑星',
        realInspiration: 'マンの星、海王星 & 天王星',
        atmosphereComposition: 'H₂ 80%, He 18%, 深青CH₄もや',
      },
      'OGLE-390Lb (Siêu Trái Đất Băng Giá)': {
        designation: 'OGLE-390Lb (極寒スーパーアース)',
        planetType: '永久凍土・地下海天体',
        realInspiration: 'OGLE-2005-BLG-390Lb & エウロパ',
        atmosphereComposition: '凍結N₂, CH₄, 氷晶もや',
      },
      'EDMUNDS-Prime (Trạm Quan sát Quỹ đạo)': {
        designation: 'EDMUNDS-Prime (外縁観測星)',
        planetType: '地平面外縁の岩石惑星',
        realInspiration: 'エドマンズの星 & ガルガンチュア系',
        atmosphereComposition: 'N₂, O₂, 降着円盤の屈折薄明',
      },
      'ISCO-Sentinel (Thiên thể Cận Photon)': {
        designation: 'ISCO-Sentinel (最内安定軌道)',
        planetType: '最内安定円軌道(ISCO)天体',
        realInspiration: 'ガルガンチュア相対論軌道',
        atmosphereComposition: '降着放射で弱電離した大気',
      },
    },
  },

  zh: {
    brandTitle: 'Milky Way Observatory',
    navExplorer: '银河系 3D',
    navBlackHole: '银心人马座A*',
    navCatalog: '行星百科库',
    navSimulator: 'AI天体模拟',
    languageLabel: '语言',

    sidebarTitle: '天体星图目录',
    searchPlaceholder: '搜索行星、黑洞或光谱标签...',
    allCategories: '全部',
    objectsCountUnit: '个天体',
    featuredBlackHoleTitle: '银河系银心 · 人马座A*',
    featuredBlackHoleSubtitle: '430万倍太阳质量 · NASA 棒旋星系模拟',
    inspectCoreAction: '解析',
    noSearchResults: '未找到匹配的天体或现象。',
    resetFilters: '清除筛选',
    hideSidebar: '收起目录',
    showSidebar: '展开目录',
    restoreAtlas: '恢复默认48个天体',

    pauseOrbit: '暂停公转',
    resumeOrbit: '继续公转',
    constellationLines: '光谱连线',
    orbitRings: '运行轨道',
    onLabel: '开启',
    offLabel: '关闭',
    resetCamera: '全景视角',
    canvasHint: '拖动360°旋转 · 滚轮缩放 · 点击人马座A*、太阳系或任意行星查看NASA数据',
    webglFallbackTitle: '天文目录模式',
    webglFallbackDesc: '当前浏览器未开启WebGL加速，可切换至“行星百科库”浏览全部48个天体。',

    bhTooltipTitle: '超大质量黑洞 人马座A* (430万 M☉)',
    bhTooltipCategory: '银河系中心核心 (NASA / EHT)',
    bhTooltipAction: '点击查看NASA银河系旋臂结构与黑洞参数',

    bhBadge: '银河系核心 · NASA 斯皮策 / 盖亚 / EHT 模型',
    bhHeadline: '银河系（Milky Way）与人马座 A* 银心',
    bhCompareLabel: '对比宇宙中真实的超大质量黑洞',
    bhMassLabel: '黑洞质量',
    bhHorizonLabel: '事件视界半径',
    bhSpinLabel: '克尔自旋参数 (a*)',
    bhDistanceLabel: '距地球距离',
    bhAnatomyHeading: '四层光学结构解析',
    bhInnerPlanetsHeading: '最近内轨道行星',
    closeInspector: '关闭面板',

    planetSpecsHeading: '物理与大气遥测数据',
    planetClassLabel: '天体表面类型',
    planetInspirationLabel: '真实天体原型',
    planetTempLabel: '表面温度',
    planetGravityLabel: '表面重力',
    planetAtmoLabel: '大气成分',
    planetRingsLabel: '行星环系统',
    planetRingsYes: '拥有冰尘行星环',
    planetRingsNo: '无行星环',
    planetOrbitLabel: '轨道半径',
    planetKeyFindings: '3大核心科学特征',
    planetOverviewHeading: '天体物理研究档案',
    planetTagsHeading: '光谱关键词',
    planetRelatedHeading: '相关天体',
    deleteObjectBtn: '从星图移除',
    viewIn3DBtn: '进入3D观测',

    catalogHeroKicker: 'NASA 标准银河系观测平台（无需配置 .env 默认运行）',
    catalogHeroTitle: '银河系、系外行星与黑洞百科',
    catalogHeroSubtitle:
      '基于 NASA 斯皮策、ESA 盖亚与 EHT 数据构建直径 105,700 光年的棒旋银河系模型，并系统查阅 30 颗真实天体档案。',
    catalogOpenBhLab: '解析银河系与人马座A*',
    catalogAddAiBtn: 'AI模拟新天体',
    catalogShowingText: '当前显示',

    modalTitle: 'AI 天体与黑洞现象模拟器',
    modalSubtitle: '输入任意系外行星、卫星或天体现象描述，由AI分析并生成3D轨道天体',
    modalPresetsLabel: '快速选择经典天体：',
    modalNameLabel: '天体名称（可选）',
    modalNamePlaceholder: '例如：比邻星 b (Proxima Centauri b)...',
    modalCategoryLabel: '天体物理分类',
    modalDescLabel: '观测数据 / 特征描述',
    modalDescPlaceholder: '描述其大气成分、表面温度、轨道周期或引力现象...',
    modalCharCount: '字',
    modalErrorMinChars: '请至少输入12个字符以便AI进行物理分析。',
    modalErrorGeneric: '暂时无法生成模拟天体，请重试。',
    modalCancelBtn: '取消',
    modalSubmitBtn: '分析并送入3D轨道',
    modalLoadingBtn: '正在计算轨道...',
    modalFooterNote: '新增的模拟天体将自动保存在本地浏览器中。',
    modalPresets: [
      {
        label: '类星体 TON 618',
        title: 'TON 618 — 660亿倍太阳质量的极亮类星体黑洞',
        category: 'Hố đen & Hiện tượng Thiên hà',
        content:
          'TON 618 是位于猎犬座、距地球104亿光年的极亮类星体，中心潜伏着人类已知最大的黑洞之一，质量高达太阳的660亿倍。其事件视界半径超过1300天文单位，足以并排容纳40多个太阳系。',
      },
      {
        label: 'LHS 1140b (韦伯望远镜)',
        title: '系外行星 LHS 1140b — 氮气大气与“牛眼海洋”冰世界',
        category: 'Hành tinh Đại dương & Sự sống',
        content:
          '詹姆斯·韦伯空间望远镜（JWST）最新观测显示，距地球48光年的超级地球 LHS 1140b 很可能拥有富含氮气的大气层。由于被红矮星潮汐锁定，其向阳面中心融化出直径约4000公里、水温约20°C的液态海洋。',
      },
      {
        label: '土卫二 Enceladus',
        title: '土卫二 (Enceladus) — 冰喷泉与海底热液海洋',
        category: 'Thế giới Băng giá & Kỳ dị',
        content:
          '土卫二洁白的冰壳几乎反射100%的阳光。南极“虎纹”裂缝持续向太空喷射数百公里高的水蒸气、冰晶和有机分子羽流，证明冰壳之下存在拥有热液喷口的温暖液态海洋。',
      },
    ],

    categories: {
      'Hành tinh Đại dương & Sự sống': {
        label: '海洋与宜居行星',
        shortLabel: '海洋与生命',
        description: '位于宜居带的系外行星、氢海世界（Hycean）与类地行星。',
      },
      'Khổng lồ Khí & Siêu Vành Đai': {
        label: '气态巨行星与超级光环',
        shortLabel: '气态巨行星',
        description: '巨型气态行星、超级土星 J1407b 以及宏伟的冰尘光环系统。',
      },
      'Hành tinh Dung nham & Cực đoan': {
        label: '熔岩与极端世界',
        shortLabel: '熔岩极端',
        description: '潮汐锁定岩浆海洋、2300K硅酸盐石雨世界与脉冲星行星。',
      },
      'Thế giới Băng giá & Kỳ dị': {
        label: '冰封与奇异世界',
        shortLabel: '冰封世界',
        description: '甲烷冰巨星、冰壳下液态海洋卫星与极寒超级地球。',
      },
      'Hố đen & Hiện tượng Thiên hà': {
        label: '黑洞与星系现象',
        shortLabel: '黑洞现象',
        description: '事件视界、相对论吸积盘、爱因斯坦引力透镜与超大质量黑洞。',
      },
      'Ngôi sao Dải Ngân Hà': {
        label: '银河系恒星 (ESA Gaia DR3)',
        shortLabel: '银河恒星',
        description: '太阳、半人马座α、天狼星、织女星、北极星、心宿二、参宿四、参宿七与盾牌座UY。',
      },
      'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
        label: '矮行星、小行星与彗星',
        shortLabel: '小行星与彗星',
        description: '月球、木卫三、冥王星、阋神星、谷神星、灶神星、贝努、哈雷彗星与奥陌陌。',
      },
    },

    blackHoleAnatomy: [
      {
        code: '01',
        title: '事件视界与黑洞阴影 (Event Horizon)',
        detail:
          '逃逸速度超过光速（299,792 km/s）的单向时空边界。由于近距光子被强引力捕获，观测到的中心黑影半径约为史瓦西半径的2.6倍。',
      },
      {
        code: '02',
        title: '光子球与冷蓝灰内缘光晕 (Photon Sphere)',
        detail:
          '紧贴黑洞阴影外缘，极端引力迫使光子绕黑洞旋转数圈后才逃逸向观测者，形成锐利的光子环与独特的蓝灰色内缘散射光晕。',
      },
      {
        code: '03',
        title: '3D立体厚吸积盘与暗尘带 (Volumetric Disk)',
        detail:
          '高速旋转的等离子体与星际尘埃形成富有体积感的厚重气体盘：上层呈现4500–6500K暖白金辉光，前缘则叠加浓密深棕吸收尘埃带。',
      },
      {
        code: '04',
        title: '厚重南北极引力透镜拱环 (Polar Lensing Arches)',
        detail:
          '吸积盘背面的光芒被极度弯曲的时空绕过黑洞南北两极折射到前方，形成极厚、多层丝状的上下极环，并与赤道盘肩部自然融为一体。',
      },
    ],

    famousBlackHoles: [
      {
        id: 'gargantua',
        name: '卡冈图雅 Gargantua (当前核心)',
        galaxy: '基普·索恩广义相对论物理模型',
        massSolar: '1亿倍太阳质量',
        eventHorizonRadius: '1.5亿公里 (~1 AU)',
        spinParameter: 'a* = 0.99999999999999',
        distanceFromEarth: '100亿光年',
        highlightFact:
          '接近光速极限的自旋使最内稳定圆轨道（ISCO）紧贴事件视界，产生1小时等于地球7年的极端引力时间膨胀。',
      },
      {
        id: 'sgr-a',
        name: '人马座 A* (Sgr A*)',
        galaxy: '银河系中心',
        massSolar: '430万倍太阳质量',
        eventHorizonRadius: '1,270万公里',
        spinParameter: 'a* ≈ 0.84 – 0.90',
        distanceFromEarth: '26,670 光年',
        highlightFact:
          '锚定我们银河系中心的超大质量黑洞，于2022年由事件视界望远镜（EHT）首次直接成像。',
      },
      {
        id: 'm87-star',
        name: 'M87* (室女座A星系黑洞)',
        galaxy: '巨型椭圆星系 Messier 87',
        massSolar: '65亿倍太阳质量',
        eventHorizonRadius: '190亿公里 (~127 AU)',
        spinParameter: 'a* ≈ 0.90',
        distanceFromEarth: '5,350万光年',
        highlightFact:
          '人类历史上首张被拍摄到黑洞阴影的天体（2019年），喷射出长达5000光年的相对论等离子体喷流。',
      },
      {
        id: 'ton-618',
        name: 'TON 618 (极超大质量类星体)',
        galaxy: '猎犬座极亮类星体',
        massSolar: '660亿倍太阳质量',
        eventHorizonRadius: '1,950亿公里 (~1,300 AU)',
        spinParameter: 'a* > 0.95',
        distanceFromEarth: '104亿光年',
        highlightFact:
          '宇宙中已知最庞大的黑洞之一，其吸积盘光度相当于140万亿颗太阳。',
      },
    ],

    planetSpecOverrides: {
      'Miller-104b (Hành tinh Đại dương)': {
        designation: 'Miller-104b (海洋世界)',
        planetType: '海洋型超级地球',
        realInspiration: '米勒星球 & 开普勒-22b',
        atmosphereComposition: 'N₂ 78%, O₂ 19%, 浓密海洋水汽',
      },
      'Kepler-452b (Hành tinh Địa cầu)': {
        designation: 'Kepler-452b (类地行星)',
        planetType: '宜居大陆与海洋岩石行星',
        realInspiration: '地球、开普勒-452b & TRAPPIST-1e',
        atmosphereComposition: 'N₂ 77%, O₂ 21%, Ar 1%, 对流云层',
      },
      'J1407b-Prime (Siêu Sao Thổ)': {
        designation: 'J1407b-Prime (超级土星)',
        planetType: '超宽光环气态巨行星',
        realInspiration: '土星 & 系外行星 J1407b',
        atmosphereComposition: 'H₂ 96%, He 3%, 暖金氨冰云带',
      },
      'Kepler-90h (Khổng lồ Khí Bão Từ)': {
        designation: 'Kepler-90h (风暴气态巨星)',
        planetType: '条纹反气旋气态巨行星',
        realInspiration: '木星 & 开普勒-90h',
        atmosphereComposition: 'H₂ 89%, He 10%, 琥珀巨风暴带',
      },
      '55 Cancri e (Thế giới Dung nham)': {
        designation: '55 Cancri e (熔岩世界)',
        planetType: '潮汐锁定岩浆超级地球',
        realInspiration: '巨蟹座55e & CoRoT-7b',
        atmosphereComposition: '气化硅酸盐, CO, SO₂ 与火山灰',
      },
      'K2-141b (Hành tinh Mưa Đá Nóng)': {
        designation: 'K2-141b (炽热石雨行星)',
        planetType: '玄武岩与熔岩河行星',
        realInspiration: 'K2-141b & 木卫一 Io',
        atmosphereComposition: 'Na, SiO, 2100K炽热矿物蒸气',
      },
      'Mann-Draconis (Hành tinh Băng Amoniac)': {
        designation: 'Mann-Draconis (冰巨星)',
        planetType: '极寒甲烷与氨冰世界',
        realInspiration: '曼恩星球、海王星 & 天王星',
        atmosphereComposition: 'H₂ 80%, He 18%, 深蓝甲烷雾霾',
      },
      'OGLE-390Lb (Siêu Trái Đất Băng Giá)': {
        designation: 'OGLE-390Lb (冰封超级地球)',
        planetType: '永冻冰壳与地下海洋世界',
        realInspiration: 'OGLE-2005-BLG-390Lb & 木卫二',
        atmosphereComposition: '固态氮、甲烷与冰晶薄雾',
      },
      'EDMUNDS-Prime (Trạm Quan sát Quỹ đạo)': {
        designation: 'EDMUNDS-Prime (外轨观测星)',
        planetType: '事件视界外缘岩石世界',
        realInspiration: '埃德蒙兹星球 & 卡冈图雅星系',
        atmosphereComposition: 'N₂, O₂ 与吸积盘折射晨昏光',
      },
      'ISCO-Sentinel (Thiên thể Cận Photon)': {
        designation: 'ISCO-Sentinel (近光子轨道)',
        planetType: '最内稳定圆轨道 (ISCO) 天体',
        realInspiration: '卡冈图雅相对论克尔轨道',
        atmosphereComposition: '受吸积盘辐射轻度电离的大气',
      },
    },
  },

  ko: {
    brandTitle: 'Milky Way Observatory',
    navExplorer: '우리 은하 3D',
    navBlackHole: '궁수자리 A*',
    navCatalog: '행성 도감',
    navSimulator: 'AI 시뮬레이터',
    languageLabel: '언어',

    sidebarTitle: '천체 도감 목록',
    searchPlaceholder: '행성, 블랙홀, 태그 검색...',
    allCategories: '전체',
    objectsCountUnit: '개 천체',
    featuredBlackHoleTitle: '우리 은하 중심 · 궁수자리 A*',
    featuredBlackHoleSubtitle: '태양 430만 배 · NASA 공식 우리 은하 모델',
    inspectCoreAction: '분석',
    noSearchResults: '검색 조건과 일치하는 천체가 없습니다.',
    resetFilters: '필터 초기화',
    hideSidebar: '목록 접기',
    showSidebar: '목록 열기',
    restoreAtlas: '기본 48개 천체 복원',

    pauseOrbit: '일시정지',
    resumeOrbit: '계속',
    constellationLines: '스펙트럼 연결선',
    orbitRings: '공전 궤도',
    onLabel: '켜짐',
    offLabel: '꺼짐',
    resetCamera: '전체 보기',
    canvasHint: '드래그로 360° 회전 · 스크롤로 확대/축소 · 궁수자리 A*, 태양계 또는 행성을 클릭해 NASA 정보 확인',
    webglFallbackTitle: '천문 도감 모드',
    webglFallbackDesc: 'WebGL을 사용할 수 없습니다. 상단의 행성 도감 탭에서 48개 천체를 탐색하세요.',

    bhTooltipTitle: '초대질량 블랙홀 궁수자리 A* (태양 430만 배)',
    bhTooltipCategory: '우리 은하 중심핵 (NASA / EHT)',
    bhTooltipAction: '클릭하여 NASA 우리 은하 구조 및 블랙홀 물리 분석 열기',

    bhBadge: '우리 은하 중심핵 · NASA 스피처 / 가이아 / EHT 모델',
    bhHeadline: '우리 은하(Milky Way) & 궁수자리 A* 중심핵',
    bhCompareLabel: '실제 우주 초대질량 블랙홀 비교',
    bhMassLabel: '질량',
    bhHorizonLabel: '사건의 지평선 반지름',
    bhSpinLabel: '커 스핀 계수 (a*)',
    bhDistanceLabel: '지구로부터의 거리',
    bhAnatomyHeading: '4층 광학 구조 해부',
    bhInnerPlanetsHeading: '최근접 공전 행성',
    closeInspector: '닫기',

    planetSpecsHeading: '물리 및 대기 원격측정',
    planetClassLabel: '표면 유형',
    planetInspirationLabel: '실제 천체 모델',
    planetTempLabel: '표면 온도',
    planetGravityLabel: '표면 중력',
    planetAtmoLabel: '대기 조성',
    planetRingsLabel: '고리 시스템',
    planetRingsYes: '얼음·먼지 고리 보유',
    planetRingsNo: '고리 없음',
    planetOrbitLabel: '궤도 반지름',
    planetKeyFindings: '핵심 과학적 특징 3가지',
    planetOverviewHeading: '천체물리 연구 보고서',
    planetTagsHeading: '스펙트럼 태그',
    planetRelatedHeading: '연관 천체',
    deleteObjectBtn: '목록에서 삭제',
    viewIn3DBtn: '3D로 관찰',

    catalogHeroKicker: 'NASA 기준 우리 은하 포털 (.env 없이 기본 실행)',
    catalogHeroTitle: '우리 은하 · 외계행성 · 블랙홀 백과사전',
    catalogHeroSubtitle:
      'NASA 스피처, ESA 가이아 DR3, EHT 관측 데이터로 구현한 지름 105,700광년의 막대나선은하(Milky Way)와 30개의 실제 천체를 탐색하세요.',
    catalogOpenBhLab: '우리 은하 & 궁수자리 A* 분석',
    catalogAddAiBtn: 'AI 천체 시뮬레이션',
    catalogShowingText: '표시 중',

    modalTitle: 'AI 천체 및 현상 시뮬레이터',
    modalSubtitle: '외계행성, 위성, 블랙홀 현상을 입력하면 AI가 분석해 3D 궤도에 배치합니다',
    modalPresetsLabel: '추천 천체 프리셋:',
    modalNameLabel: '천체 이름 (선택)',
    modalNamePlaceholder: '예: 프록시마 센타우리 b...',
    modalCategoryLabel: '천체물리 분류',
    modalDescLabel: '관측 데이터 / 설명',
    modalDescPlaceholder: '대기 성분, 표면 온도, 공전 주기, 중력 현상 등을 입력하세요...',
    modalCharCount: '자',
    modalErrorMinChars: 'AI 분석을 위해 최소 12자 이상 입력해 주세요.',
    modalErrorGeneric: '지금은 시뮬레이션을 생성할 수 없습니다. 다시 시도해 주세요.',
    modalCancelBtn: '취소',
    modalSubmitBtn: '분석 후 3D 궤도에 추가',
    modalLoadingBtn: '궤도 계산 중...',
    modalFooterNote: '생성된 천체는 브라우저에 자동 저장됩니다.',
    modalPresets: [
      {
        label: '퀘이사 TON 618',
        title: 'TON 618 — 태양 660억 배 초거대 퀘이사 블랙홀',
        category: 'Hố đen & Hiện tượng Thiên hà',
        content:
          'TON 618은 사냥개자리 방향 104억 광년 떨어진 초고광도 퀘이사로, 태양 질량의 660억 배에 달하는 우주 최대급 블랙홀을 품고 있습니다. 사건의 지평선 반지름만 1,300 AU를 넘어 태양계 40개 이상을 나란히 넣을 수 있습니다.',
      },
      {
        label: 'LHS 1140b (JWST)',
        title: '외계행성 LHS 1140b — 질소 대기와 눈알형 액체 바다 세계',
        category: 'Hành tinh Đại dương & Sự sống',
        content:
          '제임스 웹 우주망원경(JWST)의 최신 관측에 따르면 지구에서 48광년 떨어진 LHS 1140b는 질소가 풍부한 대기를 지닌 얼음 슈퍼지구일 가능성이 높습니다. 적색왜성에 조석 고정되어 낮 반구 중심에 지름 4,000km, 수온 약 20°C의 액체 바다가 형성되어 있습니다.',
      },
      {
        label: '토성 위성 엔셀라두스',
        title: '위성 엔셀라두스 — 얼음 간헐천과 열수 지하 바다',
        category: 'Thế giới Băng giá & Kỳ dị',
        content:
          '토성의 얼음 위성 엔셀라두스는 태양빛의 거의 100%를 반사합니다. 남극의 호랑이 줄무늬 균열에서 수증기와 얼음 알갱이, 유기 분자가 수백 km 상공으로 분출되며, 얼음 지각 아래 따뜻한 열수 지하 바다가 존재함을 증명합니다.',
      },
    ],

    categories: {
      'Hành tinh Đại dương & Sự sống': {
        label: '해양 및 생명 거주 행성',
        shortLabel: '해양·생명',
        description: '생명 거주 가능 영역 외계행성, 하이시안 해양 세계 및 지구 유사 행성.',
      },
      'Khổng lồ Khí & Siêu Vành Đai': {
        label: '가스 거인 및 초대형 고리',
        shortLabel: '가스 거인',
        description: '거대 가스 행성, 슈퍼 토성 J1407b 및 광대한 얼음·먼지 고리계.',
      },
      'Hành tinh Dung nham & Cực đoan': {
        label: '용암 및 극한 환경 행성',
        shortLabel: '용암·극한',
        description: '조석 고정 마그마 바다, 2,300K 규산염 암석비 행성 및 펄서 행성.',
      },
      'Thế giới Băng giá & Kỳ dị': {
        label: '얼음 및 이색 세계',
        shortLabel: '얼음 세계',
        description: '메탄 얼음 거인, 얼음 지각 아래 지하 바다 위성 및 극저온 슈퍼지구.',
      },
      'Hố đen & Hiện tượng Thiên hà': {
        label: '블랙홀 및 은하 현상',
        shortLabel: '블랙홀·은하',
        description: '사건의 지평선, 상대론적 강착원반, 아인슈타인 중력렌즈 및 초대질량 코어.',
      },
      'Ngôi sao Dải Ngân Hà': {
        label: '우리은하 항성 (ESA Gaia DR3)',
        shortLabel: '항성',
        description: '태양, 알파 센타우리, 시리우스, 베가, 폴라리스, 안타레스, 베텔게우스, 리겔 및 방패자리 UY.',
      },
      'Tiểu hành tinh, Hành tinh Lùn & Sao chổi': {
        label: '왜행성·소행성·혜성',
        shortLabel: '소행성·혜성',
        description: '달, 가니메데, 명왕성, 에리스, 세레스, 베스타, 베누, 핼리 혜성 및 오우무아무아.',
      },
    },

    blackHoleAnatomy: [
      {
        code: '01',
        title: '사건의 지평선과 블랙홀 그림자 (Event Horizon)',
        detail:
          '탈출 속도가 빛의 속도(299,792 km/s)를 초과하는 일방통행 시공간 경계입니다. 중력 포획 효과로 인해 관측되는 그림자 반지름은 슈바르츠실트 반지름의 약 2.6배로 확대됩니다.',
      },
      {
        code: '02',
        title: '광자구와 푸른빛 내부 산란 테두리 (Photon Sphere)',
        detail:
          '그림자 바로 바깥쪽에서는 극심한 중력이 광자를 원 궤도로 여러 바퀴 휘어 돌린 뒤 방출하여, 선명한 광자 고리와 은은한 청회색 내부 테두리를 만듭니다.',
      },
      {
        code: '03',
        title: '두꺼운 3D 입체 강착원반과 암흑 먼지띠',
        detail:
          '상대론적 속도로 회전하는 플라즈마와 우주 먼지가 입체적으로 두꺼운 가스 원반을 이룹니다. 4,500~6,500K의 크림골드 상부 층과 앞쪽 가장자리의 짙은 흡수 먼지띠가 깊이를 더합니다.',
      },
      {
        code: '04',
        title: '두꺼운 남·북극 중력렌즈 아치 (Polar Lensing Arches)',
        detail:
          '강착원반 뒷면에서 방출된 빛이 휘어진 시공간을 따라 블랙홀 북극과 남극 위로 크게 휘어져, 두껍고 촘촘한 다층 빛줄기 아치로 이어집니다.',
      },
    ],

    famousBlackHoles: [
      {
        id: 'gargantua',
        name: '가르강튀아 (현재 관측 중심핵)',
        galaxy: '킵 손 일반상대성이론 모델',
        massSolar: '태양의 1억 배',
        eventHorizonRadius: '1억 5,000만 km (~1 AU)',
        spinParameter: 'a* = 0.99999999999999',
        distanceFromEarth: '100억 광년',
        highlightFact:
          '광속 한계에 가까운 자전 덕분에 최내곽 안정 원궤도(ISCO)가 사건의 지평선 직전까지 근접해 1시간 = 지구 7년의 시간 지연을 일으킵니다.',
      },
      {
        id: 'sgr-a',
        name: '궁수자리 A* (Sgr A*)',
        galaxy: '우리 은하 중심',
        massSolar: '태양의 430만 배',
        eventHorizonRadius: '1,270만 km',
        spinParameter: 'a* ≈ 0.84 – 0.90',
        distanceFromEarth: '26,670광년',
        highlightFact:
          '우리 은하 중심에 위치한 초대질량 블랙홀로 2022년 사건지평선망원경(EHT)에 의해 직접 촬영되었습니다.',
      },
      {
        id: 'm87-star',
        name: 'M87* (포웨히)',
        galaxy: '거대 타원은하 메시에 87',
        massSolar: '태양의 65억 배',
        eventHorizonRadius: '190억 km (~127 AU)',
        spinParameter: 'a* ≈ 0.90',
        distanceFromEarth: '5,350만 광년',
        highlightFact:
          '인류 최초로 그림자가 촬영된 블랙홀(2019년)로, 5,000광년 길이의 상대론적 플라즈마 제트를 방출합니다.',
      },
      {
        id: 'ton-618',
        name: 'TON 618 (초거대 퀘이사)',
        galaxy: '사냥개자리 퀘이사',
        massSolar: '태양의 660억 배',
        eventHorizonRadius: '1,950억 km (~1,300 AU)',
        spinParameter: 'a* > 0.95',
        distanceFromEarth: '104억 광년',
        highlightFact:
          '우주에서 발견된 가장 거대한 블랙홀 중 하나로, 강착원반의 밝기가 태양 140조 개에 달합니다.',
      },
    ],

    planetSpecOverrides: {
      'Miller-104b (Hành tinh Đại dương)': {
        designation: 'Miller-104b (해양 행성)',
        planetType: '해양형 슈퍼지구',
        realInspiration: '밀러 행성 & 케플러-22b',
        atmosphereComposition: 'N₂ 78%, O₂ 19%, 고밀도 해양 수증기',
      },
      'Kepler-452b (Hành tinh Địa cầu)': {
        designation: 'Kepler-452b (지구 유사 행성)',
        planetType: '대륙과 바다를 품은 암석 행성',
        realInspiration: '지구, 케플러-452b & TRAPPIST-1e',
        atmosphereComposition: 'N₂ 77%, O₂ 21%, Ar 1%, 대류 구름층',
      },
      'J1407b-Prime (Siêu Sao Thổ)': {
        designation: 'J1407b-Prime (슈퍼 토성)',
        planetType: '초대형 고리 가스 거인',
        realInspiration: '토성 & 외계행성 J1407b',
        atmosphereComposition: 'H₂ 96%, He 3%, 황금빛 암모니아 구름띠',
      },
      'Kepler-90h (Khổng lồ Khí Bão Từ)': {
        designation: 'Kepler-90h (폭풍 가스 거인)',
        planetType: '거대 고기압 폭풍대 가스 행성',
        realInspiration: '목성 & 케플러-90h',
        atmosphereComposition: 'H₂ 89%, He 10%, 거대 호박색 폭풍대',
      },
      '55 Cancri e (Thế giới Dung nham)': {
        designation: '55 Cancri e (용암 행성)',
        planetType: '조석 고정 마그마 슈퍼지구',
        realInspiration: '게자리 55 e & CoRoT-7b',
        atmosphereComposition: '기화된 규산염, CO, SO₂ 및 화산재',
      },
      'K2-141b (Hành tinh Mưa Đá Nóng)': {
        designation: 'K2-141b (암석비 행성)',
        planetType: '현무암 및 마그마 강 행성',
        realInspiration: 'K2-141b & 목성 위성 이오',
        atmosphereComposition: 'Na, SiO, 2,100K 고온 광물 증기',
      },
      'Mann-Draconis (Hành tinh Băng Amoniac)': {
        designation: 'Mann-Draconis (얼음 거인)',
        planetType: '극저온 메탄·암모니아 얼음 세계',
        realInspiration: '만 행성, 해왕성 & 천왕성',
        atmosphereComposition: 'H₂ 80%, He 18%, 짙은 푸른 메탄 안개',
      },
      'OGLE-390Lb (Siêu Trái Đất Băng Giá)': {
        designation: 'OGLE-390Lb (극저온 슈퍼지구)',
        planetType: '영구 동토 및 지하 바다 천체',
        realInspiration: 'OGLE-2005-BLG-390Lb & 유로파',
        atmosphereComposition: '동결 질소, 메탄 및 얼음 결정 안개',
      },
      'EDMUNDS-Prime (Trạm Quan sát Quỹ đạo)': {
        designation: 'EDMUNDS-Prime (외곽 관측 행성)',
        planetType: '사건의 지평선 외곽 암석 행성',
        realInspiration: '에드먼즈 행성 & 가르강튀아계',
        atmosphereComposition: 'N₂, O₂ 및 강착원반 굴절 황혼광',
      },
      'ISCO-Sentinel (Thiên thể Cận Photon)': {
        designation: 'ISCO-Sentinel (근광자 궤도)',
        planetType: '최내곽 안정 원궤도(ISCO) 천체',
        realInspiration: '가르강튀아 상대론 커 궤도',
        atmosphereComposition: '강착원반 복사로 약하게 이온화된 대기',
      },
    },
  },
};
