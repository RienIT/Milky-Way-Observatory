/**
 * 5-Language Localization Dictionary (en, vi, ja, zh, ko) for Multi-Scale Universe HUD,
 * Time Simulation Controls, Multi-Wavelength Bands, Solar Eclipses, Photon Pulse, and Cinema Mode.
 */

import { LanguageCode } from './i18n';
import { ScaleLayerId } from './scale-engine';

export type ScalePresetId =
  | 'earth'
  | 'solar-system'
  | 'nearby-stars'
  | 'milky-way'
  | 'sgr-a'
  | 'local-group';

export interface UniverseHudCopy {
  scalePresetsTitle: string;
  presets: Record<ScalePresetId, string>;
  layers: Record<ScaleLayerId, string>;
  distanceToTarget: string;
  altitudeAboveSurface: string;
  scaleBarAria: string;
  timePanelTitle: string;
  play: string;
  pause: string;
  resetToNow: string;
  timeSpeedLabel: string;
  timeSpeeds: {
    realtime: string;
    hourPerSec: string;
    dayPerSec: string;
    monthPerSec: string;
    yearPerSec: string;
  };
  provenanceMeasured: string;
  provenanceIllustrative: string;
  provenanceMixed: string;
  layerToggles: {
    orbits: string;
    trails: string;
    clusters: string;
    labels: string;
    grid: string;
    galaxies: string;
    reducedMotion: string;
  };
  loadingTiles: string;
  webglRestoring: string;
  extragalacticSection: string;
  solarSystemSection: string;
  zoomSliderAria: string;
  moonPhaseLabel: string;
  wavelengthLabel: string;
  eclipseBtn: string;
  eclipseActiveBadge: string;
  photonPulseBtn: string;
  photonStopBtn: string;
  cinemaMode: string;
  showHud: string;
  searchTrigger: string;
  worldLabLabel: string;
}

export const UNIVERSE_HUD_COPY: Record<LanguageCode, UniverseHudCopy> = {
  en: {
    scalePresetsTitle: 'Scale',
    presets: {
      earth: 'Earth',
      'solar-system': 'Solar System',
      'nearby-stars': 'Nearby Stars',
      'milky-way': 'Milky Way',
      'sgr-a': 'Sgr A*',
      'local-group': 'Local Group',
    },
    layers: {
      planetary: 'Planetary Scale',
      stellar: 'Stellar Neighborhood',
      galactic: 'Galactic Scale',
      extragalactic: 'Extragalactic Scale',
    },
    distanceToTarget: 'Distance',
    altitudeAboveSurface: 'Altitude',
    scaleBarAria: 'Dynamic astronomical scale bar',
    timePanelTitle: 'Ephemeris Time',
    play: 'Play simulation time',
    pause: 'Pause simulation time',
    resetToNow: 'Now',
    timeSpeedLabel: 'Rate',
    timeSpeeds: {
      realtime: '1×',
      hourPerSec: '1h/s',
      dayPerSec: '1d/s',
      monthPerSec: '30d/s',
      yearPerSec: '1y/s',
    },
    provenanceMeasured: 'Measured Catalog / Ephemeris',
    provenanceIllustrative: 'Illustrative Parametric Model',
    provenanceMixed: 'Measured Positions · Illustrative Morphology',
    layerToggles: {
      orbits: 'Orbits',
      trails: 'Trails',
      clusters: 'Clusters',
      labels: 'Labels',
      grid: 'Galactic Grid',
      galaxies: 'Galaxies',
      reducedMotion: 'Reduced Motion',
    },
    loadingTiles: 'Streaming star tiles',
    webglRestoring: 'Restoring WebGL2 context…',
    extragalacticSection: 'Local Group & Clusters',
    solarSystemSection: 'Solar System (Live Ephemeris)',
    zoomSliderAria: 'Logarithmic universe zoom slider',
    moonPhaseLabel: 'Lunar Illum.',
    wavelengthLabel: 'Spectrum',
    eclipseBtn: 'Eclipses',
    eclipseActiveBadge: 'Umbra Active',
    photonPulseBtn: 'Light Pulse (c)',
    photonStopBtn: 'Stop Pulse',
    cinemaMode: 'Cinema [H]',
    showHud: 'Show HUD [H]',
    searchTrigger: 'Search catalog, stars, galaxies…',
    worldLabLabel: 'World Lab',
  },
  vi: {
    scalePresetsTitle: 'Thang đo',
    presets: {
      earth: 'Trái Đất',
      'solar-system': 'Hệ Mặt Trời',
      'nearby-stars': 'Sao lân cận',
      'milky-way': 'Ngân Hà',
      'sgr-a': 'Sgr A*',
      'local-group': 'Nhóm Địa phương',
    },
    layers: {
      planetary: 'Thang Hành tinh',
      stellar: 'Vùng sao lân cận',
      galactic: 'Thang Thiên hà',
      extragalactic: 'Thang Ngoài thiên hà',
    },
    distanceToTarget: 'Khoảng cách',
    altitudeAboveSurface: 'Độ cao bề mặt',
    scaleBarAria: 'Thanh tỷ lệ thiên văn động',
    timePanelTitle: 'Lịch Thiên văn Thực',
    play: 'Chạy thời gian mô phỏng',
    pause: 'Tạm dừng thời gian',
    resetToNow: 'Hiện tại',
    timeSpeedLabel: 'Tốc độ',
    timeSpeeds: {
      realtime: '1×',
      hourPerSec: '1g/s',
      dayPerSec: '1ng/s',
      monthPerSec: '30ng/s',
      yearPerSec: '1n/s',
    },
    provenanceMeasured: 'Dữ liệu Đo đạc / Lịch thiên văn',
    provenanceIllustrative: 'Mô hình Tham số Minh họa',
    provenanceMixed: 'Vị trí Đo đạc · Hình thái Minh họa',
    layerToggles: {
      orbits: 'Quỹ đạo',
      trails: 'Vệt quỹ đạo',
      clusters: 'Cụm sao',
      labels: 'Nhãn 3D',
      grid: 'Lưới Thiên hà',
      galaxies: 'Thiên hà',
      reducedMotion: 'Giảm chuyển động',
    },
    loadingTiles: 'Đang tải dữ liệu sao',
    webglRestoring: 'Đang khôi phục WebGL2…',
    extragalacticSection: 'Nhóm Địa phương & Cụm Thiên hà',
    solarSystemSection: 'Hệ Mặt Trời (Quỹ đạo Thực)',
    zoomSliderAria: 'Thanh trượt thu phóng logarit vũ trụ',
    moonPhaseLabel: 'Pha Mặt Trăng',
    wavelengthLabel: 'Phổ quan sát',
    eclipseBtn: 'Nhật thực',
    eclipseActiveBadge: 'Bóng tối Umbra',
    photonPulseBtn: 'Xung ánh sáng (c)',
    photonStopBtn: 'Tắt xung',
    cinemaMode: 'Toàn cảnh [H]',
    showHud: 'Hiện HUD [H]',
    searchTrigger: 'Tìm thiên thể, ngôi sao, thiên hà…',
    worldLabLabel: 'Phòng thí nghiệm',
  },
  ja: {
    scalePresetsTitle: 'スケール',
    presets: {
      earth: '地球',
      'solar-system': '太陽系',
      'nearby-stars': '近傍恒星',
      'milky-way': '天の川銀河',
      'sgr-a': 'いて座A*',
      'local-group': '局所銀河群',
    },
    layers: {
      planetary: '惑星スケール',
      stellar: '近傍恒星圏',
      galactic: '銀河スケール',
      extragalactic: '銀河外スケール',
    },
    distanceToTarget: '距離',
    altitudeAboveSurface: '高度',
    scaleBarAria: '動的スケールバー',
    timePanelTitle: '天体暦時刻',
    play: 'シミュレーション再生',
    pause: '一時停止',
    resetToNow: '現在',
    timeSpeedLabel: '速度',
    timeSpeeds: {
      realtime: '1×',
      hourPerSec: '1時間/秒',
      dayPerSec: '1日/秒',
      monthPerSec: '30日/秒',
      yearPerSec: '1年/秒',
    },
    provenanceMeasured: '実測カタログ / 天体暦',
    provenanceIllustrative: 'パラメトリック概念モデル',
    provenanceMixed: '実測位置・概念形態',
    layerToggles: {
      orbits: '軌道',
      trails: '軌跡',
      clusters: '星団',
      labels: 'ラベル',
      grid: '銀河グリッド',
      galaxies: '銀河群',
      reducedMotion: 'モーション軽減',
    },
    loadingTiles: '恒星データ読込中',
    webglRestoring: 'WebGL2 コンテキストを復元中…',
    extragalacticSection: '局所銀河群と銀河団',
    solarSystemSection: '太陽系（実天体暦）',
    zoomSliderAria: '対数ズームスライダー',
    moonPhaseLabel: '月照率',
    wavelengthLabel: '観測波長',
    eclipseBtn: '日食',
    eclipseActiveBadge: '本影検出中',
    photonPulseBtn: '光速パルス (c)',
    photonStopBtn: 'パルス停止',
    cinemaMode: 'シネマ [H]',
    showHud: 'HUD表示 [H]',
    searchTrigger: '天体・恒星・銀河を検索…',
    worldLabLabel: 'ワールド生成',
  },
  zh: {
    scalePresetsTitle: '尺度',
    presets: {
      earth: '地球',
      'solar-system': '太阳系',
      'nearby-stars': '近邻恒星',
      'milky-way': '银河系',
      'sgr-a': '人马座A*',
      'local-group': '本星系群',
    },
    layers: {
      planetary: '行星尺度',
      stellar: '近邻恒星尺度',
      galactic: '星系尺度',
      extragalactic: '河外星系尺度',
    },
    distanceToTarget: '距离',
    altitudeAboveSurface: '地表高度',
    scaleBarAria: '动态天文比例尺',
    timePanelTitle: '实时星历时间',
    play: '播放模拟时间',
    pause: '暂停时间',
    resetToNow: '此刻',
    timeSpeedLabel: '速率',
    timeSpeeds: {
      realtime: '1×',
      hourPerSec: '1时/秒',
      dayPerSec: '1天/秒',
      monthPerSec: '30天/秒',
      yearPerSec: '1年/秒',
    },
    provenanceMeasured: '实测星表 / 真实星历',
    provenanceIllustrative: '参数化示意模型',
    provenanceMixed: '实测位置 · 示意形态',
    layerToggles: {
      orbits: '轨道',
      trails: '轨迹尾迹',
      clusters: '引力星团',
      labels: '标签',
      grid: '银道网格',
      galaxies: '河外星系',
      reducedMotion: '减少动态效果',
    },
    loadingTiles: '正在加载恒星分块',
    webglRestoring: '正在恢复 WebGL2 上下文…',
    extragalacticSection: '本星系群与星系团',
    solarSystemSection: '太阳系（实时星历）',
    zoomSliderAria: '对数宇宙缩放滑块',
    moonPhaseLabel: '月相照明',
    wavelengthLabel: '观测波段',
    eclipseBtn: '日食',
    eclipseActiveBadge: '月球本影',
    photonPulseBtn: '光速脉冲 (c)',
    photonStopBtn: '停止脉冲',
    cinemaMode: '纯粹模式 [H]',
    showHud: '显示 HUD [H]',
    searchTrigger: '搜索天体、恒星、星系…',
    worldLabLabel: '行星实验室',
  },
  ko: {
    scalePresetsTitle: '스케일',
    presets: {
      earth: '지구',
      'solar-system': '태양계',
      'nearby-stars': '인근 항성',
      'milky-way': '우리은하',
      'sgr-a': '궁수자리 A*',
      'local-group': '국부은하군',
    },
    layers: {
      planetary: '행성 스케일',
      stellar: '인근 항성권',
      galactic: '은하 스케일',
      extragalactic: '외부은하 스케일',
    },
    distanceToTarget: '거리',
    altitudeAboveSurface: '표면 고도',
    scaleBarAria: '동적 천문 스케일 바',
    timePanelTitle: '실시간 천체력',
    play: '시간 재생',
    pause: '일시 정지',
    resetToNow: '현재',
    timeSpeedLabel: '배속',
    timeSpeeds: {
      realtime: '1×',
      hourPerSec: '1시간/초',
      dayPerSec: '1일/초',
      monthPerSec: '30일/초',
      yearPerSec: '1년/초',
    },
    provenanceMeasured: '실측 카탈로그 / 천체력',
    provenanceIllustrative: '파라메트릭 예시 모델',
    provenanceMixed: '실측 위치 · 예시 형태',
    layerToggles: {
      orbits: '궤도',
      trails: '궤적',
      clusters: '성단',
      labels: '라벨',
      grid: '은하 그리드',
      galaxies: '은하군',
      reducedMotion: '모션 줄이기',
    },
    loadingTiles: '항성 타일 스트리밍 중',
    webglRestoring: 'WebGL2 컨텍스트 복원 중…',
    extragalacticSection: '국부은하군 및 은하단',
    solarSystemSection: '태양계 (실시간 천체력)',
    zoomSliderAria: '로그 우주 줌 슬라이더',
    moonPhaseLabel: '달 위상',
    wavelengthLabel: '관측 파장',
    eclipseBtn: '일식',
    eclipseActiveBadge: '본영 활성',
    photonPulseBtn: '광속 펄스 (c)',
    photonStopBtn: '펄스 중지',
    cinemaMode: '시네마 [H]',
    showHud: 'HUD 표시 [H]',
    searchTrigger: '천체, 항성, 은하 검색…',
    worldLabLabel: '행성 실험실',
  },
};
