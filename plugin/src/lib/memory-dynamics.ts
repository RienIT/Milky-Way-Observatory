/**
 * Dynamic 3D Orbital Trajectory Trails & Category-Based Gravitational Clustering Engine.
 *
 * Pure TypeScript simulation module (zero Three.js / DOM dependencies) powering:
 *  1. Smooth fading 3D orbital trajectory trails for moving memory nodes & Solar System bodies.
 *  2. Category-similarity gravitational clustering where memory nodes drift toward
 *     same-category neighbors in 3D galactic space, forming visually distinct orbiting star clusters.
 */

import { AU_IN_METERS, KILOPARSEC_METERS, LIGHT_YEAR_METERS } from './constants';
import {
  computeSolarSystemEphemeris,
  SolarSystemEphemerisSnapshot,
  SUN_GALACTOCENTRIC_THREE_M,
} from './ephemeris';
import {
  ALL_CATEGORIES,
  CATEGORY_CONFIG,
  MemoryCategory,
  MemoryNode,
} from './memory-types';
import { Vec3d } from './scale-engine';
import { computeCatalogNodeGalacticPosM } from './universe-targets';

/** Number of sampled 3D vertices stored per moving node trajectory trail. */
export const MEMORY_TRAIL_POINTS = 40;
export const MEMORY_TRAIL_SEGMENTS = MEMORY_TRAIL_POINTS - 1;

/** Number of sampled 3D vertices stored per Solar System planetary motion wake. */
export const SOLAR_TRAIL_POINTS = 36;
export const SOLAR_TRAIL_SEGMENTS = SOLAR_TRAIL_POINTS - 1;

export type MutableVec3d = [number, number, number];

export interface MemoryDynamicNode {
  id: string;
  title: string;
  category: MemoryCategory;
  categoryIndex: number;
  tags: string[];
  colorRgb: [number, number, number];
  /** Rotating baseline galactic coordinate in kpc (authentic Gaia / Solar placement). */
  homePosKpc: Vec3d;
  /** Rotating category star-cluster sector anchor in kpc around Sgr A*. */
  clusterAnchorKpc: Vec3d;
  /** Live 3D galactic position in kpc (relative to Sgr A* at origin). */
  posKpc: MutableVec3d;
  /** Live 3D velocity in kpc / simulated second. */
  velKpc: MutableVec3d;
  /** Differential galactic orbital angular speed [rad/s] around Y-axis. */
  orbitalOmegaRad: number;
  /** Visual star size weight. */
  starSize: number;
  /** Ring-ordered 3D trail history (oldest index 0 -> newest head at length - 1). */
  trailKpc: MutableVec3d[];
}

export interface CategoryClusterSummary {
  category: MemoryCategory;
  categoryIndex: number;
  colorHex: string;
  colorRgb: [number, number, number];
  centroidKpc: Vec3d;
  rmsRadiusKpc: number;
  memberCount: number;
}

export interface ClusterCohesionMetrics {
  clusters: CategoryClusterSummary[];
  meanIntraCategoryDistKpc: number;
  meanInterCategoryDistKpc: number;
  /** Inter-category centroid distance divided by intra-category spread (> 2.5 = clearly separated clusters). */
  cohesionRatio: number;
}

export interface MemoryDynamicsStepOptions {
  /** Frame delta in seconds (clamped internally for stability). */
  dtSec: number;
  /** Whether gravitational clustering toward same-category neighbors is enabled. */
  clusteringEnabled: boolean;
  /** Multiplier for galactic orbital drift speed (default 1.0). */
  orbitalSpeedScale?: number;
  /** Reduced motion accessibility mode (slows motion gracefully without freezing). */
  reducedMotion?: boolean;
  /** Whether to push a new sample onto each node's trajectory trail on this step. */
  recordTrail?: boolean;
}

/** Parse `#rrggbb` hex string into normalized `[r, g, b]` in `[0, 1]`. */
export function hexToNormalizedRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length !== 6) return [0.55, 0.78, 1.0];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return [0.55, 0.78, 1.0];
  }
  return [r / 255, g / 255, b / 255];
}

function hashId(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/**
 * Deterministic distinct sector anchor in the Milky Way disk [kpc] for each of the 7 categories.
 * Placed along the barred spiral arms between 4.4 kpc and 11.4 kpc so all 7 star clusters
 * orbit Sagittarius A* cleanly without overlapping each other or the Galactic Core.
 */
export function getCategorySectorAnchorKpc(category: MemoryCategory): Vec3d {
  const idx = Math.max(0, ALL_CATEGORIES.indexOf(category));
  const total = ALL_CATEGORIES.length;
  // Distribute evenly in galactic azimuth with subtle radial staggering along spiral arms
  const baseAngle = (idx / total) * Math.PI * 2 + 0.38;
  const radiiKpc = [6.8, 9.4, 10.8, 7.8, 11.4, 9.0, 5.4];
  const heightsKpc = [0.22, -0.18, 0.28, -0.24, 0.16, -0.3, 0.1];
  const r = radiiKpc[idx % radiiKpc.length];
  const y = heightsKpc[idx % heightsKpc.length];
  return [Math.cos(baseAngle) * r, y, Math.sin(baseAngle) * r];
}

/**
 * Compute initial baseline galactic position [kpc] for a MemoryNode.
 * Preserves authentic Gaia DR3 placement for distant stars/exoplanets while gently
 * fanning out co-located Solar System nodes around the Orion Spur (8.178 kpc)
 * so every memory node is an individually visible, navigable orbiting beacon in Galactic view.
 */
export function computeNodeInitialGalacticKpc(node: MemoryNode, index: number): Vec3d {
  const rawM = computeCatalogNodeGalacticPosM(node);
  const sunKpc: Vec3d = [
    SUN_GALACTOCENTRIC_THREE_M[0] / KILOPARSEC_METERS,
    SUN_GALACTOCENTRIC_THREE_M[1] / KILOPARSEC_METERS,
    SUN_GALACTOCENTRIC_THREE_M[2] / KILOPARSEC_METERS,
  ];
  let gx = rawM[0] / KILOPARSEC_METERS;
  let gy = rawM[1] / KILOPARSEC_METERS;
  let gz = rawM[2] / KILOPARSEC_METERS;

  // Check if node is very close to the Sun (Solar System bodies & nearby stars) or custom
  const dxSun = gx - sunKpc[0];
  const dySun = gy - sunKpc[1];
  const dzSun = gz - sunKpc[2];
  const distFromSunKpc = Math.hypot(dxSun, dySun, dzSun);

  const h = hashId(node.id);
  const h1 = (h & 0xffff) / 65535;
  const h2 = ((h >>> 16) & 0xffff) / 65535;

  if (distFromSunKpc < 0.15) {
    // Fan out across the Orion Spur / local galactic arm (radius 3.8..12.6 kpc) so nodes start
    // clearly distributed across the Milky Way disk and then visibly drift into category clusters!
    const angle = ((index * 2.3999632297) + h1 * 1.4) % (Math.PI * 2);
    const radius = 4.2 + ((index % 9) * 0.85) + h2 * 1.1;
    gx = Math.cos(angle) * radius;
    gy = (h1 - 0.5) * 1.15;
    gz = Math.sin(angle) * radius;
  } else {
    // Clamp extreme extragalactic/far outlier nodes inside the 14.5 kpc Milky Way galactic disk
    // while preserving their exact galactic azimuth direction
    const planarR = Math.hypot(gx, gz);
    if (planarR > 14.2) {
      const scale = 14.2 / planarR;
      gx *= scale;
      gz *= scale;
    }
    gy = Math.max(-1.8, Math.min(1.8, gy));
  }

  return [gx, gy, gz];
}

function rotateAroundY(pos: Vec3d, angleRad: number): Vec3d {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return [
    pos[0] * c - pos[2] * s,
    pos[1],
    pos[0] * s + pos[2] * c,
  ];
}

/**
 * Stateful, pure-TypeScript N-body gravitational clustering & orbital trail simulator
 * for all MemoryNodes in the Milky Way 3D space.
 */
export class MemoryClusterSimulation {
  public nodes: MemoryDynamicNode[] = [];
  private nodeMap = new Map<string, MemoryDynamicNode>();
  private tagSets = new Map<string, Set<string>>();
  private simTimeSec = 0;
  private trailSampleAccumSec = 0;

  constructor(memories: MemoryNode[] = []) {
    if (memories.length > 0) {
      this.syncMemories(memories);
    }
  }

  /**
   * Synchronize simulation nodes with the current React `memories` list without discarding
   * existing orbital positions or trail histories of unchanged nodes.
   */
  public syncMemories(memories: MemoryNode[]): void {
    const incomingIds = new Set(memories.map((m) => m.id));

    // Remove deleted nodes
    for (const id of Array.from(this.nodeMap.keys())) {
      if (!incomingIds.has(id)) {
        this.nodeMap.delete(id);
        this.tagSets.delete(id);
      }
    }

    const nextNodes: MemoryDynamicNode[] = [];
    for (let i = 0; i < memories.length; i += 1) {
      const mem = memories[i];
      const existing = this.nodeMap.get(mem.id);
      const catMeta =
        CATEGORY_CONFIG[mem.category] ??
        CATEGORY_CONFIG['Khổng lồ Khí & Siêu Vành Đai'];
      const colorRgb = hexToNormalizedRgb(catMeta.colorHex);
      const categoryIndex = Math.max(0, ALL_CATEGORIES.indexOf(mem.category));

      if (existing) {
        existing.title = mem.title;
        existing.category = mem.category;
        existing.categoryIndex = categoryIndex;
        existing.colorRgb = colorRgb;
        existing.tags = mem.tags;
        this.tagSets.set(
          mem.id,
          new Set(mem.tags.map((t) => t.toLowerCase()))
        );
        nextNodes.push(existing);
      } else {
        const homePos = computeNodeInitialGalacticKpc(mem, i);
        const anchorBase = getCategorySectorAnchorKpc(mem.category);
        // Apply current global galactic rotation phase so newly added nodes align immediately
        const anchorRotated = rotateAroundY(anchorBase, this.simTimeSec * 0.052);
        const rHome = Math.max(2.5, Math.hypot(homePos[0], homePos[2]));
        // Differential galactic rotation curve: inner nodes orbit faster than outer arm nodes
        const orbitalOmegaRad = 0.068 * Math.pow(8.0 / rHome, 0.35);

        const h = hashId(mem.id);
        const seedPhase = ((h & 0xfff) / 4095) * Math.PI * 2;
        const startPos: MutableVec3d = [
          homePos[0] + Math.cos(seedPhase) * 0.12,
          homePos[1],
          homePos[2] + Math.sin(seedPhase) * 0.12,
        ];

        // Pre-fill trail with initial position (prewarm fills smooth curved arcs)
        const trailKpc: MutableVec3d[] = [];
        for (let t = 0; t < MEMORY_TRAIL_POINTS; t += 1) {
          trailKpc.push([startPos[0], startPos[1], startPos[2]]);
        }

        const dynNode: MemoryDynamicNode = {
          id: mem.id,
          title: mem.title,
          category: mem.category,
          categoryIndex,
          tags: mem.tags,
          colorRgb,
          homePosKpc: homePos,
          clusterAnchorKpc: anchorRotated,
          posKpc: startPos,
          velKpc: [0, 0, 0],
          orbitalOmegaRad,
          starSize: Math.max(1.2, Math.min(3.2, 1.45 + (mem.starSize || 0.7) * 0.85)),
          trailKpc,
        };

        this.nodeMap.set(mem.id, dynNode);
        this.tagSets.set(
          mem.id,
          new Set(mem.tags.map((t) => t.toLowerCase()))
        );
        nextNodes.push(dynNode);
      }
    }

    this.nodes = nextNodes;
  }

  /**
   * Pre-warm the simulation so fading orbital trails and emerging star clusters are
   * immediately lush and visible from the very first rendered frame.
   */
  public prewarm(steps = 110, clusteringEnabled = true, dtSec = 0.05): void {
    for (let s = 0; s < steps; s += 1) {
      this.step({
        dtSec,
        clusteringEnabled,
        orbitalSpeedScale: 1.25,
        reducedMotion: false,
        recordTrail: true,
      });
    }
  }

  public getNodeById(id: string): MemoryDynamicNode | undefined {
    return this.nodeMap.get(id);
  }

  /**
   * Advance orbital rotation, category-similarity gravitational clustering, and fading trail buffers.
   */
  public step(options: MemoryDynamicsStepOptions): void {
    const n = this.nodes.length;
    if (n === 0) return;

    const rawDt = Math.max(0.001, Math.min(0.05, options.dtSec));
    const motionFactor = options.reducedMotion ? 0.22 : 1.0;
    const dt = rawDt * motionFactor;
    const orbitScale = (options.orbitalSpeedScale ?? 1.0) * motionFactor;
    this.simTimeSec += dt;

    // 1. Rotate baseline home coordinates & category cluster anchors around Sagittarius A* (Y-axis)
    const clusterOrbitStep = 0.055 * dt * orbitScale;
    for (let i = 0; i < n; i += 1) {
      const node = this.nodes[i];
      node.homePosKpc = rotateAroundY(
        node.homePosKpc,
        node.orbitalOmegaRad * dt * orbitScale
      );
      node.clusterAnchorKpc = rotateAroundY(
        node.clusterAnchorKpc,
        clusterOrbitStep
      );
    }

    // 2. Compute current live category centroids (used for subtle swirl & collective cluster cohesion)
    const catCount = ALL_CATEGORIES.length;
    const centroidX = new Float64Array(catCount);
    const centroidY = new Float64Array(catCount);
    const centroidZ = new Float64Array(catCount);
    const catMembers = new Int32Array(catCount);

    for (let i = 0; i < n; i += 1) {
      const nd = this.nodes[i];
      const ci = nd.categoryIndex;
      if (ci >= 0 && ci < catCount) {
        centroidX[ci] += nd.posKpc[0];
        centroidY[ci] += nd.posKpc[1];
        centroidZ[ci] += nd.posKpc[2];
        catMembers[ci] += 1;
      }
    }
    for (let c = 0; c < catCount; c += 1) {
      if (catMembers[c] > 0) {
        centroidX[c] /= catMembers[c];
        centroidY[c] /= catMembers[c];
        centroidZ[c] /= catMembers[c];
      }
    }

    // 3. Accumulate gravitational forces per node
    const accX = new Float64Array(n);
    const accY = new Float64Array(n);
    const accZ = new Float64Array(n);

    if (options.clusteringEnabled) {
      // Pairwise category gravitational attraction + cross-category separation + short-range core spacing
      const G_SAME_CATEGORY = 1.65;
      const G_SHARED_TAG = 0.22;
      const REPULSION_CORE_DIST = 0.78;
      const REPULSION_CROSS_DIST = 4.6;
      const SOFTENING_SQ = 0.38;

      for (let i = 0; i < n; i += 1) {
        const a = this.nodes[i];
        const aTags = this.tagSets.get(a.id);

        for (let j = i + 1; j < n; j += 1) {
          const b = this.nodes[j];
          const dx = b.posKpc[0] - a.posKpc[0];
          const dy = b.posKpc[1] - a.posKpc[1];
          const dz = b.posKpc[2] - a.posKpc[2];
          const distSq = dx * dx + dy * dy + dz * dz;
          const dist = Math.sqrt(distSq + 1e-6);
          const invDist = 1 / dist;
          const nx = dx * invDist;
          const ny = dy * invDist;
          const nz = dz * invDist;

          let forceMag = 0;
          if (a.category === b.category) {
            // Mutual gravitational pull between same-category nodes!
            forceMag += (G_SAME_CATEGORY * dist) / (distSq + SOFTENING_SQ);

            // Prevent overlap inside cluster so each member remains a crisp distinct star
            if (dist < REPULSION_CORE_DIST) {
              const overlap = (REPULSION_CORE_DIST - dist) / REPULSION_CORE_DIST;
              forceMag -= 4.8 * overlap * overlap;
            }
          } else {
            // Gentle cross-category tidal separation so the 7 star clusters stay visually distinct
            if (dist < REPULSION_CROSS_DIST) {
              const overlap = (REPULSION_CROSS_DIST - dist) / REPULSION_CROSS_DIST;
              forceMag -= 1.45 * overlap * overlap;
            }
            // Subtle filament attraction if nodes share spectral tags
            if (aTags && aTags.size > 0) {
              for (let t = 0; t < b.tags.length; t += 1) {
                if (aTags.has(b.tags[t].toLowerCase())) {
                  forceMag += G_SHARED_TAG / (distSq + 2.5);
                  break;
                }
              }
            }
          }

          const fx = nx * forceMag;
          const fy = ny * forceMag;
          const fz = nz * forceMag;
          accX[i] += fx;
          accY[i] += fy;
          accZ[i] += fz;
          accX[j] -= fx;
          accY[j] -= fy;
          accZ[j] -= fz;
        }
      }

      // Per-node sector orbital guidance, intra-cluster orbital swirl, and galactic disk confinement
      for (let i = 0; i < n; i += 1) {
        const nd = this.nodes[i];
        const ci = nd.categoryIndex;

        // Soft gravitational well around the category's orbiting galactic sector
        const adx = nd.clusterAnchorKpc[0] - nd.posKpc[0];
        const ady = nd.clusterAnchorKpc[1] - nd.posKpc[1];
        const adz = nd.clusterAnchorKpc[2] - nd.posKpc[2];
        accX[i] += adx * 0.62;
        accY[i] += ady * 1.15;
        accZ[i] += adz * 0.62;

        // Subtle tangential orbital swirl around cluster centroid so trails curve gracefully!
        if (ci >= 0 && ci < catCount && catMembers[ci] > 1) {
          const rx = nd.posKpc[0] - centroidX[ci];
          const rz = nd.posKpc[2] - centroidZ[ci];
          const rLocal = Math.hypot(rx, rz);
          if (rLocal > 0.08) {
            const swirlStrength = 0.42 * Math.min(1.0, rLocal / 0.8);
            accX[i] += (-rz / rLocal) * swirlStrength;
            accZ[i] += (rx / rLocal) * swirlStrength;
          }
        }

        // Keep nodes orbiting cleanly along the Milky Way disk around Sgr A*
        const radial = Math.hypot(nd.posKpc[0], nd.posKpc[2]);
        if (radial > 0.2) {
          const tangentSpeed = 0.055 * orbitScale * radial;
          const targetVx = -nd.posKpc[2] * (tangentSpeed / radial);
          const targetVz = nd.posKpc[0] * (tangentSpeed / radial);
          accX[i] += (targetVx - nd.velKpc[0]) * 0.35;
          accZ[i] += (targetVz - nd.velKpc[2]) * 0.35;
        }
      }
    } else {
      // Clustering OFF: smoothly relax each memory node back along a curved orbital wake to its true homePosKpc
      for (let i = 0; i < n; i += 1) {
        const nd = this.nodes[i];
        accX[i] += (nd.homePosKpc[0] - nd.posKpc[0]) * 2.2;
        accY[i] += (nd.homePosKpc[1] - nd.posKpc[1]) * 2.4;
        accZ[i] += (nd.homePosKpc[2] - nd.posKpc[2]) * 2.2;
      }
    }

    // 4. Frame-rate-independent damped integration + safe velocity clamp
    const damping = Math.exp(-1.85 * dt);
    const maxSpeedKpc = 5.5;
    for (let i = 0; i < n; i += 1) {
      const nd = this.nodes[i];
      let vx = (nd.velKpc[0] + accX[i] * dt) * damping;
      let vy = (nd.velKpc[1] + accY[i] * dt) * damping;
      let vz = (nd.velKpc[2] + accZ[i] * dt) * damping;

      const speed = Math.hypot(vx, vy, vz);
      if (speed > maxSpeedKpc) {
        const s = maxSpeedKpc / speed;
        vx *= s;
        vy *= s;
        vz *= s;
      }

      nd.velKpc[0] = vx;
      nd.velKpc[1] = vy;
      nd.velKpc[2] = vz;

      nd.posKpc[0] += vx * dt;
      nd.posKpc[1] = Math.max(-2.2, Math.min(2.2, nd.posKpc[1] + vy * dt));
      nd.posKpc[2] += vz * dt;
    }

    // 5. Record smooth trajectory trail points at steady spatial/time cadence
    this.trailSampleAccumSec += rawDt;
    const shouldPushSample =
      options.recordTrail === true ||
      (options.recordTrail !== false && this.trailSampleAccumSec >= 0.045);

    if (shouldPushSample) {
      this.trailSampleAccumSec = 0;
      for (let i = 0; i < n; i += 1) {
        const nd = this.nodes[i];
        const trail = nd.trailKpc;
        // Shift ring in-place (zero allocations for existing Vec3d tuples)
        for (let k = 0; k < trail.length - 1; k += 1) {
          trail[k][0] = trail[k + 1][0];
          trail[k][1] = trail[k + 1][1];
          trail[k][2] = trail[k + 1][2];
        }
        const last = trail[trail.length - 1];
        last[0] = nd.posKpc[0];
        last[1] = nd.posKpc[1];
        last[2] = nd.posKpc[2];
      }
    } else {
      // Keep the trail head locked smoothly to the live node position between samples
      for (let i = 0; i < n; i += 1) {
        const nd = this.nodes[i];
        const last = nd.trailKpc[nd.trailKpc.length - 1];
        last[0] = nd.posKpc[0];
        last[1] = nd.posKpc[1];
        last[2] = nd.posKpc[2];
      }
    }
  }

  /**
   * Compute live per-category star cluster centroids, radii, and global cohesion metrics.
   */
  public computeClusterMetrics(): ClusterCohesionMetrics {
    const grouped = new Map<MemoryCategory, MemoryDynamicNode[]>();
    for (const nd of this.nodes) {
      const arr = grouped.get(nd.category);
      if (arr) arr.push(nd);
      else grouped.set(nd.category, [nd]);
    }

    const clusters: CategoryClusterSummary[] = [];
    let intraSum = 0;
    let intraCount = 0;

    for (const cat of ALL_CATEGORIES) {
      const members = grouped.get(cat);
      if (!members || members.length === 0) continue;
      let cx = 0;
      let cy = 0;
      let cz = 0;
      for (const m of members) {
        cx += m.posKpc[0];
        cy += m.posKpc[1];
        cz += m.posKpc[2];
      }
      cx /= members.length;
      cy /= members.length;
      cz /= members.length;

      let sqDistSum = 0;
      for (const m of members) {
        const d = Math.hypot(
          m.posKpc[0] - cx,
          m.posKpc[1] - cy,
          m.posKpc[2] - cz
        );
        sqDistSum += d * d;
        intraSum += d;
        intraCount += 1;
      }

      const meta = CATEGORY_CONFIG[cat];
      clusters.push({
        category: cat,
        categoryIndex: ALL_CATEGORIES.indexOf(cat),
        colorHex: meta.colorHex,
        colorRgb: hexToNormalizedRgb(meta.colorHex),
        centroidKpc: [cx, cy, cz],
        rmsRadiusKpc: Math.sqrt(sqDistSum / members.length),
        memberCount: members.length,
      });
    }

    let interSum = 0;
    let interCount = 0;
    for (let i = 0; i < clusters.length; i += 1) {
      for (let j = i + 1; j < clusters.length; j += 1) {
        const a = clusters[i].centroidKpc;
        const b = clusters[j].centroidKpc;
        interSum += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        interCount += 1;
      }
    }

    const meanIntra = intraCount > 0 ? intraSum / intraCount : 1;
    const meanInter = interCount > 0 ? interSum / interCount : 0;
    const cohesionRatio = meanIntra > 1e-4 ? meanInter / meanIntra : 0;

    return {
      clusters,
      meanIntraCategoryDistKpc: meanIntra,
      meanInterCategoryDistKpc: meanInter,
      cohesionRatio,
    };
  }
}

/**
 * Pack all moving memory node trails into pre-allocated LineSegments typed arrays
 * (`positions`, `colors`, `progress`) with zero per-frame allocations.
 * Each segment `k -> k+1` smoothly interpolates `progress` from `0.0` (faded tail) to `1.0` (bright leading head).
 */
export function packMemoryTrailsToLineSegments(
  nodes: MemoryDynamicNode[],
  positionsOut: Float32Array,
  colorsOut: Float32Array,
  progressOut: Float32Array,
  matchedIds?: Set<string>,
  selectedId?: string | null
): number {
  let vertexIndex = 0;
  const maxVertices = progressOut.length;

  for (let i = 0; i < nodes.length; i += 1) {
    const nd = nodes[i];
    const trail = nd.trailKpc;
    const segs = trail.length - 1;
    const isSelected = selectedId === nd.id;
    const isMatched = !matchedIds || matchedIds.size === 0 || matchedIds.has(nd.id);
    const brightness = isSelected ? 1.35 : isMatched ? 1.0 : 0.2;

    const r = Math.min(1, nd.colorRgb[0] * brightness);
    const g = Math.min(1, nd.colorRgb[1] * brightness);
    const b = Math.min(1, nd.colorRgb[2] * brightness);

    for (let s = 0; s < segs; s += 1) {
      if (vertexIndex + 2 > maxVertices) return vertexIndex;

      const p0 = trail[s];
      const p1 = trail[s + 1];
      const t0 = s / segs;
      const t1 = (s + 1) / segs;

      const i0 = vertexIndex * 3;
      positionsOut[i0 + 0] = p0[0];
      positionsOut[i0 + 1] = p0[1];
      positionsOut[i0 + 2] = p0[2];
      colorsOut[i0 + 0] = r;
      colorsOut[i0 + 1] = g;
      colorsOut[i0 + 2] = b;
      progressOut[vertexIndex] = t0;

      const i1 = (vertexIndex + 1) * 3;
      positionsOut[i1 + 0] = p1[0];
      positionsOut[i1 + 1] = p1[1];
      positionsOut[i1 + 2] = p1[2];
      colorsOut[i1 + 0] = r;
      colorsOut[i1 + 1] = g;
      colorsOut[i1 + 2] = b;
      progressOut[vertexIndex + 1] = t1;

      vertexIndex += 2;
    }
  }

  return vertexIndex;
}

/**
 * Real-ephemeris fading orbital wake builder for Solar System planets & Moon.
 * Computes exact historical orbital arc samples trailing behind each moving body's
 * live ephemeris date so planetary orbital motion feels immediately dynamic and intuitive!
 */
export interface SolarOrbitalWakeSpec {
  id: string;
  parentId: 'sun' | 'earth';
  colorRgb: [number, number, number];
  /** Trailing arc lookback duration in days (calibrated ~22% of each body's orbital period). */
  lookbackDays: number;
  pointsM: MutableVec3d[];
}

const SOLAR_WAKE_CONFIGS: {
  id: string;
  parentId: 'sun' | 'earth';
  colorHex: string;
  lookbackDays: number;
}[] = [
  { id: 'mercury', parentId: 'sun', colorHex: '#e2e8f0', lookbackDays: 32 },
  { id: 'venus', parentId: 'sun', colorHex: '#fde047', lookbackDays: 78 },
  { id: 'earth', parentId: 'sun', colorHex: '#38bdf8', lookbackDays: 118 },
  { id: 'moon', parentId: 'earth', colorHex: '#f1f5f9', lookbackDays: 10.5 },
  { id: 'mars', parentId: 'sun', colorHex: '#fb923c', lookbackDays: 225 },
  { id: 'ceres', parentId: 'sun', colorHex: '#94a3b8', lookbackDays: 520 },
  { id: 'jupiter', parentId: 'sun', colorHex: '#f59e0b', lookbackDays: 1420 },
  { id: 'saturn', parentId: 'sun', colorHex: '#fde68a', lookbackDays: 3300 },
  { id: 'uranus', parentId: 'sun', colorHex: '#22d3ee', lookbackDays: 8600 },
  { id: 'neptune', parentId: 'sun', colorHex: '#60a5fa', lookbackDays: 16800 },
  { id: 'pluto', parentId: 'sun', colorHex: '#c4b5fd', lookbackDays: 24000 },
];

export function computeSolarOrbitalWakes(
  currentDateMs: number,
  currentSnapshot?: SolarSystemEphemerisSnapshot
): SolarOrbitalWakeSpec[] {
  const MS_PER_DAY = 86400 * 1000;
  const specs: SolarOrbitalWakeSpec[] = SOLAR_WAKE_CONFIGS.map((cfg) => ({
    id: cfg.id,
    parentId: cfg.parentId,
    colorRgb: hexToNormalizedRgb(cfg.colorHex),
    lookbackDays: cfg.lookbackDays,
    pointsM: new Array<MutableVec3d>(SOLAR_TRAIL_POINTS),
  }));

  // Sample exact real ephemeris along each body's historical orbital arc!
  // We reuse fractional step snapshots per unique lookback window cleanly.
  const latest = currentSnapshot ?? computeSolarSystemEphemeris(new Date(currentDateMs));

  for (const spec of specs) {
    for (let k = 0; k < SOLAR_TRAIL_POINTS; k += 1) {
      if (k === SOLAR_TRAIL_POINTS - 1) {
        const b = latest.bodies[spec.id];
        spec.pointsM[k] = b
          ? spec.parentId === 'earth'
            ? [b.localOffsetM[0], b.localOffsetM[1], b.localOffsetM[2]]
            : [b.helioPosM[0], b.helioPosM[1], b.helioPosM[2]]
          : [0, 0, 0];
      } else {
        const fracBack = 1 - k / (SOLAR_TRAIL_POINTS - 1); // 1.0 oldest -> 0.0 now
        const sampleMs = currentDateMs - fracBack * spec.lookbackDays * MS_PER_DAY;
        const snap = computeSolarSystemEphemeris(new Date(sampleMs));
        const b = snap.bodies[spec.id];
        spec.pointsM[k] = b
          ? spec.parentId === 'earth'
            ? [b.localOffsetM[0], b.localOffsetM[1], b.localOffsetM[2]]
            : [b.helioPosM[0], b.helioPosM[1], b.helioPosM[2]]
          : [0, 0, 0];
      }
    }
  }

  return specs;
}

/**
 * Lightweight per-frame tracker for Solar System fading orbital wakes.
 * Initializes exact historical arcs once, then updates in O(bodies) per frame
 * as simulation time advances, only re-sampling on large time jumps (e.g. "Now" reset).
 */
export class SolarOrbitalWakeTracker {
  public wakes: SolarOrbitalWakeSpec[] = [];
  private lastSampleMsByBody = new Map<string, number>();
  private lastDateMs = Number.NaN;

  public update(currentDateMs: number, snapshot: SolarSystemEphemerisSnapshot): SolarOrbitalWakeSpec[] {
    const MS_PER_DAY = 86400 * 1000;
    const isInitial = this.wakes.length === 0 || Number.isNaN(this.lastDateMs);
    const jumpDays = isInitial ? Infinity : Math.abs(currentDateMs - this.lastDateMs) / MS_PER_DAY;

    // Rebuild cleanly on first frame or if user jumped backward / > 45 days at once
    if (isInitial || currentDateMs < this.lastDateMs || jumpDays > 45) {
      this.wakes = computeSolarOrbitalWakes(currentDateMs, snapshot);
      this.lastSampleMsByBody.clear();
      for (const w of this.wakes) {
        this.lastSampleMsByBody.set(w.id, currentDateMs);
      }
      this.lastDateMs = currentDateMs;
      return this.wakes;
    }

    this.lastDateMs = currentDateMs;
    for (const wake of this.wakes) {
      const body = snapshot.bodies[wake.id];
      if (!body) continue;
      const head: Vec3d =
        wake.parentId === 'earth'
          ? [body.localOffsetM[0], body.localOffsetM[1], body.localOffsetM[2]]
          : [body.helioPosM[0], body.helioPosM[1], body.helioPosM[2]];

      const stepMs = (wake.lookbackDays / (SOLAR_TRAIL_POINTS - 1)) * MS_PER_DAY;
      const prevSampleMs = this.lastSampleMsByBody.get(wake.id) ?? currentDateMs;

      if (currentDateMs - prevSampleMs >= stepMs) {
        // Shift trail in-place
        for (let k = 0; k < wake.pointsM.length - 1; k += 1) {
          wake.pointsM[k][0] = wake.pointsM[k + 1][0];
          wake.pointsM[k][1] = wake.pointsM[k + 1][1];
          wake.pointsM[k][2] = wake.pointsM[k + 1][2];
        }
        const last = wake.pointsM[wake.pointsM.length - 1];
        last[0] = head[0];
        last[1] = head[1];
        last[2] = head[2];
        this.lastSampleMsByBody.set(wake.id, currentDateMs);
      } else {
        // Keep leading head locked to live planet position
        const last = wake.pointsM[wake.pointsM.length - 1];
        last[0] = head[0];
        last[1] = head[1];
        last[2] = head[2];
      }
    }

    return this.wakes;
  }
}

// Re-export unit references for convenience in callers/tests
export { AU_IN_METERS, KILOPARSEC_METERS, LIGHT_YEAR_METERS };
