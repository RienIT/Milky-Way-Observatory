'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  Disc3,
  GitBranch,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CATEGORY_CONFIG,
  ConstellationLink,
  getPlanetSpecForNode,
  MemoryNode,
} from '@/lib/memory-types';
import {
  BLACK_HOLE_DISK_ROLL,
  computeOrbitalWorldPosition,
  computeOrbitRingPoints,
  computeWasdFlightDelta,
  SGRA_LENSING_BOUND_RADIUS,
  WasdFlightInput,
} from '@/lib/memory-logic';
import { LanguageCode, UI_STRINGS } from '@/lib/i18n';
import { getLocalizedNode } from '@/lib/celestial-translations';
import {
  MILKY_WAY_NASA_DATA,
  generateMilkyWayNebulae,
  generateMilkyWayStarfield,
} from '@/lib/milky-way';
import { MILKY_WAY_I18N } from '@/lib/milky-way-i18n';
import {
  createBackgroundStarfieldMaterial,
  createDeepSpaceDomeMaterial,
  createMilkyWayNebulaMaterial,
  createMilkyWayStarfieldMaterial,
  createPlanetAtmosphereMaterial,
  createPlanetRingMaterial,
  createRealisticPlanetMaterial,
  createReticleTexture,
  createRockyBeltMaterial,
  createVolumetricBlackHoleMaterial,
} from '@/lib/cosmic-shaders';
import {
  computeGalactocentricPosition,
  computeHeliocentricOrbitRadiusUnits,
  computeTrue1To1RadiusScale,
  generateRockyBeltParticles,
  getScientificAstrometry,
  SimulationScaleMode,
  SOLAR_SYSTEM_KUIPER_BELT_AU,
  SOLAR_SYSTEM_MAIN_BELT_AU,
  SOLAR_SYSTEM_MOON_PARENTS,
} from '@/lib/scientific-catalog';
import { GraphicsSettings } from '@/lib/graphics-settings';

interface BlackHoleCanvasProps {
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

interface HoveredPlanetInfo {
  id: string;
  title: string;
  category: string;
  planetDesignation: string;
  planetType: string;
  realInspiration: string;
  tags: string[];
  colorHex: string;
  screenX: number;
  screenY: number;
}

// Reusable math objects allocated outside the animation loop (Zero GC in render loop)
const _tempVecA = new THREE.Vector3();
const _tempVecB = new THREE.Vector3();
const _tempCamOffset = new THREE.Vector3();
const _tempTangent = new THREE.Vector3();
const _tempCamForward = new THREE.Vector3();
const _tempCamRight = new THREE.Vector3();
const _tempWorldUp = new THREE.Vector3(0, 1, 0);
const _projVec = new THREE.Vector3();
const _viewProjMat = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
const _bhBoundSphere = new THREE.Sphere(
  new THREE.Vector3(0, 0, 0),
  SGRA_LENSING_BOUND_RADIUS + 2.0
);
// Elevated galactic perspective showcasing the full 105,700 ly NASA Milky Way barred spiral disk,
// 4 spiral arms + Orion Spur Solar System beacon, concentric planet orbits, and Sagittarius A* at the core
const _overviewPos = new THREE.Vector3(-18.0, 68.0, 122.0);
const DISK_ROLL = BLACK_HOLE_DISK_ROLL; // ~12.6 deg diagonal tilt for galactic plane

export default function BlackHoleCanvas({
  memories,
  links,
  matchedIds,
  isFilterActive,
  selectedId,
  onSelectNode,
  orbitSpeedMultiplier,
  onChangeOrbitSpeed,
  showOrbitRings,
  onToggleOrbitRings,
  showConstellations,
  onToggleConstellations,
  showMilkyWayDisk,
  onToggleMilkyWayDisk,
  scaleMode,
  graphicsSettings,
  cameraResetTrigger,
  onResetCamera,
  lang,
}: BlackHoleCanvasProps) {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const stageRootRef = useRef<HTMLDivElement | null>(null);
  const zoomActionRef = useRef<((factor: number) => void) | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<HoveredPlanetInfo | null>(
    null
  );
  const [webglFallback, setWebglFallback] = useState(false);

  const t = UI_STRINGS[lang];
  const mw = MILKY_WAY_I18N[lang];

  // Store latest React props in refs so the WebGL loop never tears down on UI state changes
  const memoriesRef = useRef<MemoryNode[]>(memories);
  const linksRef = useRef<ConstellationLink[]>(links);
  const matchedIdsRef = useRef<Set<string>>(matchedIds);
  const isFilterActiveRef = useRef<boolean>(isFilterActive);
  const selectedIdRef = useRef<string | null>(selectedId);
  const onSelectNodeRef = useRef(onSelectNode);
  const orbitSpeedRef = useRef<number>(orbitSpeedMultiplier);
  const showOrbitRingsRef = useRef<boolean>(showOrbitRings);
  const showConstellationsRef = useRef<boolean>(showConstellations);
  const showMilkyWayDiskRef = useRef<boolean>(showMilkyWayDisk);
  const scaleModeRef = useRef<SimulationScaleMode>(scaleMode);
  const graphicsSettingsRef = useRef<GraphicsSettings>(graphicsSettings);
  const langRef = useRef<LanguageCode>(lang);
  const hoveredIdRef = useRef<string | null>(null);
  const cameraFollowActiveRef = useRef<boolean>(false);

  useEffect(() => {
    memoriesRef.current = memories;
  }, [memories]);

  useEffect(() => {
    linksRef.current = links;
  }, [links]);

  useEffect(() => {
    matchedIdsRef.current = matchedIds;
    isFilterActiveRef.current = isFilterActive;
  }, [matchedIds, isFilterActive]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    if (selectedId) {
      cameraFollowActiveRef.current = true;
    }
  }, [selectedId]);

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode;
  }, [onSelectNode]);

  useEffect(() => {
    orbitSpeedRef.current = orbitSpeedMultiplier;
  }, [orbitSpeedMultiplier]);

  useEffect(() => {
    showOrbitRingsRef.current = showOrbitRings;
  }, [showOrbitRings]);

  useEffect(() => {
    showConstellationsRef.current = showConstellations;
  }, [showConstellations]);

  useEffect(() => {
    showMilkyWayDiskRef.current = showMilkyWayDisk;
  }, [showMilkyWayDisk]);

  useEffect(() => {
    scaleModeRef.current = scaleMode;
  }, [scaleMode]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  const applyGraphicsFnRef = useRef<((gs: GraphicsSettings) => void) | null>(
    null
  );
  useEffect(() => {
    graphicsSettingsRef.current = graphicsSettings;
    if (applyGraphicsFnRef.current) {
      applyGraphicsFnRef.current(graphicsSettings);
    }
  }, [graphicsSettings]);

  const resetDesiredRef = useRef<boolean>(false);
  useEffect(() => {
    if (cameraResetTrigger > 0) {
      cameraFollowActiveRef.current = false;
      resetDesiredRef.current = true;
    }
  }, [cameraResetTrigger]);

  const syncPlanetsFnRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    if (syncPlanetsFnRef.current) {
      syncPlanetsFnRef.current();
    }
  }, [memories, links]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software WebGL detection from GPU renderer string
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl =
          probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    const initGs = graphicsSettingsRef.current;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: initGs.antialias && !isSoftwareGl,
        logarithmicDepthBuffer: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      queueMicrotask(() => setWebglFallback(true));
      return;
    }

    const initW = container.clientWidth || window.innerWidth || 1200;
    const initH = container.clientHeight || window.innerHeight || 820;
    const initialPixelRatio = initGs.resolutionScale;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(initialPixelRatio);
    renderer.setSize(initW, initH);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020307);

    const camera = new THREE.PerspectiveCamera(
      44,
      initW / Math.max(1, initH),
      0.000002,
      30000
    );
    camera.position.copy(_overviewPos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.zoomSpeed = 1.45;
    controls.minDistance = 0.00004;
    controls.maxDistance = 1200;
    controls.maxPolarAngle = Math.PI * 0.96;
    controls.minPolarAngle = Math.PI * 0.04;
    controls.target.set(0, 0, 0);
    controls.update();

    let wasdDetached = false;
    let lastTrackedPlanetId: string | null = null;
    const lastTrackedPlanetPos = new THREE.Vector3();

    const onControlStart = () => {
      cameraFollowActiveRef.current = false;
      resetDesiredRef.current = false;
    };
    controls.addEventListener('start', onControlStart);

    // Programmatic unlimited zoom helper (zooms right down to 24% above any planet/asteroid surface in both Atlas & True 1:1 modes!)
    zoomActionRef.current = (factor: number) => {
      cameraFollowActiveRef.current = false;
      resetDesiredRef.current = false;
      const selId = selectedIdRef.current;
      let minZoom = 0.00004;
      if (selId && selId !== 'BLACK_HOLE_CORE' && !wasdDetached) {
        const targetRec = planetRecordsMap.get(selId);
        if (targetRec && !(scaleModeRef.current === 'true-1to1' && targetRec.isSgrACoreEntry)) {
          controls.target.copy(targetRec.group.position);
          lastTrackedPlanetId = selId;
          lastTrackedPlanetPos.copy(targetRec.group.position);
          const actualRadius =
            0.64 * Math.max(targetRec.axialGroup.scale.x, 0.00004);
          minZoom = Math.max(0.00004, actualRadius * 1.24);
        }
      }
      controls.minDistance = minZoom;
      _tempVecA.subVectors(camera.position, controls.target);
      const currentDist = Math.max(minZoom, _tempVecA.length());
      const nextDist = THREE.MathUtils.clamp(currentDist * factor, minZoom, 1200);
      _tempVecA.normalize().multiplyScalar(nextDist);
      camera.position.copy(controls.target).add(_tempVecA);
      controls.update();
      renderSceneWithLensing();
    };

    // 6-DOF WASD Galactic Free-Flight keyboard state (never hijacks form inputs)
    const flightInput: WasdFlightInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
    };

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };

    const setFlightKey = (code: string, pressed: boolean): boolean => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          flightInput.forward = pressed;
          return true;
        case 'KeyS':
        case 'ArrowDown':
          flightInput.backward = pressed;
          return true;
        case 'KeyA':
        case 'ArrowLeft':
          flightInput.left = pressed;
          return true;
        case 'KeyD':
        case 'ArrowRight':
          flightInput.right = pressed;
          return true;
        case 'KeyE':
        case 'Space':
          flightInput.up = pressed;
          return true;
        case 'KeyQ':
        case 'KeyC':
          flightInput.down = pressed;
          return true;
        case 'ShiftLeft':
        case 'ShiftRight':
          flightInput.boost = pressed;
          return true;
        default:
          return false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;
      const handled = setFlightKey(e.code, true);
      if (handled && e.code === 'Space') {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setFlightKey(e.code, false);
    };

    const handleWindowBlur = () => {
      flightInput.forward = false;
      flightInput.backward = false;
      flightInput.left = false;
      flightInput.right = false;
      flightInput.up = false;
      flightInput.down = false;
      flightInput.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    // =========================================================================
    // 1. DEEP SPACE SKY DOME
    // =========================================================================
    const skyDomeGeo = new THREE.SphereGeometry(1250, 48, 32);
    const skyDomeMat = createDeepSpaceDomeMaterial();
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    skyDomeMesh.renderOrder = 0;
    scene.add(skyDomeMesh);

    // =========================================================================
    // 2. PINPOINT BACKGROUND STARFIELD
    // =========================================================================
    const bgStarCount = 2400;
    const bgPositions = new Float32Array(bgStarCount * 3);
    const bgColors = new Float32Array(bgStarCount * 3);
    const bgSizes = new Float32Array(bgStarCount);
    const bgPhases = new Float32Array(bgStarCount);

    const spectralPalette = [
      new THREE.Color('#c8ddff'),
      new THREE.Color('#f4f7ff'),
      new THREE.Color('#fff6e8'),
      new THREE.Color('#ffe0b5'),
      new THREE.Color('#ffcaa3'),
    ];

    for (let i = 0; i < bgStarCount; i++) {
      const u = ((i * 73 + 17) % 1009) / 1009;
      const v = ((i * 199 + 53) % 1013) / 1013;
      const w = ((i * 317 + 89) % 1019) / 1019;

      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const r = 340 + w * 640;

      bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgPositions[i * 3 + 1] = r * Math.cos(phi);
      bgPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const specCol = spectralPalette[i % spectralPalette.length];
      const mag = Math.pow(w, 3.6);
      const dim = 0.25 + 0.65 * mag;
      bgColors[i * 3] = specCol.r * dim;
      bgColors[i * 3 + 1] = specCol.g * dim;
      bgColors[i * 3 + 2] = specCol.b * dim;

      bgSizes[i] = 0.8 + mag * 2.8;
      bgPhases[i] = (i * 1.37) % (Math.PI * 2);
    }

    const bgStarGeo = new THREE.BufferGeometry();
    bgStarGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(bgPositions, 3)
    );
    bgStarGeo.setAttribute('aColor', new THREE.BufferAttribute(bgColors, 3));
    bgStarGeo.setAttribute('aSize', new THREE.BufferAttribute(bgSizes, 1));
    bgStarGeo.setAttribute('aPhase', new THREE.BufferAttribute(bgPhases, 1));

    const bgStarMat = createBackgroundStarfieldMaterial();
    bgStarMat.uniforms.uPixelRatio.value = initialPixelRatio;
    const bgStarPoints = new THREE.Points(bgStarGeo, bgStarMat);
    bgStarPoints.renderOrder = 1;
    scene.add(bgStarPoints);

    // =========================================================================
    // 2B. NASA MILKY WAY BARRED SPIRAL GALAXY (SBbc · 105,700 ly · 4 ARMS + ORION SPUR)
    // =========================================================================
    const milkyWayGroup = new THREE.Group();
    milkyWayGroup.rotation.z = DISK_ROLL;
    scene.add(milkyWayGroup);

    const milkyWaySpinGroup = new THREE.Group();
    milkyWayGroup.add(milkyWaySpinGroup);

    const buildMilkyWayStarGeo = (count: number) => {
      const data = generateMilkyWayStarfield(count);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
      geo.setAttribute('aColor', new THREE.BufferAttribute(data.colors, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(data.phases, 1));
      return geo;
    };

    let currentStarfieldCount = initGs.starfieldCount;
    let milkyWayStarGeo = buildMilkyWayStarGeo(currentStarfieldCount);
    const milkyWayStarMat = createMilkyWayStarfieldMaterial();
    milkyWayStarMat.uniforms.uPixelRatio.value = initialPixelRatio;
    const milkyWayStarPoints = new THREE.Points(
      milkyWayStarGeo,
      milkyWayStarMat
    );
    milkyWayStarPoints.renderOrder = 1;
    milkyWayStarPoints.frustumCulled = false;
    milkyWaySpinGroup.add(milkyWayStarPoints);

    const mwNebulaData = generateMilkyWayNebulae(650);
    const milkyWayNebulaGeo = new THREE.BufferGeometry();
    milkyWayNebulaGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(mwNebulaData.positions, 3)
    );
    milkyWayNebulaGeo.setAttribute(
      'aColor',
      new THREE.BufferAttribute(mwNebulaData.colors, 3)
    );
    milkyWayNebulaGeo.setAttribute(
      'aSize',
      new THREE.BufferAttribute(mwNebulaData.sizes, 1)
    );
    const milkyWayNebulaMat = createMilkyWayNebulaMaterial();
    milkyWayNebulaMat.uniforms.uPixelRatio.value = initialPixelRatio;
    const milkyWayNebulaPoints = new THREE.Points(
      milkyWayNebulaGeo,
      milkyWayNebulaMat
    );
    milkyWayNebulaPoints.visible = initGs.showAtmosphereAndNebulae;
    milkyWayNebulaPoints.renderOrder = 1;
    milkyWayNebulaPoints.frustumCulled = false;
    milkyWaySpinGroup.add(milkyWayNebulaPoints);

    // =========================================================================
    // 2C. SOLAR SYSTEM HUB ON ORION-CYGNUS SPUR (26,670 ly FROM SGR A*) + BELTS
    // =========================================================================
    const solarSystemGroup = new THREE.Group();
    const sunR = MILKY_WAY_NASA_DATA.sunOrbitRadiusUnits;
    const sunA = MILKY_WAY_NASA_DATA.sunOrbitAngleRad;
    solarSystemGroup.position.set(
      Math.cos(sunA) * sunR,
      0.25,
      Math.sin(sunA) * sunR
    );
    milkyWaySpinGroup.add(solarSystemGroup);

    // Subtle Solar System galactic orbital track (R = 26,670 ly around Sagittarius A*)
    const galacticSolarPts = new Float32Array(160 * 3);
    for (let i = 0; i < 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      galacticSolarPts[i * 3] = Math.cos(a) * sunR;
      galacticSolarPts[i * 3 + 1] = 0.25;
      galacticSolarPts[i * 3 + 2] = Math.sin(a) * sunR;
    }
    const galacticSolarOrbitGeo = new THREE.BufferGeometry();
    galacticSolarOrbitGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(galacticSolarPts, 3)
    );
    const galacticSolarOrbitMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const galacticSolarOrbitLine = new THREE.LineLoop(
      galacticSolarOrbitGeo,
      galacticSolarOrbitMat
    );
    galacticSolarOrbitLine.renderOrder = 6;
    milkyWaySpinGroup.add(galacticSolarOrbitLine);

    // Heliocentric orbital tracks around the Sun (Mercury -> Eris)
    const solarOrbitRingsGroup = new THREE.Group();
    solarSystemGroup.add(solarOrbitRingsGroup);

    // NASA Main Asteroid Belt (2.2-3.2 AU) & Kuiper Belt (30-50 AU) centered accurately on the SUN!
    const buildBeltGeo = (totalCount: number) => {
      const mainCount = Math.floor(totalCount * 0.45);
      const kuiperCount = Math.max(0, totalCount - mainCount);
      const mainInner = computeHeliocentricOrbitRadiusUnits(
        SOLAR_SYSTEM_MAIN_BELT_AU.inner
      );
      const mainOuter = computeHeliocentricOrbitRadiusUnits(
        SOLAR_SYSTEM_MAIN_BELT_AU.outer
      );
      const kuiperInner = computeHeliocentricOrbitRadiusUnits(
        SOLAR_SYSTEM_KUIPER_BELT_AU.inner
      );
      const kuiperOuter = computeHeliocentricOrbitRadiusUnits(
        SOLAR_SYSTEM_KUIPER_BELT_AU.outer
      );
      const mainBelt = generateRockyBeltParticles(
        mainCount,
        mainInner,
        mainOuter,
        0.036,
        4219,
        false
      );
      const kuiperBelt = generateRockyBeltParticles(
        kuiperCount,
        kuiperInner,
        kuiperOuter,
        0.26,
        9871,
        true
      );
      const combinedPos = new Float32Array((mainCount + kuiperCount) * 3);
      const combinedCol = new Float32Array((mainCount + kuiperCount) * 3);
      const combinedSizes = new Float32Array(mainCount + kuiperCount);
      combinedPos.set(mainBelt.positions, 0);
      combinedPos.set(kuiperBelt.positions, mainCount * 3);
      combinedCol.set(mainBelt.colors, 0);
      combinedCol.set(kuiperBelt.colors, mainCount * 3);
      combinedSizes.set(mainBelt.sizes, 0);
      combinedSizes.set(kuiperBelt.sizes, mainCount);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(combinedPos, 3));
      geo.setAttribute('aColor', new THREE.BufferAttribute(combinedCol, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(combinedSizes, 1));
      return geo;
    };

    let currentAsteroidCount = initGs.asteroidBeltCount;
    let beltGeo = buildBeltGeo(currentAsteroidCount);
    const beltMat = createRockyBeltMaterial();
    beltMat.uniforms.uPixelRatio.value = initialPixelRatio;
    const rockyBeltsPoints = new THREE.Points(beltGeo, beltMat);
    rockyBeltsPoints.visible = currentAsteroidCount > 0;
    rockyBeltsPoints.renderOrder = 5;
    rockyBeltsPoints.frustumCulled = false;
    solarSystemGroup.add(rockyBeltsPoints);

    const sunCoreGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const sunCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fef08a'),
    });
    const sunCoreMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunCoreMesh.renderOrder = 4;
    solarSystemGroup.add(sunCoreMesh);

    const sunRingGeo = new THREE.RingGeometry(0.95, 1.15, 48);
    sunRingGeo.rotateX(-Math.PI / 2);
    const sunRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#fbbf24'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunRingMesh = new THREE.Mesh(sunRingGeo, sunRingMat);
    sunRingMesh.renderOrder = 4;
    solarSystemGroup.add(sunRingMesh);

    const sunHaloRingGeo = new THREE.RingGeometry(1.55, 1.72, 64);
    sunHaloRingGeo.rotateX(-Math.PI / 2);
    const sunHaloRingMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#38bdf8'),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sunHaloRingMesh = new THREE.Mesh(sunHaloRingGeo, sunHaloRingMat);
    sunHaloRingMesh.renderOrder = 4;
    solarSystemGroup.add(sunHaloRingMesh);

    const sunProxyGeo = new THREE.SphereGeometry(3.2, 12, 12);
    const sunProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const sunProxyMesh = new THREE.Mesh(sunProxyGeo, sunProxyMat);
    sunProxyMesh.layers.set(1);
    sunProxyMesh.userData.memoryId = 'SOLAR_SYSTEM_BEACON';
    solarSystemGroup.add(sunProxyMesh);

    // =========================================================================
    // 3. TRUE 3D GEODESIC VOLUMETRIC RAYMARCHED SAGITTARIUS A* + GRAVITATIONAL LENSING
    // =========================================================================
    const blackHoleGroup = new THREE.Group();
    scene.add(blackHoleGroup);

    // 3A. Bounding Volume for 3D Geodesic Raymarching & Gravitational Lensing (R = 34.0)
    const volumetricBhGeo = new THREE.SphereGeometry(
      SGRA_LENSING_BOUND_RADIUS,
      48,
      32
    );
    const volumetricBhMat = createVolumetricBlackHoleMaterial();
    volumetricBhMat.uniforms.uDiskRoll.value = DISK_ROLL;
    volumetricBhMat.uniforms.uRaySteps.value = initGs.blackHoleRaySteps;
    const volumetricBhMesh = new THREE.Mesh(volumetricBhGeo, volumetricBhMat);
    volumetricBhMesh.renderOrder = 4;
    volumetricBhMesh.frustumCulled = false;
    blackHoleGroup.add(volumetricBhMesh);

    // 3B. Invisible Interactive Raycast Target on Layer 1 (NEVER writes opaque depth before volumetricBhMesh!)
    const horizonGeo = new THREE.SphereGeometry(4.52, 32, 32);
    const horizonMat = new THREE.MeshBasicMaterial({
      visible: false,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.layers.set(1);
    horizonMesh.userData.memoryId = 'BLACK_HOLE_CORE';
    blackHoleGroup.add(horizonMesh);

    // 3C. Post-Black-Hole Transparent Depth Mask (renderOrder = 5, strictly AFTER volumetricBhMesh renderOrder = 4!)
    // Clips orbital path rings & constellation lines behind the Event Horizon shadow without ever punching a hole in the black hole!
    const horizonOrbitMaskMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.0,
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
    });
    const horizonOrbitMaskMesh = new THREE.Mesh(
      horizonGeo,
      horizonOrbitMaskMat
    );
    horizonOrbitMaskMesh.renderOrder = 5;
    blackHoleGroup.add(horizonOrbitMaskMesh);

    // Offscreen RenderTarget for real-time gravitational lensing of background Milky Way, stars & distant objects
    const getLensingRtDims = (w: number, h: number) => {
      const scale = isSoftwareGl ? 0.5 : 0.75;
      return {
        rw: Math.max(256, Math.round(w * scale)),
        rh: Math.max(256, Math.round(h * scale)),
      };
    };
    const initLensDims = getLensingRtDims(initW, initH);
    const lensingTarget = new THREE.WebGLRenderTarget(
      initLensDims.rw,
      initLensDims.rh,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        depthBuffer: true,
        stencilBuffer: false,
      }
    );
    lensingTarget.texture.generateMipmaps = false;

    const hiddenForegroundGroups: THREE.Object3D[] = [];
    const renderSceneWithLensing = () => {
      camera.updateMatrixWorld();
      _viewProjMat.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      volumetricBhMat.uniforms.uViewProjMat.value.copy(_viewProjMat);
      volumetricBhMat.uniforms.uResolution.value.set(
        renderer.domElement.width || initW,
        renderer.domElement.height || initH
      );

      _frustum.setFromProjectionMatrix(_viewProjMat);
      const bhInView = _frustum.intersectsSphere(_bhBoundSphere);

      if (bhInView) {
        // Capture live 3D background strictly BEHIND Sagittarius A* for real-time Schwarzschild gravitational lensing
        volumetricBhMesh.visible = false;
        horizonOrbitMaskMesh.visible = false;
        const prevOrbitRingsVis = orbitRingsGroup.visible;
        const prevGalacticOrbitVis = galacticSolarOrbitLine.visible;
        const prevConstellationsVis = constellationLines.visible;
        const prevSunRingVis = sunRingMesh.visible;
        const prevSunHaloVis = sunHaloRingMesh.visible;
        orbitRingsGroup.visible = false;
        galacticSolarOrbitLine.visible = false;
        constellationLines.visible = false;
        sunRingMesh.visible = false;
        sunHaloRingMesh.visible = false;

        milkyWayStarMat.uniforms.uLensingPass.value = 1.0;
        milkyWayNebulaMat.uniforms.uLensingPass.value = 1.0;

        hiddenForegroundGroups.length = 0;
        for (const rec of planetRecordsMap.values()) {
          if (!rec.group.visible) continue;
          _tempVecB.subVectors(rec.group.position, camera.position);
          const distToCam = _tempVecB.length();
          const tBhAlongRay =
            distToCam > 1e-6
              ? (-camera.position.x * _tempVecB.x -
                  camera.position.y * _tempVecB.y -
                  camera.position.z * _tempVecB.z) /
                distToCam
              : 0;
          // Exclude foreground planets standing between camera and Sagittarius A* from the background lensing texture
          if (distToCam < tBhAlongRay + 4.5) {
            rec.group.visible = false;
            hiddenForegroundGroups.push(rec.group);
          }
        }

        renderer.setRenderTarget(lensingTarget);
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);

        for (let i = 0; i < hiddenForegroundGroups.length; i++) {
          hiddenForegroundGroups[i].visible = true;
        }
        hiddenForegroundGroups.length = 0;
        milkyWayStarMat.uniforms.uLensingPass.value = 0.0;
        milkyWayNebulaMat.uniforms.uLensingPass.value = 0.0;
        orbitRingsGroup.visible = prevOrbitRingsVis;
        galacticSolarOrbitLine.visible = prevGalacticOrbitVis;
        constellationLines.visible = prevConstellationsVis;
        sunRingMesh.visible = prevSunRingVis;
        sunHaloRingMesh.visible = prevSunHaloVis;
        volumetricBhMesh.visible = true;
        horizonOrbitMaskMesh.visible = true;

        volumetricBhMat.uniforms.uSceneTex.value = lensingTarget.texture;
        volumetricBhMat.uniforms.uHasSceneTex.value = 1.0;
      } else {
        volumetricBhMat.uniforms.uHasSceneTex.value = 0.0;
      }

      renderer.render(scene, camera);
    };

    // =========================================================================
    // 4. PHOTOREALISTIC 3D PLANETS, STARS, ASTEROIDS, COMETS & ORBITAL TRACKS
    // =========================================================================
    const planetsGroup = new THREE.Group();
    scene.add(planetsGroup);

    const orbitRingsGroup = new THREE.Group();
    scene.add(orbitRingsGroup);

    const reticleTex = createReticleTexture();

    let currentPlanetSegments = initGs.planetSegments;
    let sharedPlanetGeo = new THREE.SphereGeometry(
      0.64,
      currentPlanetSegments,
      Math.max(14, Math.round(currentPlanetSegments * 0.75))
    );
    let sharedAtmoGeo = new THREE.SphereGeometry(
      0.695,
      Math.max(16, Math.round(currentPlanetSegments * 0.7)),
      Math.max(12, Math.round(currentPlanetSegments * 0.55))
    );
    const sharedProxyGeo = new THREE.SphereGeometry(2.15, 12, 12);
    const sharedProxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const sharedCometTailGeo = new THREE.ConeGeometry(0.42, 4.6, 18, 1, true);
    sharedCometTailGeo.translate(0, 2.3, 0);
    sharedCometTailGeo.rotateX(Math.PI / 2);

    interface PlanetMeshRecord {
      group: THREE.Group;
      axialGroup: THREE.Group;
      planetMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
      atmoMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
      ringMesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | null;
      cometTailMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial> | null;
      orbitRingLine: THREE.LineLoop<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      >;
      solarOrbitRingLine: THREE.LineLoop<
        THREE.BufferGeometry,
        THREE.LineBasicMaterial
      > | null;
      reticleSprite: THREE.Sprite;
      proxyMesh: THREE.Mesh;
      baseColor: THREE.Color;
      baseScale: number;
      true1To1Scale: number;
      gaiaTruePos: THREE.Vector3 | null;
      isSolarSystemBody: boolean;
      isSun: boolean;
      isSgrACoreEntry: boolean;
      heliocentricRadius: number;
      heliocentricSpeed: number;
      heliocentricTilt: number;
      moonParentId: string | null;
      moonOrbitRadius: number;
      moonOrbitSpeed: number;
      moonInclination: number;
    }

    const planetRecordsMap = new Map<string, PlanetMeshRecord>();
    const interactableProxies: THREE.Object3D[] = [];

    const constellationGeo = new THREE.BufferGeometry();
    const constellationMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const constellationLines = new THREE.LineSegments(
      constellationGeo,
      constellationMat
    );
    constellationLines.frustumCulled = false;
    constellationLines.renderOrder = 6;
    scene.add(constellationLines);

    const syncPlanetsAndConstellations = () => {
      const currentMemories = memoriesRef.current;
      const currentIds = new Set(currentMemories.map((m) => m.id));

      for (const [id, rec] of planetRecordsMap.entries()) {
        if (!currentIds.has(id)) {
          planetsGroup.remove(rec.group);
          orbitRingsGroup.remove(rec.orbitRingLine);
          rec.orbitRingLine.geometry.dispose();
          rec.orbitRingLine.material.dispose();
          if (rec.solarOrbitRingLine) {
            solarOrbitRingsGroup.remove(rec.solarOrbitRingLine);
            rec.solarOrbitRingLine.geometry.dispose();
            rec.solarOrbitRingLine.material.dispose();
          }
          rec.planetMesh.material.dispose();
          rec.atmoMesh.material.dispose();
          if (rec.ringMesh) {
            rec.ringMesh.geometry.dispose();
            rec.ringMesh.material.dispose();
          }
          if (rec.cometTailMesh) {
            rec.cometTailMesh.material.dispose();
          }
          rec.reticleSprite.material.dispose();
          planetRecordsMap.delete(id);
        }
      }

      interactableProxies.length = 0;
      interactableProxies.push(horizonMesh, sunProxyMesh);

      for (let idx = 0; idx < currentMemories.length; idx++) {
        const node = currentMemories[idx];
        let rec = planetRecordsMap.get(node.id);
        const catMeta =
          CATEGORY_CONFIG[node.category] ||
          CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
        const planetSpec = getPlanetSpecForNode(node);
        const astrometry = getScientificAstrometry(
          node.id,
          planetSpec.earthRadiusRatio
        );
        const baseColor = new THREE.Color(catMeta.colorHex);
        const atmoColor = new THREE.Color(planetSpec.atmosphereColorHex);

        if (!rec) {
          const group = new THREE.Group();
          group.position.set(
            node.position[0],
            node.position[1],
            node.position[2]
          );

          const axialGroup = new THREE.Group();
          axialGroup.rotation.z = planetSpec.axialTiltRad;
          axialGroup.rotation.x = ((idx % 5) - 2) * 0.08;
          group.add(axialGroup);

          let seedHash = 0;
          for (let c = 0; c < node.id.length; c++) {
            seedHash = (seedHash * 31 + node.id.charCodeAt(c)) % 997;
          }
          const planetMat = createRealisticPlanetMaterial(
            planetSpec.archetypeId,
            seedHash + idx * 1.7,
            atmoColor
          );
          const planetMesh = new THREE.Mesh(sharedPlanetGeo, planetMat);
          if (astrometry.irregularShape) {
            planetMesh.scale.set(
              astrometry.irregularShape[0],
              astrometry.irregularShape[1],
              astrometry.irregularShape[2]
            );
          }
          planetMesh.renderOrder = 5;
          axialGroup.add(planetMesh);

          const atmoMat = createPlanetAtmosphereMaterial(atmoColor);
          const atmoMesh = new THREE.Mesh(sharedAtmoGeo, atmoMat);
          atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
          atmoMesh.renderOrder = 6;
          axialGroup.add(atmoMesh);

          let ringMesh: THREE.Mesh<
            THREE.BufferGeometry,
            THREE.ShaderMaterial
          > | null = null;
          if (planetSpec.hasRings) {
            const innerR = planetSpec.ringInnerRadius * 0.58;
            const outerR = planetSpec.ringOuterRadius * 0.58;
            const ringGeo = new THREE.RingGeometry(
              innerR,
              outerR,
              isSoftwareGl ? 64 : 96,
              4
            );
            ringGeo.rotateX(-Math.PI / 2);
            const ringMat = createPlanetRingMaterial(
              new THREE.Color(planetSpec.ringColorHex),
              innerR,
              outerR
            );
            ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.renderOrder = 6;
            axialGroup.add(ringMesh);
          }

          let cometTailMesh: THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshBasicMaterial
          > | null = null;
          if (astrometry.hasCometTail) {
            const tailMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color('#7dd3fc'),
              transparent: true,
              opacity: 0.34,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
              depthWrite: false,
            });
            cometTailMesh = new THREE.Mesh(sharedCometTailGeo, tailMat);
            cometTailMesh.renderOrder = 7;
            axialGroup.add(cometTailMesh);
          }

          const reticleMat = new THREE.SpriteMaterial({
            map: reticleTex,
            color: baseColor,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const reticleSprite = new THREE.Sprite(reticleMat);
          reticleSprite.scale.set(2.4, 2.4, 1);
          reticleSprite.renderOrder = 9;
          group.add(reticleSprite);

          const proxyMesh = new THREE.Mesh(sharedProxyGeo, sharedProxyMat);
          proxyMesh.layers.set(1);
          proxyMesh.userData.memoryId = node.id;
          // Ensure tiny bodies (Bennu, Halley, Mercury, Europa) remain easy to click while giant stars match their visual radius
          const proxyScale = Math.max(0.7, planetSpec.radiusScale * 0.56);
          proxyMesh.scale.setScalar(proxyScale);
          group.add(proxyMesh);

          const baseScale = planetSpec.radiusScale;
          const true1To1Scale = computeTrue1To1RadiusScale(
            astrometry.diameterKmNumeric,
            astrometry.objectClass
          );
          axialGroup.scale.setScalar(
            scaleModeRef.current === 'true-1to1' ? true1To1Scale : baseScale
          );

          // Precompute published ESA Gaia DR3 galactocentric position OR Solar System heliocentric orbit
          const isSun = node.id === 'star-sol';
          const isSgrACoreEntry = node.id === 'astro-bh-04';
          const moonMeta = SOLAR_SYSTEM_MOON_PARENTS[node.id] ?? null;
          const isSolarSystemBody =
            !isSun &&
            !isSgrACoreEntry &&
            astrometry.distanceFromSunLy < 1.0;

          let heliocentricRadius = 0;
          let heliocentricSpeed = 0;
          let heliocentricTilt = 0;
          let solarOrbitRingLine: THREE.LineLoop<
            THREE.BufferGeometry,
            THREE.LineBasicMaterial
          > | null = null;

          if (isSolarSystemBody && !moonMeta) {
            const au =
              typeof astrometry.semiMajorAxisAu === 'number'
                ? astrometry.semiMajorAxisAu
                : 24.5; // Interstellar hyperbolic visitor ('Oumuamua)
            heliocentricRadius = computeHeliocentricOrbitRadiusUnits(au);
            heliocentricSpeed = 0.24 / Math.pow(Math.max(0.35, au), 0.78);
            heliocentricTilt =
              node.id === 'small-pluto'
                ? 0.28
                : node.id === 'small-eris'
                  ? 0.42
                  : node.id === 'small-halley' || node.id === 'small-oumuamua'
                    ? 0.36
                    : ((idx % 5) - 2) * 0.015;

            const solarRingPts = new Float32Array(128 * 3);
            for (let s = 0; s < 128; s++) {
              const ang = (s / 128) * Math.PI * 2;
              solarRingPts[s * 3] = Math.cos(ang) * heliocentricRadius;
              solarRingPts[s * 3 + 1] =
                Math.sin(ang) * heliocentricRadius * Math.sin(heliocentricTilt);
              solarRingPts[s * 3 + 2] = Math.sin(ang) * heliocentricRadius;
            }
            const solarRingGeo = new THREE.BufferGeometry();
            solarRingGeo.setAttribute(
              'position',
              new THREE.BufferAttribute(solarRingPts, 3)
            );
            const solarRingMat = new THREE.LineBasicMaterial({
              color: baseColor.clone().lerp(new THREE.Color('#cbd5e1'), 0.5),
              transparent: true,
              opacity: astrometry.objectClass === 'planet' ? 0.32 : 0.16,
              depthTest: true,
              depthWrite: false,
            });
            solarOrbitRingLine = new THREE.LineLoop(solarRingGeo, solarRingMat);
            solarOrbitRingLine.renderOrder = 6;
            solarOrbitRingLine.frustumCulled = false;
            solarOrbitRingsGroup.add(solarOrbitRingLine);
          }

          let gaiaTruePos: THREE.Vector3 | null = null;
          if (
            astrometry.distanceFromSunLy >= 1.0 &&
            !isSgrACoreEntry
          ) {
            // Logarithmic distance expansion from Sol preserves exact (l, b) bearing while giving giant supergiants clean 3D separation
            const expandedLy = Math.min(
              24000,
              6500 + Math.log10(1 + astrometry.distanceFromSunLy) * 4600
            );
            const { sceneUnits } = computeGalactocentricPosition(
              astrometry.galacticLonDeg,
              astrometry.galacticLatDeg,
              expandedLy
            );
            const v = new THREE.Vector3(
              sceneUnits[0],
              sceneUnits[1],
              sceneUnits[2]
            );
            // Keep safely outside Sagittarius A* lensing sphere (R >= 36) and within galactic disk (R <= 92)
            const len = v.length();
            if (len < 36) {
              v.normalize().multiplyScalar(36 + (idx % 9) * 2.2);
            } else if (len > 92) {
              v.normalize().multiplyScalar(92);
            }
            gaiaTruePos = v;
          }

          // Circular 3D Keplerian orbital path track centered on Sagittarius A* (Explorer/Atlas mode)
          const orbitRingGeo = new THREE.BufferGeometry();
          orbitRingGeo.setAttribute(
            'position',
            new THREE.BufferAttribute(computeOrbitRingPoints(node, 128), 3)
          );
          const orbitRingColor = baseColor
            .clone()
            .lerp(new THREE.Color('#cbd5e1'), 0.45);
          const orbitRingMat = new THREE.LineBasicMaterial({
            color: orbitRingColor,
            transparent: true,
            opacity: 0.15,
            depthTest: true,
            depthWrite: false,
          });
          const orbitRingLine = new THREE.LineLoop(orbitRingGeo, orbitRingMat);
          orbitRingLine.renderOrder = 6;
          orbitRingLine.frustumCulled = false;
          orbitRingsGroup.add(orbitRingLine);

          planetsGroup.add(group);
          rec = {
            group,
            axialGroup,
            planetMesh,
            atmoMesh,
            ringMesh,
            cometTailMesh,
            orbitRingLine,
            solarOrbitRingLine,
            reticleSprite,
            proxyMesh,
            baseColor,
            baseScale,
            true1To1Scale,
            gaiaTruePos,
            isSolarSystemBody,
            isSun,
            isSgrACoreEntry,
            heliocentricRadius,
            heliocentricSpeed,
            heliocentricTilt,
            moonParentId: moonMeta ? moonMeta.parentId : null,
            moonOrbitRadius: moonMeta ? moonMeta.orbitRadiusUnits : 0,
            moonOrbitSpeed: moonMeta ? moonMeta.orbitSpeed : 0,
            moonInclination: moonMeta ? moonMeta.inclinationRad : 0,
          };
          planetRecordsMap.set(node.id, rec);
        }

        rec.proxyMesh.userData.memoryId = node.id;
        interactableProxies.push(rec.proxyMesh);
      }

      const linkCount = linksRef.current.length;
      const linePositions = new Float32Array(linkCount * 6);
      const lineColors = new Float32Array(linkCount * 6);
      constellationGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(linePositions, 3)
      );
      constellationGeo.setAttribute(
        'color',
        new THREE.BufferAttribute(lineColors, 3)
      );
    };

    syncPlanetsFnRef.current = syncPlanetsAndConstellations;
    syncPlanetsAndConstellations();

    // Live Graphics Settings Applier (zero WebGL teardown on resolution/star/belt/shader updates!)
    applyGraphicsFnRef.current = (gs: GraphicsSettings) => {
      if (isDisposed) return;

      // 1. Live Render Resolution Scale
      renderer.setPixelRatio(gs.resolutionScale);
      const cw = container.clientWidth || window.innerWidth || 1200;
      const ch = Math.max(1, container.clientHeight || window.innerHeight || 820);
      renderer.setSize(cw, ch);
      bgStarMat.uniforms.uPixelRatio.value = gs.resolutionScale;
      milkyWayStarMat.uniforms.uPixelRatio.value = gs.resolutionScale;
      milkyWayNebulaMat.uniforms.uPixelRatio.value = gs.resolutionScale;
      beltMat.uniforms.uPixelRatio.value = gs.resolutionScale;

      // 2. Live Sagittarius A* Raymarch Precision Steps
      volumetricBhMat.uniforms.uRaySteps.value = gs.blackHoleRaySteps;

      // 3. Live Atmosphere & H-II Nebulae Visibility
      milkyWayNebulaPoints.visible = gs.showAtmosphereAndNebulae;
      for (const rec of planetRecordsMap.values()) {
        rec.atmoMesh.visible = gs.showAtmosphereAndNebulae;
      }

      // 4. Live Milky Way Starfield Density Rebuild
      if (gs.starfieldCount !== currentStarfieldCount) {
        currentStarfieldCount = gs.starfieldCount;
        const oldGeo = milkyWayStarGeo;
        milkyWayStarGeo = buildMilkyWayStarGeo(currentStarfieldCount);
        milkyWayStarPoints.geometry = milkyWayStarGeo;
        oldGeo.dispose();
      }

      // 5. Live Main Asteroid Belt & Kuiper Belt Density Rebuild
      if (gs.asteroidBeltCount !== currentAsteroidCount) {
        currentAsteroidCount = gs.asteroidBeltCount;
        const oldBeltGeo = beltGeo;
        beltGeo = buildBeltGeo(currentAsteroidCount);
        rockyBeltsPoints.geometry = beltGeo;
        rockyBeltsPoints.visible = currentAsteroidCount > 0;
        oldBeltGeo.dispose();
      }

      // 6. Live Planet Geometry Tessellation Rebuild
      if (gs.planetSegments !== currentPlanetSegments) {
        currentPlanetSegments = gs.planetSegments;
        const oldP = sharedPlanetGeo;
        const oldA = sharedAtmoGeo;
        sharedPlanetGeo = new THREE.SphereGeometry(
          0.64,
          currentPlanetSegments,
          Math.max(14, Math.round(currentPlanetSegments * 0.75))
        );
        sharedAtmoGeo = new THREE.SphereGeometry(
          0.695,
          Math.max(16, Math.round(currentPlanetSegments * 0.7)),
          Math.max(12, Math.round(currentPlanetSegments * 0.55))
        );
        for (const rec of planetRecordsMap.values()) {
          rec.planetMesh.geometry = sharedPlanetGeo;
          rec.atmoMesh.geometry = sharedAtmoGeo;
        }
        oldP.dispose();
        oldA.dispose();
      }

      renderSceneWithLensing();
    };

    // =========================================================================
    // 5. RAYCASTING (Hover Tooltip & Click to Fly-To Planet or Black Hole Core)
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverRaycastTime = 0;

    const getCanvasNormalizedPointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
      pointer.y = -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;
      return rect;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverRaycastTime < 45) return;
      lastHoverRaycastTime = now;

      const rect = getCanvasNormalizedPointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactableProxies, false);

      if (hits.length > 0) {
        const hitId = hits[0].object.userData.memoryId as string;
        hoveredIdRef.current = hitId;
        renderer.domElement.style.cursor = 'pointer';

        const activeLang = langRef.current;
        const activeStrings = UI_STRINGS[activeLang];

        if (hitId === 'BLACK_HOLE_CORE') {
          _projVec.set(0, 0, 0).project(camera);
          const screenX = rect.left + ((_projVec.x + 1) / 2) * rect.width;
          const screenY = rect.top + ((-_projVec.y + 1) / 2) * rect.height;
          setHoveredPlanet({
            id: 'BLACK_HOLE_CORE',
            title: activeStrings.bhTooltipTitle,
            category: activeStrings.bhTooltipCategory,
            planetDesignation: 'Sgr A* · 4.3M M☉',
            planetType: 'Milky Way Galactic Core · EHT 2022',
            realInspiration: activeStrings.bhTooltipAction,
            tags: ['sagittarius-a', 'milky-way', 'gravitational-lensing'],
            colorHex: '#f59e0b',
            screenX,
            screenY,
          });
          return;
        }

        if (hitId === 'SOLAR_SYSTEM_BEACON') {
          const mwStrings = MILKY_WAY_I18N[activeLang];
          solarSystemGroup.getWorldPosition(_tempVecA);
          _projVec.copy(_tempVecA).project(camera);
          const screenX = rect.left + ((_projVec.x + 1) / 2) * rect.width;
          const screenY = rect.top + ((-_projVec.y + 1) / 2) * rect.height;
          setHoveredPlanet({
            id: 'SOLAR_SYSTEM_BEACON',
            title: mwStrings.solarBeaconTitle,
            category: mwStrings.solarBeaconCategory,
            planetDesignation: mwStrings.solarBeaconTag,
            planetType: 'Orion-Cygnus Spur',
            realInspiration: mwStrings.solarBeaconDetail,
            tags: ['solar-system', 'orion-spur', 'milky-way'],
            colorHex: '#fbbf24',
            screenX,
            screenY,
          });
          return;
        }

        const rawNode = memoriesRef.current.find((m) => m.id === hitId);
        const rec = planetRecordsMap.get(hitId);
        if (rawNode && rec) {
          const localized = getLocalizedNode(rawNode, activeLang);
          _projVec.copy(rec.group.position).project(camera);
          const screenX = rect.left + ((_projVec.x + 1) / 2) * rect.width;
          const screenY = rect.top + ((-_projVec.y + 1) / 2) * rect.height;
          const catMeta =
            CATEGORY_CONFIG[rawNode.category] ||
            CATEGORY_CONFIG['Hố đen & Hiện tượng Thiên hà'];
          const catText =
            activeStrings.categories[rawNode.category]?.shortLabel ||
            catMeta.shortLabel;
          const planetSpec = getPlanetSpecForNode(rawNode);
          const specOverride =
            activeStrings.planetSpecOverrides[planetSpec.designation];

          setHoveredPlanet({
            id: rawNode.id,
            title: localized.title,
            category: catText,
            planetDesignation:
              specOverride?.designation || planetSpec.designation,
            planetType: specOverride?.planetType || planetSpec.planetTypeVi,
            realInspiration:
              specOverride?.realInspiration || planetSpec.realInspiration,
            tags: rawNode.tags,
            colorHex: catMeta.colorHex,
            screenX,
            screenY,
          });
        }
      } else {
        if (hoveredIdRef.current !== null) {
          hoveredIdRef.current = null;
          renderer.domElement.style.cursor = 'grab';
          setHoveredPlanet(null);
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (dx * dx + dy * dy > 36) return;

      getCanvasNormalizedPointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactableProxies, false);

      if (hits.length > 0) {
        const hitId = hits[0].object.userData.memoryId as string;
        if (hitId === 'SOLAR_SYSTEM_BEACON') {
          cameraFollowActiveRef.current = true;
          onSelectNodeRef.current('star-sol');
        } else if (hitId) {
          cameraFollowActiveRef.current = true;
          onSelectNodeRef.current(hitId);
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isDisposed = false;
    let lastW = initW;
    let lastH = initH;
    const handleResize = () => {
      if (!container || isDisposed) return;
      const w = container.clientWidth || window.innerWidth;
      const h = Math.max(1, container.clientHeight || window.innerHeight);
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      const nextLensDims = getLensingRtDims(w, h);
      lensingTarget.setSize(nextLensDims.rw, nextLensDims.rh);
      // Immediately repaint after setSize clears the drawing buffer so opening sidebars/panels never flashes black
      renderSceneWithLensing();
    };
    window.addEventListener('resize', handleResize);

    // Observe container resize so toggling left sidebar or right inspector panel resizes WebGL cleanly
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    // =========================================================================
    // 6. ANIMATION LOOP (Software-WebGL Safe with afterDraw)
    // =========================================================================
    let frameId = 0;
    let timeoutId = 0;
    const startTimeMs = performance.now();
    let prevTimeMs = startTimeMs;
    let lastDomSyncMs = 0;
    let accumulatedOrbitTime = 0;

    function afterDraw(cb: () => void) {
      if (isDisposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            timeoutId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            timeoutId = window.setTimeout(() => {
              if (!isDisposed) frameId = requestAnimationFrame(cb);
            }, 80);
          }
        };
        timeoutId = window.setTimeout(poll, 5);
      } else {
        timeoutId = window.setTimeout(() => {
          if (!isDisposed) frameId = requestAnimationFrame(cb);
        }, 80);
      }
    }

    function tick() {
      if (isDisposed) return;
      const nowMs = performance.now();
      const rawDelta = Math.min(
        Math.max((nowMs - prevTimeMs) / 1000, 0.016),
        0.1
      );
      prevTimeMs = nowMs;
      const elapsed = (nowMs - startTimeMs) / 1000;
      accumulatedOrbitTime += rawDelta * orbitSpeedRef.current;

      // 1. Update Volumetric Geodesic Sagittarius A*, Milky Way Barred Spiral Disk & Background Starfield
      volumetricBhMat.uniforms.uTime.value = elapsed;
      bgStarMat.uniforms.uTime.value = elapsed;
      bgStarPoints.rotation.y = elapsed * 0.0025;

      const showMw = showMilkyWayDiskRef.current;
      const activeSelectedId = selectedIdRef.current;
      const showRings = showOrbitRingsRef.current;
      const isTrue1To1 = scaleModeRef.current === 'true-1to1';

      milkyWayGroup.visible = showMw;
      if (showMw) {
        milkyWayStarMat.uniforms.uTime.value = elapsed;
        milkyWaySpinGroup.rotation.y = -accumulatedOrbitTime * 0.012;
      }
      milkyWayGroup.updateMatrixWorld(true);

      // Keep Solar System hub & belts visible even when viewing planets in True 1:1 mode
      solarSystemGroup.visible = showMw || isTrue1To1;
      galacticSolarOrbitLine.visible = showMw && showRings && isTrue1To1;
      solarOrbitRingsGroup.visible = showRings && isTrue1To1;

      const solarWorldPos = solarSystemGroup.getWorldPosition(_tempVecA);
      const camDistToSolar = camera.position.distanceTo(solarWorldPos);
      // Fade out macro locator rings well before entering the Solar System so inner orbits & belts stay 100% unobstructed
      const beaconFade = THREE.MathUtils.clamp((camDistToSolar - 10.0) / 14.0, 0, 1);
      sunCoreMesh.visible = !isTrue1To1 && showMw;
      sunRingMesh.visible = beaconFade > 0.02;
      sunHaloRingMesh.visible = beaconFade > 0.02;
      sunRingMat.opacity = 0.56 * beaconFade;
      sunHaloRingMat.opacity = 0.36 * beaconFade;
      if (sunHaloRingMesh.visible) {
        const pulse = 1.0 + 0.08 * Math.sin(elapsed * 2.4);
        sunHaloRingMesh.scale.setScalar(pulse);
      }

      if (rockyBeltsPoints.visible) {
        rockyBeltsPoints.rotation.y = accumulatedOrbitTime * 0.032;
      }

      // 2. Update Orbital Positions, True 1:1 Scale / Gaia DR3 Coordinates, Axial Spin & Front/Back Depth Sorting
      const currentMemories = memoriesRef.current;
      const matched = matchedIdsRef.current;
      const filterActive = isFilterActiveRef.current;
      const activeHoveredId = hoveredIdRef.current;
      orbitRingsGroup.visible = showRings && !isTrue1To1;

      const spinAngle = milkyWaySpinGroup.rotation.y;
      const cosSpin = Math.cos(spinAngle);
      const sinSpin = Math.sin(spinAngle);

      // Pass 2A: Position Sun, Solar System planets/dwarf planets/asteroids/comets, and distant Gaia DR3 stars/exoplanets
      for (let i = 0; i < currentMemories.length; i++) {
        const node = currentMemories[i];
        const rec = planetRecordsMap.get(node.id);
        if (!rec || (isTrue1To1 && rec.moonParentId)) continue;

        if (isTrue1To1) {
          if (rec.isSgrACoreEntry) {
            rec.group.position.set(0, 0, 0);
            rec.planetMesh.visible = false;
            rec.atmoMesh.visible = false;
            if (rec.ringMesh) rec.ringMesh.visible = false;
            rec.reticleSprite.visible = false;
          } else if (rec.isSun) {
            rec.planetMesh.visible = true;
            rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
            if (rec.ringMesh) rec.ringMesh.visible = true;
            rec.reticleSprite.visible = true;
            _tempVecB.set(0, 0, 0);
            solarSystemGroup.localToWorld(_tempVecB);
            rec.group.position.copy(_tempVecB);
          } else if (rec.isSolarSystemBody) {
            rec.planetMesh.visible = true;
            rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
            if (rec.ringMesh) rec.ringMesh.visible = true;
            rec.reticleSprite.visible = true;
            const ang =
              node.orbitAngle + accumulatedOrbitTime * rec.heliocentricSpeed;
            const r = rec.heliocentricRadius;
            _tempVecB.set(
              Math.cos(ang) * r,
              Math.sin(ang) * r * Math.sin(rec.heliocentricTilt),
              Math.sin(ang) * r
            );
            solarSystemGroup.localToWorld(_tempVecB);
            rec.group.position.copy(_tempVecB);
          } else if (rec.gaiaTruePos) {
            rec.planetMesh.visible = true;
            rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
            if (rec.ringMesh) rec.ringMesh.visible = true;
            rec.reticleSprite.visible = true;
            // Co-rotate Gaia DR3 stars & exoplanets smoothly with the Milky Way spiral arms
            const gx = rec.gaiaTruePos.x;
            const gy = rec.gaiaTruePos.y;
            const gz = rec.gaiaTruePos.z;
            rec.group.position.set(
              gx * cosSpin + gz * sinSpin,
              gy,
              -gx * sinSpin + gz * cosSpin
            );
          } else {
            rec.planetMesh.visible = true;
            rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
            if (rec.ringMesh) rec.ringMesh.visible = true;
            rec.reticleSprite.visible = true;
            const [ox, oy, oz] = computeOrbitalWorldPosition(
              node,
              accumulatedOrbitTime,
              1
            );
            rec.group.position.set(ox, oy, oz);
          }
        } else {
          rec.planetMesh.visible = true;
          rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
          if (rec.ringMesh) rec.ringMesh.visible = true;
          rec.reticleSprite.visible = true;
          const [ox, oy, oz] = computeOrbitalWorldPosition(
            node,
            accumulatedOrbitTime,
            1
          );
          rec.group.position.set(ox, oy, oz);
        }
      }

      // Pass 2B: Position Solar System natural satellites (Moon, Io, Europa, Ganymede, Titan) around their real parent planet
      if (isTrue1To1) {
        for (let i = 0; i < currentMemories.length; i++) {
          const node = currentMemories[i];
          const rec = planetRecordsMap.get(node.id);
          if (!rec || !rec.moonParentId) continue;
          const parentRec = planetRecordsMap.get(rec.moonParentId);
          if (!parentRec) continue;

          rec.planetMesh.visible = true;
          rec.atmoMesh.visible = graphicsSettingsRef.current.showAtmosphereAndNebulae;
          const ang = node.orbitAngle + accumulatedOrbitTime * rec.moonOrbitSpeed;
          const r = rec.moonOrbitRadius;
          rec.group.position.set(
            parentRec.group.position.x + Math.cos(ang) * r,
            parentRec.group.position.y + Math.sin(ang) * r * Math.sin(rec.moonInclination),
            parentRec.group.position.z + Math.sin(ang) * r
          );
        }
      }

      // Pass 2C: Front/back sorting, scale, optical pinpoint beacons, dynamic click hitboxes, shaders
      for (let i = 0; i < currentMemories.length; i++) {
        const node = currentMemories[i];
        const rec = planetRecordsMap.get(node.id);
        if (!rec) continue;

        _tempVecB.subVectors(rec.group.position, camera.position);
        const distToCam = _tempVecB.length();
        // Exact ray projection toward Sagittarius A* (0,0,0):
        // A planet is strictly behind the black hole only if its distance along the view ray exceeds the black hole's projected ray distance.
        // In addition, solid planets write logarithmic Z-depth and volumetricBhMesh uses depthTest: true for exact per-pixel occlusion!
        const tBhAlongRay =
          distToCam > 1e-6
            ? (-camera.position.x * _tempVecB.x -
                camera.position.y * _tempVecB.y -
                camera.position.z * _tempVecB.z) /
              distToCam
            : 0;
        const isBehindBlackHole = distToCam > tBhAlongRay;
        const planetOrder = isBehindBlackHole ? 2 : 7;
        const shellOrder = isBehindBlackHole ? 3 : 8;
        rec.planetMesh.renderOrder = planetOrder;
        rec.atmoMesh.renderOrder = shellOrder;
        if (rec.ringMesh) {
          rec.ringMesh.renderOrder = shellOrder;
        }
        if (rec.cometTailMesh) {
          rec.cometTailMesh.renderOrder = shellOrder;
          // Orient active comet ion tail radially outward away from the Sun (True 1:1) or Galactic Center (Atlas)
          if (isTrue1To1) {
            _tempVecB.subVectors(rec.group.position, solarWorldPos).normalize();
          } else {
            _tempVecB.copy(rec.group.position).normalize();
          }
          rec.cometTailMesh.lookAt(
            rec.group.position.x + _tempVecB.x * 10,
            rec.group.position.y + _tempVecB.y * 10,
            rec.group.position.z + _tempVecB.z * 10
          );
        }

        rec.planetMesh.rotation.y = elapsed * (0.22 + (i % 5) * 0.04);

        const isMatched = matched.has(node.id);
        const isSelected = activeSelectedId === node.id;
        const isHovered = activeHoveredId === node.id;

        const modeBaseScale = isTrue1To1 ? rec.true1To1Scale : rec.baseScale;
        let targetScale = modeBaseScale;
        let targetOpacity = 1.0;
        let targetHighlight = 0.0;
        let targetReticleOpacity = 0.0;
        let targetOrbitOpacity = 0.15;

        if (isSelected) {
          targetScale = isTrue1To1 ? modeBaseScale : modeBaseScale * 1.42;
          targetOpacity = 1.0;
          targetHighlight = 0.85;
          targetReticleOpacity = isTrue1To1 ? 0.0 : 0.92;
          targetOrbitOpacity = 0.88;
        } else if (isHovered) {
          targetScale = isTrue1To1 ? modeBaseScale : modeBaseScale * 1.25;
          targetOpacity = 1.0;
          targetHighlight = 0.65;
          targetReticleOpacity = 0.82;
          targetOrbitOpacity = 0.68;
        } else if (filterActive) {
          if (isMatched) {
            targetScale = isTrue1To1 ? modeBaseScale : modeBaseScale * 1.3;
            targetOpacity = 1.0;
            targetHighlight = 0.6;
            targetReticleOpacity = 0.55;
            targetOrbitOpacity = 0.56;
          } else {
            targetScale = modeBaseScale * 0.55;
            targetOpacity = 0.16;
            targetHighlight = 0.0;
            targetReticleOpacity = 0.0;
            targetOrbitOpacity = 0.04;
          }
        }

        const currentScale = rec.axialGroup.scale.x;
        const nextScale = THREE.MathUtils.damp(
          currentScale,
          targetScale,
          8,
          rawDelta
        );
        rec.axialGroup.scale.setScalar(nextScale);

        const actualRadius = 0.64 * nextScale;

        // Subtle optical pinpoint locator for tiny True 1:1 bodies when viewed from afar (fades out cleanly on close-up!)
        if (isTrue1To1 && !rec.isSgrACoreEntry) {
          const farFactor = THREE.MathUtils.clamp(
            (distToCam / Math.max(actualRadius, 0.00005) - 18) / 24,
            0,
            1
          );
          if (!isSelected && !isHovered && !filterActive) {
            const basePinOpacity = rec.moonParentId
              ? 0.22
              : rec.isSolarSystemBody
                ? 0.42
                : 0.34;
            targetReticleOpacity = basePinOpacity * farFactor;
          } else if (isSelected) {
            targetReticleOpacity = 0.72 * farFactor;
          }
          const reticleSize = Math.max(
            actualRadius * 2.8,
            Math.min(0.62, distToCam * 0.0115)
          );
          rec.reticleSprite.scale.set(reticleSize, reticleSize, 1);
        } else {
          const atlasReticle = Math.max(0.28, nextScale * 2.2);
          rec.reticleSprite.scale.set(atlasReticle, atlasReticle, 1);
        }

        // Distance-adaptive clickable proxy hitbox so even realistic 1:1 Earth/Pluto/Bennu remain easy to click
        const proxyWorldRadius = isTrue1To1
          ? Math.max(actualRadius * 1.4, Math.min(1.35, distToCam * 0.013))
          : Math.max(0.55, actualRadius * 1.35);
        rec.proxyMesh.scale.setScalar(proxyWorldRadius / 2.15);

        rec.planetMesh.material.uniforms.uTime.value = elapsed;
        rec.planetMesh.material.uniforms.uOpacity.value = targetOpacity;
        rec.planetMesh.material.uniforms.uHighlight.value = targetHighlight;
        rec.atmoMesh.material.uniforms.uOpacity.value = targetOpacity * 0.88;
        if (isTrue1To1 && (rec.isSolarSystemBody || rec.moonParentId)) {
          rec.planetMesh.material.uniforms.uLightPos.value.copy(solarWorldPos);
          rec.atmoMesh.material.uniforms.uLightPos.value.copy(solarWorldPos);
        } else {
          rec.planetMesh.material.uniforms.uLightPos.value.set(0, 0, 0);
          rec.atmoMesh.material.uniforms.uLightPos.value.set(0, 0, 0);
        }
        if (rec.ringMesh) {
          rec.ringMesh.material.uniforms.uOpacity.value = targetOpacity * 0.92;
          rec.ringMesh.material.uniforms.uPlanetRadius.value = actualRadius;
          if (isTrue1To1 && rec.isSolarSystemBody) {
            rec.ringMesh.material.uniforms.uLightPos.value.copy(solarWorldPos);
          } else {
            rec.ringMesh.material.uniforms.uLightPos.value.set(0, 0, 0);
          }
        }
        if (showRings && !isTrue1To1) {
          rec.orbitRingLine.material.opacity = THREE.MathUtils.damp(
            rec.orbitRingLine.material.opacity,
            targetOrbitOpacity,
            9,
            rawDelta
          );
        }
        if (rec.solarOrbitRingLine && showRings && isTrue1To1) {
          const targetSolarOrbitOpacity = isSelected
            ? 0.85
            : isHovered
              ? 0.65
              : 0.28;
          rec.solarOrbitRingLine.material.opacity = THREE.MathUtils.damp(
            rec.solarOrbitRingLine.material.opacity,
            targetSolarOrbitOpacity,
            9,
            rawDelta
          );
        }

        rec.reticleSprite.material.opacity = THREE.MathUtils.damp(
          rec.reticleSprite.material.opacity,
          targetReticleOpacity,
          10,
          rawDelta
        );
      }

      // 3. Update Gossamer Spectral Constellation Lines
      const showLines = showConstellationsRef.current;
      constellationLines.visible = showLines;
      if (showLines) {
        const currentLinks = linksRef.current;
        const posAttr = constellationGeo.getAttribute(
          'position'
        ) as THREE.BufferAttribute;
        const colAttr = constellationGeo.getAttribute(
          'color'
        ) as THREE.BufferAttribute;

        if (posAttr && colAttr && posAttr.count >= currentLinks.length * 2) {
          for (let i = 0; i < currentLinks.length; i++) {
            const link = currentLinks[i];
            const recA = planetRecordsMap.get(link.sourceId);
            const recB = planetRecordsMap.get(link.targetId);
            if (!recA || !recB) continue;

            const idx = i * 6;
            posAttr.array[idx] = recA.group.position.x;
            posAttr.array[idx + 1] = recA.group.position.y;
            posAttr.array[idx + 2] = recA.group.position.z;

            posAttr.array[idx + 3] = recB.group.position.x;
            posAttr.array[idx + 4] = recB.group.position.y;
            posAttr.array[idx + 5] = recB.group.position.z;

            const touchesFocus =
              activeSelectedId === link.sourceId ||
              activeSelectedId === link.targetId ||
              activeHoveredId === link.sourceId ||
              activeHoveredId === link.targetId;

            const bothMatched =
              matched.has(link.sourceId) && matched.has(link.targetId);

            let intensity = 0.16;
            if (touchesFocus) {
              intensity = 0.82;
            } else if (filterActive) {
              intensity = bothMatched ? 0.62 : 0.02;
            }

            colAttr.array[idx] = recA.baseColor.r * intensity;
            colAttr.array[idx + 1] = recA.baseColor.g * intensity;
            colAttr.array[idx + 2] = recA.baseColor.b * intensity;

            colAttr.array[idx + 3] = recB.baseColor.r * intensity;
            colAttr.array[idx + 4] = recB.baseColor.g * intensity;
            colAttr.array[idx + 5] = recB.baseColor.b * intensity;
          }
          posAttr.needsUpdate = true;
          colAttr.needsUpdate = true;
        }
      }

      // 3B. Smooth 6-DOF WASD Galactic Free-Flight Navigation
      const isFlying =
        flightInput.forward ||
        flightInput.backward ||
        flightInput.left ||
        flightInput.right ||
        flightInput.up ||
        flightInput.down;

      if (activeSelectedId !== lastTrackedPlanetId) {
        wasdDetached = false;
        if (activeSelectedId && activeSelectedId !== 'BLACK_HOLE_CORE') {
          const newRec = planetRecordsMap.get(activeSelectedId);
          if (newRec) {
            lastTrackedPlanetId = activeSelectedId;
            lastTrackedPlanetPos.copy(newRec.group.position);
          }
        } else {
          lastTrackedPlanetId = activeSelectedId;
        }
      }

      if (isFlying) {
        wasdDetached = true;
        cameraFollowActiveRef.current = false;
        resetDesiredRef.current = false;
        camera.getWorldDirection(_tempCamForward);
        _tempCamRight
          .crossVectors(_tempCamForward, _tempWorldUp)
          .normalize();
        const distToTarget = Math.max(
          0.0002,
          camera.position.distanceTo(controls.target)
        );
        const [dx, dy, dz] = computeWasdFlightDelta(
          flightInput,
          [_tempCamForward.x, _tempCamForward.y, _tempCamForward.z],
          [_tempCamRight.x, _tempCamRight.y, _tempCamRight.z],
          distToTarget,
          rawDelta
        );
        camera.position.x += dx;
        camera.position.y += dy;
        camera.position.z += dz;
        controls.target.x += dx;
        controls.target.y += dy;
        controls.target.z += dz;
      }

      // 4. Smooth Camera Fly-To & Co-Moving Orbital Lock on Selected Planet / Sagittarius A*
      const isBlackHoleFocus =
        activeSelectedId === 'BLACK_HOLE_CORE' ||
        (isTrue1To1 && activeSelectedId === 'astro-bh-04');

      if (isBlackHoleFocus && cameraFollowActiveRef.current) {
        controls.minDistance = 8.5;
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          0.35,
          7.0,
          rawDelta
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          -0.1,
          7.0,
          rawDelta
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          0,
          7.0,
          rawDelta
        );

        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          -2.4,
          6.0,
          rawDelta
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          1.75,
          6.0,
          rawDelta
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          29.5,
          6.0,
          rawDelta
        );
      } else if (activeSelectedId && !isBlackHoleFocus && !wasdDetached) {
        const targetRec = planetRecordsMap.get(activeSelectedId);
        if (targetRec) {
          _tempVecA.copy(targetRec.group.position);
          const activeTargetScale = isTrue1To1
            ? targetRec.true1To1Scale
            : targetRec.baseScale * 1.42;
          const actualRadius =
            0.64 * Math.max(targetRec.axialGroup.scale.x, activeTargetScale);
          // Allow extreme surface close-up right down to 24% above cloud tops/craters (even 1:1 Earth & 490m Bennu!) without clipping
          controls.minDistance = Math.max(0.00004, actualRadius * 1.24);

          const deltaX = _tempVecA.x - lastTrackedPlanetPos.x;
          const deltaY = _tempVecA.y - lastTrackedPlanetPos.y;
          const deltaZ = _tempVecA.z - lastTrackedPlanetPos.z;

          if (cameraFollowActiveRef.current) {
            // Ride along with the orbiting planet even while flying in so planets stay dead-center!
            controls.target.x += deltaX;
            controls.target.y += deltaY;
            controls.target.z += deltaZ;
            camera.position.x += deltaX;
            camera.position.y += deltaY;
            camera.position.z += deltaZ;

            // Cinematic proportional framing: frames full planet/star/asteroid globe (~45% viewport height)
            // For the Sun in True 1:1 mode, pull back gently to reveal the inner Solar System + Main Asteroid Belt!
            const idealDist =
              isTrue1To1 && targetRec.isSun
                ? 2.25
                : Math.max(
                    0.00018,
                    actualRadius * (targetRec.ringMesh ? 5.6 : 3.9)
                  );

            _tempVecB.copy(_tempVecA).normalize();
            _tempTangent.set(-_tempVecB.z, 0.22, _tempVecB.x).normalize();
            _tempCamOffset
              .copy(_tempVecA)
              .addScaledVector(_tempVecB, idealDist * 0.72)
              .addScaledVector(_tempTangent, idealDist * 0.62);
            _tempCamOffset.y +=
              isTrue1To1 && targetRec.isSun
                ? idealDist * 0.42
                : actualRadius * 0.65;

            // Adaptive convergence across multi-order True 1:1 scale jumps (120 units -> 0.009 units)
            const targetGap = controls.target.distanceTo(_tempVecA);
            const camGap = camera.position.distanceTo(_tempCamOffset);
            if (targetGap < Math.max(0.00005, actualRadius * 0.05)) {
              controls.target.copy(_tempVecA);
            } else {
              const tLambda = targetGap > idealDist * 3 ? 22.0 : 14.0;
              controls.target.x = THREE.MathUtils.damp(
                controls.target.x,
                _tempVecA.x,
                tLambda,
                rawDelta
              );
              controls.target.y = THREE.MathUtils.damp(
                controls.target.y,
                _tempVecA.y,
                tLambda,
                rawDelta
              );
              controls.target.z = THREE.MathUtils.damp(
                controls.target.z,
                _tempVecA.z,
                tLambda,
                rawDelta
              );
            }

            if (camGap < Math.max(0.00005, idealDist * 0.015)) {
              camera.position.copy(_tempCamOffset);
            } else {
              const pLambda = camGap > idealDist * 5 ? 18.0 : 11.0;
              camera.position.x = THREE.MathUtils.damp(
                camera.position.x,
                _tempCamOffset.x,
                pLambda,
                rawDelta
              );
              camera.position.y = THREE.MathUtils.damp(
                camera.position.y,
                _tempCamOffset.y,
                pLambda,
                rawDelta
              );
              camera.position.z = THREE.MathUtils.damp(
                camera.position.z,
                _tempCamOffset.z,
                pLambda,
                rawDelta
              );
            }
          } else {
            // Co-moving orbital lock: keep camera & target riding along with the selected planet while orbiting/zooming
            controls.target.x += deltaX;
            controls.target.y += deltaY;
            controls.target.z += deltaZ;
            camera.position.x += deltaX;
            camera.position.y += deltaY;
            camera.position.z += deltaZ;
          }

          lastTrackedPlanetPos.copy(_tempVecA);
        }
      } else {
        controls.minDistance = 0.00004;
        if (resetDesiredRef.current) {
        controls.target.x = THREE.MathUtils.damp(
          controls.target.x,
          0,
          5,
          rawDelta
        );
        controls.target.y = THREE.MathUtils.damp(
          controls.target.y,
          0,
          5,
          rawDelta
        );
        controls.target.z = THREE.MathUtils.damp(
          controls.target.z,
          0,
          5,
          rawDelta
        );

        camera.position.x = THREE.MathUtils.damp(
          camera.position.x,
          _overviewPos.x,
          4,
          rawDelta
        );
        camera.position.y = THREE.MathUtils.damp(
          camera.position.y,
          _overviewPos.y,
          4,
          rawDelta
        );
        camera.position.z = THREE.MathUtils.damp(
          camera.position.z,
          _overviewPos.z,
          4,
          rawDelta
        );

        if (
          controls.target.lengthSq() < 0.05 &&
          camera.position.distanceTo(_overviewPos) < 0.5
        ) {
          resetDesiredRef.current = false;
        }
        }
      }

      controls.update();
      renderSceneWithLensing();

      // Expose lightweight DOM telemetry attributes (<= 5Hz, zero React state re-renders)
      if (stageRootRef.current && nowMs - lastDomSyncMs > 180) {
        lastDomSyncMs = nowMs;
        stageRootRef.current.dataset.camPos = `${camera.position.x.toFixed(1)},${camera.position.y.toFixed(1)},${camera.position.z.toFixed(1)}`;
        stageRootRef.current.dataset.camDist = camera.position
          .distanceTo(controls.target)
          .toFixed(2);
        stageRootRef.current.dataset.wasdActive = isFlying ? 'true' : 'false';
      }

      const fpsCap = graphicsSettingsRef.current.fpsCap;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else if (fpsCap > 0 && fpsCap < 60) {
        const delayMs = Math.max(8, Math.round(1000 / fpsCap));
        timeoutId = window.setTimeout(() => {
          if (!isDisposed) frameId = requestAnimationFrame(tick);
        }, delayMs);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
      zoomActionRef.current = null;
      applyGraphicsFnRef.current = null;
      if (resizeObserver) resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );

      for (const rec of planetRecordsMap.values()) {
        rec.orbitRingLine.geometry.dispose();
        rec.orbitRingLine.material.dispose();
        if (rec.solarOrbitRingLine) {
          rec.solarOrbitRingLine.geometry.dispose();
          rec.solarOrbitRingLine.material.dispose();
        }
        rec.planetMesh.material.dispose();
        rec.atmoMesh.material.dispose();
        if (rec.ringMesh) {
          rec.ringMesh.geometry.dispose();
          rec.ringMesh.material.dispose();
        }
        if (rec.cometTailMesh) {
          rec.cometTailMesh.material.dispose();
        }
        rec.reticleSprite.material.dispose();
      }
      skyDomeGeo.dispose();
      skyDomeMat.dispose();
      milkyWayStarGeo.dispose();
      milkyWayStarMat.dispose();
      milkyWayNebulaGeo.dispose();
      milkyWayNebulaMat.dispose();
      galacticSolarOrbitGeo.dispose();
      galacticSolarOrbitMat.dispose();
      beltGeo.dispose();
      beltMat.dispose();
      sunCoreGeo.dispose();
      sunCoreMat.dispose();
      sunRingGeo.dispose();
      sunRingMat.dispose();
      sunHaloRingGeo.dispose();
      sunHaloRingMat.dispose();
      sunProxyGeo.dispose();
      sunProxyMat.dispose();
      volumetricBhGeo.dispose();
      volumetricBhMat.dispose();
      horizonGeo.dispose();
      horizonMat.dispose();
      horizonOrbitMaskMat.dispose();
      lensingTarget.dispose();
      bgStarGeo.dispose();
      bgStarMat.dispose();
      reticleTex.dispose();
      sharedPlanetGeo.dispose();
      sharedAtmoGeo.dispose();
      sharedProxyGeo.dispose();
      sharedProxyMat.dispose();
      sharedCometTailGeo.dispose();
      constellationGeo.dispose();
      constellationMat.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={stageRootRef}
      data-testid="galactic-stage"
      data-scale-mode={scaleMode}
      data-resolution-scale={graphicsSettings.resolutionScale}
      data-quality-tier={graphicsSettings.tier}
      className="relative w-full h-full overflow-hidden bg-[#020307] select-none"
    >
      {/* Dedicated WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="blackhole-canvas"
        className="w-full h-full"
      />

      {/* Graceful fallback if WebGL is disabled */}
      {webglFallback && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#090a0d] text-[#f3f4f6]">
          <div className="max-w-md p-6 rounded-[14px] bg-[#111318] border border-white/[0.10] text-center space-y-2">
            <h2 className="text-lg font-semibold text-[#66b3ff]">
              {t.webglFallbackTitle}
            </h2>
            <p className="text-sm text-[#a1a7b3]">{t.webglFallbackDesc}</p>
          </div>
        </div>
      )}

      {/* Meta Astryx Floating Command Dock (Zero backdrop-blur over WebGL, Concentric Radii) */}
      <div className="pointer-events-none absolute bottom-3.5 inset-x-0 z-10 flex flex-col items-center gap-1.5 px-3">
        <div className="pointer-events-auto inline-flex flex-wrap items-center justify-center gap-1 rounded-[12px] bg-[#111318]/95 border border-white/[0.10] p-1 shadow-2xl">
          <button
            type="button"
            onClick={() =>
              onChangeOrbitSpeed(orbitSpeedMultiplier === 0 ? 1 : 0)
            }
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              orbitSpeedMultiplier === 0
                ? 'bg-[#0082fb] text-white font-semibold'
                : 'text-[#e5e7eb] hover:bg-white/[0.07]'
            }`}
          >
            {orbitSpeedMultiplier === 0 ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{t.resumeOrbit}</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>{t.pauseOrbit}</span>
              </>
            )}
          </button>

          <div className="h-3.5 w-px bg-white/[0.10] mx-0.5" aria-hidden="true" />

          {[1, 2.5].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => onChangeOrbitSpeed(spd)}
              className={`px-1.5 py-1.5 rounded-[8px] text-[11px] font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                orbitSpeedMultiplier === spd
                  ? 'bg-white/[0.10] text-white font-semibold'
                  : 'text-[#a1a7b3] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {spd}x
            </button>
          ))}

          <div className="h-3.5 w-px bg-white/[0.10] mx-0.5" aria-hidden="true" />

          <button
            type="button"
            data-testid="zoom-in-btn"
            onClick={() => zoomActionRef.current?.(0.55)}
            aria-label="Zoom in"
            title="Zoom in"
            className="inline-flex items-center justify-center p-1.5 rounded-[8px] text-[#e5e7eb] hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            data-testid="zoom-out-btn"
            onClick={() => zoomActionRef.current?.(1.65)}
            aria-label="Zoom out"
            title="Zoom out"
            className="inline-flex items-center justify-center p-1.5 rounded-[8px] text-[#e5e7eb] hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-white/[0.10] mx-0.5" aria-hidden="true" />

          <button
            type="button"
            data-testid="toggle-milkyway-btn"
            aria-pressed={showMilkyWayDisk}
            onClick={onToggleMilkyWayDisk}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              showMilkyWayDisk
                ? 'text-[#66b3ff] bg-[#0082fb]/15 border border-[#0082fb]/35'
                : 'text-[#a1a7b3] hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>{mw.diskToggleLabel}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-orbits-btn"
            aria-pressed={showOrbitRings}
            onClick={onToggleOrbitRings}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              showOrbitRings
                ? 'text-[#f3f4f6] bg-white/[0.10] border border-white/[0.14]'
                : 'text-[#a1a7b3] hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>{t.orbitRings}</span>
          </button>

          <button
            type="button"
            data-testid="toggle-constellations-btn"
            aria-pressed={showConstellations}
            onClick={onToggleConstellations}
            className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px] text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
              showConstellations
                ? 'text-[#66b3ff] bg-[#0082fb]/15 border border-[#0082fb]/35'
                : 'text-[#a1a7b3] hover:text-white hover:bg-white/[0.06] border border-transparent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>{t.constellationLines}</span>
          </button>

          <div className="h-3.5 w-px bg-white/[0.10] mx-0.5" aria-hidden="true" />

          <button
            type="button"
            data-testid="reset-camera-btn"
            onClick={onResetCamera}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-[8px] text-[11px] font-medium text-[#e5e7eb] hover:bg-white/[0.08] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#66b3ff]" />
            <span>{t.resetCamera}</span>
          </button>
        </div>

        {/* Clean Astryx Keyboard Flight & Unlimited Zoom Hint */}
        <p className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#a1a7b3] bg-[#111318]/90 border border-white/[0.08] px-3 py-1 rounded-[8px] whitespace-nowrap">
          <span className="font-mono text-[#f3f4f6]">WASD</span>
          <span>/</span>
          <span className="font-mono text-[#f3f4f6]">Q·E</span>
          <span>+</span>
          <span className="font-mono text-[#66b3ff]">Shift</span>
          <span aria-hidden="true">·</span>
          <span className="truncate max-w-[520px]">{t.canvasHint}</span>
        </p>
      </div>

      {/* Meta Astryx 3D Hover Tooltip */}
      {hoveredPlanet && (
        <div
          style={{
            transform: `translate3d(${Math.min(
              Math.max(16, hoveredPlanet.screenX + 18),
              typeof window !== 'undefined' ? window.innerWidth - 320 : 900
            )}px, ${Math.max(72, hoveredPlanet.screenY - 28)}px, 0)`,
          }}
          className="pointer-events-none fixed top-0 left-0 z-30 max-w-[310px] rounded-[12px] bg-[#111318]/95 border border-white/[0.12] px-3.5 py-2.5 shadow-2xl transition-opacity duration-150"
        >
          <div className="flex items-center gap-2 text-xs text-[#a1a7b3]">
            <span
              className="font-semibold"
              style={{ color: hoveredPlanet.colorHex }}
            >
              {hoveredPlanet.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#66b3ff] font-mono text-[11px]">
              {hoveredPlanet.planetDesignation}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[#f3f4f6] leading-snug">
            {hoveredPlanet.title}
          </p>
          <p className="mt-1 text-[11px] text-[#a1a7b3]">
            {hoveredPlanet.planetType} · {hoveredPlanet.realInspiration}
          </p>
        </div>
      )}
    </div>
  );
}
