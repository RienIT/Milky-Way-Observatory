import {
  ALL_CATEGORIES,
  ConstellationLink,
  MemoryCategory,
  MemoryNode,
} from './memory-types';

/**
 * Normalizes Vietnamese and Latin strings for smart search matching
 */
export function normalizeText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Returns the set of matching memory IDs given a search query and category filter.
 * If both query is empty and category is 'ALL', all nodes match.
 */
export function filterMemories(
  memories: MemoryNode[],
  searchQuery: string,
  selectedCategory: MemoryCategory | 'ALL'
): Set<string> {
  const normalizedQuery = normalizeText(searchQuery);
  const rawQuery = searchQuery.toLowerCase().trim();
  const matched = new Set<string>();

  for (const node of memories) {
    if (selectedCategory !== 'ALL' && node.category !== selectedCategory) {
      continue;
    }

    if (!normalizedQuery) {
      matched.add(node.id);
      continue;
    }

    const haystackRaw = [
      node.title,
      node.category,
      ...node.summary,
      ...node.tags,
      node.content,
    ]
      .join(' ')
      .toLowerCase();

    const haystackNormalized = normalizeText(haystackRaw);

    if (
      haystackRaw.includes(rawQuery) ||
      haystackNormalized.includes(normalizedQuery)
    ) {
      matched.add(node.id);
    }
  }

  return matched;
}

/**
 * Computes constellation links between memory nodes that share tags or categories.
 * Prioritizes shared tags first, and connects nearby nodes within the same category
 * so the constellation web looks cohesive without becoming a hairball.
 */
export function computeConstellationLinks(
  memories: MemoryNode[]
): ConstellationLink[] {
  const links: ConstellationLink[] = [];
  const connectionCount = new Map<string, number>();

  const incCount = (id: string) =>
    connectionCount.set(id, (connectionCount.get(id) ?? 0) + 1);

  // Pass 1: Connect all pairs that share at least 1 tag
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const a = memories[i];
      const b = memories[j];
      const aTags = new Set(a.tags.map((t) => t.toLowerCase()));
      const sharedTags = b.tags.filter((t) => aTags.has(t.toLowerCase()));

      if (sharedTags.length > 0) {
        const sameCategory = a.category === b.category;
        links.push({
          id: `${a.id}--${b.id}`,
          sourceId: a.id,
          targetId: b.id,
          sharedTags,
          sameCategory,
          strength: Math.min(3, sharedTags.length + (sameCategory ? 1 : 0)),
        });
        incCount(a.id);
        incCount(b.id);
      }
    }
  }

  // Pass 2: Ensure every node has at least 2 constellation connections by linking
  // sequentially within the same category if needed
  for (const cat of ALL_CATEGORIES) {
    const catNodes = memories.filter((m) => m.category === cat);
    for (let i = 0; i < catNodes.length; i++) {
      const a = catNodes[i];
      const b = catNodes[(i + 1) % catNodes.length];
      if (!b || a.id === b.id) continue;

      const pairId1 = `${a.id}--${b.id}`;
      const pairId2 = `${b.id}--${a.id}`;
      const alreadyLinked = links.some(
        (l) => l.id === pairId1 || l.id === pairId2
      );

      if (
        !alreadyLinked &&
        ((connectionCount.get(a.id) ?? 0) < 2 ||
          (connectionCount.get(b.id) ?? 0) < 2)
      ) {
        links.push({
          id: pairId1,
          sourceId: a.id,
          targetId: b.id,
          sharedTags: [cat.toLowerCase()],
          sameCategory: true,
          strength: 1,
        });
        incCount(a.id);
        incCount(b.id);
      }
    }
  }

  return links;
}

/**
 * Shared geometric constants keeping every planet's orbit strictly outside
 * Gargantua's volumetric accretion disk (rDiskOut = 23.6, R_BOUND = 26.0)
 * and aligned with the diagonal accretion disk plane.
 */
export const BLACK_HOLE_DISK_ROLL = 0.22;
export const MIN_SAFE_ORBIT_RADIUS = 27.5;
export const MAX_SAFE_ORBIT_RADIUS = 64.0;

/**
 * Ensures any orbital radius (including legacy persisted nodes) stays strictly
 * outside Gargantua's volumetric accretion disk and event horizon bounding sphere.
 */
export function getSafeOrbitRadius(rawRadius: number): number {
  if (rawRadius >= MIN_SAFE_ORBIT_RADIUS) {
    return rawRadius;
  }
  return Number(
    (MIN_SAFE_ORBIT_RADIUS + Math.max(0, rawRadius - 14.0) * 1.15).toFixed(2)
  );
}

/**
 * Evaluates a point along a planet's true 3D inclined circular orbit centered
 * on Gargantua (0, 0, 0) and tilted coplanar with the black hole's accretion disk.
 */
export function computeOrbitPointAtAngle(
  orbitRadius: number,
  orbitTilt: number,
  angle: number
): [number, number, number] {
  const safeR = getSafeOrbitRadius(orbitRadius);
  const ascendingNode = (safeR * 0.73) % (Math.PI * 2);
  const localX = Math.cos(angle) * safeR;
  const localZ = Math.sin(angle) * safeR;
  // True flat inclined circle centered directly on the black hole (never offset vertically)
  const localY = Math.sin(angle - ascendingNode) * orbitTilt * 0.85;

  const cosR = Math.cos(BLACK_HOLE_DISK_ROLL);
  const sinR = Math.sin(BLACK_HOLE_DISK_ROLL);
  const x = localX * cosR - localY * sinR;
  const y = localX * sinR + localY * cosR;
  const z = localZ;
  return [x, y, z];
}

/**
 * Generates closed circular 3D orbital path vertices for a planet so the planet
 * travels dead-center along its rendered circular orbital track.
 */
export function computeOrbitRingPoints(
  node: Pick<MemoryNode, 'orbitRadius' | 'orbitTilt'>,
  segments = 128
): Float32Array {
  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const [x, y, z] = computeOrbitPointAtAngle(
      node.orbitRadius,
      node.orbitTilt,
      angle
    );
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

/**
 * Computes a deterministic 3D orbital position around the black hole
 */
export function computeOrbitalWorldPosition(
  node: Pick<
    MemoryNode,
    'orbitRadius' | 'orbitAngle' | 'orbitSpeed' | 'orbitTilt'
  >,
  elapsedSeconds: number,
  speedMultiplier = 1
): [number, number, number] {
  const currentAngle =
    node.orbitAngle + elapsedSeconds * node.orbitSpeed * speedMultiplier;
  return computeOrbitPointAtAngle(
    node.orbitRadius,
    node.orbitTilt,
    currentAngle
  );
}

/**
 * Generates orbital parameters for a newly created planet node so it enters a balanced orbit
 * strictly outside Gargantua's accretion disk
 */
export function generateOrbitalParameters(existingCount: number): {
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
  orbitTilt: number;
  position: [number, number, number];
  starSize: number;
} {
  // Golden-angle distribution so new planets never stack on top of existing planets
  const goldenAngle = 2.399963229728653;
  const idx = existingCount + 1;
  const orbitAngle = (idx * goldenAngle) % (Math.PI * 2);
  // Distribute cleanly outside Gargantua's accretion disk (28.5 to 62.5)
  const normalizedBand = ((idx * 7) % 29) / 29;
  const orbitRadius = Number((28.5 + normalizedBand * 34.0).toFixed(2));
  // Keplerian-inspired angular velocity: closer planets orbit faster
  const orbitSpeed = Number((2.5 / Math.sqrt(orbitRadius)).toFixed(3)) * 0.28;
  const tiltSign = idx % 2 === 0 ? 1 : -1;
  const orbitTilt = Number(
    (tiltSign * (0.6 + ((idx * 13) % 22) * 0.11)).toFixed(2)
  );
  const [px, py, pz] = computeOrbitPointAtAngle(
    orbitRadius,
    orbitTilt,
    orbitAngle
  );
  const position: [number, number, number] = [
    Number(px.toFixed(2)),
    Number(py.toFixed(2)),
    Number(pz.toFixed(2)),
  ];
  const starSize = Number((1.18 + ((idx * 5) % 4) * 0.1).toFixed(2));

  return {
    orbitRadius,
    orbitAngle: Number(orbitAngle.toFixed(3)),
    orbitSpeed: Number(orbitSpeed.toFixed(3)),
    orbitTilt,
    position,
    starSize,
  };
}

/**
 * Deterministic fallback summarizer and tag extractor (used if Gemini API is unavailable or for instant local testing)
 */
export function localFallbackSummarize(
  rawText: string,
  customTitle?: string,
  preferredCategory?: MemoryCategory
): {
  title: string;
  category: MemoryCategory;
  summary: [string, string, string];
  tags: string[];
} {
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  const sentences = cleaned
    .split(/(?<=[.!?;\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const lower = cleaned.toLowerCase();

  // Detect astronomical category if not explicitly provided
  let category: MemoryCategory =
    preferredCategory || 'Hố đen & Hiện tượng Thiên hà';
  if (!preferredCategory) {
    if (
      /đại dương|nước|sự sống|habitable|kepler|trappist|ocean|trái đất|miller/.test(
        lower
      )
    ) {
      category = 'Hành tinh Đại dương & Sự sống';
    } else if (
      /khí|vành đai|sao thổ|sao mộc|saturn|jupiter|j1407b|gas|ring/.test(lower)
    ) {
      category = 'Khổng lồ Khí & Siêu Vành Đai';
    } else if (
      /dung nham|magma|lửa|nóng|núi lửa|lava|cancri|pulsar|cực đoan/.test(lower)
    ) {
      category = 'Hành tinh Dung nham & Cực đoan';
    } else if (
      /băng|lạnh|methane|hải vương|thiên vương|europa|titan|mann|ice|cryo/.test(
        lower
      )
    ) {
      category = 'Thế giới Băng giá & Kỳ dị';
    } else {
      category = 'Hố đen & Hiện tượng Thiên hà';
    }
  }

  const firstSentence = sentences[0] || cleaned.slice(0, 80);
  const title =
    customTitle && customTitle.trim().length > 0
      ? customTitle.trim()
      : firstSentence.length > 68
        ? `${firstSentence.slice(0, 65).trim()}...`
        : firstSentence;

  const b1 =
    sentences[0] ||
    `Đặc điểm thiên văn: ${cleaned.slice(0, 110)}${cleaned.length > 110 ? '...' : ''}`;
  const b2 =
    sentences[1] ||
    'Phân tích cấu trúc vật lý, thành phần khí quyển và tương tác hấp dẫn trong thiên hà.';
  const b3 =
    sentences[2] ||
    `Phân loại vào nhóm thiên thể: ${category} quanh hệ hố đen trung tâm.`;

  // Extract 3 meaningful astronomical tags matching constellation vocabulary
  const candidateTags: Array<{ pattern: RegExp; tag: string }> = [
    { pattern: /hố đen|black hole|chân trời sự kiện|kerr/i, tag: 'black-hole' },
    { pattern: /thấu kính|lensing|bẻ cong ánh sáng/i, tag: 'lensing' },
    { pattern: /tương đối|relativity|thời gian|einstein/i, tag: 'relativity' },
    { pattern: /đĩa bồi tụ|accretion|plasma|doppler/i, tag: 'accretion' },
    { pattern: /gargantua|interstellar|miller|mann/i, tag: 'gargantua' },
    { pattern: /ngoại hành tinh|exoplanet/i, tag: 'exoplanet' },
    { pattern: /sự sống|habitable|goldilocks/i, tag: 'habitable-zone' },
    { pattern: /đại dương|biển|nước|ocean/i, tag: 'ocean-world' },
    { pattern: /vành đai|ring|cassini/i, tag: 'ring-system' },
    { pattern: /khổng lồ khí|gas giant|sao mộc|sao thổ/i, tag: 'gas-giant' },
    { pattern: /dung nham|magma|lava|núi lửa/i, tag: 'lava-world' },
    { pattern: /băng|lạnh|methane|europa|titan/i, tag: 'cryo-world' },
    { pattern: /jwst|james webb|quang phổ/i, tag: 'jwst' },
    { pattern: /kepler/i, tag: 'kepler' },
  ];

  const tags: string[] = [];
  for (const item of candidateTags) {
    if (item.pattern.test(lower) && !tags.includes(item.tag)) {
      tags.push(item.tag);
    }
    if (tags.length === 3) break;
  }

  const defaultPool = ['exoplanet', 'black-hole', 'relativity', 'gargantua'];
  for (const fallbackTag of defaultPool) {
    if (tags.length >= 3) break;
    if (!tags.includes(fallbackTag)) {
      tags.push(fallbackTag);
    }
  }

  return {
    title,
    category,
    summary: [b1, b2, b3],
    tags: tags.slice(0, 3),
  };
}

export interface WasdFlightInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  boost: boolean;
}

/**
 * Pure 6-DOF WASD galactic flight displacement helper.
 * Scales speed smoothly with camera-to-target distance so close-up planetary surface
 * inspection glides gently while galactic-scale flight sweeps across the 105,700 ly Milky Way.
 */
export function computeWasdFlightDelta(
  input: WasdFlightInput,
  forwardDir: [number, number, number],
  rightDir: [number, number, number],
  distanceToTarget: number,
  deltaSeconds: number
): [number, number, number] {
  const moveForward = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
  const moveRight = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const moveUp = (input.up ? 1 : 0) - (input.down ? 1 : 0);

  if (moveForward === 0 && moveRight === 0 && moveUp === 0) {
    return [0, 0, 0];
  }

  let vx =
    forwardDir[0] * moveForward + rightDir[0] * moveRight;
  let vy =
    forwardDir[1] * moveForward + rightDir[1] * moveRight + moveUp;
  let vz =
    forwardDir[2] * moveForward + rightDir[2] * moveRight;

  const len = Math.hypot(vx, vy, vz);
  if (len > 1e-6) {
    vx /= len;
    vy /= len;
    vz /= len;
  }

  const baseSpeed = Math.max(0.0004, Math.min(115, distanceToTarget * 0.72));
  const speed = baseSpeed * (input.boost ? 3.2 : 1.0);
  const step = speed * Math.max(0, deltaSeconds);

  return [vx * step, vy * step, vz * step];
}

export const SGRA_SCHWARZSCHILD_RS = 1.76;
export const SGRA_LENSING_BOUND_RADIUS = 34.0;

/**
 * Exact Schwarzschild apparent black hole shadow critical impact parameter:
 * b_crit = (3 * sqrt(3) / 2) * r_s ≈ 2.598076 * r_s
 */
export function computeSchwarzschildShadowRadius(rs = SGRA_SCHWARZSCHILD_RS): number {
  return 1.5 * Math.sqrt(3) * rs;
}

/**
 * Computes relativistic gravitational light deflection angle (radians) for a photon
 * passing a Schwarzschild black hole at impact parameter `b > b_crit`:
 * Combines Einstein's 2nd-order weak-field expansion (2*rs/b + 15*pi/16*(rs/b)^2)
 * with the logarithmic strong-field photon-sphere divergence near b -> b_crit.
 */
export function computeGravitationalDeflectionRad(
  impactParam: number,
  rs = SGRA_SCHWARZSCHILD_RS
): number {
  const bCrit = computeSchwarzschildShadowRadius(rs);
  if (impactParam <= bCrit) {
    return Infinity; // Captured by the Event Horizon
  }
  const u = rs / impactParam;
  const weakField = 2.0 * u + ((15.0 * Math.PI) / 16.0) * u * u;
  const strongProximity = Math.max(1e-4, (impactParam - bCrit) / bCrit);
  const strongCorrection =
    strongProximity < 1.2
      ? Math.max(0, -Math.log(strongProximity) * 0.48 * Math.exp(-strongProximity * 1.8))
      : 0;
  return weakField + strongCorrection;
}

/**
 * Smooth outer lensing window matching the volumetric black hole shader so the
 * gravitationally lensed field blends seamlessly (zero edge seam) into unbent space.
 */
export function computeLensingBlendFactor(
  impactParam: number,
  innerFadeRadius = 23.5,
  outerBoundRadius = 33.2
): number {
  if (impactParam <= innerFadeRadius) return 1;
  if (impactParam >= outerBoundRadius) return 0;
  const t = (impactParam - innerFadeRadius) / (outerBoundRadius - innerFadeRadius);
  const smooth = t * t * (3 - 2 * t);
  return 1 - smooth;
}

/**
 * Determines whether a 3D world point sits strictly behind the black hole lens plane (origin)
 * along the camera viewing ray toward that point.
 */
export function isPointBehindBlackHolePlane(
  cameraPos: [number, number, number],
  pointPos: [number, number, number],
  margin = 0
): boolean {
  const rx = pointPos[0] - cameraPos[0];
  const ry = pointPos[1] - cameraPos[1];
  const rz = pointPos[2] - cameraPos[2];
  const distToCam = Math.hypot(rx, ry, rz);
  if (distToCam < 1e-6) return false;
  const tBhAlongRay =
    (-cameraPos[0] * rx - cameraPos[1] * ry - cameraPos[2] * rz) / distToCam;
  return distToCam > tBhAlongRay + margin;
}
