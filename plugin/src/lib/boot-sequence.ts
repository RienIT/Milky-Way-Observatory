import { LanguageCode } from './i18n';

export type BootStageId =
  | 'bundle'
  | 'webgl'
  | 'milky-way'
  | 'ephemeris'
  | 'shaders'
  | 'ready';

export type BootMilestoneId = 'webgl' | 'milky-way' | 'ephemeris' | 'shaders';

export type BootMilestoneStatus = 'pending' | 'active' | 'done';

export interface BootState {
  stage: BootStageId;
  progress: number;
}

export const BOOT_STAGE_ORDER: readonly BootStageId[] = [
  'bundle',
  'webgl',
  'milky-way',
  'ephemeris',
  'shaders',
  'ready',
] as const;

export const BOOT_MILESTONES: readonly BootMilestoneId[] = [
  'webgl',
  'milky-way',
  'ephemeris',
  'shaders',
] as const;

export const BOOT_STAGE_PROGRESS: Record<BootStageId, number> = {
  bundle: 12,
  webgl: 28,
  'milky-way': 52,
  ephemeris: 76,
  shaders: 92,
  ready: 100,
};

export interface BootCopyDictionary {
  title: string;
  subtitle: string;
  reassurance: string;
  stages: Record<BootStageId, string>;
  milestones: Record<BootMilestoneId, string>;
}

export const BOOT_COPY: Record<LanguageCode, BootCopyDictionary> = {
  en: {
    title: 'Milky Way Observatory',
    subtitle: 'Preparing real-time 3D WebGL2 space simulation',
    reassurance: 'Loading shaders and celestial mechanics — the canvas will appear in a moment.',
    stages: {
      bundle: 'Loading 3D observatory engine...',
      webgl: 'Initializing WebGL2 multi-scale renderer...',
      ephemeris: 'Computing NASA Solar System ephemeris & planets...',
      'milky-way': 'Synthesizing Milky Way starfield & gravitational clusters...',
      shaders: 'Compiling planetary shaders & rendering first frame...',
      ready: 'Observatory ready',
    },
    milestones: {
      webgl: 'WebGL2 Engine',
      ephemeris: 'Solar System & Ephemeris',
      'milky-way': 'Milky Way & Star Clusters',
      shaders: 'Planetary Shaders & First Frame',
    },
  },
  vi: {
    title: 'Đài Thiên Văn Ngân Hà',
    subtitle: 'Đang khởi tạo không gian mô phỏng 3D WebGL2',
    reassurance: 'Hệ thống đang tải dữ liệu thiên văn và biên dịch đổ bóng — vui lòng chờ giây lát.',
    stages: {
      bundle: 'Đang tải mô-đun quan sát 3D...',
      webgl: 'Đang khởi tạo bộ dựng hình WebGL2 đa tỷ lệ...',
      ephemeris: 'Đang tính toán quỹ đạo Hệ Mặt Trời NASA & các hành tinh...',
      'milky-way': 'Đang dựng trường sao Dải Ngân Hà & cụm hấp dẫn...',
      shaders: 'Đang biên dịch đổ bóng hành tinh & khung hình đầu tiên...',
      ready: 'Đã sẵn sàng khám phá',
    },
    milestones: {
      webgl: 'Động cơ WebGL2',
      ephemeris: 'Hệ Mặt Trời & Quỹ đạo NASA',
      'milky-way': 'Dải Ngân Hà & Cụm Sao',
      shaders: 'Đổ bóng 3D & Khung hình đầu',
    },
  },
  ja: {
    title: '天の川天文台',
    subtitle: 'リアルタイム 3D WebGL2 宇宙シミュレーションを準備中',
    reassurance: 'シェーダーと天体力学を読み込んでいます。まもなく表示されます。',
    stages: {
      bundle: '3D天文台モジュールを読み込み中...',
      webgl: 'WebGL2 マルチスケールエンジンを初期化中...',
      ephemeris: 'NASA 太陽系暦と惑星軌道を計算中...',
      'milky-way': '天の川星野と重力クラスターを構築中...',
      shaders: '惑星シェーダーをコンパイルして初回フレームを描画中...',
      ready: '準備完了',
    },
    milestones: {
      webgl: 'WebGL2 エンジン',
      ephemeris: '太陽系と天体暦',
      'milky-way': '天の川と星団',
      shaders: 'シェーダーと初回描画',
    },
  },
  zh: {
    title: '银河系天文台',
    subtitle: '正在准备实时 3D WebGL2 宇宙模拟',
    reassurance: '正在加载天文数据与行星着色器，画面即将呈现。',
    stages: {
      bundle: '正在加载 3D 天文台模块...',
      webgl: '正在初始化 WebGL2 多尺度引擎...',
      ephemeris: '正在计算 NASA 太阳系星历与行星轨道...',
      'milky-way': '正在生成银河系星场与引力星团...',
      shaders: '正在编译行星着色器并渲染首帧...',
      ready: '天文台已就绪',
    },
    milestones: {
      webgl: 'WebGL2 引擎',
      ephemeris: '太阳系与星历',
      'milky-way': '银河系与星团',
      shaders: '着色器与首帧渲染',
    },
  },
  ko: {
    title: '은하수 천문대',
    subtitle: '실시간 3D WebGL2 우주 시뮬레이션 준비 중',
    reassurance: '천문 데이터와 행성 셰이더를 불러오는 중입니다. 잠시만 기다려 주세요.',
    stages: {
      bundle: '3D 천문대 모듈 불러오는 중...',
      webgl: 'WebGL2 다중 스케일 엔진 초기화 중...',
      ephemeris: 'NASA 태양계 천체력 및 행성 궤도 계산 중...',
      'milky-way': '은하수 성단 및 중력 군집 생성 중...',
      shaders: '행성 셰이더 컴파일 및 첫 프레임 렌더링 중...',
      ready: '탐험 준비 완료',
    },
    milestones: {
      webgl: 'WebGL2 엔진',
      ephemeris: '태양계 및 천체력',
      'milky-way': '은하수 및 성단',
      shaders: '셰이더 및 첫 프레임',
    },
  },
};

export function createInitialBootState(stage: BootStageId = 'webgl'): BootState {
  return {
    stage,
    progress: BOOT_STAGE_PROGRESS[stage],
  };
}

export function getBootStageIndex(stage: BootStageId): number {
  return BOOT_STAGE_ORDER.indexOf(stage);
}

/**
 * Advances boot state monotonically so progress never jumps backwards
 * even if async callbacks arrive out of order.
 */
export function advanceBootState(prev: BootState, nextStage: BootStageId): BootState {
  const prevIdx = getBootStageIndex(prev.stage);
  const nextIdx = getBootStageIndex(nextStage);
  if (nextIdx <= prevIdx) {
    return prev;
  }
  const nextProgress = Math.max(prev.progress, BOOT_STAGE_PROGRESS[nextStage]);
  return {
    stage: nextStage,
    progress: Math.min(100, Math.max(0, nextProgress)),
  };
}

export function getBootMilestoneStatus(
  currentStage: BootStageId,
  milestone: BootMilestoneId
): BootMilestoneStatus {
  const currentIdx = getBootStageIndex(currentStage);
  const milestoneIdx = getBootStageIndex(milestone);
  if (currentStage === 'ready' || currentIdx > milestoneIdx) {
    return 'done';
  }
  if (currentIdx === milestoneIdx) {
    return 'active';
  }
  return 'pending';
}

export function isBootReady(state: BootState): boolean {
  return state.stage === 'ready' && state.progress >= 100;
}

export function getBootCopy(lang: LanguageCode): BootCopyDictionary {
  return BOOT_COPY[lang] ?? BOOT_COPY.en;
}
