'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  AU_IN_METERS,
  EARTH_MEAN_RADIUS_M,
  KILOPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
  SOLAR_SYSTEM_BODIES,
} from '@/lib/constants';
import {
  computeSolarSystemEphemeris,
  computeSunDirectionFromBody,
  sampleOrbitCurveHelioM,
  SolarSystemEphemerisSnapshot,
  SUN_GALACTOCENTRIC_THREE_M,
} from '@/lib/ephemeris';
import {
  EXTRAGALACTIC_CATALOG,
  getExtragalacticPosThreeM,
  getExtragalacticRadiusM,
} from '@/lib/extragalactic-catalog';
import {
  createBackgroundStarfieldMaterial,
  createDeepSpaceDomeMaterial,
  createEarthCloudsMaterial,
  createEarthHighResMaterial,
  createGalaxySpriteMaterial,
  createMilkyWayParametricDiskMaterial,
  createMilkyWayStarfieldMaterial,
  createPlanetAtmosphereMaterial,
  createPlanetRingMaterial,
  createRealisticPlanetMaterial,
  createSgrACoreGlowBillboardMaterial,
  createSolarCoronaBillboardMaterial,
  createVolumetricBlackHoleMaterial,
} from '@/lib/cosmic-shaders';
import { GraphicsSettings } from '@/lib/graphics-settings';
import { LanguageCode } from '@/lib/i18n';
import { BLACK_HOLE_DISK_ROLL } from '@/lib/memory-logic';
import { ConstellationLink, MemoryNode } from '@/lib/memory-types';
import { generateMilkyWayStarfield } from '@/lib/milky-way';
import {
  AnchorFrameId,
  AnchorOriginsM,
  applyLogZoom,
  computeAdaptiveFlightSpeedMps,
  computeLayerClipPlanes,
  computeRelativeMeters,
  computeScaleBar,
  computeScaleLayerWeights,
  formatDistanceAuto,
  interpolateLogDistance,
  lengthVec3d,
  MAX_UNIVERSE_RADIUS_M,
  MIN_SURFACE_ALTITUDE_M,
  SCALE_LAYERS,
  ScaleBarReadout,
  ScaleLayerId,
  UniversePosition,
  Vec3d,
} from '@/lib/scale-engine';
import { SimulationScaleMode } from '@/lib/scientific-catalog';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '@/lib/universe-i18n';
import {
  computeCatalogNodeGalacticPosM,
  EPHEMERIS_ID_TO_MEMORY_ID,
  MEMORY_ID_TO_EPHEMERIS_ID,
  resolveScalePreset,
  resolveUniverseTarget,
  SGRA_DISPLAY_METERS_PER_SHADER_UNIT,
} from '@/lib/universe-targets';
import ScaleHudBar, { ProvenanceMode } from './ScaleHudBar';
import TimeControlPanel from './TimeControlPanel';

export interface UniverseCanvasProps {
  memories: MemoryNode[];
  links: ConstellationLink[];
  matchedIds: Set<string>;
  isFilterActive: boolean;
  selectedId: string | null;
  onSelectNode: (id: string | null) => void;
  orbitSpeedMultiplier: number;
  onChangeOrbitSpeed: (speed: number) => void;
  showOrbitRings: boolean;
  onToggleOrbitRings: () => void;
  showConstellations: boolean;
  onToggleConstellations: () => void;
  showMilkyWayDisk: boolean;
  onToggleMilkyWayDisk: () => void;
  scaleMode: SimulationScaleMode;
  graphicsSettings: GraphicsSettings;
  cameraResetTrigger: number;
  onResetCamera: () => void;
  lang: LanguageCode;
}

interface ProjectedLabel {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  accent: string;
}

interface NamedStarRecord {
  name: string;
  constellation: string;
  raDeg: number;
  decDeg: number;
  distPc: number;
  vMag: number;
  posLy: Vec3d;
}

interface FlyToAnim {
  active: boolean;
  startMs: number;
  durationMs: number;
  startTargetPos: UniversePosition;
  endTargetPos: UniversePosition;
  startDistM: number;
  endDistM: number;
  startYaw: number;
  endYaw: number;
  startPitch: number;
  endPitch: number;
  targetId: string;
  targetLabel: string;
  targetRadiusM: number;
  provenance: ProvenanceMode;
  showSurfaceAltitude: boolean;
}

declare global {
  interface Window {
    __OBSERVATORY_API__?: {
      flyToPreset: (preset: ScalePresetId) => void;
      flyToTarget: (id: string, distM?: number) => void;
      setSgrABaselinePose: (pose: 1 | 2 | 3) => void;
      setAltitudeAboveEarthM: (altM: number) => void;
      setLogDistM: (logDistM: number) => void;
      awaitNextFrame: () => Promise<void>;
      getState: () => {
        targetId: string;
        dominantLayer: ScaleLayerId;
        distM: number;
        altitudeM: number;
        logDistM: number;
        freeFlightOffsetM: Vec3d;
        camFinite: boolean;
        simDateIso: string;
        starsLoaded: number;
        fps: number;
      };
    };
  }
}

const PLANET_VISUAL_CONFIG: Record<
  string,
  {
    archetype: number;
    baseColor: string;
    secondaryColor: string;
    accentColor: string;
    atmoColor: string;
    atmoIntensity: number;
    hasRings?: boolean;
    ringInner?: number;
    ringOuter?: number;
    ringColor?: string;
  }
> = {
  sun: {
    archetype: 9,
    baseColor: '#ffe082',
    secondaryColor: '#ff8f1f',
    accentColor: '#fffbeb',
    atmoColor: '#ffb732',
    atmoIntensity: 1.5,
  },
  mercury: {
    archetype: 7,
    baseColor: '#9b9690',
    secondaryColor: '#69645f',
    accentColor: '#c2bdb6',
    atmoColor: '#888888',
    atmoIntensity: 0.08,
  },
  venus: {
    archetype: 8,
    baseColor: '#e8c987',
    secondaryColor: '#c99b52',
    accentColor: '#f7e5bc',
    atmoColor: '#f5d28c',
    atmoIntensity: 0.72,
  },
  earth: {
    archetype: 2,
    baseColor: '#2563eb',
    secondaryColor: '#2d6a3e',
    accentColor: '#e2e8f0',
    atmoColor: '#56a8ff',
    atmoIntensity: 0.85,
  },
  moon: {
    archetype: 10,
    baseColor: '#b5b4b0',
    secondaryColor: '#767572',
    accentColor: '#d9d8d4',
    atmoColor: '#9ca3af',
    atmoIntensity: 0.04,
  },
  mars: {
    archetype: 6,
    baseColor: '#c45b33',
    secondaryColor: '#7a2f18',
    accentColor: '#e8b38c',
    atmoColor: '#e2845a',
    atmoIntensity: 0.36,
  },
  ceres: {
    archetype: 10,
    baseColor: '#8d8b88',
    secondaryColor: '#595755',
    accentColor: '#b8b6b2',
    atmoColor: '#7a7a7a',
    atmoIntensity: 0.04,
  },
  jupiter: {
    archetype: 5,
    baseColor: '#d8b48a',
    secondaryColor: '#a3653e',
    accentColor: '#f2e1c6',
    atmoColor: '#d9b58b',
    atmoIntensity: 0.48,
  },
  io: {
    archetype: 3,
    baseColor: '#e6c54a',
    secondaryColor: '#9c4319',
    accentColor: '#f5e48d',
    atmoColor: '#e8b948',
    atmoIntensity: 0.14,
  },
  europa: {
    archetype: 4,
    baseColor: '#d7dfe6',
    secondaryColor: '#8d6f56',
    accentColor: '#f2f7fa',
    atmoColor: '#a6c8e8',
    atmoIntensity: 0.2,
  },
  ganymede: {
    archetype: 10,
    baseColor: '#9e978e',
    secondaryColor: '#666059',
    accentColor: '#cfc8be',
    atmoColor: '#949aa3',
    atmoIntensity: 0.1,
  },
  callisto: {
    archetype: 10,
    baseColor: '#6b645c',
    secondaryColor: '#45403a',
    accentColor: '#9e968c',
    atmoColor: '#736d65',
    atmoIntensity: 0.06,
  },
  saturn: {
    archetype: 1,
    baseColor: '#e3cc98',
    secondaryColor: '#bfa065',
    accentColor: '#f5e8c8',
    atmoColor: '#e8d29c',
    atmoIntensity: 0.44,
    hasRings: true,
    ringInner: 1.25,
    ringOuter: 2.38,
    ringColor: '#d9c39a',
  },
  titan: {
    archetype: 8,
    baseColor: '#d99e4e',
    secondaryColor: '#a66d26',
    accentColor: '#f2c77e',
    atmoColor: '#f0ab4c',
    atmoIntensity: 0.65,
  },
  enceladus: {
    archetype: 10,
    baseColor: '#e6f0f7',
    secondaryColor: '#9cb9cc',
    accentColor: '#ffffff',
    atmoColor: '#b5dfff',
    atmoIntensity: 0.25,
  },
  uranus: {
    archetype: 4,
    baseColor: '#7fd4e6',
    secondaryColor: '#4da7bd',
    accentColor: '#bdf0fa',
    atmoColor: '#8ae2f5',
    atmoIntensity: 0.56,
    hasRings: true,
    ringInner: 1.55,
    ringOuter: 1.98,
    ringColor: '#8bc9d6',
  },
  neptune: {
    archetype: 4,
    baseColor: '#3665d6',
    secondaryColor: '#1f3e96',
    accentColor: '#7ba6ff',
    atmoColor: '#4f85ff',
    atmoIntensity: 0.62,
  },
  triton: {
    archetype: 10,
    baseColor: '#cfb9b2',
    secondaryColor: '#8d7973',
    accentColor: '#ebe0dc',
    atmoColor: '#b8c4d4',
    atmoIntensity: 0.14,
  },
  pluto: {
    archetype: 10,
    baseColor: '#c4ab97',
    secondaryColor: '#734f3d',
    accentColor: '#ebe0d5',
    atmoColor: '#9ab9d9',
    atmoIntensity: 0.2,
  },
};

const SOLAR_BODY_IDS = Object.keys(SOLAR_SYSTEM_BODIES);
const ORBIT_CURVE_BODY_IDS = [
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'ceres',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

const _projTmp = new THREE.Vector3();
const _viewProjMat = new THREE.Matrix4();

function clampPitch(p: number): number {
  return Math.max(-Math.PI * 0.492, Math.min(Math.PI * 0.492, p));
}

function sphericalOffsetM(distM: number, yaw: number, pitch: number): Vec3d {
  const cosP = Math.cos(pitch);
  return [
    distM * cosP * Math.sin(yaw),
    distM * Math.sin(pitch),
    distM * cosP * Math.cos(yaw),
  ];
}

function toGalacticMeters(pos: UniversePosition, origins: AnchorOriginsM): Vec3d {
  if (pos.anchor === 'galactic') return pos.offsetM;
  if (pos.anchor === 'heliocentric') {
    return [
      origins.sunInGalacticM[0] + pos.offsetM[0],
      origins.sunInGalacticM[1] + pos.offsetM[1],
      origins.sunInGalacticM[2] + pos.offsetM[2],
    ];
  }
  return [
    origins.sunInGalacticM[0] + origins.earthInHelioM[0] + pos.offsetM[0],
    origins.sunInGalacticM[1] + origins.earthInHelioM[1] + pos.offsetM[1],
    origins.sunInGalacticM[2] + origins.earthInHelioM[2] + pos.offsetM[2],
  ];
}

export default function UniverseCanvas({
  memories,
  selectedId,
  onSelectNode,
  showOrbitRings,
  onToggleOrbitRings,
  showMilkyWayDisk,
  scaleMode,
  graphicsSettings,
  cameraResetTrigger,
  lang,
}: UniverseCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Layer toggles & UX preferences
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showGalaxies, setShowGalaxies] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Simulation ephemeris time state (starts at real current UTC time)
  const [simDateMs, setSimDateMs] = useState<number>(() => Date.now());
  const [isTimePlaying, setIsTimePlaying] = useState<boolean>(true);
  const [timeSpeedSecPerSec, setTimeSpeedSecPerSec] = useState<number>(86_400); // 1 day/sec default so orbits & rotation feel alive

  // HUD telemetry state (throttled ~8Hz)
  const [activePreset, setActivePreset] = useState<ScalePresetId | null>('earth');
  const [dominantLayer, setDominantLayer] = useState<ScaleLayerId>('planetary');
  const [targetName, setTargetName] = useState<string>('Earth');
  const [distanceLabel, setDistanceLabel] = useState<string>('13,380 km');
  const [isSurfaceAltitude, setIsSurfaceAltitude] = useState<boolean>(true);
  const [provenance, setProvenance] = useState<ProvenanceMode>('measured');
  const [logDistM, setLogDistM] = useState<number>(Math.log10(EARTH_MEAN_RADIUS_M * 3.1));
  const [scaleBar, setScaleBar] = useState<ScaleBarReadout>({
    widthPx: 100,
    label: '5,000 km',
    meters: 5_000_000,
    unit: 'km',
  });
  const [moonPhaseFraction, setMoonPhaseFraction] = useState<number>(0.5);
  const [labels, setLabels] = useState<ProjectedLabel[]>([]);
  const [tileLoadProgress, setTileLoadProgress] = useState<number>(0);
  const [tilesReady, setTilesReady] = useState<boolean>(false);
  const [contextLost, setContextLost] = useState<boolean>(false);

  // Refs for zero-teardown render loop
  const memoriesRef = useRef(memories);
  const selectedIdRef = useRef(selectedId);
  const onSelectNodeRef = useRef(onSelectNode);
  const showOrbitsRef = useRef(showOrbitRings);
  const showMilkyWayRef = useRef(showMilkyWayDisk);
  const showLabelsRef = useRef(showLabels);
  const showGridRef = useRef(showGrid);
  const showGalaxiesRef = useRef(showGalaxies);
  const reducedMotionRef = useRef(reducedMotion);
  const scaleModeRef = useRef(scaleMode);
  const graphicsRef = useRef(graphicsSettings);
  const isTimePlayingRef = useRef(isTimePlaying);
  const timeSpeedRef = useRef(timeSpeedSecPerSec);
  const simDateMsRef = useRef(simDateMs);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);
  useEffect(() => {
    showOrbitsRef.current = showOrbitRings;
  }, [showOrbitRings]);
  useEffect(() => {
    showMilkyWayRef.current = showMilkyWayDisk;
  }, [showMilkyWayDisk]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);
  useEffect(() => {
    showGridRef.current = showGrid;
  }, [showGrid]);
  useEffect(() => {
    showGalaxiesRef.current = showGalaxies;
  }, [showGalaxies]);
  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);
  useEffect(() => {
    scaleModeRef.current = scaleMode;
  }, [scaleMode]);
  useEffect(() => {
    graphicsRef.current = graphicsSettings;
  }, [graphicsSettings]);
  useEffect(() => {
    isTimePlayingRef.current = isTimePlaying;
  }, [isTimePlaying]);
  useEffect(() => {
    timeSpeedRef.current = timeSpeedSecPerSec;
  }, [timeSpeedSecPerSec]);

  // Mutable camera controller ref (pure float64 meters!)
  const camCtrlRef = useRef<{
    targetId: string;
    targetLabel: string;
    targetRadiusM: number;
    targetPos: UniversePosition;
    provenance: ProvenanceMode;
    showSurfaceAltitude: boolean;
    distM: number;
    yaw: number;
    pitch: number;
    freeFlightOffsetM: Vec3d;
    flyTo: FlyToAnim | null;
    ephemeris: SolarSystemEphemerisSnapshot;
    starsLoaded: number;
    fps: number;
  }>({
    targetId: 'earth',
    targetLabel: 'Earth',
    targetRadiusM: EARTH_MEAN_RADIUS_M,
    targetPos: { anchor: 'earth', offsetM: [0, 0, 0] },
    provenance: 'measured',
    showSurfaceAltitude: true,
    distM: EARTH_MEAN_RADIUS_M * 3.1,
    yaw: 0.58,
    pitch: 0.26,
    freeFlightOffsetM: [0, 0, 0],
    flyTo: null,
    ephemeris: computeSolarSystemEphemeris(new Date()),
    starsLoaded: 0,
    fps: 60,
  });

  // Start smooth log-space fly-to any target or preset
  const startFlyTo = useCallback(
    (
      resolved: ReturnType<typeof resolveUniverseTarget>,
      overrideDistM?: number,
      instant = false
    ) => {
      const ctrl = camCtrlRef.current;
      const endDistM = overrideDistM ?? resolved.idealDistM;

      if (instant || reducedMotionRef.current) {
        ctrl.targetId = resolved.id;
        ctrl.targetLabel = resolved.label;
        ctrl.targetRadiusM = resolved.radiusM;
        ctrl.targetPos = resolved.position;
        ctrl.provenance = resolved.provenance;
        ctrl.showSurfaceAltitude = resolved.showSurfaceAltitude;
        ctrl.distM = endDistM;
        ctrl.yaw = resolved.idealYaw;
        ctrl.pitch = resolved.idealPitch;
        ctrl.freeFlightOffsetM = [0, 0, 0];
        ctrl.flyTo = null;
        return;
      }

      ctrl.flyTo = {
        active: true,
        startMs: performance.now(),
        durationMs: 1350,
        startTargetPos: { ...ctrl.targetPos },
        endTargetPos: resolved.position,
        startDistM: ctrl.distM,
        endDistM,
        startYaw: ctrl.yaw,
        endYaw: resolved.idealYaw,
        startPitch: ctrl.pitch,
        endPitch: resolved.idealPitch,
        targetId: resolved.id,
        targetLabel: resolved.label,
        targetRadiusM: resolved.radiusM,
        provenance: resolved.provenance,
        showSurfaceAltitude: resolved.showSurfaceAltitude,
      };
      ctrl.freeFlightOffsetM = [0, 0, 0];
    },
    []
  );

  const handleSelectPreset = useCallback(
    (preset: ScalePresetId) => {
      setActivePreset(preset);
      const resolved = resolveScalePreset(
        preset,
        camCtrlRef.current.ephemeris,
        memoriesRef.current
      );
      startFlyTo(resolved);
      if (preset === 'sgr-a') {
        onSelectNodeRef.current('BLACK_HOLE_CORE');
      } else if (preset === 'earth') {
        onSelectNodeRef.current(EPHEMERIS_ID_TO_MEMORY_ID.earth ?? null);
      } else if (preset === 'solar-system') {
        onSelectNodeRef.current(EPHEMERIS_ID_TO_MEMORY_ID.sun ?? null);
      } else {
        onSelectNodeRef.current(null);
      }
    },
    [startFlyTo]
  );

  // Sync external selectedId (sidebar clicks / TopSearchBar Black Hole Lab / Catalog Inspect)
  useEffect(() => {
    const prev = selectedIdRef.current;
    selectedIdRef.current = selectedId;
    if (!selectedId || selectedId === prev) return;

    const resolved = resolveUniverseTarget(
      selectedId,
      camCtrlRef.current.ephemeris,
      memoriesRef.current
    );
    const nextPreset: ScalePresetId | null =
      selectedId === 'BLACK_HOLE_CORE'
        ? 'sgr-a'
        : MEMORY_ID_TO_EPHEMERIS_ID[selectedId] === 'earth'
          ? 'earth'
          : null;
    queueMicrotask(() => setActivePreset(nextPreset));
    startFlyTo(resolved);
  }, [selectedId, startFlyTo]);

  // Camera reset trigger
  useEffect(() => {
    if (cameraResetTrigger === 0) return;
    const resolved = resolveScalePreset(
      'earth',
      camCtrlRef.current.ephemeris,
      memoriesRef.current
    );
    queueMicrotask(() => setActivePreset('earth'));
    startFlyTo(resolved);
  }, [cameraResetTrigger, startFlyTo]);

  const handleZoomStep = useCallback((deltaLog: number) => {
    const ctrl = camCtrlRef.current;
    ctrl.flyTo = null;
    const minDist = ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M;
    ctrl.distM = applyLogZoom(ctrl.distM, deltaLog, minDist, MAX_UNIVERSE_RADIUS_M);
    setLogDistM(Math.log10(ctrl.distM));
  }, []);

  const handleLogZoomSliderChange = useCallback((nextLogM: number) => {
    const ctrl = camCtrlRef.current;
    ctrl.flyTo = null;
    const minDist = ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M;
    ctrl.distM = Math.max(minDist, Math.min(MAX_UNIVERSE_RADIUS_M, Math.pow(10, nextLogM)));
    setLogDistM(nextLogM);
  }, []);

  const handleResetToNow = useCallback(() => {
    const now = Date.now();
    simDateMsRef.current = now;
    setSimDateMs(now);
    setTimeSpeedSecPerSec(1);
  }, []);

  // Main WebGL2 4-Pass Floating-Origin Multi-Scale Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let frameId = 0;
    let timeoutId = 0;
    let isTabHidden = document.visibilityState === 'hidden';

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;

    // WebGL2 Renderer with logarithmic depth + autoClear=false for 4-pass depth-cleared scale layers
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsRef.current.antialias,
      powerPreference: 'high-performance',
      logarithmicDepthBuffer: true,
    });
    renderer.autoClear = false;
    renderer.setSize(width, height);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, graphicsRef.current.resolutionScale)
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Detect software GL only to scale render pacing/budget (never scene content!)
    let isSoftwareGl = false;
    try {
      const gl = renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const rendStr = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '')
        : String(gl.getParameter(gl.RENDERER) || '');
      isSoftwareGl =
        /swiftshader|llvmpipe|softpipe|mesa offscreen|basic render|angle \(google/i.test(
          rendStr
        );
    } catch {
      // ignore
    }

    // Shared perspective camera updated per pass with tight near/far clip planes
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1e6);

    // Track disposable resources for 100% leak-free cleanup
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };

    // =========================================================================
    // PASS 1: Deep Sky & Extragalactic Scene (1 unit = 1 Mpc)
    // =========================================================================
    const extragalacticScene = new THREE.Scene();

    const skyDomeGeo = track(new THREE.SphereGeometry(2800, 32, 24));
    const skyDomeMat = track(createDeepSpaceDomeMaterial());
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    extragalacticScene.add(skyDomeMesh);

    // Background distant starfield shell (all-sky celestial sphere)
    const bgStarCount = Math.min(18000, Math.max(4000, Math.round(graphicsRef.current.starfieldCount * 0.35)));
    const bgPos = new Float32Array(bgStarCount * 3);
    const bgCol = new Float32Array(bgStarCount * 3);
    const bgSize = new Float32Array(bgStarCount);
    const bgPhase = new Float32Array(bgStarCount);
    let seed = 4219;
    const nextRnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < bgStarCount; i += 1) {
      const u = nextRnd() * 2 - 1;
      const theta = nextRnd() * Math.PI * 2;
      const r = 2200;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      bgPos[i * 3 + 0] = r * s * Math.cos(theta);
      bgPos[i * 3 + 1] = r * u;
      bgPos[i * 3 + 2] = r * s * Math.sin(theta);
      const tint = nextRnd();
      bgCol[i * 3 + 0] = tint < 0.3 ? 0.78 : 1.0;
      bgCol[i * 3 + 1] = tint < 0.3 ? 0.88 : tint < 0.7 ? 0.96 : 0.85;
      bgCol[i * 3 + 2] = tint < 0.7 ? 1.0 : 0.72;
      bgSize[i] = 0.7 + Math.pow(nextRnd(), 3.2) * 2.4;
      bgPhase[i] = nextRnd() * Math.PI * 2;
    }
    const bgGeo = track(new THREE.BufferGeometry());
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    bgGeo.setAttribute('aColor', new THREE.BufferAttribute(bgCol, 3));
    bgGeo.setAttribute('aSize', new THREE.BufferAttribute(bgSize, 1));
    bgGeo.setAttribute('aPhase', new THREE.BufferAttribute(bgPhase, 1));
    const bgMat = track(createBackgroundStarfieldMaterial());
    const bgStarsPoints = new THREE.Points(bgGeo, bgMat);
    extragalacticScene.add(bgStarsPoints);

    // Local Group + Nearby Galaxies + Galaxy Clusters (McConnachie 2012 & NED)
    const galaxyGroup = new THREE.Group();
    extragalacticScene.add(galaxyGroup);
    const galaxyPlaneGeo = track(new THREE.PlaneGeometry(1, 1));
    const galaxyMeshes: {
      entry: (typeof EXTRAGALACTIC_CATALOG)[number];
      posM: Vec3d;
      radiusMpc: number;
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
    }[] = [];

    for (const entry of EXTRAGALACTIC_CATALOG) {
      if (entry.id === 'mw-galaxy') continue; // Rendered in full 3D in Pass 2!
      const mat = track(
        createGalaxySpriteMaterial(
          entry.morphology,
          entry.tintHex,
          entry.inclinationDeg,
          entry.positionAngleDeg
        )
      );
      const mesh = new THREE.Mesh(galaxyPlaneGeo, mat);
      const posM = getExtragalacticPosThreeM(entry);
      const radiusMpc = Math.max(0.018, (entry.diameterKpc / 1000) * 2.2);
      mesh.scale.set(radiusMpc * 2, radiusMpc * 2, 1);
      galaxyGroup.add(mesh);
      galaxyMeshes.push({ entry, posM, radiusMpc, mesh, mat });
    }

    // =========================================================================
    // PASS 2: Galactic Scene (1 unit = 1 kpc)
    // =========================================================================
    const galacticScene = new THREE.Scene();
    const galacticRoot = new THREE.Group();
    galacticScene.add(galacticRoot);

    // Continuous double-sided parametric Milky Way spiral disk + dust lanes (illustrative: true)
    const mwDiskGeo = track(new THREE.PlaneGeometry(36, 36, 1, 1));
    mwDiskGeo.rotateX(-Math.PI / 2);
    const mwDiskMat = track(createMilkyWayParametricDiskMaterial());
    const mwDiskMesh = new THREE.Mesh(mwDiskGeo, mwDiskMat);
    galacticRoot.add(mwDiskMesh);

    // Volumetric Milky Way starfield scaled into exact kpc (MW radius ~15.5 kpc)
    const mwStarBudget = isSoftwareGl
      ? 12000
      : Math.min(48000, Math.max(12000, Math.round(graphicsRef.current.starfieldCount * 0.85)));
    const mwRaw = generateMilkyWayStarfield(mwStarBudget);
    const mwScaleToKpc = 15.5 / 118.0; // Map existing 118-unit Milky Way disk -> exact 15.5 kpc!
    for (let i = 0; i < mwRaw.positions.length; i += 1) {
      mwRaw.positions[i] *= mwScaleToKpc;
    }
    const mwStarsGeo = track(new THREE.BufferGeometry());
    mwStarsGeo.setAttribute('position', new THREE.BufferAttribute(mwRaw.positions, 3));
    mwStarsGeo.setAttribute('aColor', new THREE.BufferAttribute(mwRaw.colors, 3));
    mwStarsGeo.setAttribute('aSize', new THREE.BufferAttribute(mwRaw.sizes, 1));
    const mwStarsMat = track(createMilkyWayStarfieldMaterial());
    const mwStarsPoints = new THREE.Points(mwStarsGeo, mwStarsMat);
    galacticRoot.add(mwStarsPoints);

    // Galactic Polar Grid (kpc concentric rings around Sgr A*, toggleable)
    const galacticGridGroup = new THREE.Group();
    const gridRadiiKpc = [2, 5, 8.178, 12, 16];
    for (const rk of gridRadiiKpc) {
      const pts: THREE.Vector3[] = [];
      for (let s = 0; s <= 96; s += 1) {
        const a = (s / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rk, 0, Math.sin(a) * rk));
      }
      const g = track(new THREE.BufferGeometry().setFromPoints(pts));
      const isSolarCircle = Math.abs(rk - 8.178) < 0.05;
      const m = track(
        new THREE.LineBasicMaterial({
          color: isSolarCircle ? '#54a8ff' : '#334155',
          transparent: true,
          opacity: isSolarCircle ? 0.55 : 0.28,
        })
      );
      galacticGridGroup.add(new THREE.Line(g, m));
    }
    for (let sp = 0; sp < 12; sp += 1) {
      const a = (sp / 12) * Math.PI * 2;
      const g = track(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(a) * 16, 0, Math.sin(a) * 16),
        ])
      );
      const m = track(
        new THREE.LineBasicMaterial({
          color: '#334155',
          transparent: true,
          opacity: 0.22,
        })
      );
      galacticGridGroup.add(new THREE.Line(g, m));
    }
    galacticRoot.add(galacticGridGroup);

    // Sgr A* distant LOD core glow billboard (compact galactic nucleus, never blows out white)
    const sgrACoreGeo = track(new THREE.PlaneGeometry(0.95, 0.95));
    const sgrACoreMat = track(createSgrACoreGlowBillboardMaterial());
    const sgrACoreBillboard = new THREE.Mesh(sgrACoreGeo, sgrACoreMat);
    galacticRoot.add(sgrACoreBillboard);

    // =========================================================================
    // PASS 2B: Galactic Center Nuclear Star Cluster (NSC + S-Stars, 1 unit = 1 pc)
    // Eliminates the 1.6 kpc -> 184 pc -> 1 pc -> 100 AU dead zone when approaching Sgr A*!
    // Modeled on Schödel et al. (2014) Milky Way NSC & GRAVITY S-star cluster (illustrative: true).
    // =========================================================================
    const gcClusterScene = new THREE.Scene();
    const gcClusterRoot = new THREE.Group();
    gcClusterScene.add(gcClusterRoot);

    const nscCount = isSoftwareGl ? 900 : 1800;
    const nscPos = new Float32Array(nscCount * 3);
    const nscCol = new Float32Array(nscCount * 3);
    const nscSize = new Float32Array(nscCount);
    let nscSeed = 918273;
    const nextNsc = () => {
      nscSeed = (nscSeed * 1664525 + 1013904223) >>> 0;
      return nscSeed / 4294967296;
    };
    for (let i = 0; i < nscCount; i += 1) {
      // Logarithmic radial distribution from 0.0025 pc (~500 AU S-stars) out to 420 pc (Central Molecular Zone)
      const logR = -2.6 + nextNsc() * 5.22;
      const rPc = Math.pow(10, logR);
      const u = nextNsc() * 2 - 1;
      const phi = nextNsc() * Math.PI * 2;
      const sinT = Math.sqrt(Math.max(0, 1 - u * u));
      // Mildly flattened oblate nuclear bulge & CMZ distribution (q ~ 0.65)
      nscPos[i * 3 + 0] = rPc * sinT * Math.cos(phi);
      nscPos[i * 3 + 1] = rPc * u * 0.65;
      nscPos[i * 3 + 2] = rPc * sinT * Math.sin(phi);

      // Young hot blue-white B/O S-stars near core (<0.5 pc) + warm golden K/M giants farther out
      const isYoungBlue = rPc < 0.8 ? nextNsc() < 0.48 : nextNsc() < 0.14;
      if (isYoungBlue) {
        nscCol[i * 3 + 0] = 0.72 + nextNsc() * 0.24;
        nscCol[i * 3 + 1] = 0.84 + nextNsc() * 0.16;
        nscCol[i * 3 + 2] = 1.0;
      } else {
        nscCol[i * 3 + 0] = 1.0;
        nscCol[i * 3 + 1] = 0.72 + nextNsc() * 0.22;
        nscCol[i * 3 + 2] = 0.44 + nextNsc() * 0.28;
      }
      nscSize[i] = 1.0 + Math.pow(nextNsc(), 2.4) * 2.8;
    }
    const nscGeo = track(new THREE.BufferGeometry());
    nscGeo.setAttribute('position', new THREE.BufferAttribute(nscPos, 3));
    nscGeo.setAttribute('aColor', new THREE.BufferAttribute(nscCol, 3));
    nscGeo.setAttribute('aSize', new THREE.BufferAttribute(nscSize, 1));
    const nscMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          uOpacity: { value: 1.0 },
        },
        vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          attribute float aSize;
          attribute vec3 aColor;
          uniform float uPixelRatio;
          varying vec3 vColor;
          void main() {
            vColor = aColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float dist = max(0.004, -mvPosition.z);
            gl_PointSize = clamp(aSize * uPixelRatio * (5.2 / pow(dist, 0.22)), 1.2, 6.8);
            gl_Position = projectionMatrix * mvPosition;
            #include <logdepthbuf_vertex>
          }
        `,
        fragmentShader: `
          precision highp float;
          #include <common>
          #include <logdepthbuf_pars_fragment>
          uniform float uOpacity;
          varying vec3 vColor;
          void main() {
            vec2 uv = gl_PointCoord * 2.0 - 1.0;
            float r = length(uv);
            if (r > 1.0 || uOpacity <= 0.005) discard;
            float core = exp(-r * r * 12.0);
            float halo = exp(-r * r * 2.8) * 0.35;
            vec3 col = mix(vColor, vec3(1.0, 0.98, 0.94), core * 0.55);
            float a = clamp((core + halo) * uOpacity, 0.0, 1.0);
            gl_FragColor = vec4(col * a, a);
            #include <logdepthbuf_fragment>
          }
        `,
      })
    );
    const nscPoints = new THREE.Points(nscGeo, nscMat);
    gcClusterRoot.add(nscPoints);

    // Continuous Sgr A* intermediate accretion-core LOD billboard (spans 3 kpc -> 20 AU seamlessly)
    const sgrABeaconGeo = track(new THREE.PlaneGeometry(1, 1));
    const sgrABeaconMat = track(createSgrACoreGlowBillboardMaterial());
    const sgrABeaconMesh = new THREE.Mesh(sgrABeaconGeo, sgrABeaconMat);
    gcClusterRoot.add(sgrABeaconMesh);

    // =========================================================================
    // PASS 3: Stellar Neighborhood Scene (1 unit = 1 light-year)
    // =========================================================================
    const stellarScene = new THREE.Scene();
    const stellarRoot = new THREE.Group();
    stellarScene.add(stellarRoot);

    const stellarGeo = track(new THREE.BufferGeometry());
    const stellarMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          uOpacity: { value: 1.0 },
        },
        vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          attribute float aSize;
          attribute vec3 aColor;
          uniform float uPixelRatio;
          varying vec3 vColor;
          void main() {
            vColor = aColor;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float dist = max(0.5, -mvPosition.z);
            gl_PointSize = clamp(aSize * uPixelRatio * (18.0 / pow(dist, 0.36)), 1.4, 11.0);
            gl_Position = projectionMatrix * mvPosition;
            #include <logdepthbuf_vertex>
          }
        `,
        fragmentShader: `
          precision highp float;
          #include <common>
          #include <logdepthbuf_pars_fragment>
          uniform float uOpacity;
          varying vec3 vColor;
          void main() {
            vec2 uv = gl_PointCoord * 2.0 - 1.0;
            float r = length(uv);
            if (r > 1.0 || uOpacity <= 0.005) discard;
            float core = exp(-r * r * 11.0);
            float halo = exp(-r * r * 2.6) * 0.42;
            vec3 col = mix(vColor, vec3(1.0), core * 0.65);
            float a = clamp((core + halo) * uOpacity, 0.0, 1.0);
            gl_FragColor = vec4(col * a, a);
            #include <logdepthbuf_fragment>
          }
        `,
      })
    );
    const stellarPoints = new THREE.Points(stellarGeo, stellarMat);
    stellarRoot.add(stellarPoints);

    // Load binary star tiles off-main-thread via Web Worker (with clean main-thread fallback)
    let starWorker: Worker | null = null;
    let namedStars: NamedStarRecord[] = [];

    const applyDecodedStars = (
      positionsLy: Float32Array,
      colors: Float32Array,
      sizes: Float32Array,
      count: number
    ) => {
      if (isDisposed) return;
      stellarGeo.setAttribute('position', new THREE.BufferAttribute(positionsLy, 3));
      stellarGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
      stellarGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
      stellarGeo.computeBoundingSphere();
      camCtrlRef.current.starsLoaded = count;
      setTileLoadProgress(1);
      setTilesReady(true);
    };

    const loadManifestForLabels = async () => {
      try {
        const res = await fetch('/data/stars-manifest.json');
        if (!res.ok) return;
        const manifest = (await res.json()) as {
          namedStars?: {
            name: string;
            constellation: string;
            raDeg: number;
            decDeg: number;
            distPc: number;
            vMag: number;
          }[];
        };
        if (!manifest.namedStars || isDisposed) return;
        // Pick brightest & nearest 36 named stars for clean 3D labels
        const top = manifest.namedStars
          .filter((s) => s.distPc < 25 || s.vMag < 1.4)
          .slice(0, 36);
        namedStars = top.map((s) => {
          const distLy = s.distPc * 3.261563777;
          // Use exact ra/dec -> three galactic direction
          const ra = (s.raDeg * Math.PI) / 180;
          const dec = (s.decDeg * Math.PI) / 180;
          const cd = Math.cos(dec);
          const ex = distLy * cd * Math.cos(ra);
          const ey = distLy * cd * Math.sin(ra);
          const ez = distLy * Math.sin(dec);
          // Match worker matrix
          const aG = (192.8594812065348 * Math.PI) / 180;
          const dG = (27.12825118085622 * Math.PI) / 180;
          const lN = (122.9319185680026 * Math.PI) / 180;
          const z0 = Math.cos(dG) * Math.cos(aG);
          const z1 = Math.cos(dG) * Math.sin(aG);
          const z2 = Math.sin(dG);
          const r00 = -Math.cos(lN) * Math.sin(dG) * Math.cos(aG) - Math.sin(lN) * Math.sin(aG);
          const r01 = -Math.cos(lN) * Math.sin(dG) * Math.sin(aG) + Math.sin(lN) * Math.cos(aG);
          const r02 = Math.cos(lN) * Math.cos(dG);
          const r10 = Math.sin(lN) * Math.sin(dG) * Math.cos(aG) - Math.cos(lN) * Math.sin(aG);
          const r11 = Math.sin(lN) * Math.sin(dG) * Math.sin(aG) + Math.cos(lN) * Math.cos(aG);
          const r12 = -Math.sin(lN) * Math.cos(dG);
          const cx = r01 * r12 - r02 * r11;
          const cy = r02 * r10 - r00 * r12;
          const cz = r00 * r11 - r01 * r10;
          const sgn = cx * z0 + cy * z1 + cz * z2 >= 0 ? 1 : -1;
          const gx = r00 * ex + r01 * ey + r02 * ez;
          const gy = (r10 * ex + r11 * ey + r12 * ez) * sgn;
          const gz = z0 * ex + z1 * ey + z2 * ez;
          return { ...s, posLy: [gx, gz, -gy] as Vec3d };
        });
      } catch {
        // Non-blocking
      }
    };
    void loadManifestForLabels();

    try {
      starWorker = new Worker('/workers/star-tile-worker.js');
      starWorker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (!msg) return;
        if (msg.type === 'PROGRESS') {
          setTileLoadProgress(msg.progress ?? 0.5);
        } else if (msg.type === 'LOADED') {
          applyDecodedStars(msg.positionsLy, msg.colors, msg.sizes, msg.count);
        }
      };
      starWorker.postMessage({
        type: 'LOAD_STAR_TILES',
        requestId: 1,
        urls: ['/data/stars-tier0.bin', '/data/stars-tier1.bin'],
      });
    } catch {
      queueMicrotask(() => {
        if (!isDisposed) setTilesReady(true);
      });
    }

    // =========================================================================
    // PASS 4A: Planetary / Solar System Scene (1 unit = 1,000 km = 1e6 m)
    // =========================================================================
    const planetaryScene = new THREE.Scene();
    const segs = isSoftwareGl ? 32 : Math.max(36, graphicsRef.current.planetSegments);
    const unitSphereGeo = track(new THREE.SphereGeometry(1, segs, Math.round(segs * 0.75)));

    interface PlanetMeshEntry {
      id: string;
      group: THREE.Group;
      axialGroup: THREE.Group;
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
      cloudMesh?: THREE.Mesh;
      cloudMat?: THREE.ShaderMaterial;
      atmoMesh?: THREE.Mesh;
      atmoMat?: THREE.ShaderMaterial;
      ringMesh?: THREE.Mesh;
      ringMat?: THREE.ShaderMaterial;
    }

    const planetEntries = new Map<string, PlanetMeshEntry>();

    for (const id of SOLAR_BODY_IDS) {
      const phys = SOLAR_SYSTEM_BODIES[id];
      const vis = PLANET_VISUAL_CONFIG[id] ?? PLANET_VISUAL_CONFIG.mercury;
      const group = new THREE.Group();
      const axialGroup = new THREE.Group();
      axialGroup.rotation.z = (phys.obliquityDeg * Math.PI) / 180;
      group.add(axialGroup);

      let mat: THREE.ShaderMaterial;
      let cloudMesh: THREE.Mesh | undefined;
      let cloudMat: THREE.ShaderMaterial | undefined;

      if (id === 'earth') {
        mat = track(createEarthHighResMaterial());
        cloudMat = track(createEarthCloudsMaterial());
        cloudMesh = new THREE.Mesh(unitSphereGeo, cloudMat);
        cloudMesh.scale.setScalar(1.011);
        axialGroup.add(cloudMesh);
      } else {
        mat = track(
          createRealisticPlanetMaterial(
            vis.archetype,
            id.length * 17.3 + phys.obliquityDeg,
            new THREE.Color(vis.atmoColor)
          )
        );
      }

      const mesh = new THREE.Mesh(unitSphereGeo, mat);
      axialGroup.add(mesh);

      let atmoMesh: THREE.Mesh | undefined;
      let atmoMat: THREE.ShaderMaterial | undefined;
      if (vis.atmoIntensity > 0.12) {
        atmoMat = track(createPlanetAtmosphereMaterial(new THREE.Color(vis.atmoColor)));
        atmoMesh = new THREE.Mesh(unitSphereGeo, atmoMat);
        atmoMesh.scale.setScalar(id === 'sun' ? 1.28 : 1.048);
        axialGroup.add(atmoMesh);
      }

      let ringMesh: THREE.Mesh | undefined;
      let ringMat: THREE.ShaderMaterial | undefined;
      if (vis.hasRings && vis.ringInner && vis.ringOuter && vis.ringColor) {
        const ringGeo = track(new THREE.RingGeometry(vis.ringInner, vis.ringOuter, 96));
        ringGeo.rotateX(-Math.PI / 2);
        ringMat = track(
          createPlanetRingMaterial(
            new THREE.Color(vis.ringColor),
            vis.ringInner,
            vis.ringOuter
          )
        );
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        axialGroup.add(ringMesh);
      }

      planetaryScene.add(group);
      planetEntries.set(id, {
        id,
        group,
        axialGroup,
        mesh,
        mat,
        cloudMesh,
        cloudMat,
        atmoMesh,
        atmoMat,
        ringMesh,
        ringMat,
      });
    }

    // Radiant Volumetric Solar Corona & Halo Billboard around the Sun
    const solarCoronaGeo = track(new THREE.PlaneGeometry(1, 1));
    const solarCoronaMat = track(createSolarCoronaBillboardMaterial());
    const solarCoronaBillboard = new THREE.Mesh(solarCoronaGeo, solarCoronaMat);
    solarCoronaBillboard.renderOrder = 3;
    planetaryScene.add(solarCoronaBillboard);

    // Real Ephemeris Orbit Lines (updated lazily when date shifts > 15 days)
    const orbitGroup = new THREE.Group();
    planetaryScene.add(orbitGroup);
    const orbitLines: {
      id: string;
      parentId: string;
      line: THREE.Line;
      pointsM: Vec3d[];
      geo: THREE.BufferGeometry;
    }[] = [];

    const initialDate = new Date(simDateMsRef.current);
    for (const id of ORBIT_CURVE_BODY_IDS) {
      const ptsM = sampleOrbitCurveHelioM(id, initialDate, 96);
      const positions = new Float32Array(ptsM.length * 3);
      const geo = track(new THREE.BufferGeometry());
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const color =
        id === 'earth'
          ? '#3b82f6'
          : id === 'moon'
            ? '#94a3b8'
            : id === 'mars'
              ? '#c26b4a'
              : '#475569';
      const mat = track(
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: id === 'earth' ? 0.55 : 0.32,
        })
      );
      const line = new THREE.Line(geo, mat);
      orbitGroup.add(line);
      orbitLines.push({
        id,
        parentId: id === 'moon' ? 'earth' : 'sun',
        line,
        pointsM: ptsM,
        geo,
      });
    }

    // =========================================================================
    // PASS 4B: Sagittarius A* Relativistic Black Hole Scene (100% UNTOUCHED SHADER!)
    // Hard Rule #1: Exact same volumetric Schwarzschild raymarching & two-pass capture!
    // =========================================================================
    const blackHoleScene = new THREE.Scene();
    const volumetricBhGeo = track(new THREE.SphereGeometry(34.0, 64, 48));
    const volumetricBhMat = track(createVolumetricBlackHoleMaterial());
    volumetricBhMat.uniforms.uDiskRoll.value = BLACK_HOLE_DISK_ROLL;
    const volumetricBhMesh = new THREE.Mesh(volumetricBhGeo, volumetricBhMat);
    volumetricBhMesh.renderOrder = 6;
    blackHoleScene.add(volumetricBhMesh);

    const lensingTarget = track(
      new THREE.WebGLRenderTarget(
        Math.max(256, Math.round(width * 0.75)),
        Math.max(256, Math.round(height * 0.75)),
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          type: THREE.UnsignedByteType,
        }
      )
    );

    // =========================================================================
    // =========================================================================
    // Input Controls: Left Orbit, Right/Middle/Shift+Left Pan, Scroll Zoom, WASD/QE/Shift
    // =========================================================================
    let dragMode: 'orbit' | 'pan' | null = null;
    let pointerMoved = false;
    let lastPtrX = 0;
    let lastPtrY = 0;
    const activeTouches = new Map<number, { x: number; y: number }>();
    let lastPinchDist = 0;
    let lastPinchCenterX = 0;
    let lastPinchCenterY = 0;

    const keys = {
      w: false,
      s: false,
      a: false,
      d: false,
      q: false,
      e: false,
      shift: false,
    };

    const getCameraBasis = (yaw: number, pitch: number) => {
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const sinY = Math.sin(yaw);
      const cosY = Math.cos(yaw);
      const fwd: Vec3d = [-cosP * sinY, -sinP, -cosP * cosY];
      const right: Vec3d = [cosY, 0, -sinY];
      const up: Vec3d = [-sinP * sinY, cosP, -sinP * cosY];
      return { fwd, right, up };
    };

    const applyPanPixels = (dx: number, dy: number) => {
      const ctrl = camCtrlRef.current;
      ctrl.flyTo = null;
      const orbitOffNow = sphericalOffsetM(ctrl.distM, ctrl.yaw, ctrl.pitch);
      const actualDist = lengthVec3d([
        orbitOffNow[0] + ctrl.freeFlightOffsetM[0],
        orbitOffNow[1] + ctrl.freeFlightOffsetM[1],
        orbitOffNow[2] + ctrl.freeFlightOffsetM[2],
      ]);
      const effDistM = Math.max(
        MIN_SURFACE_ALTITUDE_M,
        Math.min(MAX_UNIVERSE_RADIUS_M, actualDist - ctrl.targetRadiusM)
      );
      const vpH = Math.max(1, renderer.domElement.clientHeight || container.clientHeight || 720);
      const fovRad = (camera.fov * Math.PI) / 180;
      const metersPerPixel = (2 * effDistM * Math.tan(fovRad * 0.5)) / vpH;
      const { right, up } = getCameraBasis(ctrl.yaw, ctrl.pitch);
      // Dragging right pulls scene right (camera moves left); dragging down pulls scene down (camera moves up)
      ctrl.freeFlightOffsetM = [
        ctrl.freeFlightOffsetM[0] + (-right[0] * dx + up[0] * dy) * metersPerPixel,
        ctrl.freeFlightOffsetM[1] + (-right[1] * dx + up[1] * dy) * metersPerPixel,
        ctrl.freeFlightOffsetM[2] + (-right[2] * dx + up[2] * dy) * metersPerPixel,
      ];
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onPointerDown = (e: PointerEvent) => {
      // Blur any focused slider/button so WASD keyboard flight always responds immediately
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && activeEl !== document.body && typeof activeEl.blur === 'function') {
        activeEl.blur();
      }

      if (e.pointerType === 'mouse') {
        if (e.button === 2 || e.button === 1 || (e.button === 0 && e.shiftKey)) {
          e.preventDefault();
          dragMode = 'pan';
        } else if (e.button === 0) {
          dragMode = 'orbit';
        } else {
          return;
        }
      } else {
        dragMode = 'orbit';
      }

      pointerMoved = false;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;
      activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activeTouches.size === 2) {
        const pts = Array.from(activeTouches.values());
        lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        lastPinchCenterX = (pts[0].x + pts[1].x) * 0.5;
        lastPinchCenterY = (pts[0].y + pts[1].y) * 0.5;
      }
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // ignore if synthetic pointer event has no active capture target
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (activeTouches.has(e.pointerId)) {
        activeTouches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (activeTouches.size === 2) {
        const pts = Array.from(activeTouches.values());
        const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const cx = (pts[0].x + pts[1].x) * 0.5;
        const cy = (pts[0].y + pts[1].y) * 0.5;
        if (lastPinchDist > 4 && d > 4) {
          const deltaLog = Math.log10(lastPinchDist / d) * 1.4;
          const ctrl = camCtrlRef.current;
          ctrl.flyTo = null;
          ctrl.distM = applyLogZoom(
            ctrl.distM,
            deltaLog,
            ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
            MAX_UNIVERSE_RADIUS_M
          );
        }
        applyPanPixels(cx - lastPinchCenterX, cy - lastPinchCenterY);
        lastPinchDist = d;
        lastPinchCenterX = cx;
        lastPinchCenterY = cy;
        return;
      }

      if (!dragMode) return;
      const dx = e.clientX - lastPtrX;
      const dy = e.clientY - lastPtrY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) pointerMoved = true;
      lastPtrX = e.clientX;
      lastPtrY = e.clientY;

      if (dragMode === 'pan') {
        applyPanPixels(dx, dy);
      } else {
        const ctrl = camCtrlRef.current;
        ctrl.flyTo = null;
        ctrl.yaw -= dx * 0.0052;
        ctrl.pitch = clampPitch(ctrl.pitch + dy * 0.0052);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      activeTouches.delete(e.pointerId);
      if (activeTouches.size < 2) lastPinchDist = 0;
      if (activeTouches.size === 0) dragMode = null;
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      void pointerMoved;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const ctrl = camCtrlRef.current;
      ctrl.flyTo = null;
      // Logarithmic scroll zoom: smooth across 23+ orders of magnitude!
      const clampedDeltaY = Math.max(-140, Math.min(140, e.deltaY));
      const deltaLog = clampedDeltaY * 0.0016;
      ctrl.distM = applyLogZoom(
        ctrl.distM,
        deltaLog,
        ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
        MAX_UNIVERSE_RADIUS_M
      );
    };

    const isTextEditingTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName;
      if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (tag === 'INPUT') {
        const inputType = ((el as HTMLInputElement).type || 'text').toLowerCase();
        // Do NOT swallow WASD when user focused the zoom range slider or checkboxes!
        return inputType !== 'range' && inputType !== 'checkbox' && inputType !== 'button';
      }
      return false;
    };

    const setFlightKeyState = (e: KeyboardEvent, pressed: boolean): boolean => {
      const code = e.code;
      const k = e.key.toLowerCase();
      let matched = false;
      // Match physical e.code first so Vietnamese Telex/VNI IME (e.g. W -> ư, D -> đ) still flies!
      if (code === 'KeyW' || code === 'ArrowUp' || k === 'w') {
        keys.w = pressed;
        matched = true;
      }
      if (code === 'KeyS' || code === 'ArrowDown' || k === 's') {
        keys.s = pressed;
        matched = true;
      }
      if (code === 'KeyA' || code === 'ArrowLeft' || k === 'a') {
        keys.a = pressed;
        matched = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight' || k === 'd') {
        keys.d = pressed;
        matched = true;
      }
      if (code === 'KeyQ' || k === 'q') {
        keys.q = pressed;
        matched = true;
      }
      if (code === 'KeyE' || k === 'e') {
        keys.e = pressed;
        matched = true;
      }
      if (code === 'ShiftLeft' || code === 'ShiftRight' || k === 'shift') {
        keys.shift = pressed;
        matched = true;
      }
      return matched;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextEditingTarget(e.target)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const matched = setFlightKeyState(e, true);
      if (
        matched &&
        (e.code === 'ArrowUp' ||
          e.code === 'ArrowDown' ||
          e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight')
      ) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      setFlightKeyState(e, false);
    };

    const onWindowBlur = () => {
      keys.w = keys.s = keys.a = keys.d = keys.q = keys.e = keys.shift = false;
      dragMode = null;
      activeTouches.clear();
    };

    const onVisibilityChange = () => {
      isTabHidden = document.visibilityState === 'hidden';
      if (!isTabHidden && !isDisposed) {
        lastFrameMs = performance.now();
        frameId = requestAnimationFrame(tick);
      }
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };

    const onContextRestored = () => {
      setContextLost(false);
    };

    const handleResize = () => {
      if (isDisposed || !container) return;
      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      lensingTarget.setSize(
        Math.max(256, Math.round(w * 0.75)),
        Math.max(256, Math.round(h * 0.75))
      );
      volumetricBhMat.uniforms.uResolution.value.set(
        renderer.domElement.width || w,
        renderer.domElement.height || h
      );
    };

    renderer.domElement.addEventListener('contextmenu', onContextMenu);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    const frameWaiters: (() => void)[] = [];
    let forceHudSync = true;

    // Expose deterministic test/inspection API for Playwright smoke & baseline black hole verification
    window.__OBSERVATORY_API__ = {
      flyToPreset: (preset) => {
        const res = resolveScalePreset(preset, camCtrlRef.current.ephemeris, memoriesRef.current);
        setActivePreset(preset);
        startFlyTo(res, undefined, true);
        forceHudSync = true;
      },
      flyToTarget: (id, distM) => {
        const res = resolveUniverseTarget(id, camCtrlRef.current.ephemeris, memoriesRef.current);
        startFlyTo(res, distM, true);
        forceHudSync = true;
      },
      setSgrABaselinePose: (pose) => {
        const ctrl = camCtrlRef.current;
        const res = resolveUniverseTarget('BLACK_HOLE_CORE', ctrl.ephemeris, memoriesRef.current);
        ctrl.targetId = res.id;
        ctrl.targetLabel = res.label;
        ctrl.targetRadiusM = res.radiusM;
        ctrl.targetPos = { anchor: 'galactic', offsetM: [0, 0, 0] };
        ctrl.provenance = 'measured';
        ctrl.showSurfaceAltitude = false;
        ctrl.freeFlightOffsetM = [0, 0, 0];
        ctrl.flyTo = null;
        setActivePreset('sgr-a');
        if (pose === 1) {
          // Enlarged standard 3/4 oblique view of Sagittarius A*
          ctrl.distM = 25.5 * SGRA_DISPLAY_METERS_PER_SHADER_UNIT;
          ctrl.yaw = 0;
          ctrl.pitch = 0.34;
        } else if (pose === 2) {
          // Edge-on accretion disk
          ctrl.distM = 24.5 * SGRA_DISPLAY_METERS_PER_SHADER_UNIT;
          ctrl.yaw = 0.08;
          ctrl.pitch = 0.01;
        } else {
          // Polar top-down view
          ctrl.distM = 28.0 * SGRA_DISPLAY_METERS_PER_SHADER_UNIT;
          ctrl.yaw = 0;
          ctrl.pitch = 1.28;
        }
        forceHudSync = true;
      },
      setAltitudeAboveEarthM: (altM) => {
        const ctrl = camCtrlRef.current;
        const res = resolveUniverseTarget('earth', ctrl.ephemeris, memoriesRef.current);
        setActivePreset('earth');
        startFlyTo(res, EARTH_MEAN_RADIUS_M + Math.max(250, altM), true);
        forceHudSync = true;
      },
      setLogDistM: (nextLog) => {
        const ctrl = camCtrlRef.current;
        ctrl.flyTo = null;
        ctrl.distM = Math.max(
          ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
          Math.min(MAX_UNIVERSE_RADIUS_M, Math.pow(10, nextLog))
        );
        forceHudSync = true;
      },
      awaitNextFrame: () =>
        new Promise<void>((resolve) => {
          frameWaiters.push(resolve);
        }),
      getState: () => {
        const ctrl = camCtrlRef.current;
        const orbitOffNow = sphericalOffsetM(ctrl.distM, ctrl.yaw, ctrl.pitch);
        const actualDistM = Math.max(
          ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
          lengthVec3d([
            orbitOffNow[0] + ctrl.freeFlightOffsetM[0],
            orbitOffNow[1] + ctrl.freeFlightOffsetM[1],
            orbitOffNow[2] + ctrl.freeFlightOffsetM[2],
          ])
        );
        const weights = computeScaleLayerWeights(actualDistM);
        return {
          targetId: ctrl.targetId,
          dominantLayer: weights.dominant,
          distM: actualDistM,
          altitudeM: Math.max(0, actualDistM - ctrl.targetRadiusM),
          logDistM: Math.log10(Math.max(1, actualDistM)),
          freeFlightOffsetM: ctrl.freeFlightOffsetM,
          camFinite:
            Number.isFinite(actualDistM) &&
            Number.isFinite(ctrl.yaw) &&
            Number.isFinite(ctrl.pitch),
          simDateIso: new Date(simDateMsRef.current).toISOString(),
          starsLoaded: ctrl.starsLoaded,
          fps: ctrl.fps,
        };
      },
    };

    // =========================================================================
    // Adaptive FPS Governor & Render Loop
    // =========================================================================
    let lastFrameMs = performance.now();
    let elapsedSec = 0;
    let lastHudSyncMs = 0;
    let lastEphemerisMs = 0;
    let adaptiveResFactor = 1.0;
    const fpsSamples: number[] = [];

    function afterDraw(cb: (ts: number) => void) {
      if (isDisposed || isTabHidden) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed || isTabHidden) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timeoutId = window.setTimeout(poll, 8);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = requestAnimationFrame(cb);
          }
        };
        timeoutId = window.setTimeout(poll, 8);
      } else {
        timeoutId = window.setTimeout(() => {
          if (!isDisposed && !isTabHidden) frameId = requestAnimationFrame(cb);
        }, 65);
      }
    }

    function tick(nowMs: number) {
      if (isDisposed || isTabHidden) return;

      const rawDt = Math.min(0.1, Math.max(0.001, (nowMs - lastFrameMs) / 1000));
      lastFrameMs = nowMs;
      elapsedSec += reducedMotionRef.current ? rawDt * 0.15 : rawDt;

      // Real FPS sliding window & adaptive quality governor
      const instFps = 1 / rawDt;
      fpsSamples.push(instFps);
      if (fpsSamples.length > 30) fpsSamples.shift();
      const avgFps = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
      camCtrlRef.current.fps = Math.round(avgFps);

      if (!isSoftwareGl && fpsSamples.length >= 25) {
        if (avgFps < 28 && adaptiveResFactor > 0.65) {
          adaptiveResFactor = Math.max(0.65, adaptiveResFactor - 0.05);
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, graphicsRef.current.resolutionScale) *
              adaptiveResFactor
          );
        } else if (avgFps > 54 && adaptiveResFactor < 1.0) {
          adaptiveResFactor = Math.min(1.0, adaptiveResFactor + 0.02);
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, graphicsRef.current.resolutionScale) *
              adaptiveResFactor
          );
        }
      }

      // Advance ephemeris simulation clock
      if (isTimePlayingRef.current) {
        simDateMsRef.current += rawDt * timeSpeedRef.current * 1000;
      }

      // Refresh real Solar System ephemeris (~20Hz or whenever time advances)
      if (nowMs - lastEphemerisMs > 50) {
        lastEphemerisMs = nowMs;
        camCtrlRef.current.ephemeris = computeSolarSystemEphemeris(
          new Date(simDateMsRef.current)
        );
      }

      const ctrl = camCtrlRef.current;
      const ephem = ctrl.ephemeris;
      const origins: AnchorOriginsM = {
        sunInGalacticM: ephem.sunInGalacticM,
        earthInHelioM: ephem.bodies.earth.helioPosM,
      };

      // Keep active Solar System target position locked to live ephemeris
      if (ephem.bodies[ctrl.targetId]) {
        if (ctrl.targetId === 'earth') {
          ctrl.targetPos = { anchor: 'earth', offsetM: [0, 0, 0] };
        } else if (ctrl.targetId === 'moon') {
          ctrl.targetPos = {
            anchor: 'earth',
            offsetM: ephem.bodies.moon.localOffsetM,
          };
        } else {
          ctrl.targetPos = {
            anchor: 'heliocentric',
            offsetM: ephem.bodies[ctrl.targetId].helioPosM,
          };
        }
      }

      // Update active log-space fly-to animation
      if (ctrl.flyTo && ctrl.flyTo.active) {
        const f = ctrl.flyTo;
        const progress = Math.min(1, (nowMs - f.startMs) / f.durationMs);
        const eased =
          progress * progress * progress * (progress * (progress * 6 - 15) + 10);

        ctrl.distM = interpolateLogDistance(f.startDistM, f.endDistM, progress);
        ctrl.yaw = f.startYaw + (f.endYaw - f.startYaw) * eased;
        ctrl.pitch = f.startPitch + (f.endPitch - f.startPitch) * eased;

        // Smoothly hand off target anchor at midpoint
        if (progress < 0.5) {
          ctrl.targetPos = f.startTargetPos;
        } else {
          ctrl.targetPos = f.endTargetPos;
          ctrl.targetId = f.targetId;
          ctrl.targetLabel = f.targetLabel;
          ctrl.targetRadiusM = f.targetRadiusM;
          ctrl.provenance = f.provenance;
          ctrl.showSurfaceAltitude = f.showSurfaceAltitude;
        }

        if (progress >= 1) {
          ctrl.targetPos = f.endTargetPos;
          ctrl.targetId = f.targetId;
          ctrl.targetLabel = f.targetLabel;
          ctrl.targetRadiusM = f.targetRadiusM;
          ctrl.provenance = f.provenance;
          ctrl.showSurfaceAltitude = f.showSurfaceAltitude;
          ctrl.distM = f.endDistM;
          ctrl.flyTo = null;
        }
      }

      // Distance-proportional WASD/QE/Shift 6-DOF free-flight
      const isFlying = keys.w || keys.s || keys.a || keys.d || keys.q || keys.e;
      if (isFlying) {
        ctrl.flyTo = null;
        const preOrbit = sphericalOffsetM(ctrl.distM, ctrl.yaw, ctrl.pitch);
        const preActualDistM = lengthVec3d([
          preOrbit[0] + ctrl.freeFlightOffsetM[0],
          preOrbit[1] + ctrl.freeFlightOffsetM[1],
          preOrbit[2] + ctrl.freeFlightOffsetM[2],
        ]);
        const surfaceDistM = Math.max(
          MIN_SURFACE_ALTITUDE_M,
          preActualDistM - ctrl.targetRadiusM
        );
        const speedMps = computeAdaptiveFlightSpeedMps(surfaceDistM, keys.shift);
        const stepM = speedMps * rawDt;

        // Forward/Right/Camera-Up orthonormal basis from yaw & pitch
        const { fwd, right, up } = getCameraBasis(ctrl.yaw, ctrl.pitch);

        let dx = 0;
        let dy = 0;
        let dz = 0;
        if (keys.w) {
          dx += fwd[0] * stepM;
          dy += fwd[1] * stepM;
          dz += fwd[2] * stepM;
        }
        if (keys.s) {
          dx -= fwd[0] * stepM;
          dy -= fwd[1] * stepM;
          dz -= fwd[2] * stepM;
        }
        if (keys.d) {
          dx += right[0] * stepM;
          dy += right[1] * stepM;
          dz += right[2] * stepM;
        }
        if (keys.a) {
          dx -= right[0] * stepM;
          dy -= right[1] * stepM;
          dz -= right[2] * stepM;
        }
        if (keys.e) {
          dx += up[0] * stepM;
          dy += up[1] * stepM;
          dz += up[2] * stepM;
        }
        if (keys.q) {
          dx -= up[0] * stepM;
          dy -= up[1] * stepM;
          dz -= up[2] * stepM;
        }

        const nextOff: Vec3d = [
          ctrl.freeFlightOffsetM[0] + dx,
          ctrl.freeFlightOffsetM[1] + dy,
          ctrl.freeFlightOffsetM[2] + dz,
        ];
        // Prevent flying straight inside a solid planet sphere
        const nextRel: Vec3d = [
          preOrbit[0] + nextOff[0],
          preOrbit[1] + nextOff[1],
          preOrbit[2] + nextOff[2],
        ];
        const minSafeDist = ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M;
        const nextDist = lengthVec3d(nextRel);
        if (ctrl.targetRadiusM > 0 && nextDist < minSafeDist && nextDist > 1e-3) {
          const pushScale = minSafeDist / nextDist;
          ctrl.freeFlightOffsetM = [
            nextRel[0] * pushScale - preOrbit[0],
            nextRel[1] * pushScale - preOrbit[1],
            nextRel[2] * pushScale - preOrbit[2],
          ];
        } else {
          ctrl.freeFlightOffsetM = nextOff;
        }
      }

      // Compute exact floating-origin Camera UniversePosition in float64 SI meters
      const orbitOff = sphericalOffsetM(ctrl.distM, ctrl.yaw, ctrl.pitch);
      const camRelTargetM: Vec3d = [
        orbitOff[0] + ctrl.freeFlightOffsetM[0],
        orbitOff[1] + ctrl.freeFlightOffsetM[1],
        orbitOff[2] + ctrl.freeFlightOffsetM[2],
      ];
      const actualDistToTargetM = Math.max(
        ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
        Math.min(MAX_UNIVERSE_RADIUS_M, lengthVec3d(camRelTargetM))
      );
      const camPos: UniversePosition = {
        anchor: ctrl.targetPos.anchor,
        offsetM: [
          ctrl.targetPos.offsetM[0] + camRelTargetM[0],
          ctrl.targetPos.offsetM[1] + camRelTargetM[1],
          ctrl.targetPos.offsetM[2] + camRelTargetM[2],
        ],
      };

      const camGalacticM = toGalacticMeters(camPos, origins);
      const distToSgrAM = lengthVec3d(camGalacticM);
      const distToSunM = lengthVec3d(
        computeRelativeMeters({ anchor: 'heliocentric', offsetM: [0, 0, 0] }, camPos, origins)
      );
      const effectiveViewDistM = Math.max(
        MIN_SURFACE_ALTITUDE_M,
        actualDistToTargetM - ctrl.targetRadiusM
      );
      const weights = computeScaleLayerWeights(actualDistToTargetM);

      // Camera orientation (always looking from camPos toward target + freeFlightOffset)
      camera.position.set(0, 0, 0);
      camera.lookAt(-orbitOff[0], -orbitOff[1], -orbitOff[2]);
      camera.updateMatrixWorld();

      // Clear full framebuffer once before 4-pass layered rendering
      renderer.clear(true, true, true);

      // =====================================================================
      // PASS 1: Deep Sky & Extragalactic Layer (1 unit = 1 Mpc)
      // =====================================================================
      const clipExtra = computeLayerClipPlanes('extragalactic', ctrl.distM);
      camera.near = clipExtra.near;
      camera.far = clipExtra.far;
      camera.updateProjectionMatrix();

      skyDomeMat.uniforms.uTime.value = elapsedSec;
      bgMat.uniforms.uTime.value = elapsedSec;
      bgMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();

      galaxyGroup.visible = showGalaxiesRef.current;
      if (showGalaxiesRef.current) {
        const extraOpacity = Math.max(0.22, weights.extragalactic);
        for (const gm of galaxyMeshes) {
          const rx = (gm.posM[0] - camGalacticM[0]) / MEGAPARSEC_METERS;
          const ry = (gm.posM[1] - camGalacticM[1]) / MEGAPARSEC_METERS;
          const rz = (gm.posM[2] - camGalacticM[2]) / MEGAPARSEC_METERS;
          gm.mesh.position.set(rx, ry, rz);
          gm.mesh.lookAt(0, 0, 0);
          // Keep major galaxies & clusters clearly legible across Local Group and cluster distances
          const distMpc = Math.hypot(rx, ry, rz);
          const isMajor =
            gm.entry.id === 'm31' ||
            gm.entry.id === 'm33' ||
            gm.entry.id === 'lmc' ||
            gm.entry.id === 'smc' ||
            gm.entry.group === 'galaxy-clusters';
          const minAngularScale = isMajor ? distMpc * 0.055 : distMpc * 0.022;
          const displayRadiusMpc = Math.max(gm.radiusMpc, minAngularScale);
          gm.mesh.scale.set(displayRadiusMpc * 2, displayRadiusMpc * 2, 1);

          const visFade =
            gm.entry.group === 'local-group'
              ? extraOpacity
              : weights.extragalactic * (distMpc > 0.01 ? 1 : 0.4);
          gm.mat.uniforms.uOpacity.value = visFade;
        }
      }
      renderer.render(extragalacticScene, camera);
      renderer.clearDepth();

      // =====================================================================
      // PASS 2: Galactic Layer (1 unit = 1 kpc)
      // =====================================================================
      const nearSgrACloseup = distToSgrAM < 3.6e13; // ~240 AU
      const distToSgrAKpc = distToSgrAM / KILOPARSEC_METERS;
      const distToSgrAPc = distToSgrAM / PARSEC_METERS;
      const galacticVis = showMilkyWayRef.current && weights.galactic > 0.005;
      const insideMilkyWay =
        showMilkyWayRef.current && distToSgrAKpc < 18.0 && !nearSgrACloseup;

      if (galacticVis || weights.extragalactic > 0.05 || insideMilkyWay) {
        const clipGal = computeLayerClipPlanes('galactic', Math.max(ctrl.distM, 1e18));
        camera.near = Math.min(clipGal.near, 0.005);
        camera.far = clipGal.far;
        camera.updateProjectionMatrix();

        galacticRoot.position.set(
          -camGalacticM[0] / KILOPARSEC_METERS,
          -camGalacticM[1] / KILOPARSEC_METERS,
          -camGalacticM[2] / KILOPARSEC_METERS
        );

        const mwOpacity = showMilkyWayRef.current
          ? Math.max(weights.galactic, weights.extragalactic * 0.85)
          : 0;
        // Smoothly attenuate the flat parametric bulge disk inside 3.2 kpc so flying into
        // 1.16 kpc or 184 pc never creates a blinding pure-white clipped wall!
        const bulgeProximityFade = Math.max(
          0,
          Math.min(1, (distToSgrAKpc - 0.35) / 2.85)
        );
        mwDiskMat.uniforms.uOpacity.value = mwOpacity * 0.88 * bulgeProximityFade;
        mwDiskMat.uniforms.uTime.value = elapsedSec;

        // Keep Milky Way stars visible inside the Galactic Bulge even at 184 pc!
        const starFloor = insideMilkyWay ? 0.52 : 0;
        mwStarsMat.uniforms.uOpacity.value = Math.max(mwOpacity * 0.95, starFloor);
        mwStarsMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();

        galacticGridGroup.visible = showGridRef.current && weights.galactic > 0.12;

        // Far galactic nucleus glow (only above ~2.5 kpc; handed off to gcClusterScene below 3 kpc)
        const farCoreFade = Math.max(0, Math.min(1, (distToSgrAKpc - 1.8) / 2.2));
        sgrACoreBillboard.visible = !nearSgrACloseup && mwOpacity > 0.05 && farCoreFade > 0.01;
        sgrACoreBillboard.lookAt(
          camGalacticM[0] / KILOPARSEC_METERS,
          camGalacticM[1] / KILOPARSEC_METERS,
          camGalacticM[2] / KILOPARSEC_METERS
        );
        sgrACoreMat.uniforms.uOpacity.value = mwOpacity * 0.55 * farCoreFade;
        sgrACoreMat.uniforms.uCloseFactor.value = 0.0;
        sgrACoreMat.uniforms.uTime.value = elapsedSec;

        renderer.render(galacticScene, camera);
        renderer.clearDepth();
      }

      // =====================================================================
      // PASS 2B: Galactic Center Nuclear Star Cluster & Continuous Sgr A* Beacon (1 unit = 1 pc)
      // Bridges 3.2 kpc -> 1.16 kpc -> 184 pc -> 10 pc -> 1 pc -> 50 AU -> 1.66 AU with zero void!
      // =====================================================================
      const showGcCluster = distToSgrAKpc < 3.6 && distToSgrAM > 16 * AU_IN_METERS;
      if (showGcCluster) {
        camera.near = Math.max(1e-6, distToSgrAPc * 0.002);
        camera.far = Math.max(800, distToSgrAPc * 6.0);
        camera.updateProjectionMatrix();

        gcClusterRoot.position.set(
          -camGalacticM[0] / PARSEC_METERS,
          -camGalacticM[1] / PARSEC_METERS,
          -camGalacticM[2] / PARSEC_METERS
        );

        // Smooth fade-in below 3.4 kpc; crossfade beacon smoothly into volumetric Sgr A* across 180 AU -> 55 AU
        const outerIn = Math.max(0, Math.min(1, (3.4 - distToSgrAKpc) / 1.8));
        const beaconFadeOut = Math.max(
          0,
          Math.min(1, (distToSgrAM - 52 * AU_IN_METERS) / (140 * AU_IN_METERS))
        );
        const starFadeOut = Math.max(
          0,
          Math.min(1, (distToSgrAM - 18 * AU_IN_METERS) / (110 * AU_IN_METERS))
        );
        const clusterOpacity = outerIn * (0.28 + 0.72 * starFadeOut);

        nscMat.uniforms.uOpacity.value = clusterOpacity * 0.85;
        nscMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();

        // Keep Sgr A* visibly centered & monotonically growing from 1.6 kpc -> 184 pc -> 1 pc -> 50 AU
        sgrABeaconMesh.visible = beaconFadeOut > 0.01;
        sgrABeaconMesh.lookAt(
          camGalacticM[0] / PARSEC_METERS,
          camGalacticM[1] / PARSEC_METERS,
          camGalacticM[2] / PARSEC_METERS
        );
        // Calibrated so apparent size grows monotonically into the real ~3.3 AU volumetric disk at 50 AU (~6.6% FOV)
        const logDistPc = Math.log10(Math.max(1e-5, distToSgrAPc));
        // logDistPc: +3.06 (1.16 kpc) -> +2.26 (184 pc) -> 0.0 (1 pc) -> -3.6 (50 AU)
        const closeFactor = Math.max(0, Math.min(1, (2.6 - logDistPc) / 3.2));
        const angularFrac = 0.11 + closeFactor * 0.085;
        const beaconDiamPc = Math.max(1e-5, distToSgrAPc * angularFrac);
        sgrABeaconMesh.scale.set(beaconDiamPc, beaconDiamPc, 1);

        sgrABeaconMat.uniforms.uOpacity.value = outerIn * beaconFadeOut * 0.88;
        sgrABeaconMat.uniforms.uCloseFactor.value = closeFactor;
        sgrABeaconMat.uniforms.uTime.value = elapsedSec;

        renderer.render(gcClusterScene, camera);
        renderer.clearDepth();
      }

      // =====================================================================
      // PASS 3: Stellar Neighborhood Layer (1 unit = 1 light-year)
      // =====================================================================
      const stellarOpacity = Math.max(weights.stellar, weights.planetary * 0.45);
      if (stellarOpacity > 0.01 && camCtrlRef.current.starsLoaded > 0) {
        const clipStar = computeLayerClipPlanes('stellar', Math.max(ctrl.distM, 1e14));
        camera.near = clipStar.near;
        camera.far = clipStar.far;
        camera.updateProjectionMatrix();

        stellarRoot.position.set(
          (origins.sunInGalacticM[0] - camGalacticM[0]) / LIGHT_YEAR_METERS,
          (origins.sunInGalacticM[1] - camGalacticM[1]) / LIGHT_YEAR_METERS,
          (origins.sunInGalacticM[2] - camGalacticM[2]) / LIGHT_YEAR_METERS
        );
        stellarMat.uniforms.uOpacity.value = stellarOpacity;
        stellarMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();

        renderer.render(stellarScene, camera);
        renderer.clearDepth();
      }

      // =====================================================================
      // PASS 4A: Planetary / Solar System Layer (1 unit = 1,000 km = 1e6 m)
      // =====================================================================
      const inSolarSystemRange = distToSunM < 4500 * AU_IN_METERS && weights.planetary > 0.005;
      if (inSolarSystemRange) {
        const mpu = SCALE_LAYERS.planetary.metersPerUnit; // 1e6 m
        const clipPlan = computeLayerClipPlanes('planetary', effectiveViewDistM);
        camera.near = clipPlan.near;
        camera.far = clipPlan.far;
        camera.updateProjectionMatrix();

        const sunRelM = computeRelativeMeters(
          { anchor: 'heliocentric', offsetM: [0, 0, 0] },
          camPos,
          origins
        );
        const sunGpuX = sunRelM[0] / mpu;
        const sunGpuY = sunRelM[1] / mpu;
        const sunGpuZ = sunRelM[2] / mpu;

        const isTrueScale = scaleModeRef.current === 'true-1to1';

        for (const id of SOLAR_BODY_IDS) {
          const entry = planetEntries.get(id);
          const bodyState = ephem.bodies[id];
          if (!entry || !bodyState) continue;

          const bodyPos: UniversePosition =
            id === 'earth'
              ? { anchor: 'earth', offsetM: [0, 0, 0] }
              : id === 'moon'
                ? { anchor: 'earth', offsetM: bodyState.localOffsetM }
                : { anchor: 'heliocentric', offsetM: bodyState.helioPosM };

          const relM = computeRelativeMeters(bodyPos, camPos, origins);
          const gx = relM[0] / mpu;
          const gy = relM[1] / mpu;
          const gz = relM[2] / mpu;
          const distUnits = Math.hypot(gx, gy, gz);

          entry.group.position.set(gx, gy, gz);

          // Real physical radius in 1,000 km units (plus gentle distant Atlas boost only in Atlas mode)
          const physicalRadiusUnits = bodyState.radiusM / mpu;
          const sunPinpointScale = id === 'sun' ? (isTrueScale ? 0.011 : 0.024) : isTrueScale ? 0.0032 : 0.014;
          const radiusUnits = Math.max(physicalRadiusUnits, distUnits * sunPinpointScale);

          entry.axialGroup.scale.setScalar(radiusUnits);
          entry.mesh.rotation.y = bodyState.spinAngleRad;
          if (entry.cloudMesh) {
            entry.cloudMesh.rotation.y = bodyState.spinAngleRad * 1.015;
          }

          if (id === 'sun') {
            solarCoronaBillboard.position.set(gx, gy, gz);
            solarCoronaBillboard.lookAt(0, 0, 0);
            const coronaDiameter = Math.max(radiusUnits * 6.4, distUnits * 0.145);
            solarCoronaBillboard.scale.set(coronaDiameter, coronaDiameter, 1);
            solarCoronaMat.uniforms.uTime.value = elapsedSec;
            solarCoronaMat.uniforms.uOpacity.value = Math.min(1.0, weights.planetary * 1.15);
          }

          // Live solar direction for authentic Earth day/night terminator & Moon phase!
          const sunDir =
            id === 'sun' ? ([0, 1, 0] as Vec3d) : computeSunDirectionFromBody(bodyState.helioPosM);

          if (id === 'earth') {
            entry.mat.uniforms.uSunDir.value.set(sunDir[0], sunDir[1], sunDir[2]);
            entry.mat.uniforms.uTime.value = elapsedSec;
            if (entry.cloudMat) {
              entry.cloudMat.uniforms.uSunDir.value.set(sunDir[0], sunDir[1], sunDir[2]);
              entry.cloudMat.uniforms.uTime.value = elapsedSec;
            }
          } else {
            entry.mat.uniforms.uTime.value = elapsedSec;
            entry.mat.uniforms.uOpacity.value = weights.planetary;
            entry.mat.uniforms.uLightPos.value.set(sunGpuX, sunGpuY, sunGpuZ);
            if (id === 'sun' && entry.mat.uniforms.uHighlight) {
              entry.mat.uniforms.uHighlight.value = 0.65;
            }
          }

          if (entry.atmoMat) {
            entry.atmoMat.uniforms.uOpacity.value =
              id === 'sun' ? weights.planetary * 1.25 : weights.planetary * 0.88;
            entry.atmoMat.uniforms.uLightPos.value.set(
              id === 'sun' ? 0 : sunGpuX,
              id === 'sun' ? 0 : sunGpuY,
              id === 'sun' ? 0 : sunGpuZ
            );
          }
          if (entry.ringMat) {
            entry.ringMat.uniforms.uOpacity.value = weights.planetary * 0.92;
            entry.ringMat.uniforms.uPlanetRadius.value = radiusUnits;
            entry.ringMat.uniforms.uLightPos.value.set(sunGpuX, sunGpuY, sunGpuZ);
          }
        }

        // Update real ephemeris orbit curves relative to floating-origin camera
        orbitGroup.visible = showOrbitsRef.current;
        if (showOrbitsRef.current) {
          const earthRelM = computeRelativeMeters(
            { anchor: 'earth', offsetM: [0, 0, 0] },
            camPos,
            origins
          );
          for (const ol of orbitLines) {
            const baseRel = ol.parentId === 'earth' ? earthRelM : sunRelM;
            const posAttr = ol.geo.getAttribute('position') as THREE.BufferAttribute;
            const arr = posAttr.array as Float32Array;
            for (let i = 0; i < ol.pointsM.length; i += 1) {
              const p = ol.pointsM[i];
              arr[i * 3 + 0] = (baseRel[0] + p[0]) / mpu;
              arr[i * 3 + 1] = (baseRel[1] + p[1]) / mpu;
              arr[i * 3 + 2] = (baseRel[2] + p[2]) / mpu;
            }
            posAttr.needsUpdate = true;
          }
        }

        renderer.render(planetaryScene, camera);
      }

      // =====================================================================
      // PASS 4B: Sagittarius A* Relativistic Black Hole (HARD RULE #1!)
      // Exact untouched Schwarzschild raymarching & two-pass background lensing!
      // =====================================================================
      if (nearSgrACloseup) {
        const camBhX = camGalacticM[0] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT;
        const camBhY = camGalacticM[1] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT;
        const camBhZ = camGalacticM[2] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT;

        // Prepare galactic Milky Way starfield behind Sgr A* (subtle, clean baseline match)
        const prevDiskOpacity = mwDiskMat.uniforms.uOpacity.value;
        const prevStarsOpacity = mwStarsMat.uniforms.uOpacity.value;
        const prevGridVis = galacticGridGroup.visible;
        const prevCoreVis = sgrACoreBillboard.visible;

        galacticRoot.position.set(0, 0, 0);
        mwDiskMat.uniforms.uOpacity.value = 0.0;
        mwStarsMat.uniforms.uOpacity.value = 0.24;
        mwStarsMat.uniforms.uPixelRatio.value = renderer.getPixelRatio() * 0.72;
        galacticGridGroup.visible = false;
        sgrACoreBillboard.visible = false;

        // Pass 1 of 2: capture live background sky + subtle Milky Way starfield into lensingTarget
        renderer.setRenderTarget(lensingTarget);
        renderer.clear(true, true, true);
        camera.position.set(0, 0, 0);
        camera.lookAt(-orbitOff[0], -orbitOff[1], -orbitOff[2]);
        camera.near = 0.05;
        camera.far = 4000;
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        renderer.render(extragalacticScene, camera);
        renderer.clearDepth();
        camera.near = 2.0;
        camera.far = 400;
        camera.updateProjectionMatrix();
        renderer.render(galacticScene, camera);
        renderer.setRenderTarget(null);

        // Also render subtle distant Milky Way starfield to main framebuffer behind Sgr A*
        renderer.clearDepth();
        renderer.render(galacticScene, camera);
        renderer.clearDepth();

        // Restore galactic layer state
        mwDiskMat.uniforms.uOpacity.value = prevDiskOpacity;
        mwStarsMat.uniforms.uOpacity.value = prevStarsOpacity;
        galacticGridGroup.visible = prevGridVis;
        sgrACoreBillboard.visible = prevCoreVis;

        // Pass 2 of 2: render untouched volumetric Schwarzschild black hole over background
        camera.position.set(camBhX, camBhY, camBhZ);
        camera.lookAt(
          camBhX - orbitOff[0] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT,
          camBhY - orbitOff[1] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT,
          camBhZ - orbitOff[2] / SGRA_DISPLAY_METERS_PER_SHADER_UNIT
        );
        camera.near = 0.05;
        camera.far = 4000;
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();

        _viewProjMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        volumetricBhMat.uniforms.uTime.value = elapsedSec;
        volumetricBhMat.uniforms.uRaySteps.value = isSoftwareGl
          ? Math.min(36, graphicsRef.current.blackHoleRaySteps)
          : graphicsRef.current.blackHoleRaySteps;
        volumetricBhMat.uniforms.uSceneTex.value = lensingTarget.texture;
        volumetricBhMat.uniforms.uHasSceneTex.value = 1.0;
        volumetricBhMat.uniforms.uViewProjMat.value.copy(_viewProjMat);
        volumetricBhMat.uniforms.uResolution.value.set(
          renderer.domElement.width || width,
          renderer.domElement.height || height
        );

        renderer.render(blackHoleScene, camera);
      }

      // =====================================================================
      // Throttled HUD & Decluttered 3D Labels Update (~8 Hz, or instant on jumps)
      // =====================================================================
      if (forceHudSync || nowMs - lastHudSyncMs > 125) {
        forceHudSync = false;
        lastHudSyncMs = nowMs;

        const displayDistM = ctrl.showSurfaceAltitude
          ? Math.max(0, actualDistToTargetM - ctrl.targetRadiusM)
          : actualDistToTargetM;
        const formatted = formatDistanceAuto(displayDistM);
        const vpH = renderer.domElement.clientHeight || height;
        const vpW = renderer.domElement.clientWidth || width;
        const fovRad = (45 * Math.PI) / 180;
        const metersPerPixel =
          (2 * Math.max(100, displayDistM) * Math.tan(fovRad * 0.5)) / Math.max(1, vpH);
        const bar = computeScaleBar(metersPerPixel, 108);

        setDominantLayer(weights.dominant);
        setTargetName(ctrl.targetLabel);
        setDistanceLabel(formatted.text);
        setIsSurfaceAltitude(ctrl.showSurfaceAltitude);
        setProvenance(
          weights.dominant === 'galactic' && !nearSgrACloseup
            ? 'illustrative'
            : showGcCluster && !nearSgrACloseup
              ? 'mixed'
              : weights.dominant === 'extragalactic'
                ? 'mixed'
                : ctrl.provenance
        );
        setLogDistM(Math.log10(Math.max(1, actualDistToTargetM)));
        setScaleBar(bar);
        setSimDateMs(simDateMsRef.current);
        setMoonPhaseFraction(ephem.moonPhaseFraction);

        if (stageRef.current) {
          stageRef.current.dataset.scaleLayer = weights.dominant;
          stageRef.current.dataset.targetId = ctrl.targetId;
          stageRef.current.dataset.camDistM = actualDistToTargetM.toExponential(3);
          stageRef.current.dataset.finite = Number.isFinite(actualDistToTargetM) ? 'true' : 'false';
          stageRef.current.dataset.starsLoaded = String(ctrl.starsLoaded);
          stageRef.current.dataset.fps = String(ctrl.fps);
        }

        // Compute decluttered non-overlapping 3D projected labels
        if (showLabelsRef.current) {
          camera.position.set(0, 0, 0);
          camera.lookAt(-orbitOff[0], -orbitOff[1], -orbitOff[2]);
          camera.near = 0.0001;
          camera.far = 1e8;
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();

          const candidates: {
            id: string;
            text: string;
            subtext?: string;
            relM: Vec3d;
            priority: number;
            accent: string;
          }[] = [];

          // 1. Solar System bodies when in planetary/inner-stellar range
          if (inSolarSystemRange) {
            for (const id of [
              'sun',
              'mercury',
              'venus',
              'earth',
              'moon',
              'mars',
              'ceres',
              'jupiter',
              'saturn',
              'uranus',
              'neptune',
              'pluto',
            ]) {
              const bs = ephem.bodies[id];
              if (!bs) continue;
              const bp: UniversePosition =
                id === 'earth'
                  ? { anchor: 'earth', offsetM: [0, 0, 0] }
                  : id === 'moon'
                    ? { anchor: 'earth', offsetM: bs.localOffsetM }
                    : { anchor: 'heliocentric', offsetM: bs.helioPosM };
              const relM = computeRelativeMeters(bp, camPos, origins);
              const dM = lengthVec3d(relM);
              if (dM < bs.radiusM * 1.4) continue;
              candidates.push({
                id,
                text: SOLAR_SYSTEM_BODIES[id].name,
                relM,
                priority: id === 'earth' || id === 'sun' ? 100 : id === 'moon' ? 88 : 80,
                accent: id === 'earth' ? '#54a8ff' : id === 'sun' ? '#fbbf24' : '#cbd5e1',
              });
            }
          }

          // 2. Named nearby Hipparcos / Gaia DR3 stars in stellar scale
          if (weights.stellar > 0.25) {
            for (const st of namedStars) {
              const starGalM: Vec3d = [
                origins.sunInGalacticM[0] + st.posLy[0] * LIGHT_YEAR_METERS,
                origins.sunInGalacticM[1] + st.posLy[1] * LIGHT_YEAR_METERS,
                origins.sunInGalacticM[2] + st.posLy[2] * LIGHT_YEAR_METERS,
              ];
              const relM: Vec3d = [
                starGalM[0] - camGalacticM[0],
                starGalM[1] - camGalacticM[1],
                starGalM[2] - camGalacticM[2],
              ];
              candidates.push({
                id: `star:${st.name}`,
                text: st.name,
                subtext: `${(st.distPc * 3.2616).toFixed(1)} ly`,
                relM,
                priority: st.vMag < 0.5 ? 72 : 55,
                accent: '#93c5fd',
              });
            }
          }

          // 3. Sagittarius A* & Sun Galactic landmark
          if (
            (weights.galactic > 0.2 || weights.extragalactic > 0.2 || showGcCluster) &&
            distToSgrAM > 75 * AU_IN_METERS
          ) {
            candidates.push({
              id: 'BLACK_HOLE_CORE',
              text: 'Sagittarius A* (Milky Way Core)',
              relM: [-camGalacticM[0], -camGalacticM[1], -camGalacticM[2]],
              priority: 95,
              accent: '#f59e0b',
            });
            if (weights.galactic > 0.25) {
              candidates.push({
                id: 'sun',
                text: 'Solar System (8.18 kpc)',
                relM: [
                  origins.sunInGalacticM[0] - camGalacticM[0],
                  origins.sunInGalacticM[1] - camGalacticM[1],
                  origins.sunInGalacticM[2] - camGalacticM[2],
                ],
                priority: 92,
                accent: '#54a8ff',
              });
            }
          }

          // 4. Local Group & Galaxy Clusters in extragalactic scale
          if (showGalaxiesRef.current && weights.extragalactic > 0.15) {
            for (const g of EXTRAGALACTIC_CATALOG) {
              if (g.id === 'mw-galaxy') continue;
              const gp = getExtragalacticPosThreeM(g);
              const relM: Vec3d = [
                gp[0] - camGalacticM[0],
                gp[1] - camGalacticM[1],
                gp[2] - camGalacticM[2],
              ];
              const isMajor =
                g.id === 'm31' ||
                g.id === 'lmc' ||
                g.id === 'smc' ||
                g.id === 'm33' ||
                g.id === 'virgo-cluster' ||
                g.id === 'coma-cluster' ||
                g.id === 'perseus-cluster' ||
                g.id === 'fornax-cluster';
              candidates.push({
                id: g.id,
                text: g.name,
                subtext:
                  g.distanceMpc < 1
                    ? `${Math.round(g.distanceMpc * 1000)} kpc`
                    : `${g.distanceMpc.toFixed(1)} Mpc`,
                relM,
                priority: isMajor ? 88 : 50,
                accent: g.group === 'galaxy-clusters' ? '#fbbf24' : '#c4b5fd',
              });
            }
          }

          candidates.sort((a, b) => b.priority - a.priority);

          const accepted: ProjectedLabel[] = [];
          for (const c of candidates) {
            if (accepted.length >= 16) break;
            const len = lengthVec3d(c.relM);
            if (len <= 0) continue;
            // Normalize direction to unit sphere distance 100 so projection never overflows float32
            const scale = 100 / len;
            _projTmp.set(c.relM[0] * scale, c.relM[1] * scale, c.relM[2] * scale);
            _projTmp.project(camera);
            if (_projTmp.z > 1 || _projTmp.z < -1) continue;

            const sx = (_projTmp.x * 0.5 + 0.5) * vpW;
            const sy = (-_projTmp.y * 0.5 + 0.5) * vpH;
            if (sx < 40 || sx > vpW - 40 || sy < 48 || sy > vpH - 110) continue;

            // Non-overlapping declutter box check (108px x 26px)
            const overlaps = accepted.some(
              (other) => Math.abs(other.x - sx) < 108 && Math.abs(other.y - sy) < 26
            );
            if (overlaps) continue;

            accepted.push({
              id: c.id,
              text: c.text,
              subtext: c.subtext,
              x: Math.round(sx),
              y: Math.round(sy),
              accent: c.accent,
            });
          }
          setLabels(accepted);
        } else {
          setLabels((prev) => (prev.length > 0 ? [] : prev));
        }
      }

      // Resolve any pending awaitNextFrame() waiters after render & HUD sync complete
      if (frameWaiters.length > 0) {
        const pending = frameWaiters.splice(0, frameWaiters.length);
        for (const resolve of pending) resolve();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        const fpsCap = graphicsRef.current.fpsCap;
        if (fpsCap > 0 && fpsCap < 60) {
          timeoutId = window.setTimeout(() => {
            if (!isDisposed && !isTabHidden) frameId = requestAnimationFrame(tick);
          }, Math.max(8, Math.round(1000 / fpsCap)));
        } else {
          frameId = requestAnimationFrame(tick);
        }
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      delete window.__OBSERVATORY_API__;
      if (starWorker) {
        starWorker.terminate();
        starWorker = null;
      }
      if (resizeObserver) resizeObserver.disconnect();
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);

      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [startFlyTo]);

  // Keep reference to computeCatalogNodeGalacticPosM warm for catalog fly-to
  const minLogDistM = useMemo(
    () => Math.log10(EARTH_MEAN_RADIUS_M + MIN_SURFACE_ALTITUDE_M),
    []
  );
  const maxLogDistM = useMemo(() => Math.log10(MAX_UNIVERSE_RADIUS_M), []);
  void computeCatalogNodeGalacticPosM;
  void getExtragalacticRadiusM;

  const hudCopy = UNIVERSE_HUD_COPY[lang];

  const handleClickLabel = useCallback(
    (labelId: string) => {
      if (labelId.startsWith('star:')) return;
      const resolved = resolveUniverseTarget(
        labelId,
        camCtrlRef.current.ephemeris,
        memoriesRef.current
      );
      startFlyTo(resolved);
      const mappedMem = EPHEMERIS_ID_TO_MEMORY_ID[labelId];
      if (mappedMem) {
        onSelectNodeRef.current(mappedMem);
      } else if (labelId === 'BLACK_HOLE_CORE') {
        onSelectNodeRef.current('BLACK_HOLE_CORE');
      }
    },
    [startFlyTo]
  );

  return (
    <div
      ref={stageRef}
      data-testid="universe-stage"
      className="relative w-full h-full overflow-hidden bg-[#05060a] select-none"
    >
      {/* WebGL2 Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Asset Streaming Loading Progress Bar */}
      {!tilesReady && (
        <div
          data-testid="tile-loading-banner"
          className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-[8px] bg-[#111318]/95 border border-white/[0.10] px-3 py-1.5 flex items-center gap-2.5 shadow-xl"
        >
          <span className="text-[11px] font-medium text-[#d1d5db]">
            {hudCopy.loadingTiles}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-[#1f2430] overflow-hidden">
            <div
              className="h-full bg-[#0082fb] transition-all duration-200"
              style={{ width: `${Math.max(12, Math.round(tileLoadProgress * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* WebGL Context Lost Recovery Banner */}
      {contextLost && (
        <div
          role="alert"
          className="absolute inset-0 z-40 flex items-center justify-center bg-[#090a0d]/90"
        >
          <div className="rounded-[12px] bg-[#111318] border border-white/[0.12] px-5 py-3 text-sm font-medium text-[#f3f4f6]">
            {hudCopy.webglRestoring}
          </div>
        </div>
      )}

      {/* Decluttered Non-Overlapping 3D Projected Labels */}
      {showLabels && labels.length > 0 && (
        <div
          aria-hidden="false"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        >
          {labels.map((lbl) => (
            <button
              key={lbl.id}
              type="button"
              onClick={() => handleClickLabel(lbl.id)}
              style={{
                transform: `translate3d(${lbl.x}px, ${lbl.y}px, 0) translate(-50%, -120%)`,
              }}
              className="pointer-events-auto absolute top-0 left-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#0b0d12]/85 hover:bg-[#171b24] border border-white/[0.12] text-[10px] font-medium text-[#f3f4f6] shadow-md whitespace-nowrap transition-colors"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: lbl.accent }}
              />
              <span>{lbl.text}</span>
              {lbl.subtext && (
                <span className="font-mono text-[9px] text-[#9ca3af]">
                  {lbl.subtext}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Top-Right Ephemeris Time Panel */}
      <TimeControlPanel
        lang={lang}
        simDateMs={simDateMs}
        isPlaying={isTimePlaying}
        speedSecondsPerSec={timeSpeedSecPerSec}
        moonPhaseFraction={moonPhaseFraction}
        onTogglePlay={() => setIsTimePlaying((p) => !p)}
        onChangeSpeed={setTimeSpeedSecPerSec}
        onResetToNow={handleResetToNow}
      />

      {/* Bottom Multi-Scale HUD: Scale Bar, Distance Readout, Provenance, Presets, Layer Toggles */}
      <ScaleHudBar
        lang={lang}
        activePreset={activePreset}
        dominantLayer={dominantLayer}
        targetName={targetName}
        distanceLabel={distanceLabel}
        isSurfaceAltitude={isSurfaceAltitude}
        scaleBar={scaleBar}
        provenance={provenance}
        logDistM={logDistM}
        minLogDistM={minLogDistM}
        maxLogDistM={maxLogDistM}
        onLogZoomSliderChange={handleLogZoomSliderChange}
        onZoomStep={handleZoomStep}
        onSelectPreset={handleSelectPreset}
        showOrbits={showOrbitRings}
        onToggleOrbits={onToggleOrbitRings}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((v) => !v)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        showGalaxies={showGalaxies}
        onToggleGalaxies={() => setShowGalaxies((v) => !v)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion((v) => !v)}
      />
    </div>
  );
}
