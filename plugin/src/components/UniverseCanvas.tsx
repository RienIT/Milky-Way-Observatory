'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button } from '@heroui/react';
import {
  AU_IN_METERS,
  EARTH_MEAN_RADIUS_M,
  KILOPARSEC_METERS,
  LIGHT_YEAR_METERS,
  MEGAPARSEC_METERS,
  PARSEC_METERS,
  SOLAR_SYSTEM_BODIES,
} from '../lib/constants';
import {
  computeSolarSystemEphemeris,
  computeSunDirectionFromBody,
  eclipticJ2000ToGalactic,
  sampleOrbitCurveHelioM,
  SolarSystemEphemerisSnapshot,
  SUN_GALACTOCENTRIC_THREE_M,
} from '../lib/ephemeris';
import {
  EXTRAGALACTIC_CATALOG,
  getExtragalacticPosThreeM,
  getExtragalacticRadiusM,
} from '../lib/extragalactic-catalog';
import {
  createBackgroundStarfieldMaterial,
  createClusterHaloMaterial,
  createCometTailMaterial,
  createDeepSpaceDomeMaterial,
  createEarthCloudsMaterial,
  createEarthHighResMaterial,
  createFermiBubblesMaterial,
  createGalaxySpriteMaterial,
  createMemoryClusterNodeMaterial,
  createMilkyWayParametricDiskMaterial,
  createMilkyWayStarfieldMaterial,
  createPhotonPulseMaterial,
  createPlanetAtmosphereMaterial,
  createPlanetRingMaterial,
  createRealisticPlanetMaterial,
  createSgrACoreGlowBillboardMaterial,
  createSolarCoronaBillboardMaterial,
  createTrajectoryTrailMaterial,
  createVolumetricBlackHoleMaterial,
} from '../lib/cosmic-shaders';
import {
  computeLunarShadowOnEarth,
  computePhotonPulseRadiusM,
  SOLAR_ECLIPSE_PRESETS,
  SolarEclipsePreset,
  WavelengthBandId,
} from '../lib/astrophysics-science';
import { getLocalizedNode } from '../lib/celestial-translations';
import { GraphicsSettings } from '../lib/graphics-settings';
import { LanguageCode, UI_STRINGS } from '../lib/i18n';
import {
  MEMORY_TRAIL_SEGMENTS,
  MemoryClusterSimulation,
  packMemoryTrailsToLineSegments,
  SOLAR_TRAIL_SEGMENTS,
  SolarOrbitalWakeTracker,
} from '../lib/memory-dynamics';
import { BLACK_HOLE_DISK_ROLL } from '../lib/memory-logic';
import {
  ALL_CATEGORIES,
  ConstellationLink,
  getPlanetSpecForNode,
  MemoryNode,
} from '../lib/memory-types';
import { generateNasaMilkyWayKpcStarfield } from '../lib/milky-way';
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
  galacticToThreeUp,
  interpolateLogDistance,
  lengthVec3d,
  MAX_UNIVERSE_RADIUS_M,
  MIN_SURFACE_ALTITUDE_M,
  SCALE_LAYERS,
  ScaleBarReadout,
  ScaleLayerId,
  UniversePosition,
  Vec3d,
} from '../lib/scale-engine';
import { getScientificAstrometry, SimulationScaleMode } from '../lib/scientific-catalog';
import { ScalePresetId, UNIVERSE_HUD_COPY } from '../lib/universe-i18n';
import {
  computeCatalogNodeGalacticPosM,
  computeCatalogObjectPosition,
  computeCatalogObjectRadiusM,
  EPHEMERIS_ID_TO_MEMORY_ID,
  isCatalogDirectRenderedId,
  MEMORY_ID_TO_EPHEMERIS_ID,
  resolveScalePreset,
  resolveUniverseTarget,
  SGRA_DISPLAY_METERS_PER_SHADER_UNIT,
} from '../lib/universe-targets';
import {
  advanceBootState,
  BootStageId,
  BootState,
  createInitialBootState,
  isBootReady,
} from '../lib/boot-sequence';
import ObservatoryBootOverlay from './ObservatoryBootOverlay';
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
  assetBasePath?: string;
  onBootReady?: () => void;
  wavelengthBand?: WavelengthBandId;
  onChangeWavelengthBand?: (band: WavelengthBandId) => void;
  cinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
  initialSimDateMs?: number;
  initialLogDistM?: number;
  externalEclipseRequest?: { preset: SolarEclipsePreset; seq: number } | null;
  externalPhotonTrigger?: number;
  externalScalePresetRequest?: { preset: ScalePresetId; seq: number } | null;
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
      setWavelengthBand: (band: WavelengthBandId) => void;
      jumpToEclipse: (presetId?: string) => void;
      triggerPhotonPulse: (active?: boolean) => void;
      setCinemaMode: (enabled: boolean) => void;
      captureSnapshot: () => Promise<string | null>;
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
        wavelengthBand: WavelengthBandId;
        eclipseActive: boolean;
        photonPulseActive: boolean;
        cinemaMode: boolean;
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
  matchedIds,
  isFilterActive,
  selectedId,
  onSelectNode,
  orbitSpeedMultiplier,
  showOrbitRings,
  onToggleOrbitRings,
  showMilkyWayDisk,
  scaleMode,
  graphicsSettings,
  cameraResetTrigger,
  lang,
  assetBasePath = '',
  onBootReady,
  wavelengthBand: controlledWavelengthBand,
  onChangeWavelengthBand,
  cinemaMode: controlledCinemaMode,
  onToggleCinemaMode,
  initialSimDateMs,
  initialLogDistM,
  externalEclipseRequest,
  externalPhotonTrigger,
  externalScalePresetRequest,
}: UniverseCanvasProps) {
  const onBootReadyRef = useRef(onBootReady);
  useEffect(() => {
    onBootReadyRef.current = onBootReady;
  }, [onBootReady]);
  const normalizedAssetBase = assetBasePath.replace(/\/+$/, '');
  const assetBaseRef = useRef(normalizedAssetBase);
  useEffect(() => {
    assetBaseRef.current = normalizedAssetBase;
  }, [normalizedAssetBase]);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Layer toggles & UX preferences
  const [showTrails, setShowTrails] = useState(true);
  const [clusterMode, setClusterMode] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showGalaxies, setShowGalaxies] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Phase 1 & 2 state: Multi-Wavelength, Cinema Mode, Lunar Eclipse, Photon Pulse, Targeting Reticle
  const [internalWavelengthBand, setInternalWavelengthBand] = useState<WavelengthBandId>('optical');
  const wavelengthBand = controlledWavelengthBand ?? internalWavelengthBand;
  const setWavelengthBandState = useCallback(
    (next: WavelengthBandId) => {
      setInternalWavelengthBand(next);
      onChangeWavelengthBand?.(next);
    },
    [onChangeWavelengthBand]
  );

  const [internalCinemaMode, setInternalCinemaMode] = useState(false);
  const cinemaMode = controlledCinemaMode ?? internalCinemaMode;
  const toggleCinemaModeState = useCallback(() => {
    if (onToggleCinemaMode) {
      onToggleCinemaMode();
    } else {
      setInternalCinemaMode((v) => !v);
    }
  }, [onToggleCinemaMode]);
  const setCinemaModeDirect = useCallback(
    (enabled: boolean) => {
      if (onToggleCinemaMode) {
        if ((controlledCinemaMode ?? false) !== enabled) {
          onToggleCinemaMode();
        }
      } else {
        setInternalCinemaMode(enabled);
      }
    },
    [controlledCinemaMode, onToggleCinemaMode]
  );

  const [eclipseActive, setEclipseActive] = useState(false);
  const [photonPulseActive, setPhotonPulseActive] = useState(false);
  const [photonElapsedSec, setPhotonElapsedSec] = useState(0);
  const [photonRadiusM, setPhotonRadiusM] = useState(0);
  const [reticlePos, setReticlePos] = useState<{ x: number; y: number } | null>(null);

  // Simulation ephemeris time state (starts at real current UTC time or deep-linked timestamp)
  const [simDateMs, setSimDateMs] = useState<number>(() => initialSimDateMs ?? Date.now());
  const [isTimePlaying, setIsTimePlaying] = useState<boolean>(true);
  const [timeSpeedSecPerSec, setTimeSpeedSecPerSec] = useState<number>(3_600); // 1 hour/sec default so Earth rotation & orbits feel smooth and natural

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
  const [bootState, setBootState] = useState<BootState>(() => createInitialBootState('webgl'));
  const [isBootOverlayMounted, setIsBootOverlayMounted] = useState<boolean>(true);

  const bootReady = isBootReady(bootState);

  useEffect(() => {
    if (!bootReady) return;
    const timer = window.setTimeout(() => {
      setIsBootOverlayMounted(false);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [bootReady]);

  // Refs for zero-teardown render loop
  const memoriesRef = useRef(memories);
  const matchedIdsRef = useRef(matchedIds);
  const isFilterActiveRef = useRef(isFilterActive);
  const orbitSpeedRef = useRef(orbitSpeedMultiplier);
  const selectedIdRef = useRef<string | null>(null);
  const hasMountedSelectionRef = useRef(false);
  const langRef = useRef(lang);
  const onSelectNodeRef = useRef(onSelectNode);
  const showOrbitsRef = useRef(showOrbitRings);
  const showTrailsRef = useRef(showTrails);
  const clusterModeRef = useRef(clusterMode);
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
  const wavelengthBandRef = useRef<WavelengthBandId>(wavelengthBand);
  const cinemaModeRef = useRef<boolean>(cinemaMode);
  const toggleCinemaRef = useRef(toggleCinemaModeState);
  const setCinemaDirectRef = useRef(setCinemaModeDirect);
  const setWavelengthRef = useRef(setWavelengthBandState);
  const photonPulseActiveRef = useRef(photonPulseActive);
  const photonElapsedSecRef = useRef(0);
  const eclipseActiveRef = useRef(false);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);
  useEffect(() => {
    matchedIdsRef.current = matchedIds;
  }, [matchedIds]);
  useEffect(() => {
    isFilterActiveRef.current = isFilterActive;
  }, [isFilterActive]);
  useEffect(() => {
    orbitSpeedRef.current = orbitSpeedMultiplier;
  }, [orbitSpeedMultiplier]);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);
  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);
  useEffect(() => {
    showOrbitsRef.current = showOrbitRings;
  }, [showOrbitRings]);
  useEffect(() => {
    showTrailsRef.current = showTrails;
  }, [showTrails]);
  useEffect(() => {
    clusterModeRef.current = clusterMode;
  }, [clusterMode]);
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
  useEffect(() => {
    wavelengthBandRef.current = wavelengthBand;
  }, [wavelengthBand]);
  useEffect(() => {
    cinemaModeRef.current = cinemaMode;
  }, [cinemaMode]);
  useEffect(() => {
    toggleCinemaRef.current = toggleCinemaModeState;
  }, [toggleCinemaModeState]);
  useEffect(() => {
    setCinemaDirectRef.current = setCinemaModeDirect;
  }, [setCinemaModeDirect]);
  useEffect(() => {
    setWavelengthRef.current = setWavelengthBandState;
  }, [setWavelengthBandState]);
  useEffect(() => {
    photonPulseActiveRef.current = photonPulseActive;
  }, [photonPulseActive]);

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
      const nextSelectedId =
        preset === 'sgr-a'
          ? 'BLACK_HOLE_CORE'
          : preset === 'earth'
            ? (EPHEMERIS_ID_TO_MEMORY_ID.earth ?? null)
            : preset === 'solar-system'
              ? (EPHEMERIS_ID_TO_MEMORY_ID.sun ?? null)
              : null;
      // Record selection before notifying parent so the selectedId effect does not overwrite this preset's framing distance
      selectedIdRef.current = nextSelectedId;
      onSelectNodeRef.current(nextSelectedId);
    },
    [startFlyTo]
  );

  // Sync external selectedId (sidebar clicks / TopSearchBar Black Hole Lab / Catalog "View in 3D" / plugin initialTarget)
  useEffect(() => {
    const isInitialMount = !hasMountedSelectionRef.current;
    hasMountedSelectionRef.current = true;
    const prev = selectedIdRef.current;
    selectedIdRef.current = selectedId;
    if (!selectedId || (!isInitialMount && selectedId === prev)) return;

    const resolved = resolveUniverseTarget(
      selectedId,
      camCtrlRef.current.ephemeris,
      memoriesRef.current,
      langRef.current
    );
    const nextPreset: ScalePresetId | null =
      selectedId === 'BLACK_HOLE_CORE' || selectedId === 'astro-bh-04'
        ? 'sgr-a'
        : MEMORY_ID_TO_EPHEMERIS_ID[selectedId] === 'earth'
          ? 'earth'
          : null;
    queueMicrotask(() => {
      setActivePreset(nextPreset);
      setTargetName(resolved.label);
      setProvenance(resolved.provenance);
      setIsSurfaceAltitude(resolved.showSurfaceAltitude);
      setLogDistM(Math.log10(resolved.idealDistM));
    });
    // Jump immediately when mounting directly onto a selected body (e.g., from Planet Catalog -> View in 3D)
    startFlyTo(resolved, undefined, isInitialMount);
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

  const handleJumpToEclipse = useCallback(
    (preset: SolarEclipsePreset, instant = false) => {
      simDateMsRef.current = preset.dateMs;
      setSimDateMs(preset.dateMs);
      setIsTimePlaying(true);
      setTimeSpeedSecPerSec(1);

      const ephemNow = computeSolarSystemEphemeris(new Date(preset.dateMs));
      camCtrlRef.current.ephemeris = ephemNow;
      const earthPos = ephemNow.bodies.earth?.helioPosM;
      const moonPos = ephemNow.bodies.moon?.helioPosM;
      const sunDir = earthPos
        ? computeSunDirectionFromBody(earthPos)
        : ([1, 0.2, 0.3] as Vec3d);

      // Compute exact lunar umbral strike vector on Earth's surface so the shadow sits prominently in view
      let aimDir: Vec3d = sunDir;
      if (earthPos && moonPos) {
        const shadow = computeLunarShadowOnEarth(earthPos, moonPos);
        const mRel = shadow.moonRelEarthRadii;
        const proj = mRel[0] * sunDir[0] + mRel[1] * sunDir[1] + mRel[2] * sunDir[2];
        const px = mRel[0] - sunDir[0] * proj;
        const py = mRel[1] - sunDir[1] * proj;
        const pz = mRel[2] - sunDir[2] * proj;
        const p2 = px * px + py * py + pz * pz;
        const alongSun = Math.sqrt(Math.max(0.08, 1.0 - Math.min(0.92, p2)));
        const sx = px + sunDir[0] * alongSun;
        const sy = py + sunDir[1] * alongSun;
        const sz = pz + sunDir[2] * alongSun;
        // Blend 75% shadow strike point + 25% sub-solar point for dramatic sunlit Earth + dark umbra framing
        const bx = sx * 0.75 + sunDir[0] * 0.25;
        const by = sy * 0.75 + sunDir[1] * 0.25;
        const bz = sz * 0.75 + sunDir[2] * 0.25;
        const bLen = Math.hypot(bx, by, bz) || 1;
        aimDir = [bx / bLen, by / bLen, bz / bLen];
      }

      const idealYaw = Math.atan2(aimDir[0], aimDir[2]);
      const idealPitch = Math.max(
        -1.25,
        Math.min(1.25, Math.asin(Math.max(-0.96, Math.min(0.96, aimDir[1]))))
      );

      const resolved = resolveScalePreset('earth', ephemNow, memoriesRef.current);
      resolved.idealYaw = idealYaw;
      resolved.idealPitch = idealPitch;
      resolved.idealDistM = EARTH_MEAN_RADIUS_M * 3.15;
      setActivePreset('earth');
      startFlyTo(resolved, resolved.idealDistM, instant);
    },
    [startFlyTo]
  );

  const handleTogglePhotonPulse = useCallback(
    (forceState?: boolean) => {
      const next = forceState !== undefined ? forceState : !photonPulseActiveRef.current;
      photonPulseActiveRef.current = next;
      setPhotonPulseActive(next);
      if (next) {
        photonElapsedSecRef.current = 0;
        setPhotonElapsedSec(0);
        setPhotonRadiusM(0);
        // Frame the inner Solar System nicely if user isn't already viewing planetary scale
        const ctrl = camCtrlRef.current;
        if (ctrl.distM < 0.35 * AU_IN_METERS || ctrl.distM > 140 * AU_IN_METERS) {
          const resolved = resolveScalePreset('solar-system', ctrl.ephemeris, memoriesRef.current);
          resolved.idealDistM = 3.2 * AU_IN_METERS;
          setActivePreset('solar-system');
          startFlyTo(resolved, resolved.idealDistM);
        }
        setIsTimePlaying(true);
      }
    },
    [startFlyTo]
  );

  const handleJumpToEclipseRef = useRef(handleJumpToEclipse);
  useEffect(() => {
    handleJumpToEclipseRef.current = handleJumpToEclipse;
  }, [handleJumpToEclipse]);
  const handleTogglePhotonRef = useRef(handleTogglePhotonPulse);
  useEffect(() => {
    handleTogglePhotonRef.current = handleTogglePhotonPulse;
  }, [handleTogglePhotonPulse]);

  // Honor optional URL deep-link initial zoom distance once on mount
  useEffect(() => {
    if (typeof initialLogDistM !== 'number' || !Number.isFinite(initialLogDistM)) return;
    const ctrl = camCtrlRef.current;
    ctrl.distM = Math.max(
      ctrl.targetRadiusM + MIN_SURFACE_ALTITUDE_M,
      Math.min(MAX_UNIVERSE_RADIUS_M, Math.pow(10, initialLogDistM))
    );
  }, [initialLogDistM]);

  // Honor external Command Palette actions cleanly on next paint frame
  useEffect(() => {
    if (!externalEclipseRequest) return;
    const id = window.requestAnimationFrame(() => {
      handleJumpToEclipse(externalEclipseRequest.preset);
    });
    return () => window.cancelAnimationFrame(id);
  }, [externalEclipseRequest, handleJumpToEclipse]);

  useEffect(() => {
    if (!externalPhotonTrigger) return;
    const id = window.requestAnimationFrame(() => {
      handleTogglePhotonPulse(true);
    });
    return () => window.cancelAnimationFrame(id);
  }, [externalPhotonTrigger, handleTogglePhotonPulse]);

  useEffect(() => {
    if (!externalScalePresetRequest) return;
    const id = window.requestAnimationFrame(() => {
      handleSelectPreset(externalScalePresetRequest.preset);
    });
    return () => window.cancelAnimationFrame(id);
  }, [externalScalePresetRequest, handleSelectPreset]);

  // Main WebGL2 4-Pass Floating-Origin Multi-Scale Engine (yielded across paint frames to prevent UI freeze)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let frameId = 0;
    let timeoutId = 0;
    let isTabHidden = document.visibilityState === 'hidden';
    const cleanups: (() => void)[] = [];
    const activeYieldCancels = new Set<() => void>();

    const reportBootStage = (stage: BootStageId) => {
      if (isDisposed) return;
      setBootState((prev) => advanceBootState(prev, stage));
    };

    const yieldToPaint = (): Promise<void> =>
      new Promise<void>((resolve) => {
        if (isDisposed) {
          resolve();
          return;
        }
        let rId = 0;
        let tId = 0;
        const finish = () => {
          activeYieldCancels.delete(cancel);
          resolve();
        };
        const cancel = () => {
          cancelAnimationFrame(rId);
          clearTimeout(tId);
          activeYieldCancels.delete(cancel);
          resolve();
        };
        activeYieldCancels.add(cancel);
        rId = requestAnimationFrame(() => {
          tId = window.setTimeout(finish, 0);
        });
      });

    const bootEngine = async () => {
      // Yield 1 paint frame immediately so ObservatoryBootOverlay paints crisply before heavy WebGL2 setup
      reportBootStage('webgl');
      await yieldToPaint();
      if (isDisposed) return;

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
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      container.appendChild(renderer.domElement);
      cleanups.push(() => {
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      });

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

    const computeTargetPixelRatio = (gs: GraphicsSettings, adaptFactor = 1.0): number => {
      if (isSoftwareGl) {
        return Math.max(0.5, Math.min(1.0, gs.resolutionScale));
      }
      // Allow real 1.25x / 1.5x (RTX 3050-4050) / 2.0x (Ultra) supersampling even on 1080p monitors!
      const desired = Math.max(0.5, Math.min(2.0, gs.resolutionScale));
      return Math.max(0.5, desired * adaptFactor);
    };

    const computeLensingTargetDims = (w: number, h: number, gs: GraphicsSettings) => {
      const mult = isSoftwareGl
        ? 0.65
        : gs.resolutionScale >= 1.5 || gs.blackHoleRaySteps >= 96
          ? Math.min(1.5, gs.resolutionScale)
          : 0.75;
      return {
        lw: Math.max(256, Math.min(2560, Math.round(w * mult))),
        lh: Math.max(256, Math.min(1600, Math.round(h * mult))),
      };
    };

    renderer.setPixelRatio(computeTargetPixelRatio(graphicsRef.current, 1.0));

    // Shared perspective camera updated per pass with tight near/far clip planes
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1e6);

    // Track disposable resources for 100% leak-free cleanup
    const disposables: { dispose: () => void }[] = [];
    const track = <T extends { dispose: () => void }>(item: T): T => {
      disposables.push(item);
      return item;
    };
    cleanups.push(() => {
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      }
    });

    // =========================================================================
    // PASS 1: Deep Sky & Extragalactic Scene (1 unit = 1 Mpc)
    // =========================================================================
    const extragalacticScene = new THREE.Scene();

    const skyDomeGeo = track(new THREE.SphereGeometry(2800, 32, 24));
    const skyDomeMat = track(createDeepSpaceDomeMaterial());
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    extragalacticScene.add(skyDomeMesh);

    const buildBgStarsGeometry = (count: number): THREE.BufferGeometry => {
      const bgPos = new Float32Array(count * 3);
      const bgCol = new Float32Array(count * 3);
      const bgSize = new Float32Array(count);
      const bgPhase = new Float32Array(count);
      let seed = 4219;
      const nextRnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let i = 0; i < count; i += 1) {
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
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(bgCol, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(bgSize, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(bgPhase, 1));
      return g;
    };

    // Background distant starfield shell (all-sky celestial sphere; scales up to 36k on RTX/Ultra)
    let activeBgStarCount = isSoftwareGl
      ? 6000
      : Math.min(36000, Math.max(4000, Math.round(graphicsRef.current.starfieldCount * 0.3)));
    let bgGeo = buildBgStarsGeometry(activeBgStarCount);
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
    cleanups.push(() => {
      try {
        bgGeo.dispose();
      } catch {
        // ignore
      }
    });

    // Yield before heavy Pass 2 Milky Way starfield & gravitational cluster simulation
    reportBootStage('milky-way');
    await yieldToPaint();
    if (isDisposed) return;

    // =========================================================================
    // PASS 2: Galactic Scene (1 unit = 1 kpc)
    // =========================================================================
    const galacticScene = new THREE.Scene();
    const galacticRoot = new THREE.Group();
    galacticScene.add(galacticRoot);

    // Continuous double-sided NASA/JPL-Caltech (R. Hurt) barred-spiral disk + absorbing dust lanes (illustrative: true)
    const mwDiskGeo = track(new THREE.PlaneGeometry(44, 44, 1, 1));
    mwDiskGeo.rotateX(-Math.PI / 2);
    const mwDiskMat = track(createMilkyWayParametricDiskMaterial());
    const mwDiskMesh = new THREE.Mesh(mwDiskGeo, mwDiskMat);
    mwDiskMesh.renderOrder = 1;
    galacticRoot.add(mwDiskMesh);

    const buildMilkyWayStarsGeometry = (budget: number): THREE.BufferGeometry => {
      const mwRaw = generateNasaMilkyWayKpcStarfield(budget);
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(mwRaw.positions, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(mwRaw.colors, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(mwRaw.sizes, 1));
      g.setAttribute('aPhase', new THREE.BufferAttribute(mwRaw.phases, 1));
      return g;
    };

    const computeMwDensityScale = (count: number) =>
      Math.max(0.28, Math.min(0.82, Math.sqrt(11000 / Math.max(6000, count)) * 0.72));

    // Volumetric Milky Way starfield in exact kpc aligned 1:1 with NASA's barred-spiral disk (up to 120k RTX / 140k Ultra)
    let activeMwStarCount = isSoftwareGl
      ? 12000
      : Math.min(140000, Math.max(6000, graphicsRef.current.starfieldCount));
    let mwStarsGeo = buildMilkyWayStarsGeometry(activeMwStarCount);
    const mwStarsMat = track(createMilkyWayStarfieldMaterial());
    mwStarsMat.uniforms.uDensityScale.value = computeMwDensityScale(activeMwStarCount);
    const mwStarsPoints = new THREE.Points(mwStarsGeo, mwStarsMat);
    mwStarsPoints.renderOrder = 2;
    galacticRoot.add(mwStarsPoints);

    // Volumetric 3D Fermi Bubbles & eROSITA X-Ray Shock Lobes (+/-8.5 kpc above & below Sgr A*)
    const fermiGroup = new THREE.Group();
    const fermiGeo = track(new THREE.SphereGeometry(1, 44, 32));
    const fermiMat = track(createFermiBubblesMaterial());
    const fermiNorth = new THREE.Mesh(fermiGeo, fermiMat);
    fermiNorth.scale.set(3.6, 4.35, 3.6);
    fermiNorth.position.set(0, 4.35, 0);
    fermiNorth.renderOrder = 3;
    const fermiSouth = new THREE.Mesh(fermiGeo, fermiMat);
    fermiSouth.scale.set(3.6, 4.35, 3.6);
    fermiSouth.position.set(0, -4.35, 0);
    fermiSouth.rotation.x = Math.PI;
    fermiSouth.renderOrder = 3;
    fermiGroup.add(fermiNorth);
    fermiGroup.add(fermiSouth);
    fermiGroup.visible = false;
    galacticRoot.add(fermiGroup);

    // Smoothly damped spectral band weights [Optical, Infrared, Radio 21cm, X-Ray/Gamma]
    const currentBandWeights = new THREE.Vector4(1, 0, 0, 0);

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

    // -------------------------------------------------------------------------
    // Dynamic Moving Memory Nodes: Fading Orbital Trajectory Trails &
    // Category-Based Gravitational Star Clusters (1 unit = 1 kpc)
    // -------------------------------------------------------------------------
    const MAX_MEMORY_DYN_NODES = 128;
    const memorySim = new MemoryClusterSimulation(memoriesRef.current);
    memorySim.prewarm(110, clusterModeRef.current, 0.05);
    let lastDynMemoriesRef: MemoryNode[] | null = memoriesRef.current;
    let clusterHaloBlend = clusterModeRef.current ? 1.0 : 0.0;
    let latestClusterMetrics = memorySim.computeClusterMetrics();

    // 1. Soft volumetric category star-cluster halos (up to 12 categories)
    const maxClusters = Math.max(12, ALL_CATEGORIES.length);
    const clusterHaloPosArr = new Float32Array(maxClusters * 3);
    const clusterHaloColArr = new Float32Array(maxClusters * 3);
    const clusterHaloRadArr = new Float32Array(maxClusters);
    const clusterHaloGeo = track(new THREE.BufferGeometry());
    clusterHaloGeo.setAttribute('position', new THREE.BufferAttribute(clusterHaloPosArr, 3));
    clusterHaloGeo.setAttribute('aColor', new THREE.BufferAttribute(clusterHaloColArr, 3));
    clusterHaloGeo.setAttribute('aRadiusKpc', new THREE.BufferAttribute(clusterHaloRadArr, 1));
    clusterHaloGeo.setDrawRange(0, 0);
    const clusterHaloMat = track(createClusterHaloMaterial());
    const clusterHaloPoints = new THREE.Points(clusterHaloGeo, clusterHaloMat);
    clusterHaloPoints.renderOrder = 3;
    clusterHaloPoints.frustumCulled = false;
    galacticRoot.add(clusterHaloPoints);

    // 2. Smooth fading orbital & clustering trajectory trails (1 single batched draw call!)
    const maxTrailVertices = MAX_MEMORY_DYN_NODES * MEMORY_TRAIL_SEGMENTS * 2;
    const memTrailPosArr = new Float32Array(maxTrailVertices * 3);
    const memTrailColArr = new Float32Array(maxTrailVertices * 3);
    const memTrailProgArr = new Float32Array(maxTrailVertices);
    const memTrailGeo = track(new THREE.BufferGeometry());
    memTrailGeo.setAttribute('position', new THREE.BufferAttribute(memTrailPosArr, 3));
    memTrailGeo.setAttribute('aColor', new THREE.BufferAttribute(memTrailColArr, 3));
    memTrailGeo.setAttribute('aProgress', new THREE.BufferAttribute(memTrailProgArr, 1));
    memTrailGeo.setDrawRange(0, 0);
    const memTrailMat = track(createTrajectoryTrailMaterial());
    const memTrailLines = new THREE.LineSegments(memTrailGeo, memTrailMat);
    memTrailLines.renderOrder = 4;
    memTrailLines.frustumCulled = false;
    galacticRoot.add(memTrailLines);

    // 3. Glowing navigable moving memory star-nodes at each trail's leading head
    const memNodePosArr = new Float32Array(MAX_MEMORY_DYN_NODES * 3);
    const memNodeColArr = new Float32Array(MAX_MEMORY_DYN_NODES * 3);
    const memNodeSizeArr = new Float32Array(MAX_MEMORY_DYN_NODES);
    const memNodeHighlightArr = new Float32Array(MAX_MEMORY_DYN_NODES);
    const memNodeAlphaArr = new Float32Array(MAX_MEMORY_DYN_NODES);
    const memNodeGeo = track(new THREE.BufferGeometry());
    memNodeGeo.setAttribute('position', new THREE.BufferAttribute(memNodePosArr, 3));
    memNodeGeo.setAttribute('aColor', new THREE.BufferAttribute(memNodeColArr, 3));
    memNodeGeo.setAttribute('aSize', new THREE.BufferAttribute(memNodeSizeArr, 1));
    memNodeGeo.setAttribute('aHighlight', new THREE.BufferAttribute(memNodeHighlightArr, 1));
    memNodeGeo.setAttribute('aAlpha', new THREE.BufferAttribute(memNodeAlphaArr, 1));
    memNodeGeo.setDrawRange(0, 0);
    const memNodeMat = track(createMemoryClusterNodeMaterial());
    const memNodePoints = new THREE.Points(memNodeGeo, memNodeMat);
    memNodePoints.renderOrder = 5;
    memNodePoints.frustumCulled = false;
    galacticRoot.add(memNodePoints);

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
        const res = await fetch(`${assetBaseRef.current}/data/stars-manifest.json`);
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
      starWorker = new Worker(`${assetBaseRef.current}/workers/star-tile-worker.js`);
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
        urls: [
          `${assetBaseRef.current}/data/stars-tier0.bin`,
          `${assetBaseRef.current}/data/stars-tier1.bin`,
        ],
      });
    } catch {
      queueMicrotask(() => {
        if (!isDisposed) setTilesReady(true);
      });
    }
    cleanups.push(() => {
      if (starWorker) {
        starWorker.terminate();
        starWorker = null;
      }
      try {
        mwStarsGeo.dispose();
      } catch {
        // ignore
      }
    });

    // Yield before Pass 4A Solar System ephemeris, planets & belts
    reportBootStage('ephemeris');
    await yieldToPaint();
    if (isDisposed) return;

    // =========================================================================
    // PASS 4A: Planetary / Solar System Scene (1 unit = 1,000 km = 1e6 m)
    // =========================================================================
    const planetaryScene = new THREE.Scene();
    let activePlanetSegs = isSoftwareGl
      ? 32
      : Math.max(20, graphicsRef.current.planetSegments);
    let unitSphereGeo = new THREE.SphereGeometry(
      1,
      activePlanetSegs,
      Math.round(activePlanetSegs * 0.75)
    );

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
      ringInner?: number;
      ringOuter?: number;
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
        const ringSegs = activePlanetSegs >= 80 ? 160 : 96;
        const ringGeo = new THREE.RingGeometry(vis.ringInner, vis.ringOuter, ringSegs);
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
        ringInner: vis.ringInner,
        ringOuter: vis.ringOuter,
      });
    }

    // Real Ecliptic Main Asteroid Belt (2.18-3.26 AU) & Kuiper Belt (30.5-48.0 AU)
    const buildSolarBeltGeometry = (totalCount: number): THREE.BufferGeometry => {
      const g = new THREE.BufferGeometry();
      if (totalCount <= 0) {
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
        g.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(0), 3));
        g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(0), 1));
        return g;
      }
      const pos = new Float32Array(totalCount * 3);
      const col = new Float32Array(totalCount * 3);
      const size = new Float32Array(totalCount);
      const unitsPerAu = AU_IN_METERS / SCALE_LAYERS.planetary.metersPerUnit;
      const mainCount = Math.round(totalCount * 0.58);
      let s = 918273;
      const rnd = () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
      };
      for (let i = 0; i < totalCount; i += 1) {
        const isMain = i < mainCount;
        const rAu = isMain
          ? 2.18 + Math.pow(rnd(), 0.92) * 1.08
          : 30.5 + Math.pow(rnd(), 1.15) * 17.5;
        const theta = rnd() * Math.PI * 2;
        const inclSpan = isMain ? 0.14 : 0.24;
        const zAu = (rnd() + rnd() - 1.0) * rAu * inclSpan;
        const eclAu: Vec3d = [rAu * Math.cos(theta), rAu * Math.sin(theta), zAu];
        const threeAu = galacticToThreeUp(eclipticJ2000ToGalactic(eclAu));
        pos[i * 3 + 0] = threeAu[0] * unitsPerAu;
        pos[i * 3 + 1] = threeAu[1] * unitsPerAu;
        pos[i * 3 + 2] = threeAu[2] * unitsPerAu;

        if (isMain) {
          // Rocky silicate & carbonaceous chondrite tints
          const t = rnd();
          col[i * 3 + 0] = 0.72 + t * 0.20;
          col[i * 3 + 1] = 0.65 + t * 0.17;
          col[i * 3 + 2] = 0.56 + t * 0.14;
          size[i] = 1.05 + Math.pow(rnd(), 2.8) * 2.1;
        } else {
          // Icy Trans-Neptunian / Kuiper Belt objects
          const t = rnd();
          col[i * 3 + 0] = 0.64 + t * 0.18;
          col[i * 3 + 1] = 0.74 + t * 0.16;
          col[i * 3 + 2] = 0.88 + t * 0.12;
          size[i] = 1.15 + Math.pow(rnd(), 2.5) * 2.2;
        }
      }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
      g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      return g;
    };

    let activeBeltCount = isSoftwareGl
      ? Math.min(2000, graphicsRef.current.asteroidBeltCount)
      : graphicsRef.current.asteroidBeltCount;
    let solarBeltGeo = buildSolarBeltGeometry(activeBeltCount);
    const solarBeltMat = track(
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          uOpacity: { value: 0.72 },
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
            float dist = max(1000.0, -mvPosition.z);
            gl_PointSize = clamp(aSize * uPixelRatio * (18.0 / pow(dist * 0.00001, 0.24)), 1.0, 4.2);
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
            float core = exp(-r * r * 5.2);
            float a = clamp(core * uOpacity, 0.0, 0.9);
            gl_FragColor = vec4(vColor * a, a);
            #include <logdepthbuf_fragment>
          }
        `,
      })
    );
    const solarBeltPoints = new THREE.Points(solarBeltGeo, solarBeltMat);
    planetaryScene.add(solarBeltPoints);

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
      const ptsM = sampleOrbitCurveHelioM(id, initialDate, 128);
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

    // Smooth Fading Orbital Trajectory Wakes for Moving Solar System Planets & Moon (1 batched draw call)
    const solarWakeTracker = new SolarOrbitalWakeTracker();
    const maxSolarTrailVerts = 12 * SOLAR_TRAIL_SEGMENTS * 2;
    const solarTrailPosArr = new Float32Array(maxSolarTrailVerts * 3);
    const solarTrailColArr = new Float32Array(maxSolarTrailVerts * 3);
    const solarTrailProgArr = new Float32Array(maxSolarTrailVerts);
    const solarTrailGeo = track(new THREE.BufferGeometry());
    solarTrailGeo.setAttribute('position', new THREE.BufferAttribute(solarTrailPosArr, 3));
    solarTrailGeo.setAttribute('aColor', new THREE.BufferAttribute(solarTrailColArr, 3));
    solarTrailGeo.setAttribute('aProgress', new THREE.BufferAttribute(solarTrailProgArr, 1));
    solarTrailGeo.setDrawRange(0, 0);
    const solarTrailMat = track(createTrajectoryTrailMaterial());
    const solarTrailLines = new THREE.LineSegments(solarTrailGeo, solarTrailMat);
    solarTrailLines.renderOrder = 2;
    solarTrailLines.frustumCulled = false;
    planetaryScene.add(solarTrailLines);

    // Speed-of-Light Photon Pulse Wavefront Sphere + Equatorial Ring (c = 299,792,458 m/s)
    const photonGroup = new THREE.Group();
    const photonSphereGeo = track(new THREE.SphereGeometry(1, 44, 28));
    const photonSphereMat = track(createPhotonPulseMaterial());
    const photonSphereMesh = new THREE.Mesh(photonSphereGeo, photonSphereMat);
    photonSphereMesh.renderOrder = 5;
    photonGroup.add(photonSphereMesh);

    const photonRingGeo = track(new THREE.RingGeometry(0.985, 1.015, 128));
    photonRingGeo.rotateX(-Math.PI / 2);
    const photonRingMat = track(
      new THREE.MeshBasicMaterial({
        color: '#E88B38',
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    const photonRingMesh = new THREE.Mesh(photonRingGeo, photonRingMat);
    // Align equatorial photon ring with the real J2000 Ecliptic plane (~60.2 deg tilt from Galactic plane)
    const eclPole = galacticToThreeUp(eclipticJ2000ToGalactic([0, 0, 1]));
    const eclQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(eclPole[0], eclPole[1], eclPole[2]).normalize()
    );
    photonRingMesh.quaternion.copy(eclQuat);
    photonRingMesh.renderOrder = 6;
    photonGroup.add(photonRingMesh);
    photonGroup.visible = false;
    planetaryScene.add(photonGroup);
    cleanups.push(() => {
      try {
        unitSphereGeo.dispose();
        solarBeltGeo.dispose();
        for (const entry of planetEntries.values()) {
          entry.ringMesh?.geometry.dispose();
        }
      } catch {
        // ignore
      }
    });

    // Yield before Pass 4A-2 catalog models, Pass 4B relativistic black hole & first frame shader compile
    reportBootStage('shaders');
    await yieldToPaint();
    if (isDisposed) return;

    // =========================================================================
    // PASS 4A-2: Full 3D Procedural Models for ALL Catalog Objects
    // (All 8 non-Sun Gaia DR3 stars, all 15 NASA/JWST exoplanets, all 5 extra
    //  Solar System small bodies & comets, plus any user-added custom worlds!)
    // =========================================================================
    const catalogScene = new THREE.Scene();
    const sharedCatalogCoronaGeo = track(new THREE.PlaneGeometry(1, 1));
    const sharedCometIonGeo = track(new THREE.ConeGeometry(1.75, 13.5, 28, 1, true));
    sharedCometIonGeo.translate(0, -13.5 * 0.5, 0);
    const sharedCometDustGeo = track(new THREE.ConeGeometry(3.0, 9.6, 28, 1, true));
    sharedCometDustGeo.translate(0, -9.6 * 0.5, 0);

    interface CatalogMeshEntry {
      id: string;
      node: MemoryNode;
      position: UniversePosition;
      radiusM: number;
      isStar: boolean;
      isHeliocentric: boolean;
      hasCometTail: boolean;
      shapeScale: [number, number, number];
      spinRate: number;
      group: THREE.Group;
      axialGroup: THREE.Group;
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
      atmoMesh?: THREE.Mesh;
      atmoMat?: THREE.ShaderMaterial;
      ringMesh?: THREE.Mesh;
      ringMat?: THREE.ShaderMaterial;
      ringInner?: number;
      ringOuter?: number;
      coronaMesh?: THREE.Mesh;
      coronaMat?: THREE.ShaderMaterial;
      cometTailPivot?: THREE.Group;
      cometIonMat?: THREE.ShaderMaterial;
      cometDustMat?: THREE.ShaderMaterial;
      accentColor: string;
    }

    const catalogEntries = new Map<string, CatalogMeshEntry>();
    let lastSyncedMemoriesRef: MemoryNode[] | null = null;
    const _antiSunVec = new THREE.Vector3();
    const _negYAxis = new THREE.Vector3(0, -1, 0);
    const _exoLightDir = new THREE.Vector3(0.76, 0.34, 0.55).normalize();

    const createCatalogMeshEntry = (node: MemoryNode): CatalogMeshEntry => {
      const spec = getPlanetSpecForNode(node);
      const astro = getScientificAstrometry(node.id);
      const position = computeCatalogObjectPosition(node);
      const radiusM = computeCatalogObjectRadiusM(node);
      const isStar = node.id.startsWith('star-') || astro.objectClass === 'star';
      const isHeliocentric = position.anchor === 'heliocentric';
      const hasCometTail = Boolean(astro.hasCometTail);

      let seed = 0;
      for (let i = 0; i < node.id.length; i += 1) {
        seed = (seed * 31 + node.id.charCodeAt(i)) % 997;
      }

      const shapeScale: [number, number, number] = astro.irregularShape
        ? [astro.irregularShape[0], astro.irregularShape[1], astro.irregularShape[2]]
        : node.id === 'star-vega'
          ? [1.12, 0.9, 1.12]
          : [1, 1, 1];

      const group = new THREE.Group();
      const axialGroup = new THREE.Group();
      axialGroup.rotation.z = spec.axialTiltRad || 0.14;
      group.add(axialGroup);

      const atmoColor = new THREE.Color(spec.atmosphereColorHex || '#38bdf8');
      const mat = createRealisticPlanetMaterial(
        spec.archetypeId,
        seed + (spec.axialTiltRad || 0) * 19.7,
        atmoColor
      );

      // Apply current detail boost immediately so RTX/Ultra detail is live from frame 1
      const initGs = graphicsRef.current;
      if (mat.uniforms.uDetailBoost) {
        mat.uniforms.uDetailBoost.value = isSoftwareGl
          ? 0.25
          : initGs.tier === 'rtx' || initGs.tier === 'ultra' || initGs.planetSegments >= 80
            ? 1.0
            : initGs.tier === 'high'
              ? 0.55
              : 0.0;
      }

      const mesh = new THREE.Mesh(unitSphereGeo, mat);
      mesh.scale.set(shapeScale[0], shapeScale[1], shapeScale[2]);
      axialGroup.add(mesh);

      // Atmospheric Fresnel halo for stars, planets with atmospheres, and comets
      let atmoMesh: THREE.Mesh | undefined;
      let atmoMat: THREE.ShaderMaterial | undefined;
      const hasAtmosphere =
        isStar ||
        hasCometTail ||
        (spec.archetypeId !== 7 && spec.archetypeId !== 10);
      if (hasAtmosphere) {
        atmoMat = createPlanetAtmosphereMaterial(atmoColor);
        atmoMesh = new THREE.Mesh(unitSphereGeo, atmoMat);
        const haloScale = isStar ? 1.24 : hasCometTail ? 1.09 : 1.055;
        atmoMesh.scale.set(
          shapeScale[0] * haloScale,
          shapeScale[1] * haloScale,
          shapeScale[2] * haloScale
        );
        atmoMesh.visible = isStar || hasCometTail || initGs.showAtmosphereAndNebulae;
        axialGroup.add(atmoMesh);
      }

      // Multi-band planetary rings (e.g., J1407b's colossal 37-band ring system) or Vega's JWST debris disk
      let ringMesh: THREE.Mesh | undefined;
      let ringMat: THREE.ShaderMaterial | undefined;
      let ringInner: number | undefined;
      let ringOuter: number | undefined;
      if (spec.hasRings && spec.ringOuterRadius > 1.05) {
        ringInner = Math.max(1.12, spec.ringInnerRadius || 1.35);
        ringOuter = Math.max(ringInner + 0.35, spec.ringOuterRadius);
        const ringSegs = activePlanetSegs >= 80 ? 160 : 96;
        const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, ringSegs);
        ringGeo.rotateX(-Math.PI / 2);
        ringMat = createPlanetRingMaterial(
          new THREE.Color(spec.ringColorHex || spec.atmosphereColorHex || '#fde68a'),
          ringInner,
          ringOuter
        );
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        axialGroup.add(ringMesh);
      }

      // Radiant spectral corona billboard for all stars + luminous coma halo for comets
      let coronaMesh: THREE.Mesh | undefined;
      let coronaMat: THREE.ShaderMaterial | undefined;
      if (isStar || hasCometTail) {
        coronaMat = createSolarCoronaBillboardMaterial(atmoColor);
        coronaMesh = new THREE.Mesh(sharedCatalogCoronaGeo, coronaMat);
        coronaMesh.renderOrder = 4;
        group.add(coronaMesh);
      }

      // Dual volumetric ion & dust tail cones for active comets (1P/Halley)
      let cometTailPivot: THREE.Group | undefined;
      let cometIonMat: THREE.ShaderMaterial | undefined;
      let cometDustMat: THREE.ShaderMaterial | undefined;
      if (hasCometTail) {
        cometTailPivot = new THREE.Group();
        cometIonMat = createCometTailMaterial(new THREE.Color('#38bdf8'));
        const ionMesh = new THREE.Mesh(sharedCometIonGeo, cometIonMat);
        ionMesh.renderOrder = 3;
        cometTailPivot.add(ionMesh);

        cometDustMat = createCometTailMaterial(new THREE.Color('#dbeafe'));
        const dustMesh = new THREE.Mesh(sharedCometDustGeo, cometDustMat);
        dustMesh.rotation.z = 0.14;
        dustMesh.renderOrder = 2;
        cometTailPivot.add(dustMesh);

        group.add(cometTailPivot);
      }

      group.visible = false;
      catalogScene.add(group);

      return {
        id: node.id,
        node,
        position,
        radiusM,
        isStar,
        isHeliocentric,
        hasCometTail,
        shapeScale,
        spinRate:
          node.id === 'star-vega'
            ? 0.36
            : isStar
              ? 0.08
              : hasCometTail || astro.irregularShape
                ? 0.24
                : 0.14,
        group,
        axialGroup,
        mesh,
        mat,
        atmoMesh,
        atmoMat,
        ringMesh,
        ringMat,
        ringInner,
        ringOuter,
        coronaMesh,
        coronaMat,
        cometTailPivot,
        cometIonMat,
        cometDustMat,
        accentColor: spec.atmosphereColorHex || '#38bdf8',
      };
    };

    const disposeCatalogEntry = (entry: CatalogMeshEntry) => {
      catalogScene.remove(entry.group);
      entry.mat.dispose();
      entry.atmoMat?.dispose();
      if (entry.ringMesh) {
        entry.ringMesh.geometry.dispose();
      }
      entry.ringMat?.dispose();
      entry.coronaMat?.dispose();
      entry.cometIonMat?.dispose();
      entry.cometDustMat?.dispose();
    };

    const syncCatalogEntries = (list: MemoryNode[]) => {
      if (list === lastSyncedMemoriesRef) return;
      lastSyncedMemoriesRef = list;
      const activeIds = new Set<string>();
      for (const node of list) {
        if (!isCatalogDirectRenderedId(node.id)) continue;
        activeIds.add(node.id);
        if (!catalogEntries.has(node.id)) {
          catalogEntries.set(node.id, createCatalogMeshEntry(node));
        }
      }
      for (const [id, entry] of catalogEntries.entries()) {
        if (!activeIds.has(id)) {
          disposeCatalogEntry(entry);
          catalogEntries.delete(id);
        }
      }
    };

    syncCatalogEntries(memoriesRef.current);
    cleanups.push(() => {
      try {
        for (const entry of catalogEntries.values()) {
          disposeCatalogEntry(entry);
        }
        catalogEntries.clear();
      } catch {
        // ignore
      }
    });

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

    const initLensDims = computeLensingTargetDims(width, height, graphicsRef.current);
    const lensingTarget = track(
      new THREE.WebGLRenderTarget(initLensDims.lw, initLensDims.lh, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
      })
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
      if (e.code === 'KeyH' && !e.repeat) {
        e.preventDefault();
        toggleCinemaRef.current();
        return;
      }
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
      const ld = computeLensingTargetDims(w, h, graphicsRef.current);
      lensingTarget.setSize(ld.lw, ld.lh);
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
    cleanups.push(() => {
      delete window.__OBSERVATORY_API__;
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
    });

    const frameWaiters: (() => void)[] = [];
    const snapshotWaiters: ((dataUrl: string | null) => void)[] = [];
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
      setWavelengthBand: (band) => {
        wavelengthBandRef.current = band;
        setWavelengthRef.current(band);
        // Snap immediately when invoked programmatically for deterministic visual captures
        currentBandWeights.set(
          band === 'optical' ? 1 : 0,
          band === 'infrared' ? 1 : 0,
          band === 'radio' ? 1 : 0,
          band === 'xray' ? 1 : 0
        );
        forceHudSync = true;
      },
      jumpToEclipse: (presetId) => {
        const target =
          SOLAR_ECLIPSE_PRESETS.find((p) => p.id === presetId) ?? SOLAR_ECLIPSE_PRESETS[0];
        handleJumpToEclipseRef.current(target, true);
        forceHudSync = true;
      },
      triggerPhotonPulse: (active = true) => {
        handleTogglePhotonRef.current(active);
        if (active) {
          photonElapsedSecRef.current = 420; // Start visibly mid-inner-system when invoked programmatically
        }
        forceHudSync = true;
      },
      setCinemaMode: (enabled) => {
        setCinemaDirectRef.current(enabled);
        forceHudSync = true;
      },
      captureSnapshot: () =>
        new Promise<string | null>((resolve) => {
          snapshotWaiters.push(resolve);
        }),
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
        const activeFly = ctrl.flyTo && ctrl.flyTo.active ? ctrl.flyTo : null;
        const reportedTargetId = activeFly ? activeFly.targetId : ctrl.targetId;
        const reportedLogDistM = activeFly
          ? Math.log10(Math.max(1, activeFly.endDistM))
          : Math.log10(Math.max(1, actualDistM));
        return {
          targetId: reportedTargetId,
          dominantLayer: weights.dominant,
          distM: actualDistM,
          altitudeM: Math.max(0, actualDistM - ctrl.targetRadiusM),
          logDistM: reportedLogDistM,
          freeFlightOffsetM: ctrl.freeFlightOffsetM,
          camFinite:
            Number.isFinite(actualDistM) &&
            Number.isFinite(ctrl.yaw) &&
            Number.isFinite(ctrl.pitch),
          simDateIso: new Date(simDateMsRef.current).toISOString(),
          starsLoaded: ctrl.starsLoaded,
          fps: ctrl.fps,
          wavelengthBand: wavelengthBandRef.current,
          eclipseActive: eclipseActiveRef.current,
          photonPulseActive: photonPulseActiveRef.current,
          cinemaMode: cinemaModeRef.current,
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
    let lastAppliedGfxSig = '';
    let firstFrameCommitted = false;
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

      // Live graphics preset/settings synchronization (instant SSAA, tessellation, star/belt density, detail boost)
      const activeGs = graphicsRef.current;
      const nextGfxSig = `${activeGs.tier}|${activeGs.resolutionScale}|${activeGs.starfieldCount}|${activeGs.asteroidBeltCount}|${activeGs.planetSegments}|${activeGs.blackHoleRaySteps}|${activeGs.showAtmosphereAndNebulae}`;
      if (nextGfxSig !== lastAppliedGfxSig) {
        lastAppliedGfxSig = nextGfxSig;
        adaptiveResFactor = 1.0;

        // 1. Live render pixel ratio (1.5x SSAA on RTX 3050-4050, 2.0x on Ultra)
        renderer.setPixelRatio(computeTargetPixelRatio(activeGs, 1.0));
        const cw = container?.clientWidth || width;
        const ch = container?.clientHeight || height;
        const ld = computeLensingTargetDims(cw, ch, activeGs);
        lensingTarget.setSize(ld.lw, ld.lh);

        // 2. Live planet sphere & planetary ring tessellation upgrade
        const nextSegs = isSoftwareGl ? 32 : Math.max(20, activeGs.planetSegments);
        if (nextSegs !== activePlanetSegs) {
          const prevSphere = unitSphereGeo;
          activePlanetSegs = nextSegs;
          unitSphereGeo = new THREE.SphereGeometry(
            1,
            activePlanetSegs,
            Math.round(activePlanetSegs * 0.75)
          );
          const nextRingSegs = activePlanetSegs >= 80 ? 160 : 96;
          for (const entry of planetEntries.values()) {
            entry.mesh.geometry = unitSphereGeo;
            if (entry.cloudMesh) entry.cloudMesh.geometry = unitSphereGeo;
            if (entry.atmoMesh) entry.atmoMesh.geometry = unitSphereGeo;
            if (entry.ringMesh && entry.ringInner && entry.ringOuter) {
              const oldRing = entry.ringMesh.geometry;
              const newRing = new THREE.RingGeometry(
                entry.ringInner,
                entry.ringOuter,
                nextRingSegs
              );
              newRing.rotateX(-Math.PI / 2);
              entry.ringMesh.geometry = newRing;
              oldRing.dispose();
            }
          }
          for (const entry of catalogEntries.values()) {
            entry.mesh.geometry = unitSphereGeo;
            if (entry.atmoMesh) entry.atmoMesh.geometry = unitSphereGeo;
            if (entry.ringMesh && entry.ringInner && entry.ringOuter) {
              const oldRing = entry.ringMesh.geometry;
              const newRing = new THREE.RingGeometry(
                entry.ringInner,
                entry.ringOuter,
                nextRingSegs
              );
              newRing.rotateX(-Math.PI / 2);
              entry.ringMesh.geometry = newRing;
              oldRing.dispose();
            }
          }
          prevSphere.dispose();
        }

        // 3. Live Milky Way & deep-sky starfield density rebuild
        const nextMwStars = isSoftwareGl
          ? 12000
          : Math.min(140000, Math.max(6000, activeGs.starfieldCount));
        if (nextMwStars !== activeMwStarCount) {
          const prevMw = mwStarsGeo;
          activeMwStarCount = nextMwStars;
          mwStarsGeo = buildMilkyWayStarsGeometry(activeMwStarCount);
          mwStarsPoints.geometry = mwStarsGeo;
          mwStarsMat.uniforms.uDensityScale.value = computeMwDensityScale(activeMwStarCount);
          prevMw.dispose();
        }

        const nextBgStars = isSoftwareGl
          ? 6000
          : Math.min(36000, Math.max(4000, Math.round(activeGs.starfieldCount * 0.3)));
        if (nextBgStars !== activeBgStarCount) {
          const prevBg = bgGeo;
          activeBgStarCount = nextBgStars;
          bgGeo = buildBgStarsGeometry(activeBgStarCount);
          bgStarsPoints.geometry = bgGeo;
          prevBg.dispose();
        }

        // 4. Live Solar System Main Asteroid Belt & Kuiper Belt rebuild
        const nextBeltCount = isSoftwareGl
          ? Math.min(2000, activeGs.asteroidBeltCount)
          : activeGs.asteroidBeltCount;
        if (nextBeltCount !== activeBeltCount) {
          const prevBelt = solarBeltGeo;
          activeBeltCount = nextBeltCount;
          solarBeltGeo = buildSolarBeltGeometry(activeBeltCount);
          solarBeltPoints.geometry = solarBeltGeo;
          prevBelt.dispose();
        }

        // 5. Shader micro-relief boost (Earth alpine relief, crisp clouds, planet eddies/craters)
        const detailBoost = isSoftwareGl
          ? 0.25
          : activeGs.tier === 'rtx' ||
              activeGs.tier === 'ultra' ||
              activeGs.planetSegments >= 80
            ? 1.0
            : activeGs.tier === 'high'
              ? 0.55
              : 0.0;
        for (const entry of planetEntries.values()) {
          if (entry.mat.uniforms.uDetailBoost) {
            entry.mat.uniforms.uDetailBoost.value = detailBoost;
          }
          if (entry.cloudMat?.uniforms.uDetailBoost) {
            entry.cloudMat.uniforms.uDetailBoost.value = detailBoost;
          }
          if (entry.cloudMesh) {
            entry.cloudMesh.visible = activeGs.showAtmosphereAndNebulae;
          }
          if (entry.atmoMesh && entry.id !== 'sun') {
            entry.atmoMesh.visible = activeGs.showAtmosphereAndNebulae;
          }
        }
        for (const entry of catalogEntries.values()) {
          if (entry.mat.uniforms.uDetailBoost) {
            entry.mat.uniforms.uDetailBoost.value = detailBoost;
          }
          if (entry.atmoMesh && !entry.isStar && !entry.hasCometTail) {
            entry.atmoMesh.visible = activeGs.showAtmosphereAndNebulae;
          }
        }
      }

      if (!isSoftwareGl && fpsSamples.length >= 25) {
        if (avgFps < 28 && adaptiveResFactor > 0.65) {
          adaptiveResFactor = Math.max(0.65, adaptiveResFactor - 0.05);
          renderer.setPixelRatio(
            computeTargetPixelRatio(graphicsRef.current, adaptiveResFactor)
          );
        } else if (avgFps > 54 && adaptiveResFactor < 1.0) {
          adaptiveResFactor = Math.min(1.0, adaptiveResFactor + 0.02);
          renderer.setPixelRatio(
            computeTargetPixelRatio(graphicsRef.current, adaptiveResFactor)
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
        // Smoothly damp 4-band multi-wavelength weights [Optical, Infrared, Radio 21cm, X-Ray/Gamma]
        const activeBand = wavelengthBandRef.current;
        const dampDt = Math.min(0.05, Math.max(0.008, rawDt));
        currentBandWeights.x = THREE.MathUtils.damp(currentBandWeights.x, activeBand === 'optical' ? 1 : 0, 6.0, dampDt);
        currentBandWeights.y = THREE.MathUtils.damp(currentBandWeights.y, activeBand === 'infrared' ? 1 : 0, 6.0, dampDt);
        currentBandWeights.z = THREE.MathUtils.damp(currentBandWeights.z, activeBand === 'radio' ? 1 : 0, 6.0, dampDt);
        currentBandWeights.w = THREE.MathUtils.damp(currentBandWeights.w, activeBand === 'xray' ? 1 : 0, 6.0, dampDt);

        const nebulaFactor = graphicsRef.current.showAtmosphereAndNebulae ? 1.0 : 0.18;
        mwDiskMat.uniforms.uOpacity.value = mwOpacity * 0.96 * bulgeProximityFade * nebulaFactor;
        mwDiskMat.uniforms.uTime.value = elapsedSec;
        mwDiskMat.uniforms.uBandWeights.value.copy(currentBandWeights);

        // Keep Milky Way stars visible inside the Galactic Bulge even at 184 pc!
        const starFloor = insideMilkyWay ? 0.52 : 0;
        mwStarsMat.uniforms.uOpacity.value = Math.max(mwOpacity * 0.86, starFloor);
        mwStarsMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        mwStarsMat.uniforms.uBandWeights.value.copy(currentBandWeights);

        // Volumetric 3D Fermi Bubbles above & below Sagittarius A* (vivid in X-Ray/Gamma, faint ghost in Radio)
        const fermiOpacity =
          Math.max(currentBandWeights.w * 0.92, currentBandWeights.z * 0.14) *
          mwOpacity *
          bulgeProximityFade;
        fermiGroup.visible = fermiOpacity > 0.01 && !nearSgrACloseup;
        if (fermiGroup.visible) {
          fermiMat.uniforms.uTime.value = elapsedSec;
          fermiMat.uniforms.uOpacity.value = fermiOpacity;
        }

        galacticGridGroup.visible = showGridRef.current && weights.galactic > 0.12;

        // Subtle warm galactic nucleus glint (mwDiskMat already renders the creamy-gold NASA bar & core!)
        const farCoreFade = Math.max(0, Math.min(1, (distToSgrAKpc - 1.8) / 2.2));
        sgrACoreBillboard.visible = !nearSgrACloseup && mwOpacity > 0.05 && farCoreFade > 0.01;
        sgrACoreBillboard.lookAt(
          camGalacticM[0] / KILOPARSEC_METERS,
          camGalacticM[1] / KILOPARSEC_METERS,
          camGalacticM[2] / KILOPARSEC_METERS
        );
        sgrACoreMat.uniforms.uOpacity.value = mwOpacity * 0.24 * farCoreFade;
        sgrACoreMat.uniforms.uCloseFactor.value = 0.0;
        sgrACoreMat.uniforms.uTime.value = elapsedSec;

        // Update moving memory nodes, fading orbital trails, & gravitational category clusters
        if (lastDynMemoriesRef !== memoriesRef.current) {
          memorySim.syncMemories(memoriesRef.current);
          lastDynMemoriesRef = memoriesRef.current;
        }
        const isGalacticClusterVisible =
          !nearSgrACloseup &&
          distToSgrAKpc > 0.45 &&
          (weights.galactic > 0.04 || weights.extragalactic > 0.05);

        // Advance N-body gravitational clustering & orbital trajectories smoothly every frame
        if (isGalacticClusterVisible || weights.galactic > 0.01) {
          memorySim.step({
            dtSec: Math.min(0.05, Math.max(0.008, rawDt)),
            clusteringEnabled: clusterModeRef.current,
            orbitalSpeedScale: Math.max(0.4, orbitSpeedRef.current || 1.0),
            reducedMotion: reducedMotionRef.current,
          });
          latestClusterMetrics = memorySim.computeClusterMetrics();
        }

        clusterHaloBlend = THREE.MathUtils.damp(
          clusterHaloBlend,
          clusterModeRef.current ? 1.0 : 0.0,
          4.5,
          Math.min(0.05, Math.max(0.008, rawDt))
        );

        const memOverlayAlpha = isGalacticClusterVisible
          ? Math.max(weights.galactic, weights.extragalactic * 0.65) *
            Math.max(0, Math.min(1, (distToSgrAKpc - 0.5) / 2.2))
          : 0;

        if (memOverlayAlpha > 0.01) {
          const activeNodes = memorySim.nodes;
          const nodeCount = Math.min(MAX_MEMORY_DYN_NODES, activeNodes.length);
          const filterActive = isFilterActiveRef.current;
          const matchedSet = matchedIdsRef.current;
          const curSelId = selectedIdRef.current;

          // Update moving memory star-nodes buffer in-place
          for (let i = 0; i < nodeCount; i += 1) {
            const nd = activeNodes[i];
            const i3 = i * 3;
            memNodePosArr[i3 + 0] = nd.posKpc[0];
            memNodePosArr[i3 + 1] = nd.posKpc[1];
            memNodePosArr[i3 + 2] = nd.posKpc[2];
            memNodeColArr[i3 + 0] = nd.colorRgb[0];
            memNodeColArr[i3 + 1] = nd.colorRgb[1];
            memNodeColArr[i3 + 2] = nd.colorRgb[2];
            memNodeSizeArr[i] = nd.starSize;
            memNodeHighlightArr[i] = curSelId === nd.id ? 1.0 : 0.0;
            memNodeAlphaArr[i] =
              !filterActive || matchedSet.has(nd.id) || curSelId === nd.id ? 1.0 : 0.16;
          }
          (memNodeGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
          (memNodeGeo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true;
          (memNodeGeo.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
          (memNodeGeo.getAttribute('aHighlight') as THREE.BufferAttribute).needsUpdate = true;
          (memNodeGeo.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true;
          memNodeGeo.setDrawRange(0, nodeCount);
          memNodePoints.visible = true;
          memNodeMat.uniforms.uTime.value = elapsedSec;
          memNodeMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
          memNodeMat.uniforms.uOpacity.value = Math.min(1.0, memOverlayAlpha * 1.15);

          // Update smooth fading orbital trajectory trails buffer in-place
          if (showTrailsRef.current) {
            const packedVerts = packMemoryTrailsToLineSegments(
              activeNodes,
              memTrailPosArr,
              memTrailColArr,
              memTrailProgArr,
              filterActive ? matchedSet : undefined,
              curSelId
            );
            (memTrailGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
            (memTrailGeo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true;
            (memTrailGeo.getAttribute('aProgress') as THREE.BufferAttribute).needsUpdate = true;
            memTrailGeo.setDrawRange(0, packedVerts);
            memTrailLines.visible = packedVerts > 0;
            memTrailMat.uniforms.uTime.value = elapsedSec;
            memTrailMat.uniforms.uOpacity.value = Math.min(0.95, memOverlayAlpha * 0.92);
          } else {
            memTrailLines.visible = false;
          }

          // Update soft volumetric category cluster halos
          if (clusterHaloBlend > 0.02 && latestClusterMetrics.clusters.length > 0) {
            const clusters = latestClusterMetrics.clusters;
            const cCount = Math.min(maxClusters, clusters.length);
            for (let c = 0; c < cCount; c += 1) {
              const cl = clusters[c];
              const c3 = c * 3;
              clusterHaloPosArr[c3 + 0] = cl.centroidKpc[0];
              clusterHaloPosArr[c3 + 1] = cl.centroidKpc[1];
              clusterHaloPosArr[c3 + 2] = cl.centroidKpc[2];
              clusterHaloColArr[c3 + 0] = cl.colorRgb[0];
              clusterHaloColArr[c3 + 1] = cl.colorRgb[1];
              clusterHaloColArr[c3 + 2] = cl.colorRgb[2];
              clusterHaloRadArr[c] = Math.max(1.35, Math.min(3.4, cl.rmsRadiusKpc * 1.75 + 0.85));
            }
            (clusterHaloGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
            (clusterHaloGeo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true;
            (clusterHaloGeo.getAttribute('aRadiusKpc') as THREE.BufferAttribute).needsUpdate = true;
            clusterHaloGeo.setDrawRange(0, cCount);
            clusterHaloPoints.visible = true;
            clusterHaloMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
            clusterHaloMat.uniforms.uOpacity.value = memOverlayAlpha * clusterHaloBlend * 0.92;
          } else {
            clusterHaloPoints.visible = false;
          }
        } else {
          memNodePoints.visible = false;
          memTrailLines.visible = false;
          clusterHaloPoints.visible = false;
        }

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
            const moonBody = ephem.bodies.moon;
            const lunarShadow =
              moonBody
                ? computeLunarShadowOnEarth(bodyState.helioPosM, moonBody.helioPosM)
                : null;
            eclipseActiveRef.current = Boolean(lunarShadow?.isActive);
            const ecActiveVal = lunarShadow?.isActive ? 1.0 : 0.0;
            const mRel = lunarShadow?.moonRelEarthRadii ?? [60, 0, 0];
            const sDist = (lunarShadow?.sunDistM ?? AU_IN_METERS) / EARTH_MEAN_RADIUS_M;

            entry.mat.uniforms.uSunDir.value.set(sunDir[0], sunDir[1], sunDir[2]);
            entry.mat.uniforms.uTime.value = elapsedSec;
            entry.mat.uniforms.uEclipseActive.value = ecActiveVal;
            entry.mat.uniforms.uMoonRelEarth.value.set(mRel[0], mRel[1], mRel[2]);
            entry.mat.uniforms.uSunDistEarth.value = sDist;
            if (entry.cloudMat) {
              entry.cloudMat.uniforms.uSunDir.value.set(sunDir[0], sunDir[1], sunDir[2]);
              entry.cloudMat.uniforms.uTime.value = elapsedSec;
              entry.cloudMat.uniforms.uEclipseActive.value = ecActiveVal;
              entry.cloudMat.uniforms.uMoonRelEarth.value.set(mRel[0], mRel[1], mRel[2]);
              entry.cloudMat.uniforms.uSunDistEarth.value = sDist;
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

        // Speed-of-Light Photon Pulse wavefront (c = 299,792,458 m/s) expanding from the Sun
        if (photonPulseActiveRef.current) {
          const clockMult = !isTimePlayingRef.current
            ? 0
            : timeSpeedRef.current <= 1
              ? 1
              : Math.min(180, timeSpeedRef.current >= 86_400 ? 60 : timeSpeedRef.current);
          photonElapsedSecRef.current += rawDt * clockMult;
          const pRadM = computePhotonPulseRadiusM(photonElapsedSecRef.current);
          if (pRadM > 55 * AU_IN_METERS) {
            photonElapsedSecRef.current = 0;
          }
          const radiusUnits = Math.max(700, computePhotonPulseRadiusM(photonElapsedSecRef.current) / mpu);
          photonGroup.visible = true;
          photonGroup.position.set(sunGpuX, sunGpuY, sunGpuZ);
          photonGroup.scale.setScalar(radiusUnits);
          photonSphereMat.uniforms.uTime.value = elapsedSec;
          photonSphereMat.uniforms.uOpacity.value = Math.min(0.88, weights.planetary * 0.95);
          photonRingMat.opacity = Math.min(0.85, weights.planetary * 0.88);
        } else {
          photonGroup.visible = false;
        }

        // Position Main Asteroid Belt & Kuiper Belt around the Sun in true J2000 Ecliptic plane
        solarBeltPoints.visible = activeBeltCount > 0 && weights.planetary > 0.02;
        if (solarBeltPoints.visible) {
          solarBeltPoints.position.set(sunGpuX, sunGpuY, sunGpuZ);
          solarBeltMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
          solarBeltMat.uniforms.uOpacity.value = Math.min(0.85, weights.planetary * 0.82);
        }

        // Update real ephemeris orbit curves & smooth fading orbital wakes relative to floating-origin camera
        const earthRelM = computeRelativeMeters(
          { anchor: 'earth', offsetM: [0, 0, 0] },
          camPos,
          origins
        );
        orbitGroup.visible = showOrbitsRef.current;
        if (showOrbitsRef.current) {
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

        // Smooth fading orbital trajectory wakes behind moving Solar System planets & Moon
        if (showTrailsRef.current && weights.planetary > 0.02) {
          const wakes = solarWakeTracker.update(simDateMsRef.current, ephem);
          let vIdx = 0;
          for (let w = 0; w < wakes.length; w += 1) {
            const wake = wakes[w];
            const baseRel = wake.parentId === 'earth' ? earthRelM : sunRelM;
            const pts = wake.pointsM;
            const segs = pts.length - 1;
            const r = wake.colorRgb[0];
            const g = wake.colorRgb[1];
            const b = wake.colorRgb[2];
            for (let s = 0; s < segs; s += 1) {
              if (vIdx + 2 > maxSolarTrailVerts) break;
              const p0 = pts[s];
              const p1 = pts[s + 1];
              const i0 = vIdx * 3;
              solarTrailPosArr[i0 + 0] = (baseRel[0] + p0[0]) / mpu;
              solarTrailPosArr[i0 + 1] = (baseRel[1] + p0[1]) / mpu;
              solarTrailPosArr[i0 + 2] = (baseRel[2] + p0[2]) / mpu;
              solarTrailColArr[i0 + 0] = r;
              solarTrailColArr[i0 + 1] = g;
              solarTrailColArr[i0 + 2] = b;
              solarTrailProgArr[vIdx] = s / segs;

              const i1 = (vIdx + 1) * 3;
              solarTrailPosArr[i1 + 0] = (baseRel[0] + p1[0]) / mpu;
              solarTrailPosArr[i1 + 1] = (baseRel[1] + p1[1]) / mpu;
              solarTrailPosArr[i1 + 2] = (baseRel[2] + p1[2]) / mpu;
              solarTrailColArr[i1 + 0] = r;
              solarTrailColArr[i1 + 1] = g;
              solarTrailColArr[i1 + 2] = b;
              solarTrailProgArr[vIdx + 1] = (s + 1) / segs;

              vIdx += 2;
            }
          }
          (solarTrailGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
          (solarTrailGeo.getAttribute('aColor') as THREE.BufferAttribute).needsUpdate = true;
          (solarTrailGeo.getAttribute('aProgress') as THREE.BufferAttribute).needsUpdate = true;
          solarTrailGeo.setDrawRange(0, vIdx);
          solarTrailLines.visible = vIdx > 0;
          solarTrailMat.uniforms.uTime.value = elapsedSec;
          solarTrailMat.uniforms.uOpacity.value = Math.min(0.95, weights.planetary * 0.95);
        } else {
          solarTrailLines.visible = false;
        }

        renderer.render(planetaryScene, camera);
      }

      // =====================================================================
      // PASS 4A-2: Dedicated Scale-Normalized 3D Catalog Objects Pass
      // Renders ALL 8 non-Sun Gaia DR3 stars, ALL 15 NASA/JWST exoplanets,
      // ALL 5 extra Solar System small bodies & comets, and custom AI worlds!
      // =====================================================================
      syncCatalogEntries(memoriesRef.current);
      let renderedCatalogId = '';
      {
        const visibleCatalog: {
          entry: CatalogMeshEntry;
          relM: Vec3d;
          distM: number;
          opacity: number;
        }[] = [];

        for (const entry of catalogEntries.values()) {
          const isActiveTarget = ctrl.targetId === entry.id;
          // Exact float64 displacement with zero cancellation jitter when actively inspecting!
          const relM: Vec3d = isActiveTarget
            ? [-camRelTargetM[0], -camRelTargetM[1], -camRelTargetM[2]]
            : computeRelativeMeters(entry.position, camPos, origins);
          const distM = lengthVec3d(relM);
          const maxVisDist = entry.isStar
            ? Math.max(entry.radiusM * 6000, 0.35 * LIGHT_YEAR_METERS)
            : entry.hasCometTail
              ? entry.radiusM * 3200
              : entry.radiusM * 1800;

          if (distM <= maxVisDist) {
            const fadeStart = maxVisDist * 0.45;
            const opacity =
              distM <= fadeStart
                ? 1.0
                : Math.max(0, Math.min(1, (maxVisDist - distM) / (maxVisDist - fadeStart)));
            if (opacity > 0.01) {
              visibleCatalog.push({ entry, relM, distM, opacity });
            }
          }
          entry.group.visible = false;
        }

        if (visibleCatalog.length > 0) {
          // Normalize GPU units around the primary visible catalog body (~20 units radius)
          // so both 115 m 'Oumuamua and 630M km UY Scuti render with razor-sharp precision!
          const primary =
            visibleCatalog.find((v) => v.entry.id === ctrl.targetId) ?? visibleCatalog[0];
          const catalogMpu = Math.max(10, primary.entry.radiusM / 20);
          renderedCatalogId = primary.entry.id;

          renderer.clearDepth();
          camera.position.set(0, 0, 0);
          camera.lookAt(-orbitOff[0], -orbitOff[1], -orbitOff[2]);
          const primaryDistUnits = Math.max(1.0, primary.distM / catalogMpu);
          camera.near = Math.max(0.05, Math.min(1.5, primaryDistUnits * 0.005));
          camera.far = Math.max(25000, primaryDistUnits * 40);
          camera.updateProjectionMatrix();

          for (const item of visibleCatalog) {
            const { entry, relM, distM, opacity } = item;
            const gx = relM[0] / catalogMpu;
            const gy = relM[1] / catalogMpu;
            const gz = relM[2] / catalogMpu;
            const radiusUnits = entry.radiusM / catalogMpu;
            const distUnits = distM / catalogMpu;

            entry.group.visible = true;
            entry.group.position.set(gx, gy, gz);
            entry.axialGroup.scale.setScalar(radiusUnits);
            entry.mesh.rotation.y = elapsedSec * entry.spinRate;
            entry.group.updateMatrixWorld(true);

            // Compute authentic illumination position in normalized GPU space:
            // - Stars emit their own incandescent photosphere light
            // - Solar System small bodies are lit by our real Sun
            // - Interstellar exoplanets are lit by their local host star at cinematic 3/4 phase
            let lightX = gx + _exoLightDir.x * Math.max(2000, radiusUnits * 80);
            let lightY = gy + _exoLightDir.y * Math.max(2000, radiusUnits * 80);
            let lightZ = gz + _exoLightDir.z * Math.max(2000, radiusUnits * 80);

            if (entry.isStar) {
              // Offset straight up along +Y so Vega's debris disk is illuminated 360° with zero self-shadow
              lightX = gx;
              lightY = gy + Math.max(1500, radiusUnits * 60);
              lightZ = gz;
            } else if (entry.isHeliocentric) {
              const sunDir = computeSunDirectionFromBody(entry.position.offsetM);
              const lightRange = Math.max(2000, radiusUnits * 80);
              lightX = gx + sunDir[0] * lightRange;
              lightY = gy + sunDir[1] * lightRange;
              lightZ = gz + sunDir[2] * lightRange;

              if (entry.cometTailPivot) {
                // Point comet ion & dust tail directly away from the Sun
                _antiSunVec.set(-sunDir[0], -sunDir[1], -sunDir[2]).normalize();
                entry.cometTailPivot.quaternion.setFromUnitVectors(_negYAxis, _antiSunVec);
                entry.cometTailPivot.scale.setScalar(radiusUnits);
              }
            }

            entry.mat.uniforms.uTime.value = elapsedSec;
            entry.mat.uniforms.uOpacity.value = opacity;
            entry.mat.uniforms.uLightPos.value.set(lightX, lightY, lightZ);
            if (entry.isStar && entry.mat.uniforms.uHighlight) {
              entry.mat.uniforms.uHighlight.value = 0.72;
            }

            if (entry.atmoMat) {
              entry.atmoMat.uniforms.uOpacity.value = entry.isStar
                ? opacity * 1.25
                : entry.hasCometTail
                  ? opacity * 1.05
                  : opacity * 0.9;
              entry.atmoMat.uniforms.uLightPos.value.set(
                entry.isStar ? gx : lightX,
                entry.isStar ? gy : lightY,
                entry.isStar ? gz : lightZ
              );
            }

            if (entry.ringMat) {
              entry.ringMat.uniforms.uOpacity.value = entry.isStar
                ? opacity * 0.68
                : opacity * 0.94;
              entry.ringMat.uniforms.uPlanetRadius.value = radiusUnits;
              entry.ringMat.uniforms.uLightPos.value.set(lightX, lightY, lightZ);
            }

            if (entry.coronaMesh && entry.coronaMat) {
              entry.coronaMesh.lookAt(0, 0, 0);
              const coronaMult = entry.isStar ? 6.0 : 4.2;
              const coronaDiam = Math.max(
                radiusUnits * coronaMult,
                entry.isStar ? distUnits * 0.12 : radiusUnits * 4.2
              );
              entry.coronaMesh.scale.set(coronaDiam, coronaDiam, 1);
              entry.coronaMat.uniforms.uTime.value = elapsedSec;
              entry.coronaMat.uniforms.uOpacity.value = entry.isStar
                ? opacity * 1.05
                : opacity * 0.72;
            }

            if (entry.cometIonMat && entry.cometDustMat) {
              entry.cometIonMat.uniforms.uTime.value = elapsedSec;
              entry.cometIonMat.uniforms.uOpacity.value = opacity * 0.88;
              entry.cometDustMat.uniforms.uTime.value = elapsedSec * 0.7;
              entry.cometDustMat.uniforms.uOpacity.value = opacity * 0.52;
            }
          }

          renderer.render(catalogScene, camera);
        }
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
        setEclipseActive(eclipseActiveRef.current);
        if (photonPulseActiveRef.current) {
          setPhotonElapsedSec(photonElapsedSecRef.current);
          setPhotonRadiusM(computePhotonPulseRadiusM(photonElapsedSecRef.current));
        }

        if (stageRef.current) {
          stageRef.current.dataset.scaleLayer = weights.dominant;
          stageRef.current.dataset.targetId = ctrl.targetId;
          stageRef.current.dataset.camDistM = actualDistToTargetM.toExponential(3);
          stageRef.current.dataset.finite = Number.isFinite(actualDistToTargetM) ? 'true' : 'false';
          stageRef.current.dataset.starsLoaded = String(ctrl.starsLoaded);
          stageRef.current.dataset.fps = String(ctrl.fps);
          stageRef.current.dataset.catalogRendered = renderedCatalogId;
          stageRef.current.dataset.trailsActive = showTrailsRef.current ? 'true' : 'false';
          stageRef.current.dataset.clusteringActive = clusterModeRef.current ? 'true' : 'false';
          stageRef.current.dataset.clusterCount = String(latestClusterMetrics.clusters.length);
          stageRef.current.dataset.clusterCohesion = latestClusterMetrics.cohesionRatio.toFixed(2);
          stageRef.current.dataset.wavelengthBand = wavelengthBandRef.current;
          stageRef.current.dataset.eclipseActive = eclipseActiveRef.current ? 'true' : 'false';
          stageRef.current.dataset.photonPulseActive = photonPulseActiveRef.current ? 'true' : 'false';
          stageRef.current.dataset.cinemaMode = cinemaModeRef.current ? 'true' : 'false';
        }

        // Project precision optical Telescope Targeting Reticle onto active target center
        if (selectedIdRef.current && !cinemaModeRef.current) {
          camera.position.set(0, 0, 0);
          camera.lookAt(-orbitOff[0], -orbitOff[1], -orbitOff[2]);
          camera.near = 0.0001;
          camera.far = 1e8;
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld();
          const tLen = lengthVec3d(camRelTargetM);
          if (tLen > 0) {
            const s = 100 / tLen;
            _projTmp.set(-camRelTargetM[0] * s, -camRelTargetM[1] * s, -camRelTargetM[2] * s);
            _projTmp.project(camera);
            if (_projTmp.z >= -1 && _projTmp.z <= 1) {
              const rx = Math.round((_projTmp.x * 0.5 + 0.5) * vpW);
              const ry = Math.round((-_projTmp.y * 0.5 + 0.5) * vpH);
              if (rx > 48 && rx < vpW - 48 && ry > 48 && ry < vpH - 48) {
                setReticlePos({ x: rx, y: ry });
              } else {
                setReticlePos(null);
              }
            } else {
              setReticlePos(null);
            }
          }
        } else {
          setReticlePos((prev) => (prev !== null ? null : prev));
        }

        // Compute decluttered non-overlapping 3D projected labels
        if (showLabelsRef.current && !cinemaModeRef.current) {
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

            // Extra Solar System small bodies & comets (Eris, 4 Vesta, Bennu, Halley, 'Oumuamua)
            for (const entry of catalogEntries.values()) {
              if (!entry.isHeliocentric) continue;
              const relM: Vec3d =
                ctrl.targetId === entry.id
                  ? [-camRelTargetM[0], -camRelTargetM[1], -camRelTargetM[2]]
                  : computeRelativeMeters(entry.position, camPos, origins);
              const dM = lengthVec3d(relM);
              if (dM < entry.radiusM * 1.6) continue;
              const loc = getLocalizedNode(entry.node, langRef.current);
              candidates.push({
                id: entry.id,
                text: loc.title.split(' — ')[0],
                relM,
                priority: ctrl.targetId === entry.id ? 96 : 64,
                accent: entry.accentColor,
              });
            }
          }

          // 1B. Active non-Solar-System catalog star / exoplanet / custom object label
          if (renderedCatalogId) {
            const activeCat = catalogEntries.get(renderedCatalogId);
            if (activeCat && !activeCat.isHeliocentric) {
              const relM: Vec3d =
                ctrl.targetId === activeCat.id
                  ? [-camRelTargetM[0], -camRelTargetM[1], -camRelTargetM[2]]
                  : computeRelativeMeters(activeCat.position, camPos, origins);
              const dM = lengthVec3d(relM);
              if (dM > activeCat.radiusM * 1.6) {
                const loc = getLocalizedNode(activeCat.node, langRef.current);
                candidates.push({
                  id: activeCat.id,
                  text: loc.title.split(' — ')[0],
                  relM,
                  priority: 98,
                  accent: activeCat.accentColor,
                });
              }
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

              // 3B. Distinct Category Star Clusters (when Gravitational Clustering is ON)
              if (clusterModeRef.current && latestClusterMetrics.clusters.length > 0) {
                const catStrings = UI_STRINGS[langRef.current].categories;
                for (const cl of latestClusterMetrics.clusters) {
                  const catLabel = catStrings[cl.category]?.shortLabel || cl.category;
                  const relM: Vec3d = [
                    cl.centroidKpc[0] * KILOPARSEC_METERS - camGalacticM[0],
                    cl.centroidKpc[1] * KILOPARSEC_METERS - camGalacticM[1],
                    cl.centroidKpc[2] * KILOPARSEC_METERS - camGalacticM[2],
                  ];
                  candidates.push({
                    id: `cluster:${cl.categoryIndex}`,
                    text: catLabel,
                    subtext: `${cl.memberCount}`,
                    relM,
                    priority: 76,
                    accent: cl.colorHex,
                  });
                }
              }
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

      // Mark observatory ready immediately after the very first WebGL2 frame finishes rendering
      if (!firstFrameCommitted) {
        firstFrameCommitted = true;
        reportBootStage('ready');
        onBootReadyRef.current?.();
      }

      // Capture clean HUD-free WebGL2 PNG before the drawing buffer swaps
      if (snapshotWaiters.length > 0) {
        let dataUrl: string | null = null;
        try {
          dataUrl = renderer.domElement.toDataURL('image/png');
        } catch {
          dataUrl = null;
        }
        const pendingSnaps = snapshotWaiters.splice(0, snapshotWaiters.length);
        for (const resolve of pendingSnaps) resolve(dataUrl);
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
    };

    void bootEngine();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      for (const cancelYield of Array.from(activeYieldCancels)) {
        cancelYield();
      }
      activeYieldCancels.clear();
      // Dispose in reverse order of creation so listeners & geometries release before renderer
      for (let i = cleanups.length - 1; i >= 0; i -= 1) {
        try {
          cleanups[i]();
        } catch {
          // ignore
        }
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
      if (labelId.startsWith('cluster:')) {
        const idx = Number(labelId.slice('cluster:'.length));
        const cat = ALL_CATEGORIES[idx];
        const leadNode = cat
          ? memoriesRef.current.find((m) => m.category === cat)
          : undefined;
        if (leadNode) {
          const resolved = resolveUniverseTarget(
            leadNode.id,
            camCtrlRef.current.ephemeris,
            memoriesRef.current,
            langRef.current
          );
          startFlyTo(resolved);
          onSelectNodeRef.current(leadNode.id);
        }
        return;
      }
      const resolved = resolveUniverseTarget(
        labelId,
        camCtrlRef.current.ephemeris,
        memoriesRef.current,
        langRef.current
      );
      startFlyTo(resolved);
      const mappedMem = EPHEMERIS_ID_TO_MEMORY_ID[labelId];
      if (mappedMem) {
        onSelectNodeRef.current(mappedMem);
      } else if (labelId === 'BLACK_HOLE_CORE') {
        onSelectNodeRef.current('BLACK_HOLE_CORE');
      } else if (memoriesRef.current.some((m) => m.id === labelId)) {
        onSelectNodeRef.current(labelId);
      }
    },
    [startFlyTo]
  );

  return (
    <div
      ref={stageRef}
      data-testid="universe-stage"
      data-boot-stage={bootState.stage}
      data-boot-ready={bootReady ? 'true' : 'false'}
      className="relative w-full h-full overflow-hidden bg-[#05060a] select-none"
    >
      {/* WebGL2 Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Non-Blocking Staged Startup Loading Overlay (fades out after first WebGL2 frame renders) */}
      {isBootOverlayMounted && (
        <ObservatoryBootOverlay
          stage={bootState.stage}
          progress={bootState.progress}
          lang={lang}
          isFadingOut={bootReady}
          assetBasePath={assetBasePath}
        />
      )}

      {/* Asset Streaming Loading Progress Bar (shown only if star tiles continue loading after boot) */}
      {bootReady && !tilesReady && !cinemaMode && (
        <div
          data-testid="tile-loading-banner"
          className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-[12px] bg-[#141416]/95 border border-[#FFF8E7]/12 px-3.5 py-2 flex items-center gap-2.5 shadow-lg"
        >
          <span className="text-[11px] font-mono text-[#FFF8E7]/85">
            {hudCopy.loadingTiles}
          </span>
          <div className="w-24 h-1.5 rounded-[4px] bg-white/[0.08] overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${Math.max(12, Math.round(tileLoadProgress * 100))}%`,
                backgroundImage:
                  'linear-gradient(90deg, #E10500 0%, #FA500F 45%, #FFAF00 100%)',
              }}
            />
          </div>
        </div>
      )}

      {/* WebGL Context Lost Recovery Banner */}
      {contextLost && (
        <div
          role="alert"
          className="absolute inset-0 z-40 flex items-center justify-center bg-[#030406]/90"
        >
          <div className="rounded-[12px] bg-[#141416] border border-[#FFF8E7]/14 px-5 py-3.5 text-sm font-mono text-[#FFF8E7]">
            {hudCopy.webglRestoring}
          </div>
        </div>
      )}

      {/* Precision Optical Telescope Targeting Reticle (3D projected onto selected object) */}
      {bootReady && !cinemaMode && selectedId && reticlePos && (
        <div
          aria-hidden="true"
          data-testid="telescope-reticle"
          style={{
            transform: `translate3d(${reticlePos.x}px, ${reticlePos.y}px, 0) translate(-50%, -50%)`,
          }}
          className="pointer-events-none absolute top-0 left-0 z-10 w-[72px] h-[72px]"
        >
          <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FA500F]/90" />
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FA500F]/90" />
          <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FA500F]/90" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FA500F]/90" />
        </div>
      )}

      {/* Decluttered Non-Overlapping 3D Projected Labels */}
      {showLabels && !cinemaMode && labels.length > 0 && (
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
              className="pointer-events-auto absolute top-0 left-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] bg-[#141416]/90 hover:bg-[#1E1E22] border border-[#FFF8E7]/14 hover:border-[#FA500F]/60 text-[10px] font-medium text-[#FFF8E7] whitespace-nowrap transition-colors"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: lbl.accent }}
              />
              <span>{lbl.text}</span>
              {lbl.subtext && (
                <span className="font-mono text-[9px] text-[#8A8D96]">
                  {lbl.subtext}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Top-Right Ephemeris Time & Solar Eclipse Panel (hidden in Cinema Mode) */}
      <div
        className={`transition-opacity duration-300 ${
          cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <TimeControlPanel
          lang={lang}
          simDateMs={simDateMs}
          isPlaying={isTimePlaying}
          speedSecondsPerSec={timeSpeedSecPerSec}
          moonPhaseFraction={moonPhaseFraction}
          eclipseActive={eclipseActive}
          onTogglePlay={() => setIsTimePlaying((p) => !p)}
          onChangeSpeed={setTimeSpeedSecPerSec}
          onResetToNow={handleResetToNow}
          onJumpToEclipse={(preset) => handleJumpToEclipse(preset, false)}
        />
      </div>

      {/* Bottom Multi-Scale Instrument HUD (hidden in Cinema Mode) */}
      <div
        className={`transition-opacity duration-300 ${
          cinemaMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
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
          showTrails={showTrails}
          onToggleTrails={() => setShowTrails((v) => !v)}
          clusterMode={clusterMode}
          onToggleClusterMode={() => setClusterMode((v) => !v)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((v) => !v)}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid((v) => !v)}
          showGalaxies={showGalaxies}
          onToggleGalaxies={() => setShowGalaxies((v) => !v)}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion((v) => !v)}
          wavelengthBand={wavelengthBand}
          onChangeWavelengthBand={setWavelengthBandState}
          photonPulseActive={photonPulseActive}
          photonElapsedSec={photonElapsedSec}
          photonRadiusM={photonRadiusM}
          onTogglePhotonPulse={() => handleTogglePhotonPulse()}
          onToggleCinemaMode={toggleCinemaModeState}
        />
      </div>

      {/* Subtle Unobtrusive Restore Trigger in Cinema / Telescope Mode */}
      {cinemaMode && (
        <Button
          size="sm"
          variant="outline"
          data-testid="restore-hud-btn"
          onPress={toggleCinemaModeState}
          className="pointer-events-auto absolute bottom-3 right-3 z-30 h-8 min-w-0 rounded-[8px] bg-[#141416]/95 hover:bg-[#1E1E22] border border-[#FFF8E7]/16 hover:border-[#FA500F] px-3 text-[11px] font-mono text-[#FFF8E7]"
        >
          {hudCopy.showHud}
        </Button>
      )}
    </div>
  );
}
