import * as THREE from 'three';

/**
 * Generates a subtle circular astronomical targeting reticle for selected/hovered planets
 */
export function createReticleTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const cx = size / 2;
    const cy = size / 2;
    ctx.clearRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255, 245, 225, 0.82)';
    ctx.lineWidth = 2.2;

    // 4 astronomical corner arc brackets
    const r = 104;
    const arcLen = Math.PI * 0.26;
    for (let i = 0; i < 4; i++) {
      const start = i * (Math.PI / 2) + 0.19;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + arcLen);
      ctx.stroke();
    }

    // Fine inner orbital ring with tick marks
    ctx.strokeStyle = 'rgba(255, 240, 210, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 84, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Deep Space Sky Dome Shader:
 * Matches the velvety pitch-black cosmic void of the Gargantua reference frame
 * with only whisper-faint cosmic dust so the golden striated black hole and planets have maximum contrast.
 */
export function createDeepSpaceDomeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;

      float hash3(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
              mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
              mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      void main() {
        vec3 planeNormal = normalize(vec3(0.22, 0.94, -0.25));
        float planeDist = abs(dot(vDir, planeNormal));
        float galacticBand = exp(-planeDist * planeDist * 14.0);
        float n = noise3(vDir * 4.5);

        // Deep obsidian void matching the Interstellar Gargantua reference
        vec3 voidCol = vec3(0.006, 0.007, 0.012);
        vec3 dustWarm = vec3(0.022, 0.017, 0.014);
        vec3 col = voidCol + dustWarm * galacticBand * n * 0.65;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });
}

/**
 * True 3D Geodesic Volumetric Raymarched Sagittarius A* / Gargantua Black Hole Shader
 * with Real-Time Astrophysical Gravitational Lensing of Background Stars, Milky Way & Objects:
 * - Velocity-Verlet Schwarzschild null geodesic raymarching (d^2x/dl^2 = -1.5 * rs * h^2 * x / r^5)
 * - Projects the gravitationally bent exit ray back through uViewProjMat to warp the live 3D
 *   background scene texture (uSceneTex) seamlessly around the accretion disk & Einstein ring,
 *   with a smooth 360° analytical Milky Way fallback for rays deflected >70° near the photon sphere.
 * - Writes exact per-fragment logarithmic gl_FragDepth from the real raymarch hit depth so
 *   planets in front of Sagittarius A* always occlude the black hole and lensing halo cleanly,
 *   while planets behind it are occluded and gravitationally lensed — with ZERO shadow holes.
 * - Uses Interleaved Gradient Noise jitter + Nyquist-safe band-limited plasma striations to
 *   eliminate concentric stair-stepping and moiré artifacts at every quality preset.
 */
export function createVolumetricBlackHoleMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    depthTest: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uDiskRoll: { value: 0.22 }, // ~12.6 deg diagonal tilt matching galactic plane
      uRaySteps: { value: 52.0 }, // Live adjustable raymarch step budget (24..96)
      uSceneTex: { value: null },
      uHasSceneTex: { value: 0.0 },
      uViewProjMat: { value: new THREE.Matrix4() },
      uResolution: { value: new THREE.Vector2(1440, 900) },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform float uTime;
      uniform float uDiskRoll;
      uniform float uRaySteps;
      uniform sampler2D uSceneTex;
      uniform float uHasSceneTex;
      uniform mat4 uViewProjMat;
      uniform vec2 uResolution;
      varying vec3 vWorldPos;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);

        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);

        return mix(nxy0, nxy1, f.z);
      }

      // Fast 2-octave 3D turbulent FBM for volumetric plasma & billowing dust clouds
      float fbm3(vec3 p) {
        float v = 0.0;
        v += 0.62 * noise3(p);
        p = p * 2.06 + vec3(13.1, -7.4, 5.2);
        v += 0.38 * noise3(p);
        return v;
      }

      // Rotate vector around Z axis by angle a
      vec3 rotZ(vec3 v, float a) {
        float c = cos(a);
        float s = sin(a);
        return vec3(c * v.x - s * v.y, s * v.x + c * v.y, v.z);
      }

      // 360-degree analytical Milky Way & pinpoint starfield fallback for extreme deflection rays (>65 deg)
      // that bend around the photon sphere past the viewport boundary
      vec3 evalBentDeepSpace(vec3 dirWorld, float diskRoll) {
        vec3 d = normalize(rotZ(dirWorld, -diskRoll));
        float planeDist = abs(d.y);
        float mwBand = exp(-planeDist * planeDist * 26.0);
        float cloud = fbm3(d * 6.0 + vec3(2.1, 0.0, -1.3));
        vec3 voidCol = vec3(0.008, 0.009, 0.015);
        vec3 mwBlue = vec3(0.14, 0.22, 0.42);
        vec3 mwWarm = vec3(0.32, 0.24, 0.16);
        vec3 col = voidCol + mix(mwBlue, mwWarm, cloud) * mwBand * (0.45 + 0.75 * cloud);

        // Crisp gravitationally-lensed pinpoint star grid along bent ray
        vec3 cell = floor(d * 135.0);
        float starRnd = hash31(cell);
        if (starRnd > 0.986) {
          vec3 center = (cell + 0.5) / 135.0;
          float dist2 = dot(d - normalize(center), d - normalize(center));
          float spark = exp(-dist2 * 52000.0) * smoothstep(0.986, 0.999, starRnd);
          vec3 starCol = mix(vec3(0.75, 0.86, 1.0), vec3(1.0, 0.88, 0.72), fract(starRnd * 73.1));
          col += starCol * spark * 1.4;
        }
        return col;
      }

      void main() {
        // Transform camera ray into tilted galactic local coordinates (disk equatorial plane is y = 0)
        vec3 roWorld = cameraPosition;
        vec3 rdWorld = normalize(vWorldPos - cameraPosition);

        vec3 ro = rotZ(roWorld, -uDiskRoll);
        vec3 rd = normalize(rotZ(rdWorld, -uDiskRoll));

        // Analytic ray-sphere intersection with extended gravitational lensing volume (R = 34.0)
        float R_BOUND = 34.0;
        float bProj = dot(ro, rd);
        float cSphere = dot(ro, ro) - R_BOUND * R_BOUND;
        float disc = bProj * bProj - cSphere;
        if (disc < 0.0) discard;

        float sqrtDisc = sqrt(disc);
        float tEnter = max(0.0, -bProj - sqrtDisc);
        float tExit = -bProj + sqrtDisc;
        if (tExit <= 0.0) discard;

        // Impact parameter (unbent closest distance to Sagittarius A*) and smooth physical lensing envelope
        float impactParam = length(cross(ro, rd));
        float forwardMask = smoothstep(-5.0, 3.0, -bProj);
        // Monotonic cubic taper from b = 8 -> 33.2 so deflection decays smoothly with ZERO pinched outer halo ring!
        float outerTaper = clamp((33.2 - impactParam) / 25.2, 0.0, 1.0);
        float lensFade = outerTaper * outerTaper * (3.0 - 2.0 * outerTaper) * forwardMask;

        // Relativistic Schwarzschild parameters:
        // rs = 1.76 -> apparent black hole shadow radius b_crit = 2.598 * 1.76 ≈ 4.57 units
        float rs = 1.76;
        float rHorizon = 1.84;
        float rPhoton = 1.5 * rs; // 2.64
        float rDiskIn = 3.05;
        float rDiskOut = 23.6;

        // Interleaved Gradient Noise ray-start dither eliminates concentric shell stair-stepping without visible stipple grain
        float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));

        vec3 pos = ro + rd * tEnter;
        vec3 dir = rd;
        float tMarched = tEnter;

        // Conserved specific angular momentum h^2 = |x x v|^2 for null geodesic bending
        vec3 Lvec = cross(pos, dir);
        float h2 = dot(Lvec, Lvec);

        vec3 accumCol = vec3(0.0);
        float transmittance = 1.0;
        float hitHorizon = 0.0;
        float minR = 100.0;
        float photonRingGlow = 0.0;
        float diskDepthSum = 0.0;
        float diskWeightSum = 0.0;

        // Gargantua / Sagittarius A* Reference Color Palette
        vec3 colCreamWhite = vec3(1.00, 0.975, 0.91);
        vec3 colChampagne  = vec3(0.96, 0.79, 0.50);
        vec3 colBronze     = vec3(0.62, 0.36, 0.14);
        vec3 colEspresso   = vec3(0.08, 0.036, 0.012);
        vec3 colSlateBlue  = vec3(0.46, 0.61, 0.84);

        // Adaptive Symplectic Geodesic Raymarching Loop (silky-smooth across all quality tiers)
        float effSteps = clamp(uRaySteps * 1.45, 52.0, 136.0);
        float stepScale = 80.0 / effSteps;
        for (int i = 0; i < 136; i++) {
          if (float(i) >= effSteps) break;
          float r2 = dot(pos, pos);
          float r = sqrt(r2);
          minR = min(minR, r);

          // 1. Check Event Horizon capture
          if (r < rHorizon) {
            hitHorizon = 1.0;
            break;
          }

          // Exit bounding sphere once ray leaves outward
          if (r > R_BOUND + 0.6 && dot(pos, dir) > 0.0) {
            break;
          }

          float rCyl = length(pos.xz);
          float nearDisk = 1.0 - smoothstep(1.0, 3.8, abs(pos.y));
          float inDiskR = 1.0 - smoothstep(rDiskOut - 1.0, rDiskOut + 4.0, rCyl);
          float nearPhotonZone = 1.0 - smoothstep(4.5, 11.5, r);
          float detailWeight = clamp(max(nearDisk * inDiskR, nearPhotonZone), 0.0, 1.0);

          float dt = mix(
            clamp(r * 0.14 * stepScale, 0.28, 2.25),
            clamp(r * 0.038 * stepScale, 0.085, 0.38),
            detailWeight
          );

          if (i == 0) {
            float jitterOffset = dt * (ign - 0.5) * 0.52;
            pos += dir * jitterOffset;
            tMarched = max(0.0, tMarched + jitterOffset);
          }

          // Accumulate delicate cool slate-blue scattering right along the photon sphere boundary
          float phDist = abs(r - rPhoton * 1.07);
          photonRingGlow += exp(-phDist * phDist * 4.4) * dt * 0.12;

          // 2. Evaluate Sculpted Thick 3D Volumetric Accretion Disk
          if (rCyl > rDiskIn && rCyl < rDiskOut) {
            float normR = clamp((rCyl - rDiskIn) / (rDiskOut - rDiskIn), 0.0, 1.0);

            float innerPuff = 0.36 * exp(-pow((rCyl - 5.2) * 0.38, 2.0));
            float diskH = 0.36 + innerPuff + 0.034 * (rCyl - rDiskIn);

            if (abs(pos.y) < diskH * 2.35) {
              float vCoord = pos.y / diskH;
              float angle = atan(pos.z, pos.x);

              // Differential Keplerian shear spiral coordinate
              float omega = 1.5 / pow(max(rCyl, 2.5), 0.72);
              float swirlAngle = angle + 22.0 / (rCyl + 1.4) - uTime * omega * 0.62;

              vec3 sampleP = vec3(
                cos(swirlAngle) * (rCyl * 0.42),
                pos.y * 2.15,
                sin(swirlAngle) * (rCyl * 0.42)
              );

              float cloudMacro = fbm3(sampleP * 0.80 + vec3(rCyl * 0.48, 0.0, -uTime * 0.11));
              float cloudFine  = noise3(sampleP * 1.85 + vec3(0.0, pos.y * 1.5, uTime * 0.18));

              // Nyquist-safe band-limited concentric fibrous striations (velvety smooth, zero moiré)
              float aaMid  = exp(-dt * 1.45);
              float aaFine = exp(-dt * 2.95);
              float radialPhase = rCyl * 2.55 + cloudMacro * 2.4;
              float band1 = 0.5 + 0.5 * sin(radialPhase * 1.85);
              float band2 = mix(0.5, 0.5 + 0.5 * sin(rCyl * 6.8 + cloudFine * 2.1 - uTime * 0.30), aaMid);
              float band3 = mix(0.5, 0.5 + 0.5 * sin(rCyl * 12.2 + cloudMacro * 1.6), aaFine);
              float striations = clamp(band1 * 0.50 + band2 * 0.34 + band3 * 0.16, 0.0, 1.0);

              float verticalWarp = vCoord + (cloudMacro - 0.5) * 0.34;
              float verticalEnv = exp(-verticalWarp * verticalWarp * 2.55);

              float innerEdge = smoothstep(0.0, 0.045, normR);
              float outerEdge = pow(clamp(1.0 - smoothstep(0.20, 1.0, normR), 0.0, 1.0), 1.32);

              float fibrousStructure = smoothstep(0.14, 0.86, striations * 0.58 + cloudMacro * 0.42);
              float density = verticalEnv * innerEdge * outerEdge * (0.42 + 0.92 * fibrousStructure);

              if (density > 0.004) {
                // Dark espresso-brown absorbing dust lane along the lower/front equatorial lip
                float dustLayerMask = exp(-pow((vCoord + 0.34) * 2.35, 2.0))
                  * smoothstep(0.10, 0.46, normR)
                  * smoothstep(0.68, 0.22, cloudMacro * 0.65 + cloudFine * 0.35);

                // Relativistic Doppler beaming (left shoulder approaches viewer & blazes hotter)
                vec3 keplerVel = normalize(vec3(-pos.z, 0.0, pos.x));
                float doppler = dot(keplerVel, -dir);
                float beaming = clamp(pow(1.0 + doppler * 0.36, 1.75), 0.62, 1.65);

                vec3 plasmaCol = mix(colCreamWhite, colChampagne, smoothstep(0.0, 0.32, normR));
                plasmaCol = mix(plasmaCol, colBronze, smoothstep(0.28, 0.68, normR));
                plasmaCol = mix(plasmaCol, colEspresso, smoothstep(0.64, 0.96, normR));

                float upperCrest = smoothstep(-0.15, 0.65, vCoord) * (1.0 - normR * 0.55);
                float crestBoost = smoothstep(0.36, 0.90, striations * 0.64 + cloudFine * 0.36);
                plasmaCol = mix(plasmaCol * 0.74, colCreamWhite, clamp(crestBoost * 0.46 + upperCrest * 0.28, 0.0, 0.78));
                plasmaCol = mix(plasmaCol, colCreamWhite * 1.28, exp(-normR * 6.8) * 0.66);

                vec3 emitCol = mix(plasmaCol, colEspresso * 0.38, dustLayerMask * 0.88);

                float emissionStrength = density * (0.85 + 0.92 * crestBoost) * (1.0 - dustLayerMask * 0.74) * beaming;
                float extinction = density * (1.25 + dustLayerMask * 2.65);

                float stepAlpha = 1.0 - exp(-extinction * dt * 1.05);
                float wDepth = transmittance * stepAlpha;
                diskDepthSum += tMarched * wDepth;
                diskWeightSum += wDepth;

                accumCol += transmittance * emitCol * emissionStrength * dt * 1.15;
                transmittance *= (1.0 - stepAlpha);

                if (transmittance < 0.015) {
                  transmittance = 0.0;
                  break;
                }
              }
            }
          }

          // 3. Velocity-Verlet (2nd-order) Schwarzschild null geodesic deflection
          vec3 acc = -1.5 * rs * h2 * pos / (r2 * r2 * r);
          vec3 dirHalf = normalize(dir + acc * (dt * 0.5));
          vec3 posNext = pos + dirHalf * dt;
          float r2Next = dot(posNext, posNext);
          float rNext = max(0.25, sqrt(r2Next));
          vec3 accNext = -1.5 * rs * h2 * posNext / (r2Next * r2Next * rNext);
          dir = normalize(dir + (acc + accNext) * (dt * 0.5));
          pos = posNext;
          tMarched += dt;
        }

        // Tone-compress ONLY the hot plasma emission so background lensed starlight matches unbent space seamlessly
        vec3 mappedDisk = accumCol / (vec3(1.0) + accumCol * 0.45);
        mappedDisk = pow(max(mappedDisk, vec3(0.0)), vec3(0.96));

        vec3 finalCol = mappedDisk;
        float finalAlpha = 0.0;

        if (hitHorizon > 0.5) {
          float shadowRimFactor = clamp(photonRingGlow * 0.95, 0.0, 0.72);
          vec3 shadowBase = mix(vec3(0.005, 0.006, 0.010), colSlateBlue * 0.72, shadowRimFactor);
          finalCol = mappedDisk + transmittance * shadowBase;
          finalAlpha = 1.0;
        } else {
          // Real-Time Astrophysical Gravitational Lensing of Background Light & Objects:
          // Transform the deflected exit ray back to world space and sample the live 3D background scene!
          vec3 bentDirWorld = normalize(rotZ(dir, uDiskRoll));
          // Gently blend deflection to zero across the outer region so there is ZERO pinched fish-eye bubble ring
          vec3 finalRayDir = normalize(mix(rdWorld, bentDirWorld, lensFade));
          float deflectAngle = acos(clamp(dot(rdWorld, finalRayDir), -1.0, 1.0));

          vec3 lensedBg = evalBentDeepSpace(finalRayDir, uDiskRoll);
          if (uHasSceneTex > 0.5) {
            vec3 lensedFarWorld = cameraPosition + finalRayDir * 600.0;
            vec4 lensedClip = uViewProjMat * vec4(lensedFarWorld, 1.0);
            vec2 lensedUv = (lensedClip.xy / max(lensedClip.w, 0.0001)) * 0.5 + 0.5;

            float inViewport = step(0.001, lensedClip.w)
              * smoothstep(0.0, 0.08, lensedUv.x) * smoothstep(1.0, 0.92, lensedUv.x)
              * smoothstep(0.0, 0.08, lensedUv.y) * smoothstep(1.0, 0.92, lensedUv.y);

            vec3 sampledScene = texture2D(uSceneTex, clamp(lensedUv, vec2(0.002), vec2(0.998))).rgb;
            lensedBg = mix(lensedBg, sampledScene, inViewport);
          }

          // Subtle Einstein-ring gravitational magnification & photon-sphere blue-slate caustic shimmer
          float einsteinMagnify = 1.0 + 0.36 * exp(-pow((minR - rPhoton * 1.18) * 1.35, 2.0)) * smoothstep(0.12, 0.85, deflectAngle);
          float nearPhoton = exp(-pow((minR - rPhoton * 1.05) * 2.2, 2.0));
          vec3 photonScatter = colSlateBlue * nearPhoton * 0.42;

          finalCol = mappedDisk + transmittance * (lensedBg * einsteinMagnify + photonScatter);

          float diskLuma = dot(mappedDisk, vec3(0.299, 0.587, 0.114));
          float diskAlpha = clamp((1.0 - transmittance) * 1.18 + smoothstep(0.008, 0.15, diskLuma) * 0.85, 0.0, 1.0);
          // Fade lensing halo strictly where physical gravitational deflection becomes negligible -> zero outer seam!
          float lensAlpha = smoothstep(0.018, 0.14, deflectAngle) * lensFade;
          finalAlpha = max(diskAlpha, lensAlpha);
        }

        if (finalAlpha < 0.004) discard;
        gl_FragColor = vec4(finalCol, finalAlpha);

        // Exact per-fragment logarithmic Z-depth from real raymarch hit surface so:
        // - Planets IN FRONT of Sagittarius A* cleanly occlude both the black hole & its lensing halo
        // - Planets BEHIND Sagittarius A* are cleanly occluded & gravitationally lensed
        float tShadowFront = max(0.05, -bProj - sqrt(max(0.0, 20.43 - impactParam * impactParam)));
        float tLensPlane = max(0.05, -bProj);
        float tDiskAvg = diskWeightSum > 0.02 ? (diskDepthSum / diskWeightSum) : tLensPlane;
        float tDepth = hitHorizon > 0.5
          ? (diskWeightSum > 0.25 ? min(tDiskAvg, tShadowFront) : tShadowFront)
          : (diskWeightSum > 0.14 ? tDiskAvg : tLensPlane);

        vec3 depthWorldPos = cameraPosition + rdWorld * tDepth;
        vec4 depthClip = uViewProjMat * vec4(depthWorldPos, 1.0);
        #if defined( USE_LOGDEPTHBUF )
          gl_FragDepth = log2( max(1.0 + depthClip.w, 1e-6) ) * logDepthBufFC * 0.5;
        #else
          gl_FragDepth = clamp((depthClip.z / max(depthClip.w, 1e-6)) * 0.5 + 0.5, 0.0, 1.0);
        #endif
      }
    `,
  });
}

/**
 * Photorealistic 3D Procedural Planet Shader:
 * Renders 6 scientifically inspired exoplanet / solar-system archetypes in 3D spherical coordinates
 * (zero UV seam), dynamically illuminated by Gargantua at world origin (0, 0, 0) with:
 * - Lambertian dayside + twilight terminator scattering + nightside ambient/lava emission
 * - Blinn-Phong specular ocean & ice reflection of the golden accretion disk
 * - Animated 3D cloud layer & atmospheric Fresnel limb scattering
 */
export function createRealisticPlanetMaterial(
  archetypeId: number,
  seed: number,
  atmosphereColor: THREE.Color
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    depthTest: true,
    uniforms: {
      uTime: { value: 0 },
      uArchetype: { value: archetypeId },
      uSeed: { value: seed },
      uAtmoColor: { value: atmosphereColor.clone() },
      uOpacity: { value: 1.0 },
      uHighlight: { value: 0.0 },
      uLightPos: { value: new THREE.Vector3(0, 0, 0) },
      uDetailBoost: { value: 0.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;
      void main() {
        vLocalPos = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uArchetype;
      uniform float uSeed;
      uniform vec3 uAtmoColor;
      uniform float uOpacity;
      uniform float uHighlight;
      uniform vec3 uLightPos;
      uniform float uDetailBoost;

      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vWorldNormal;

      float hash3(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3) + uSeed * 0.07);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash3(i + vec3(0,0,0)), hash3(i + vec3(1,0,0)), f.x),
              mix(hash3(i + vec3(0,1,0)), hash3(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash3(i + vec3(0,0,1)), hash3(i + vec3(1,0,1)), f.x),
              mix(hash3(i + vec3(0,1,1)), hash3(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm3(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise3(p);
          p = p * 2.08 + vec3(1.7, -2.3, 0.9);
          a *= 0.5;
        }
        return v;
      }

      // Multi-scale procedural crater field for airless rocky worlds (Mercury, Mars highlands)
      float craterLayer(vec3 p, float freq) {
        vec3 sp = p * freq;
        vec3 cell = floor(sp);
        vec3 frac = fract(sp) - 0.5;
        float minD = 1.0;
        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            for (int z = -1; z <= 1; z++) {
              vec3 n = vec3(float(x), float(y), float(z));
              vec3 c = cell + n;
              vec3 jitter = vec3(
                hash3(c + vec3(1.1, 0.0, 0.0)),
                hash3(c + vec3(0.0, 2.3, 0.0)),
                hash3(c + vec3(0.0, 0.0, 3.7))
              ) - 0.5;
              float d = length(frac - n - jitter * 0.68);
              minD = min(minD, d);
            }
          }
        }
        float bowl = smoothstep(0.14, 0.36, minD);
        float rim = exp(-pow((minD - 0.37) * 14.0, 2.0)) * 0.28;
        return bowl - 0.22 + rim;
      }

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(cameraPosition - vWorldPos);
        // Primary illumination from host star (Sun for Solar System in 1:1 mode) or Galactic Core
        vec3 lightVec = uLightPos - vWorldPos;
        vec3 L = length(lightVec) > 0.0001 ? normalize(lightVec) : vec3(0.0, 1.0, 0.0);

        float NdotL = dot(N, L);
        float dayFactor = smoothstep(-0.22, 0.65, NdotL);
        float twilight = exp(-pow((NdotL + 0.04) * 5.5, 2.0));
        float fresnel = pow(1.0 - max(dot(N, V), 0.0), 3.0);

        vec3 H = normalize(L + V);
        float specBase = pow(max(dot(N, H), 0.0), 32.0) * smoothstep(-0.05, 0.35, NdotL);

        vec3 p = normalize(vLocalPos);
        float lat = p.y;

        float cloudSpin = uTime * 0.06;
        vec3 cloudPos = vec3(
          p.x * cos(cloudSpin) - p.z * sin(cloudSpin),
          p.y,
          p.x * sin(cloudSpin) + p.z * cos(cloudSpin)
        );

        vec3 surfaceAlbedo = vec3(0.5);
        float specularMask = 0.0;
        float cloudAlpha = 0.0;
        vec3 nightEmission = vec3(0.0);

        if (uArchetype < 0.5) {
          // ARCHETYPE 0: Deep Ocean / Hycean World (Kepler-22b, K2-18b, Proxima b)
          float bathymetry = fbm3(p * 3.4);
          float microWave = fbm3(p * 14.0);
          float islandMask = smoothstep(0.67, 0.73, bathymetry);
          vec3 deepOcean = vec3(0.03, 0.15, 0.32);
          vec3 shallowSea = vec3(0.08, 0.44, 0.60);
          vec3 archipelago = vec3(0.68, 0.66, 0.54);

          surfaceAlbedo = mix(deepOcean, shallowSea, smoothstep(0.24, 0.65, bathymetry + microWave * 0.08));
          surfaceAlbedo = mix(surfaceAlbedo, archipelago, islandMask);

          float polarIce = smoothstep(0.75, 0.89, abs(lat) + 0.12 * bathymetry);
          surfaceAlbedo = mix(surfaceAlbedo, vec3(0.92, 0.96, 1.0), polarIce);

          float cyclone = fbm3(cloudPos * 4.5 + vec3(0.0, lat * 2.4, 0.0));
          cloudAlpha = smoothstep(0.47, 0.79, cyclone) * 0.72;
          specularMask = (1.0 - islandMask) * (1.0 - cloudAlpha * 0.8) * 0.95;
        } else if (uArchetype < 1.5) {
          // ARCHETYPE 1: Saturn / J1407b (Pale Golden Cassini Ringed Gas Giant)
          float turb = fbm3(p * 4.2);
          float fineTurb = fbm3(p * 13.0);
          float zonal = sin(lat * 26.0 + turb * 2.8);
          float fineBands = sin(lat * 64.0 - fineTurb * 1.9);

          vec3 colCream  = vec3(0.96, 0.90, 0.76);
          vec3 colGold   = vec3(0.84, 0.68, 0.44);
          vec3 colOchre  = vec3(0.68, 0.50, 0.30);
          vec3 colPolar  = vec3(0.36, 0.43, 0.50);

          surfaceAlbedo = mix(colGold, colCream, 0.5 + 0.5 * zonal);
          surfaceAlbedo = mix(surfaceAlbedo, colOchre, smoothstep(0.12, 0.82, 0.5 + 0.5 * fineBands) * 0.48);
          surfaceAlbedo = mix(surfaceAlbedo, colPolar, smoothstep(0.73, 0.95, abs(lat)));
          specularMask = 0.14;
        } else if (uArchetype < 2.5) {
          // ARCHETYPE 2: NASA Blue Marble Earth / Kepler-452b / TRAPPIST-1e
          float elev = fbm3(p * 2.9 + vec3(1.2));
          float ridge = fbm3(p * 11.5 + vec3(3.1));
          float moisture = fbm3(p * 4.6 + vec3(5.4));
          float landMask = smoothstep(0.47, 0.505, elev + (ridge - 0.5) * 0.09);

          vec3 oceanDeep = vec3(0.03, 0.13, 0.35);
          vec3 oceanCoast = vec3(0.07, 0.38, 0.56);
          vec3 oceanCol = mix(oceanDeep, oceanCoast, smoothstep(0.32, 0.48, elev));

          vec3 forestCol = vec3(0.11, 0.34, 0.18);
          vec3 savannaCol = vec3(0.44, 0.50, 0.25);
          vec3 desertCol = vec3(0.78, 0.65, 0.44);
          vec3 mountainCol = vec3(0.56, 0.52, 0.49);

          vec3 landCol = mix(desertCol, savannaCol, smoothstep(0.28, 0.54, moisture));
          landCol = mix(landCol, forestCol, smoothstep(0.50, 0.78, moisture));
          landCol = mix(landCol, mountainCol, smoothstep(0.66, 0.84, elev + ridge * 0.14));

          surfaceAlbedo = mix(oceanCol, landCol, landMask);

          float iceCap = smoothstep(0.72, 0.85, abs(lat) + 0.14 * (elev - 0.5));
          surfaceAlbedo = mix(surfaceAlbedo, vec3(0.95, 0.97, 1.0), iceCap);

          float clouds = fbm3(cloudPos * 4.4) * 0.75 + fbm3(cloudPos * 12.0) * 0.25;
          cloudAlpha = smoothstep(0.49, 0.76, clouds) * 0.80;
          specularMask = (1.0 - landMask) * (1.0 - iceCap) * (1.0 - cloudAlpha * 0.85) * 0.92;

          float cityNoise = smoothstep(0.64, 0.76, fbm3(p * 16.0));
          nightEmission = vec3(1.0, 0.78, 0.42) * landMask * (1.0 - iceCap) * cityNoise * (1.0 - dayFactor) * 0.30;
        } else if (uArchetype < 3.5) {
          // ARCHETYPE 3: Volcanic / Magma Worlds (55 Cancri e, K2-141b, Io, KELT-9b)
          float crustNoise = fbm3(p * 3.8);
          float detailNoise = fbm3(p * 11.0 - vec3(uTime * 0.03));
          float fissure = pow(clamp(1.0 - abs(crustNoise - 0.48) * 5.2, 0.0, 1.0), 2.3);
          float hotSpot = smoothstep(0.68, 0.88, detailNoise) * smoothstep(0.35, 0.75, crustNoise);
          float lavaIntensity = clamp(fissure + hotSpot * 0.85, 0.0, 1.0);

          vec3 basaltCol = vec3(0.12, 0.10, 0.11);
          vec3 warmRock  = vec3(0.30, 0.20, 0.15);
          vec3 magmaRed  = vec3(0.96, 0.24, 0.04);
          vec3 magmaYellow = vec3(1.0, 0.86, 0.34);

          vec3 lavaCol = mix(magmaRed, magmaYellow, smoothstep(0.35, 0.92, lavaIntensity));
          surfaceAlbedo = mix(basaltCol, warmRock, detailNoise);
          surfaceAlbedo = mix(surfaceAlbedo, lavaCol, lavaIntensity * 0.78);

          nightEmission = lavaCol * lavaIntensity * 1.15;
          specularMask = 0.20;
        } else if (uArchetype < 4.5) {
          // ARCHETYPE 4: Neptune / Uranus / Europa Cryogenic Ice Worlds
          float glacier = fbm3(p * 3.6);
          float crevasse = abs(fbm3(p * 9.5) - 0.5) * 2.0;
          float band = 0.5 + 0.5 * sin(lat * 20.0 + glacier * 2.6);

          vec3 deepMethane = vec3(0.09, 0.22, 0.58);
          vec3 cryoCyan    = vec3(0.30, 0.66, 0.90);
          vec3 ammoniaIce  = vec3(0.86, 0.93, 0.99);

          surfaceAlbedo = mix(deepMethane, cryoCyan, band * 0.65 + glacier * 0.35);
          surfaceAlbedo = mix(surfaceAlbedo, ammoniaIce, smoothstep(0.48, 0.84, crevasse) * 0.62);

          float highHaze = fbm3(cloudPos * 5.2);
          cloudAlpha = smoothstep(0.54, 0.82, highHaze) * 0.50;
          specularMask = 0.62;
        } else if (uArchetype < 5.5) {
          // ARCHETYPE 5: NASA Juno Jupiter / Kepler-90h (Banded Storm Gas Giant + Great Red Spot)
          float turb = fbm3(p * 4.8);
          float eddy = fbm3(p * 14.0);
          float zones = sin(lat * 22.0 + turb * 4.2 + eddy * 0.9);
          float fineBelt = sin(lat * 48.0 - turb * 3.1);
          vec2 stormDelta = vec2((p.x - 0.45) * 1.15, (lat + 0.26) * 2.5);
          float stormSpot = exp(-dot(stormDelta, stormDelta) * 15.0);
          float stormSwirl = sin(length(stormDelta) * 28.0 + eddy * 4.0) * 0.5 + 0.5;

          vec3 beltRust  = vec3(0.56, 0.30, 0.18);
          vec3 beltOchre = vec3(0.76, 0.54, 0.34);
          vec3 zoneCream = vec3(0.95, 0.89, 0.78);
          vec3 stormRed  = mix(vec3(0.82, 0.28, 0.14), vec3(0.96, 0.54, 0.28), stormSwirl);

          surfaceAlbedo = mix(beltRust, zoneCream, smoothstep(-0.58, 0.58, zones));
          surfaceAlbedo = mix(surfaceAlbedo, beltOchre, smoothstep(0.2, 0.8, 0.5 + 0.5 * fineBelt) * 0.38);
          surfaceAlbedo = mix(surfaceAlbedo, stormRed, stormSpot * 0.92);
          specularMask = 0.14;
        } else if (uArchetype < 6.5) {
          // ARCHETYPE 6: NASA Mars (Iron-Oxide Rusty Terracotta, Valles Marineris, Polar CO2 Ice Caps)
          float terrain = fbm3(p * 3.4 + vec3(2.1));
          float microDust = fbm3(p * 13.5);
          float craters = craterLayer(p, 5.5);
          // Dark basaltic Syrtis Major & Valles Marineris canyon rift near equator
          float canyonRift = exp(-pow((lat + 0.08 + 0.08 * sin(p.x * 4.0)) * 9.5, 2.0)) * smoothstep(0.1, 0.8, p.x);

          vec3 dustyRust   = vec3(0.78, 0.38, 0.21);
          vec3 brightOchre = vec3(0.88, 0.54, 0.32);
          vec3 darkBasalt  = vec3(0.38, 0.19, 0.13);

          surfaceAlbedo = mix(darkBasalt, dustyRust, smoothstep(0.26, 0.62, terrain));
          surfaceAlbedo = mix(surfaceAlbedo, brightOchre, smoothstep(0.55, 0.85, microDust) * 0.55);
          surfaceAlbedo *= (0.88 + 0.22 * craters);
          surfaceAlbedo = mix(surfaceAlbedo, darkBasalt * 0.72, canyonRift * 0.75);

          // Crisp NASA white polar CO2 & water ice caps
          float marsPolar = smoothstep(0.80, 0.89, abs(lat) + 0.08 * (terrain - 0.5));
          surfaceAlbedo = mix(surfaceAlbedo, vec3(0.96, 0.94, 0.92), marsPolar);

          // Thin wispy Martian dust haze
          cloudAlpha = smoothstep(0.68, 0.88, fbm3(cloudPos * 5.0)) * 0.18;
          specularMask = marsPolar * 0.35;
        } else if (uArchetype < 7.5) {
          // ARCHETYPE 7: NASA MESSENGER Mercury (Multi-Scale Impact Craters & Charcoal-Silver Regolith)
          float macroBasin = fbm3(p * 3.2);
          float microRegolith = fbm3(p * 16.0);
          float bigCraters = craterLayer(p, 4.2);
          float smallCraters = craterLayer(p + vec3(1.9), 11.5);

          vec3 darkMare   = vec3(0.28, 0.27, 0.26);
          vec3 midRego    = vec3(0.50, 0.48, 0.46);
          vec3 ejectaRay  = vec3(0.76, 0.74, 0.71);

          surfaceAlbedo = mix(darkMare, midRego, smoothstep(0.28, 0.72, macroBasin));
          surfaceAlbedo *= (0.76 + 0.34 * bigCraters) * (0.86 + 0.22 * smallCraters);
          surfaceAlbedo = mix(surfaceAlbedo, ejectaRay, smoothstep(0.68, 0.90, microRegolith * bigCraters) * 0.55);
          specularMask = 0.08;
        } else if (uArchetype < 8.5) {
          // ARCHETYPE 8: NASA Magellan / Akatsuki Venus & Titan (Dense Creamy-Golden Sulfuric Cloud Deck)
          float chevron = fbm3(cloudPos * 3.6 + vec3(abs(lat) * 2.2, 0.0, 0.0));
          float fineSwirl = fbm3(cloudPos * 10.5);
          float bandWave = 0.5 + 0.5 * sin(lat * 14.0 + chevron * 3.8);

          vec3 deepSulfur  = vec3(0.76, 0.54, 0.26);
          vec3 warmCream   = vec3(0.94, 0.82, 0.56);
          vec3 brightHaze  = vec3(0.98, 0.92, 0.74);

          surfaceAlbedo = mix(deepSulfur, warmCream, bandWave * 0.65 + chevron * 0.35);
          surfaceAlbedo = mix(surfaceAlbedo, brightHaze, smoothstep(0.52, 0.86, fineSwirl) * 0.55);
          cloudAlpha = 0.12;
          specularMask = 0.20;
        } else if (uArchetype < 9.5) {
          // ARCHETYPE 9: Luminous Gaia DR3 Main-Sequence & Supergiant Star Photosphere (Sun, Sirius, Betelgeuse, Rigel, UY Scuti)
          float boilA = fbm3(p * 6.5 + vec3(uTime * 0.08, -uTime * 0.05, uTime * 0.06));
          float boilB = fbm3(p * 16.5 - vec3(uTime * 0.14, uTime * 0.09, 0.0));
          float granules = clamp(boilA * 0.62 + boilB * 0.38, 0.0, 1.0);
          float sunspot = smoothstep(0.24, 0.12, boilA) * smoothstep(0.6, 0.1, abs(lat));
          float viewDot = clamp(dot(N, V), 0.0, 1.0);
          // Physical stellar limb darkening (Eddington approximation)
          float limbDarkening = 0.42 + 0.58 * pow(viewDot, 0.55);

          vec3 coreWhite = mix(uAtmoColor, vec3(1.0, 0.99, 0.94), 0.78);
          vec3 midPlasma = uAtmoColor * 1.48;
          vec3 darkCell  = uAtmoColor * 0.62;

          vec3 starCol = mix(darkCell, midPlasma, smoothstep(0.18, 0.66, granules));
          starCol = mix(starCol, coreWhite, smoothstep(0.50, 0.90, granules) * 0.92);
          starCol *= (1.0 - sunspot * 0.42);
          starCol *= (limbDarkening * 1.42 + fresnel * 0.58);
          starCol += mix(uAtmoColor, vec3(1.0, 0.96, 0.84), 0.45) * (0.48 + uHighlight * 0.28);

          gl_FragColor = vec4(starCol, uOpacity);
          #include <logdepthbuf_fragment>
          return;
        } else if (uArchetype < 10.5) {
          // ARCHETYPE 10: NASA JPL Cratered Rocky Asteroid / Dwarf Planet / Moon (Moon, Ganymede, Pluto, Ceres, 4 Vesta, Bennu, 'Oumuamua)
          float macroTerrain = fbm3(p * 3.1 + vec3(0.8));
          float regolith = fbm3(p * 15.0 + vec3(2.4));
          float largeCraters = craterLayer(p, 3.8);
          float microCraters = craterLayer(p + vec3(2.3), 10.2);

          vec3 darkBasalt = mix(vec3(0.18, 0.17, 0.18), uAtmoColor * 0.34, 0.35);
          vec3 midRegolith = mix(vec3(0.46, 0.44, 0.42), uAtmoColor * 0.72, 0.35);
          vec3 brightIceOrEjecta = mix(vec3(0.84, 0.82, 0.80), uAtmoColor * 1.15, 0.30);

          surfaceAlbedo = mix(darkBasalt, midRegolith, smoothstep(0.26, 0.72, macroTerrain));
          surfaceAlbedo *= (0.72 + 0.38 * largeCraters) * (0.86 + 0.22 * microCraters);
          surfaceAlbedo = mix(surfaceAlbedo, brightIceOrEjecta, smoothstep(0.64, 0.88, regolith * largeCraters) * 0.62);
          specularMask = 0.10;
        } else {
          // ARCHETYPE 11: Active Icy Comet Nucleus (1P/Halley — Carbon-Black Crust + Glowing Sublimating Cyan-White Ice Jets)
          float crust = fbm3(p * 4.5);
          float pits = craterLayer(p, 5.2);
          float activeVent = smoothstep(0.64, 0.84, fbm3(p * 9.5 + vec3(uTime * 0.04)));

          vec3 carbonCrust = vec3(0.11, 0.11, 0.13);
          vec3 dustyIce = vec3(0.32, 0.42, 0.52);
          vec3 jetCyan = vec3(0.65, 0.92, 1.0);

          surfaceAlbedo = mix(carbonCrust, dustyIce, smoothstep(0.38, 0.76, crust));
          surfaceAlbedo *= (0.78 + 0.30 * pits);
          surfaceAlbedo = mix(surfaceAlbedo, jetCyan, activeVent * 0.65);
          nightEmission = jetCyan * activeVent * (0.55 + 0.45 * dayFactor) + vec3(0.25, 0.62, 0.92) * fresnel * 0.65;
          specularMask = 0.38;
        }

        // Composite white-gold cloud layer over planetary surface
        vec3 cloudColor = vec3(0.98, 0.96, 0.93);
        vec3 compositeAlbedo = mix(surfaceAlbedo, cloudColor, cloudAlpha);

        // High-frequency micro-relief & atmospheric eddy detail unlocked on RTX 3050-4050 / Ultra
        float microShade = 1.0;
        if (uDetailBoost > 0.01) {
          float fineA = noise3(p * 26.0 + vec3(uSeed * 0.13));
          float fineB = noise3(p * 62.0 - vec3(uSeed * 0.27));
          float micro = (fineA * 0.62 + fineB * 0.38) - 0.5;
          compositeAlbedo *= (1.0 + micro * 0.24 * uDetailBoost);
          // Subtle micro-bump relief along terminator for solid & storm surfaces (non-stars)
          if (uArchetype < 8.5 || uArchetype > 9.5) {
            float fineShift = noise3((p + L * 0.018) * 26.0 + vec3(uSeed * 0.13));
            microShade = clamp(1.0 + (fineShift - fineA) * 1.45 * uDetailBoost, 0.78, 1.24);
          }
        }

        vec3 coreLightCol = vec3(1.0, 0.95, 0.86);
        vec3 ambientSpaceCol = vec3(0.21, 0.23, 0.29);
        vec3 twilightScatterCol = mix(vec3(0.95, 0.52, 0.22), uAtmoColor, 0.45);

        vec3 litSurface = compositeAlbedo * (ambientSpaceCol + coreLightCol * dayFactor * 1.14 * microShade);
        litSurface += twilightScatterCol * twilight * 0.20;
        litSurface += vec3(1.0, 0.92, 0.76) * specBase * specularMask * 0.90;
        litSurface += nightEmission;

        float limbStrength = fresnel * (0.32 + 0.60 * dayFactor + uHighlight * 0.45);
        vec3 finalCol = mix(litSurface, uAtmoColor * 1.22, limbStrength * 0.58);

        gl_FragColor = vec4(finalCol * mix(0.22, 1.0, uOpacity), 1.0);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Outer Rayleigh Scattering Atmosphere Halo Material for 3D Planets
 * Uses soft outer edge falloff so there is zero hard silhouette ring around the planet.
 */
export function createPlanetAtmosphereMaterial(
  atmosphereColor: THREE.Color
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uAtmoColor: { value: atmosphereColor.clone() },
      uOpacity: { value: 0.85 },
      uLightPos: { value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uAtmoColor;
      uniform float uOpacity;
      uniform vec3 uLightPos;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPos;

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 lightVec = uLightPos - vWorldPos;
        vec3 L = length(lightVec) > 0.0001 ? normalize(lightVec) : vec3(0.0, 1.0, 0.0);

        float ndotv = clamp(dot(-N, V), 0.0, 1.0);
        float dayWeight = 0.28 + 0.72 * smoothstep(-0.3, 0.55, dot(-N, L));
        // Soft bell-curve fade at the outer edge (ndotv -> 0) so there is no hard rim outline
        float softHalo = pow(ndotv, 1.65) * pow(1.0 - ndotv * 0.65, 2.2);
        float alpha = softHalo * dayWeight * uOpacity * 0.65;

        gl_FragColor = vec4(uAtmoColor * 1.2, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Realistic Multi-Band Planetary Ring Shader (Saturn / J1407b / Ice Giant Rings)
 * Includes concentric icy/dusty ringlets, Cassini Division gap, and real planet shadow casting!
 */
export function createPlanetRingMaterial(
  ringColor: THREE.Color,
  innerR: number,
  outerR: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false,
    uniforms: {
      uRingColor: { value: ringColor.clone() },
      uInnerR: { value: innerR },
      uOuterR: { value: outerR },
      uOpacity: { value: 0.92 },
      uLightPos: { value: new THREE.Vector3(0, 0, 0) },
      uPlanetRadius: { value: 0.64 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vPlanetCenter;
      void main() {
        vLocalPos = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vPlanetCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uRingColor;
      uniform float uInnerR;
      uniform float uOuterR;
      uniform float uOpacity;
      uniform vec3 uLightPos;
      uniform float uPlanetRadius;

      varying vec3 vLocalPos;
      varying vec3 vWorldPos;
      varying vec3 vPlanetCenter;

      void main() {
        float r = length(vLocalPos.xz);
        float normR = clamp((r - uInnerR) / max(0.001, uOuterR - uInnerR), 0.0, 1.0);
        if (normR <= 0.0 || normR >= 1.0) discard;

        // Concentric ringlet bands (C ring, B ring, Cassini Division gap at ~0.64, A ring)
        float ringlets = 0.55
          + 0.25 * sin(normR * 68.0)
          + 0.12 * sin(normR * 155.0)
          + 0.08 * cos(normR * 310.0);

        // Prominent Cassini Division gap and narrower Encke gap
        float cassiniGap = 1.0 - 0.88 * exp(-pow((normR - 0.64) * 26.0, 2.0));
        float enckeGap   = 1.0 - 0.65 * exp(-pow((normR - 0.86) * 48.0, 2.0));

        float radialFade = smoothstep(0.0, 0.08, normR) * smoothstep(1.0, 0.88, normR);

        // Scale-invariant planetary shadow cast onto the back of the rings away from host star
        vec3 lightVec = uLightPos - vPlanetCenter;
        vec3 lightDir = length(lightVec) > 0.0001 ? normalize(lightVec) : vec3(0.0, 1.0, 0.0);
        vec3 relPos = vWorldPos - vPlanetCenter;
        float projAlongLight = dot(relPos, lightDir);
        float perpDistSq = max(0.0, dot(relPos, relPos) - projAlongLight * projAlongLight);
        float safeRadius = max(0.00005, uPlanetRadius);
        float normPerp = sqrt(perpDistSq) / safeRadius;
        float inShadow = (projAlongLight < 0.0)
          ? smoothstep(0.88, 1.12, normPerp)
          : 1.0;
        float shadowFactor = 0.22 + 0.78 * inShadow;

        vec3 warmTint = mix(uRingColor, vec3(1.0, 0.95, 0.86), 0.35 + 0.35 * sin(normR * 32.0));
        float alpha = clamp(ringlets * cassiniGap * enckeGap * radialFade * uOpacity * 0.82, 0.0, 0.92);

        gl_FragColor = vec4(warmTint * shadowFactor, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Custom ShaderMaterial for deep-space background starfield with realistic magnitudes and temperatures
 */
export function createBackgroundStarfieldMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float aSize;
      attribute vec3 aColor;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vTwinkle;

      void main() {
        vColor = aColor;
        vTwinkle = 0.86 + 0.14 * sin(uTime * 1.2 + aPhase);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(aSize * uPixelRatio * (160.0 / max(1.0, -mvPosition.z)), 0.8, 10.0);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      varying vec3 vColor;
      varying float vTwinkle;

      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        if (r2 > 1.0) discard;

        float core = exp(-r2 * 18.0);
        float halo = exp(-r2 * 4.8) * 0.35;
        float alpha = (core + halo) * vTwinkle;
        vec3 col = mix(vColor, vec3(1.0), core * 0.8);
        gl_FragColor = vec4(col, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Custom ShaderMaterial for NASA Milky Way Barred Spiral Galaxy starfield (20,000 stars)
 * Crisp stellar cores with gentle astronomical shimmer and distance-attenuated brightness.
 */
export function createMilkyWayStarfieldMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uOpacity: { value: 1.0 },
      uDensityScale: { value: 1.0 },
      uLensingPass: { value: 0.0 },
      uBandWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float aSize;
      attribute vec3 aColor;
      attribute float aPhase;
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uLensingPass;
      varying vec3 vColor;
      varying float vTwinkle;
      varying float vCull;

      void main() {
        vColor = aColor;
        vTwinkle = 0.88 + 0.12 * sin(uTime * 1.3 + aPhase);
        vCull = 0.0;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        // During the background gravitational lensing capture pass, cull Milky Way stars strictly
        // in front of Sagittarius A* so ONLY background light behind the black hole gets bent.
        if (uLensingPass > 0.5) {
          vec3 toStar = worldPos.xyz - cameraPosition;
          vec3 toBh = -cameraPosition;
          float distBh = length(toBh);
          if (distBh > 0.001) {
            float projStar = dot(toStar, toBh / distBh);
            if (projStar < distBh - 24.0) {
              vCull = 1.0;
            }
          }
        }

        vec4 mvPosition = viewMatrix * worldPos;
        float dist = max(0.35, -mvPosition.z);
        // Calibrated for kpc galactic coordinates: delicate crisp star pinpoints that never turn into chalky white blobs
        float sz = aSize * uPixelRatio * (18.5 / pow(dist, 0.72));
        gl_PointSize = vCull > 0.5 ? 0.0 : clamp(sz, 0.85, 3.3);
        gl_Position = vCull > 0.5 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      uniform float uDensityScale;
      uniform vec4 uBandWeights;
      varying vec3 vColor;
      varying float vTwinkle;
      varying float vCull;

      void main() {
        if (vCull > 0.5) discard;
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        if (r2 > 1.0) discard;

        float core = exp(-r2 * 18.0);
        float halo = exp(-r2 * 4.5) * 0.24;

        // Spectral band modulation: Optical / Infrared / Radio 21cm / X-Ray-Gamma
        vec3 optCol = mix(vColor, vec3(1.0, 0.99, 0.97), core * 0.42);
        vec3 irCol = mix(vec3(0.95, 0.52, 0.16), vec3(1.0, 0.88, 0.62), core * 0.68);
        vec3 radioCol = mix(vec3(0.18, 0.62, 0.95), vec3(0.75, 0.95, 1.0), core * 0.55);
        float isHot = smoothstep(-0.02, 0.18, vColor.b - vColor.r);
        vec3 xrayCol = mix(vec3(0.65, 0.35, 0.98), vec3(0.55, 0.92, 1.0), isHot);

        vec3 col =
          optCol * uBandWeights.x +
          irCol * uBandWeights.y +
          radioCol * uBandWeights.z +
          xrayCol * uBandWeights.w;

        float bandGain =
          1.0 * uBandWeights.x +
          1.12 * uBandWeights.y +
          0.52 * uBandWeights.z +
          (0.24 + 0.88 * isHot) * uBandWeights.w;

        float alpha = clamp((core * 0.72 + halo) * vTwinkle * uOpacity * uDensityScale * bandGain, 0.0, 0.92);
        gl_FragColor = vec4(col, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Soft Volumetric H-II Nebula & Galactic Bar Cloud Shader for the Milky Way Spiral Arms
 * Ultra-soft Gaussian falloff so overlapping clouds blend smoothly without circular sprite edges
 * or edge-on white blowout near Sagittarius A*.
 */
export function createMilkyWayNebulaMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: true,
    uniforms: {
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.145 },
      uLensingPass: { value: 0.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float aSize;
      attribute vec3 aColor;
      uniform float uPixelRatio;
      uniform float uLensingPass;
      varying vec3 vColor;
      varying float vCull;

      void main() {
        vColor = aColor;
        vCull = 0.0;

        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        if (uLensingPass > 0.5) {
          vec3 toCloud = worldPos.xyz - cameraPosition;
          vec3 toBh = -cameraPosition;
          float distBh = length(toBh);
          if (distBh > 0.001) {
            float projCloud = dot(toCloud, toBh / distBh);
            if (projCloud < distBh - 24.0) {
              vCull = 1.0;
            }
          }
        }

        vec4 mvPosition = viewMatrix * worldPos;
        float dist = max(18.0, -mvPosition.z);
        gl_PointSize = vCull > 0.5 ? 0.0 : clamp(aSize * uPixelRatio * (230.0 / dist), 8.0, 118.0);
        gl_Position = vCull > 0.5 ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vCull;

      void main() {
        if (vCull > 0.5) discard;
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        if (r2 > 1.0) discard;

        // Smooth cubic-Gaussian falloff for painterly interstellar gas & dust clouds
        float soft = pow(1.0 - r2, 2.2) * exp(-r2 * 1.9);
        gl_FragColor = vec4(vColor, soft * uOpacity);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Crisp Circular Rocky/Icy Asteroid & Kuiper Belt Particle Shader
 * Strictly caps gl_PointSize so particles NEVER turn into giant flat squares during close-up planetary flight.
 */
export function createRockyBeltMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    uniforms: {
      uPixelRatio: { value: 1 },
      uOpacity: { value: 0.82 },
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
        float dist = max(0.35, -mvPosition.z);
        gl_PointSize = clamp(aSize * uPixelRatio * (5.5 / dist), 1.0, 4.2);
        gl_Position = projectionMatrix * mvPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      varying vec3 vColor;

      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        if (r2 > 1.0) discard;

        // Round rocky pebble with subtle sunlit specular edge
        float body = smoothstep(1.0, 0.22, r2);
        float shade = 0.72 + 0.28 * clamp(1.0 - length(uv - vec2(-0.25, -0.25)), 0.0, 1.0);
        gl_FragColor = vec4(vColor * shade, body * uOpacity);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * High-Fidelity Earth Surface Material (Phase 2):
 * - Multi-octave continental elevation, bathymetry, deserts, mountains, polar ice caps
 * - Live solar direction (uSunDir) driving crisp twilight terminator & ocean specular glint
 * - Glowing urban city lights strictly on night-side coastal/temperate landmasses
 * - Integrated Rayleigh blue atmospheric scattering toward the limb
 */
export function createEarthHighResMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: new THREE.Vector3(1, 0.2, 0.3).normalize() },
      uTime: { value: 0 },
      uDetailBoost: { value: 0 },
      uEclipseActive: { value: 0 },
      uMoonRelEarth: { value: new THREE.Vector3(60, 0, 0) },
      uSunDistEarth: { value: 23455.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vObjPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        vObjPos = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform vec3 uSunDir;
      uniform float uTime;
      uniform float uDetailBoost;
      uniform float uEclipseActive;
      uniform vec3 uMoonRelEarth;
      uniform float uSunDistEarth;

      varying vec3 vObjPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
              mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
              mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise3(p);
          p = p * 2.07 + vec3(11.3, -7.1, 5.7);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 p = normalize(vObjPos);
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewDir);
        vec3 L = normalize(uSunDir);

        float lat = abs(p.y);
        // Warp domain for organic continental coastlines (Eurasia/Americas/Africa-like distribution)
        vec3 warp = vec3(
          fbm(p * 2.2 + vec3(1.7, 0.3, -2.1)),
          fbm(p * 2.2 + vec3(-3.2, 4.1, 1.4)),
          fbm(p * 2.2 + vec3(2.9, -1.8, 3.6))
        );
        float continentField = fbm(p * 2.45 + (warp - 0.5) * 0.92);
        float ridgeDetail = fbm(p * 11.0 + warp * 1.4);
        float microTopo = 0.0;
        if (uDetailBoost > 0.01) {
          microTopo =
            ((noise3(p * 28.0 + warp * 2.1) - 0.5) * 0.055 +
              (noise3(p * 64.0 - warp * 1.7) - 0.5) * 0.028) *
            uDetailBoost;
        }
        float elevation = continentField + (ridgeDetail - 0.5) * 0.16 + microTopo;

        float seaLevel = 0.505;
        float landMask = smoothstep(seaLevel - 0.008, seaLevel + 0.014, elevation);
        float coastalShelf = smoothstep(seaLevel - 0.08, seaLevel, elevation) * (1.0 - landMask);

        // Ocean colors (deep abyssal indigo -> turquoise continental shelf)
        vec3 oceanDeep = vec3(0.018, 0.068, 0.165);
        vec3 oceanMid = vec3(0.032, 0.145, 0.295);
        vec3 oceanShelf = vec3(0.065, 0.265, 0.385);
        float oceanDepth = clamp((seaLevel - elevation) * 6.5, 0.0, 1.0);
        vec3 oceanCol = mix(oceanMid, oceanDeep, oceanDepth);
        oceanCol = mix(oceanCol, oceanShelf, coastalShelf * 0.65);

        // Land biomes: tropical forest, temperate green, arid subtropical desert, alpine rock, polar ice
        float moisture = fbm(p * 4.1 + vec3(5.2, -2.4, 8.1));
        float aridity = smoothstep(0.12, 0.36, lat) * (1.0 - smoothstep(0.45, 0.68, lat)) * smoothstep(0.42, 0.66, 1.0 - moisture);
        float mountain = smoothstep(0.64, 0.78, elevation);
        float iceCap = smoothstep(0.76, 0.89, lat + (ridgeDetail - 0.5) * 0.09);

        vec3 forestCol = vec3(0.085, 0.235, 0.098);
        vec3 plainsCol = vec3(0.195, 0.305, 0.135);
        vec3 desertCol = vec3(0.585, 0.475, 0.325);
        vec3 mountainCol = vec3(0.365, 0.335, 0.305);
        vec3 snowCol = vec3(0.92, 0.95, 0.98);

        vec3 landCol = mix(forestCol, plainsCol, smoothstep(0.35, 0.68, moisture));
        landCol = mix(landCol, desertCol, aridity * 0.85);
        landCol = mix(landCol, mountainCol, mountain * 0.78);
        landCol = mix(landCol, snowCol, smoothstep(0.74, 0.84, elevation) * 0.85);

        vec3 surfaceAlbedo = mix(oceanCol, landCol, landMask);
        surfaceAlbedo = mix(surfaceAlbedo, snowCol, iceCap * 0.94);

        // Solar illumination + twilight terminator scattering
        float ndl = dot(N, L);
        float dayFactor = smoothstep(-0.08, 0.18, ndl);
        float diffuse = max(0.0, ndl);
        // Analytical Solar Eclipse Lunar Umbra & Penumbra from live astronomy-engine Moon/Sun positions
        float eclipseFactor = 1.0;
        float eclipseUmbraGlow = 0.0;
        if (uEclipseActive > 0.001 && ndl > -0.05) {
          vec3 toMoon = uMoonRelEarth - N;
          float projMoon = dot(toMoon, L);
          if (projMoon > 0.0) {
            float dMoon = length(toMoon);
            vec3 dirMoon = toMoon / max(0.001, dMoon);
            float sep = acos(clamp(dot(dirMoon, L), -1.0, 1.0));
            float angMoon = atan(0.2727, dMoon);
            float angSun = atan(109.1, max(1000.0, uSunDistEarth));
            float penumbraEdge = angMoon + angSun;
            float umbraEdge = max(0.00022, abs(angMoon - angSun));
            float penumbra = smoothstep(umbraEdge * 1.15, penumbraEdge * 1.15, sep);
            float umbraCore = smoothstep(umbraEdge * 0.45, penumbraEdge * 0.28, sep);
            float rawShadow = mix(0.02, 1.0, penumbra * (0.18 + 0.82 * umbraCore));
            eclipseFactor = mix(1.0, rawShadow, uEclipseActive);
            // Warm bronze-amber 360-degree twilight rim right around the umbral core
            eclipseUmbraGlow = exp(-pow((sep - penumbraEdge * 0.22) / (penumbraEdge * 0.14), 2.0)) * uEclipseActive * dayFactor;
          }
        }

        // Solar illumination + twilight terminator scattering (attenuated by lunar shadow)
        float terminatorBand = exp(-pow((ndl + 0.015) * 11.0, 2.0));
        vec3 twilightTint = vec3(0.62, 0.25, 0.09) * terminatorBand * 0.24 * eclipseFactor;
        twilightTint += vec3(0.45, 0.19, 0.07) * eclipseUmbraGlow * 0.22;

        // Crisp solar specular glint on liquid ocean (extinguished inside totality)
        vec3 H = normalize(L + V);
        float specPow = pow(max(0.0, dot(N, H)), 46.0);
        float waterMask = (1.0 - landMask) * (1.0 - iceCap);
        vec3 specular = vec3(0.95, 0.92, 0.84) * specPow * waterMask * 0.55 * dayFactor * eclipseFactor;

        // City night lights on night-side continents + faint glimmer inside deep solar eclipse totality!
        float nightMask = smoothstep(0.04, -0.14, ndl);
        float eclipseTotalityNight = smoothstep(0.22, 0.06, eclipseFactor) * dayFactor * 0.65;
        float habitableLat = (1.0 - smoothstep(0.52, 0.74, lat)) * (1.0 - iceCap) * (1.0 - mountain * 0.7);
        float coastBias = smoothstep(0.0, 0.18, elevation - seaLevel) * (1.0 - smoothstep(0.14, 0.32, elevation - seaLevel));
        float cityClusters = noise3(p * 34.0) * noise3(p * 78.0 + vec3(4.2, -1.7, 9.3));
        float fineMetropolis =
          uDetailBoost > 0.01
            ? smoothstep(0.62, 0.86, noise3(p * 145.0 + vec3(1.8, 5.4, -3.1))) * 0.22 * uDetailBoost
            : 0.0;
        float citySparks = smoothstep(0.36, 0.62, cityClusters + coastBias * 0.28 + fineMetropolis) * landMask * habitableLat;
        vec3 cityLights = vec3(1.0, 0.74, 0.34) * citySparks * max(nightMask, eclipseTotalityNight) * (1.45 + 0.25 * uDetailBoost);

        // Analytical alpine relief shading on RTX 3050-4050 / Ultra
        float landRelief = 1.0;
        if (uDetailBoost > 0.01 && landMask > 0.05) {
          float hHere = noise3(p * 32.0 + warp * 1.6);
          float hSun = noise3((p + L * 0.012) * 32.0 + warp * 1.6);
          landRelief = clamp(1.0 + (hSun - hHere) * 1.5 * landMask * uDetailBoost, 0.78, 1.24);
        }

        // Rayleigh blue atmospheric scattering along limb
        float fresnel = pow(1.0 - max(0.0, dot(N, V)), 3.2);
        vec3 rayleighDay = vec3(0.24, 0.56, 1.0) * fresnel * (0.25 + 0.75 * dayFactor) * 0.72 * (0.35 + 0.65 * eclipseFactor);
        vec3 rayleighNight = vec3(0.06, 0.14, 0.30) * fresnel * nightMask * 0.22;

        // Earthshine ambient floor on dark side so silhouette stays readable against stars
        vec3 nightAmbient = surfaceAlbedo * 0.032;
        vec3 litColor = surfaceAlbedo * (diffuse * 1.18 * landRelief * eclipseFactor) + twilightTint + specular + nightAmbient * (1.0 - dayFactor * eclipseFactor);
        vec3 finalColor = litColor + cityLights + rayleighDay + rayleighNight;

        gl_FragColor = vec4(finalColor, 1.0);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Animated Earth Cloud Layer Material (Phase 2):
 * Semi-transparent trade-wind & cyclone cloud cover with live terminator shading.
 */
export function createEarthCloudsMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uSunDir: { value: new THREE.Vector3(1, 0.2, 0.3).normalize() },
      uTime: { value: 0 },
      uDetailBoost: { value: 0 },
      uEclipseActive: { value: 0 },
      uMoonRelEarth: { value: new THREE.Vector3(60, 0, 0) },
      uSunDistEarth: { value: 23455.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vObjPos;
      varying vec3 vWorldNormal;

      void main() {
        vObjPos = normalize(position);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform vec3 uSunDir;
      uniform float uTime;
      uniform float uDetailBoost;
      uniform float uEclipseActive;
      uniform vec3 uMoonRelEarth;
      uniform float uSunDistEarth;
      varying vec3 vObjPos;
      varying vec3 vWorldNormal;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
              mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
              mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.55;
        for (int i = 0; i < 5; i++) {
          v += a * noise3(p);
          p = p * 2.12 + vec3(4.1, -6.3, 2.9);
          a *= 0.48;
        }
        return v;
      }

      void main() {
        float drift = uTime * 0.008;
        float c = cos(drift);
        float s = sin(drift);
        vec3 p = vec3(
          vObjPos.x * c - vObjPos.z * s,
          vObjPos.y,
          vObjPos.x * s + vObjPos.z * c
        );
        // Stretch slightly along latitude bands for trade-wind streaks
        vec3 windCoord = vec3(p.x * 3.4, p.y * 5.2, p.z * 3.4);
        float swirl = fbm(windCoord + vec3(0.0, 1.2, 0.0));
        float clouds = fbm(windCoord * 1.45 + vec3(swirl * 1.15));
        if (uDetailBoost > 0.01) {
          float cirrus = noise3(windCoord * 5.8 + vec3(swirl * 2.4)) - 0.5;
          clouds += cirrus * 0.14 * uDetailBoost;
        }
        float alpha = smoothstep(0.51, 0.77, clouds) * 0.78;
        if (alpha < 0.01) discard;

        vec3 N = normalize(vWorldNormal);
        vec3 L = normalize(uSunDir);
        float ndl = dot(N, L);
        float eclipseFactor = 1.0;
        if (uEclipseActive > 0.001 && ndl > -0.05) {
          vec3 toMoon = uMoonRelEarth - N * 1.011;
          float projMoon = dot(toMoon, L);
          if (projMoon > 0.0) {
            float dMoon = length(toMoon);
            vec3 dirMoon = toMoon / max(0.001, dMoon);
            float sep = acos(clamp(dot(dirMoon, L), -1.0, 1.0));
            float angMoon = atan(0.2727, dMoon);
            float angSun = atan(109.1, max(1000.0, uSunDistEarth));
            float penumbraEdge = angMoon + angSun;
            float umbraEdge = max(0.00022, abs(angMoon - angSun));
            float penumbra = smoothstep(umbraEdge * 1.15, penumbraEdge * 1.15, sep);
            float umbraCore = smoothstep(umbraEdge * 0.45, penumbraEdge * 0.28, sep);
            float rawShadow = mix(0.025, 1.0, penumbra * (0.18 + 0.82 * umbraCore));
            eclipseFactor = mix(1.0, rawShadow, uEclipseActive);
          }
        }
        float dayLit = smoothstep(-0.12, 0.22, ndl) * eclipseFactor;
        float twilight = exp(-pow((ndl + 0.02) * 10.0, 2.0)) * eclipseFactor;
        vec3 col = mix(vec3(0.05, 0.06, 0.09), vec3(0.95, 0.97, 1.0), dayLit);
        col += vec3(0.65, 0.28, 0.12) * twilight * 0.35;

        gl_FragColor = vec4(col, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * NASA/JPL-Caltech (R. Hurt / Spitzer GLIMPSE / Reid et al. 2019) Barred-Spiral Milky Way Disk Shader (illustrative: true).
 * Uses NormalBlending so dark reddish-brown interstellar dust lanes genuinely absorb light along the
 * inner concave edge of every spiral arm and around the creamy-gold central Galactic Bar, while bright
 * blue-white OB star ridges and ruby-pink H-II star-forming knots trace all 4 tightly-wound arms + Orion Spur.
 */
export function createMilkyWayParametricDiskMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uOpacity: { value: 1.0 },
      uTime: { value: 0.0 },
      uBandWeights: { value: new THREE.Vector4(1, 0, 0, 0) },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vDiskPos;
      void main() {
        // Plane lies in XZ in kpc units (-22..+22 kpc)
        vDiskPos = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform float uOpacity;
      uniform float uTime;
      uniform vec4 uBandWeights;
      varying vec2 vDiskPos;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm2(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
        for (int i = 0; i < 5; i++) {
          v += a * noise2(p);
          p = rot * p * 2.07 + vec2(5.2, -3.7);
          a *= 0.5;
        }
        return v;
      }

      // Ridged filamentary noise for dark dust lanes & delicate star-cluster veins
      float ridgedFbm(vec2 p) {
        float v = 0.0;
        float a = 0.52;
        mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
        for (int i = 0; i < 4; i++) {
          float n = 1.0 - abs(noise2(p) * 2.0 - 1.0);
          v += a * n * n;
          p = rot * p * 2.15 + vec2(-2.9, 4.3);
          a *= 0.48;
        }
        return v;
      }

      void main() {
        // vDiskPos is in kpc: radius 0..21.5 kpc
        float r = length(vDiskPos);
        if (r > 21.5 || uOpacity <= 0.001) discard;

        float angle = atan(vDiskPos.y, vDiskPos.x);

        // -----------------------------------------------------------------
        // 1. Creamy-Gold Elliptical Galactic Bar (NASA R. Hurt / Wegg+2015)
        //    Synchronized with generateNasaMilkyWayKpcStarfield (barAngle = -0.95 rad)
        // -----------------------------------------------------------------
        float barAngle = -0.95;
        float cb = cos(barAngle);
        float sb = sin(barAngle);
        vec2 bPos = vec2(
          vDiskPos.x * cb + vDiskPos.y * sb,
          -vDiskPos.x * sb + vDiskPos.y * cb
        );

        // Soft boxy/peanut-ellipse bar distance (semi-major ~4.0 kpc, semi-minor ~1.52 kpc)
        vec2 bScaled = vec2(bPos.x / 4.05, bPos.y / 1.52);
        float barShape = pow(
          pow(abs(bScaled.x), 2.25) + pow(abs(bScaled.y), 2.15),
          0.455
        );
        float barBody = exp(-barShape * barShape * 1.55);
        float barCore = exp(-dot(bPos / vec2(2.1, 0.92), bPos / vec2(2.1, 0.92)) * 1.35);
        float nuclearPeak = exp(-(r * r) / 0.55);

        // Subtle miniature inner nuclear spiral curl right inside the bright yellow bar (NASA signature!)
        float innerSwirlPhase = angle + 3.2 * log(max(0.18, r)) - barAngle;
        float innerSwirl = (0.5 + 0.5 * cos(innerSwirlPhase * 2.0)) * smoothstep(2.6, 0.35, r) * smoothstep(0.08, 0.32, r);
        float barGranule = fbm2(bPos * 1.65 + vec2(1.7, -2.3));

        // Darker slate-brown dust moat cradling both long flanks of the golden bar
        float barMoat = exp(-pow((barShape - 1.12) / 0.28, 2.0)) * smoothstep(0.25, 0.85, abs(bScaled.y) / max(0.25, barShape));

        // -----------------------------------------------------------------
        // 2. Four Tightly-Wound Logarithmic Spiral Arms (pitch ~12.4°, k = 4.55)
        //    Counter-clockwise outward from the bar ends (r0 = 3.15 kpc)
        // -----------------------------------------------------------------
        float r0 = 3.15;
        float pitchK = 4.55;
        float logR = log(max(1.35, r) / r0);

        // Gentle organic domain warp so arms have natural spurs, kinks & feathers
        vec2 warpCoord = vDiskPos * 0.24;
        float angleWarp = (fbm2(warpCoord + vec2(3.1, -1.9)) - 0.5) * 0.26;
        float fineCluster = fbm2(vDiskPos * 1.35 + vec2(-4.2, 2.8));
        float microSparkle = fbm2(vDiskPos * 3.8 + vec2(8.1, -6.4));
        float dustFilament = ridgedFbm(vDiskPos * 1.45 + vec2(2.4, 5.1));
        float h2Field = fbm2(vDiskPos * 2.85 - vec2(6.3, 1.9));

        float broadArm = 0.0;
        float crispRidge = 0.0;
        float dustLane = 0.0;
        float h2Accum = 0.0;

        float armOffsets[4];
        armOffsets[0] = barAngle;                // Scutum-Centaurus (major)
        armOffsets[1] = barAngle + 1.57;         // Sagittarius-Carina (secondary)
        armOffsets[2] = barAngle + 3.14159265;   // Perseus (major)
        armOffsets[3] = barAngle - 1.57;         // Norma-Outer (secondary)

        for (int i = 0; i < 4; i++) {
          float isMajor = (i == 0 || i == 2) ? 1.0 : 0.78;
          // Secondary arms stay delicate in the innermost bar zone and pick up past 3.2 kpc
          float armStartMask = (i == 0 || i == 2)
            ? smoothstep(2.05, 3.45, r)
            : smoothstep(2.75, 4.35, r);

          // Phase wraps every 2*PI; arms wind counter-clockwise as r increases
          float phase = angle + pitchK * logR - armOffsets[i] + angleWarp;
          float c = 0.5 + 0.5 * cos(phase);

          // Broad periwinkle-blue stellar spiral band
          broadArm += pow(c, 3.2) * isMajor * armStartMask;

          // Narrow glittering icy blue-white OB-star ridge with organic granulation
          float ridge = pow(c, 15.0) * isMajor * armStartMask;
          crispRidge += ridge * (0.48 + 0.92 * fineCluster) * (0.65 + 0.65 * microSparkle);

          // Dark reddish-brown absorbing dust lane hugging the INNER CONCAVE side of each arm!
          // For counter-clockwise outward winding, inner concave edge sits slightly behind in phase (-0.20 rad)
          float dustC = 0.5 + 0.5 * cos(phase - 0.21);
          float dustBand = pow(dustC, 18.0) * (0.55 + 0.85 * dustFilament) * armStartMask;
          // Also delicate dark dust feathers trailing slightly outward
          float featherC = 0.5 + 0.5 * cos(phase + 0.32 + fineCluster * 0.9);
          float featherDust = pow(featherC, 12.0) * dustFilament * 0.28 * armStartMask;
          dustLane += (dustBand + featherDust) * (0.72 + 0.28 * isMajor);

          // Ruby-pink H-II star-forming nebular beads dotted right along the OB ridge
          float h2Noise = smoothstep(0.60, 0.83, h2Field * 0.62 + microSparkle * 0.45);
          h2Accum += pow(c, 19.0) * h2Noise * isMajor * armStartMask;
        }

        // -----------------------------------------------------------------
        // 3. Orion-Cygnus Local Spur passing through Solar System (-8.178, 0) kpc
        // -----------------------------------------------------------------
        float orionPhase = angle + pitchK * log(max(4.0, r) / 8.18) - 3.14159265 + angleWarp * 0.6;
        float orionRadial = exp(-pow((r - 8.18) / 1.45, 2.0));
        float orionArc = pow(0.5 + 0.5 * cos(orionPhase), 12.0) * orionRadial * smoothstep(-0.2, 0.75, -cos(angle));
        broadArm += orionArc * 0.45;
        crispRidge += orionArc * (0.6 + 0.7 * fineCluster) * 0.62;
        h2Accum += orionArc * smoothstep(0.62, 0.84, h2Field) * 0.55;

        // Faint outer trailing stellar arc on the far right/outer periphery (r ~ 15.5-18.5 kpc)
        float outerArcPhase = angle + pitchK * log(max(6.0, r) / r0) - (barAngle - 1.57) + angleWarp;
        float outerArc = pow(0.5 + 0.5 * cos(outerArcPhase), 14.0) * exp(-pow((r - 16.4) / 1.9, 2.0)) * (0.45 + 0.75 * fineCluster);

        // -----------------------------------------------------------------
        // 4. Smooth Radial Envelopes & NASA R. Hurt Color Synthesis
        // -----------------------------------------------------------------
        float diskBase = exp(-r / 7.2) * smoothstep(21.2, 11.2, r);
        float armRadialEnv = smoothstep(2.1, 4.2, r) * exp(-max(0.0, r - 3.6) / 8.2) * smoothstep(20.6, 12.0, r);
        float dustRadialEnv = smoothstep(2.2, 4.5, r) * smoothstep(18.5, 10.5, r);

        // NASA R. Hurt palette
        vec3 deepSlateDisk = vec3(0.18, 0.22, 0.34);     // Outer indigo-slate stellar disk
        vec3 periwinkleArm = vec3(0.46, 0.54, 0.74);     // Broad dusty blue-lavender spiral arm
        vec3 obBlueWhite   = vec3(0.84, 0.91, 1.00);     // Crisp icy blue-white OB clusters
        vec3 barCreamCore  = vec3(1.00, 0.95, 0.76);     // Creamy butter-gold galactic nucleus
        vec3 barWarmGold   = vec3(0.86, 0.72, 0.46);     // Warm golden-amber bar body
        vec3 dustRustUmber = vec3(0.24, 0.12, 0.08);     // Dark reddish-brown absorbing dust lanes
        vec3 h2RubyPink    = vec3(1.00, 0.38, 0.58);     // Glowing H-alpha magenta-pink H-II knots

        // Build continuous stellar disk + spiral arms
        vec3 diskCol = deepSlateDisk * (0.58 + 0.48 * fineCluster) * diskBase;
        diskCol += periwinkleArm * clamp(broadArm, 0.0, 1.45) * armRadialEnv * (0.72 + 0.38 * fineCluster) * 0.74;
        diskCol += obBlueWhite * clamp(crispRidge, 0.0, 1.6) * armRadialEnv * 0.85;
        diskCol += obBlueWhite * outerArc * 0.42 * smoothstep(20.8, 15.5, r);

        // Darken & tint with reddish-brown interstellar dust lanes (authentic light absorption!)
        float dustMask = clamp(dustLane * dustRadialEnv * 0.72 + barMoat * (0.38 + 0.45 * dustFilament), 0.0, 0.84);
        diskCol = mix(diskCol, dustRustUmber * (0.35 + 0.65 * diskBase), dustMask);

        // Blend creamy-gold elliptical Galactic Bar smoothly over center (zero donut hole!)
        float barAlpha = clamp(barBody * 0.92 + barCore * 0.45, 0.0, 1.0);
        vec3 barCol = mix(barWarmGold, barCreamCore, clamp(barCore * 0.75 + nuclearPeak * 0.55 + innerSwirl * 0.14, 0.0, 1.0));
        barCol *= (0.90 + 0.14 * barGranule - 0.10 * innerSwirl * (1.0 - nuclearPeak));
        // Subtle warm dust curls grazing the very edges of the bar
        float barEdgeDust = smoothstep(0.55, 1.05, barShape) * dustFilament * 0.22;
        barCol = mix(barCol, dustRustUmber * 1.15, barEdgeDust);

        vec3 optFinal = mix(diskCol, barCol, smoothstep(0.06, 0.82, barAlpha));
        // Add luminous golden core glow + bright ruby-pink H-II knots sitting above dust
        optFinal += barCreamCore * nuclearPeak * 0.32;
        optFinal += h2RubyPink * clamp(h2Accum, 0.0, 1.4) * armRadialEnv * 1.05;

        // -----------------------------------------------------------------
        // 5. Multi-Wavelength Synthesis (Infrared / Radio 21cm HI / X-Ray & Gamma)
        // -----------------------------------------------------------------
        // Infrared (3.6-24 um Spitzer/JWST): Dust becomes transparent and emits warm PAH amber-crimson,
        // revealing the glowing golden Central Bar & molecular ring cleanly.
        vec3 irDisk = vec3(0.30, 0.11, 0.05) * (0.65 + 0.45 * fineCluster) * diskBase;
        irDisk += vec3(0.88, 0.42, 0.14) * clamp(broadArm, 0.0, 1.4) * armRadialEnv * 0.62;
        // PAH dust lanes glow warm red-orange instead of absorbing!
        irDisk += vec3(1.00, 0.48, 0.16) * dustMask * (0.68 + 0.55 * dustFilament) * 0.92;
        irDisk += vec3(1.00, 0.78, 0.34) * clamp(h2Accum, 0.0, 1.4) * armRadialEnv * 1.15;
        vec3 irBar = mix(vec3(0.96, 0.54, 0.18), vec3(1.00, 0.93, 0.68), clamp(barCore * 0.85 + nuclearPeak * 0.65, 0.0, 1.0));
        vec3 irFinal = mix(irDisk, irBar, smoothstep(0.04, 0.78, barAlpha)) + vec3(1.0, 0.88, 0.58) * nuclearPeak * 0.48;

        // Radio 21cm (1.42 GHz HI): Extended neutral atomic hydrogen disk & filamentary outer spiral arms
        float hiOuterEnv = smoothstep(1.6, 4.2, r) * smoothstep(21.4, 15.8, r);
        float molRing = exp(-pow((r - 4.35) / 1.15, 2.0));
        vec3 hiDisk = vec3(0.03, 0.14, 0.32) * exp(-r / 10.8) * smoothstep(21.4, 14.2, r);
        hiDisk += vec3(0.08, 0.56, 0.92) * clamp(broadArm, 0.0, 1.45) * hiOuterEnv * (0.68 + 0.52 * dustFilament) * 0.92;
        hiDisk += vec3(0.45, 0.92, 1.00) * clamp(crispRidge + dustLane * 0.48, 0.0, 1.65) * hiOuterEnv * 0.68;
        hiDisk += vec3(0.28, 0.78, 0.98) * outerArc * 0.72;
        hiDisk += vec3(0.32, 0.84, 1.00) * molRing * (0.35 + 0.45 * fineCluster) * 0.55;
        hiDisk += vec3(0.85, 0.96, 1.00) * nuclearPeak * 0.42;

        // X-Ray & Gamma (Chandra / Fermi-LAT): Dim cool stars, intense Galactic Center CMZ & high-energy SNR/H-II shocks
        vec3 xrayDisk = vec3(0.05, 0.03, 0.14) * diskBase * 0.45;
        xrayDisk += vec3(0.26, 0.12, 0.56) * clamp(broadArm, 0.0, 1.3) * armRadialEnv * 0.36;
        xrayDisk += vec3(0.76, 0.34, 1.00) * clamp(h2Accum, 0.0, 1.4) * armRadialEnv * 1.45;
        float xraySpark = smoothstep(0.76, 0.92, microSparkle * fineCluster * 1.38) * armRadialEnv;
        xrayDisk += vec3(0.55, 0.90, 1.00) * xraySpark * 1.4;
        xrayDisk += vec3(0.95, 0.58, 1.00) * barCore * 0.55;
        xrayDisk += vec3(0.85, 0.92, 1.00) * nuclearPeak * 1.35;

        vec3 finalCol =
          optFinal * uBandWeights.x +
          irFinal * uBandWeights.y +
          hiDisk * uBandWeights.z +
          xrayDisk * uBandWeights.w;

        // Soft filmic shoulder so nothing ever clips to harsh flat #ffffff
        finalCol = finalCol / (vec3(1.0) + finalCol * 0.28);

        // Smooth radial alpha that melts seamlessly into pure black intergalactic space
        float lumAlpha = clamp(
          diskBase * 0.92 +
          broadArm * armRadialEnv * 0.65 +
          crispRidge * armRadialEnv * 0.55 +
          outerArc * 0.45 +
          barBody * 0.98 +
          hiOuterEnv * broadArm * 0.38 * uBandWeights.z,
          0.0,
          0.98
        );
        float alpha = lumAlpha * smoothstep(21.4, 14.0, r) * uOpacity;

        gl_FragColor = vec4(finalCol, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Procedural Extragalactic Galaxy / Cluster Disk Shader (Phase 3, morphologyIllustrative: true).
 * Supports spiral, barred-spiral, elliptical, irregular, dwarf-sph, and cluster morphologies.
 */
export function createGalaxySpriteMaterial(
  morphology: 'barred-spiral' | 'spiral' | 'elliptical' | 'irregular' | 'dwarf-sph' | 'cluster',
  tintHex: string,
  inclinationDeg: number,
  positionAngleDeg: number
): THREE.ShaderMaterial {
  const morphCode =
    morphology === 'spiral' || morphology === 'barred-spiral'
      ? 1.0
      : morphology === 'irregular'
        ? 2.0
        : morphology === 'cluster'
          ? 3.0
          : 0.0;

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTint: { value: new THREE.Color(tintHex) },
      uMorph: { value: morphCode },
      uTiltScale: { value: Math.max(0.24, Math.cos((inclinationDeg * Math.PI) / 180)) },
      uPosAngle: { value: (positionAngleDeg * Math.PI) / 180 },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform vec3 uTint;
      uniform float uMorph;
      uniform float uTiltScale;
      uniform float uPosAngle;
      uniform float uOpacity;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      float noise2(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        if (uOpacity <= 0.005) discard;
        float ca = cos(uPosAngle);
        float sa = sin(uPosAngle);
        vec2 p = vec2(vUv.x * ca - vUv.y * sa, vUv.x * sa + vUv.y * ca);
        vec2 diskP = vec2(p.x, p.y / uTiltScale);
        float r = length(diskP);
        if (r > 1.0) discard;

        float intensity = 0.0;
        vec3 col = uTint;

        if (uMorph > 2.5) {
          // Galaxy Cluster: central cD bright galaxy + scattered member galaxy halos
          float core = exp(-dot(vUv, vUv) * 8.0) * 1.35;
          float halo = exp(-dot(vUv, vUv) * 2.2) * 0.52;
          float members = 0.0;
          for (int i = 0; i < 7; i++) {
            float fi = float(i);
            vec2 off = vec2(sin(fi * 2.31 + 0.5), cos(fi * 3.17 - 0.8)) * (0.22 + 0.08 * fi);
            float d2 = dot(vUv - off, vUv - off);
            members += exp(-d2 * 110.0) * 0.95;
          }
          intensity = core + halo + members;
          col = mix(uTint, vec3(1.0, 0.94, 0.82), clamp(core * 0.75, 0.0, 1.0));
        } else if (uMorph > 1.5) {
          // Irregular (LMC / SMC / M82)
          float n = noise2(diskP * 5.0 + vec2(2.3, -1.1)) * 0.65 + noise2(diskP * 10.0) * 0.35;
          float env = exp(-r * r * 3.4);
          intensity = env * (0.65 + 1.25 * n);
          col = mix(uTint, vec3(1.0, 0.96, 0.90), exp(-r * r * 7.0) * 0.55);
        } else if (uMorph > 0.5) {
          // Spiral galaxy (M31 Andromeda, M33, M81, M51, M104)
          float ang = atan(diskP.y, diskP.x);
          float spiral = 0.5 + 0.5 * cos(2.0 * ang - 6.8 * log(max(0.06, r)));
          float arm = pow(spiral, 2.6) * smoothstep(0.05, 0.24, r) * exp(-r * 2.3);
          float bulge = exp(-r * r * 14.0) * 1.45;
          float diskGlow = exp(-r * 2.8) * 0.45;
          float clumpy = 0.78 + 0.48 * noise2(diskP * 7.5);
          intensity = bulge + (arm * 1.25 + diskGlow) * clumpy;
          vec3 coreWarm = vec3(1.0, 0.91, 0.75);
          vec3 armBlue = mix(uTint, vec3(0.68, 0.84, 1.0), 0.58);
          col = mix(armBlue, coreWarm, clamp(bulge * 0.75, 0.0, 1.0));
        } else {
          // Elliptical / Dwarf Spheroidal (de Vaucouleurs profile)
          intensity = exp(-pow(r * 3.1, 0.82)) * 1.35;
        }

        float edgeFade = smoothstep(1.0, 0.64, r);
        float alpha = clamp(intensity * edgeFade * uOpacity, 0.0, 0.98);
        gl_FragColor = vec4(col * intensity * edgeFade * uOpacity, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Multi-Scale Galactic Core & Accretion Beacon Shader for Sagittarius A* LOD.
 * - At galactic range (uCloseFactor = 0): warm, non-clipped golden galactic nucleus glow.
 * - Across intermediate parsec/light-year approach (uCloseFactor -> 1): reveals a crisp
 *   tilted golden accretion ring + dark central core hint so zooming from 34 kpc -> 1.6 kpc ->
 *   184 pc -> 1 pc -> 100 AU -> 1.66 AU is completely continuous with zero dead zone.
 */
export function createSgrACoreGlowBillboardMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: 1.0 },
      uCloseFactor: { value: 0.0 },
      uTime: { value: 0.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uOpacity;
      uniform float uCloseFactor;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        float r = length(vUv);
        if (r > 1.0 || uOpacity <= 0.005) discard;

        // Controlled non-clipping galactic bulge/nucleus glow
        float softCore = exp(-r * r * 16.0) * 0.62;
        float softHalo = exp(-r * 3.8) * 0.30;

        // Tilted accretion disk & photon-ring preview emerging smoothly across 500 pc -> 50 AU
        float tiltAng = -0.32;
        float c = cos(tiltAng);
        float s = sin(tiltAng);
        vec2 rotUv = vec2(vUv.x * c - vUv.y * s, vUv.x * s + vUv.y * c);
        float diskR = length(vec2(rotUv.x, rotUv.y * 3.0));
        float swirl = 0.86 + 0.14 * sin(atan(rotUv.y, rotUv.x) * 3.0 + uTime * 1.1);
        float diskRing = exp(-pow((diskR - 0.32) * 6.8, 2.0)) * swirl;
        float photonRing = exp(-pow((r - 0.145) * 24.0, 2.0)) * 0.72;
        float shadowCut = smoothstep(0.085, 0.155, r);

        float farIntensity = softCore + softHalo;
        float nearIntensity = (diskRing * 0.64 + photonRing * 0.68 + exp(-r * 4.2) * 0.20) * shadowCut;
        float intensity = mix(farIntensity, nearIntensity, uCloseFactor);

        vec3 amberOuter = vec3(0.86, 0.56, 0.26);
        vec3 goldInner = vec3(0.96, 0.84, 0.62);
        vec3 photonChampagne = vec3(1.0, 0.94, 0.82);

        vec3 col = mix(amberOuter, goldInner, clamp(softCore + diskRing * 0.85, 0.0, 1.0));
        col = mix(col, photonChampagne, clamp(photonRing * uCloseFactor * 0.7, 0.0, 1.0));

        float edgeFade = smoothstep(1.0, 0.58, r);
        float alpha = clamp(intensity * edgeFade * uOpacity, 0.0, 0.88);
        gl_FragColor = vec4(col * intensity * edgeFade * uOpacity, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Radiant Volumetric Solar Corona & Starlight Halo Billboard for the Sun.
 * Ensures the Sun glows intensely from close-up solar orbits out across the entire Solar System.
 */
export function createSolarCoronaBillboardMaterial(
  coronaColor?: THREE.Color
): THREE.ShaderMaterial {
  const baseColor = coronaColor ? coronaColor.clone() : new THREE.Color('#ffb838');
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 1.0 },
      uCoronaColor: { value: baseColor },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      void main() {
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uCoronaColor;
      varying vec2 vUv;

      void main() {
        float r = length(vUv);
        if (r > 1.0 || uOpacity <= 0.005) discard;

        float angle = atan(vUv.y, vUv.x);
        // Subtle animated stellar corona streamers
        float rays =
          0.86 +
          0.14 * sin(angle * 7.0 + uTime * 0.35) * sin(angle * 13.0 - uTime * 0.22);

        float hotCore = exp(-r * r * 26.0) * 1.65;
        float innerCorona = exp(-r * 5.2) * 1.15 * rays;
        float outerGlow = exp(-r * 2.3) * 0.42;
        float edgeFade = smoothstep(1.0, 0.58, r);

        vec3 whiteHot = mix(uCoronaColor, vec3(1.0, 0.99, 0.96), 0.78);
        vec3 midCorona = mix(uCoronaColor, vec3(1.0), 0.14);
        vec3 outerHalo = uCoronaColor * 0.78;

        vec3 col =
          whiteHot * hotCore +
          midCorona * innerCorona +
          outerHalo * outerGlow;

        float alpha = clamp((hotCore + innerCorona + outerGlow) * edgeFade * uOpacity, 0.0, 1.0);
        gl_FragColor = vec4(col * edgeFade * uOpacity, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Volumetric Additive Ion & Dust Comet Tail Shader (for 1P/Halley & active comets).
 * Cone geometry extends along +Y from nucleus (vUv.y = 1 at tip -> 0 at base).
 */
export function createCometTailMaterial(
  tailColor: THREE.Color = new THREE.Color('#38bdf8')
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 0.85 },
      uTailColor: { value: tailColor.clone() },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      void main() {
        vUv = uv;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vNormalView = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPos.xyz);
        gl_Position = projectionMatrix * mvPos;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uTailColor;
      varying vec2 vUv;
      varying vec3 vNormalView;
      varying vec3 vViewDir;

      void main() {
        // vUv.y: 1.0 near coma nucleus -> 0.0 at distant tail tip
        float along = clamp(vUv.y, 0.0, 1.0);
        float tipFade = smoothstep(0.0, 0.35, along) * pow(along, 1.35) * smoothstep(1.0, 0.84, along);
        float edgeSoft = pow(abs(dot(normalize(vNormalView), normalize(vViewDir))), 1.15);
        float streamer =
          0.74 +
          0.18 * sin(vUv.x * 25.1327 + uTime * 1.4 - along * 6.0) +
          0.08 * cos(vUv.x * 50.2654 - uTime * 2.1);

        vec3 coreCyan = mix(uTailColor, vec3(0.92, 0.98, 1.0), along * 0.65);
        float alpha = clamp(tipFade * edgeSoft * streamer * uOpacity * 0.85, 0.0, 0.92);
        if (alpha <= 0.003) discard;

        gl_FragColor = vec4(coreCyan * alpha, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Smooth Fading Orbital Trajectory Trail Shader (THREE.LineSegments).
 * Renders per-vertex color + exponential alpha taper from 0.0 (tail) -> 1.0 (incandescent head)
 * with full logarithmic depth buffer compatibility across planetary & galactic scales.
 */
export function createTrajectoryTrailMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aColor;
      attribute float aProgress;
      varying vec3 vColor;
      varying float vProgress;
      void main() {
        vColor = aColor;
        vProgress = aProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vProgress;

      void main() {
        float p = clamp(vProgress, 0.0, 1.0);
        // Smooth tail-to-head exponential fade with glowing leading tip
        float fade = pow(p, 1.62) * smoothstep(0.0, 0.07, p);
        float pulse = 0.90 + 0.10 * sin(p * 16.0 - uTime * 2.8);
        float alpha = clamp(fade * pulse * uOpacity * 0.98, 0.0, 1.0);
        if (alpha <= 0.004) discard;

        // Hot white-tinted leading tip transitioning cleanly into category hue
        vec3 tipColor = mix(vColor * 1.15, vec3(1.0, 0.99, 0.96), pow(p, 3.8) * 0.72);
        gl_FragColor = vec4(tipColor * alpha, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Glowing Navigable Star-Node Shader for moving Memory Nodes in 3D Galactic Space.
 * Renders crisp core + soft radial halo + subtle 4-point astronomical diffraction glint.
 */
export function createMemoryClusterNodeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uPixelRatio: { value: 1.0 },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aHighlight;
      attribute float aAlpha;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vHighlight;
      varying float vAlpha;
      void main() {
        vColor = aColor;
        vHighlight = aHighlight;
        vAlpha = aAlpha;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float dist = max(1.2, -mvPos.z);
        float basePx = aSize * uPixelRatio * (52.0 / pow(dist, 0.42));
        float selBoost = 1.0 + aHighlight * 0.65;
        gl_PointSize = clamp(basePx * selBoost, 5.0 * uPixelRatio, 30.0 * uPixelRatio);
        gl_Position = projectionMatrix * mvPos;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vHighlight;
      varying float vAlpha;

      void main() {
        vec2 uv = gl_PointCoord * 2.0 - 1.0;
        float r = length(uv);
        if (r > 1.0 || uOpacity * vAlpha <= 0.005) discard;

        float core = exp(-r * r * 18.0);
        float halo = exp(-r * r * 3.8) * 0.58;
        // Crisp 4-point Hubble-style diffraction spikes
        float spikeX = exp(-abs(uv.y) * 14.0) * exp(-abs(uv.x) * 3.0);
        float spikeY = exp(-abs(uv.x) * 14.0) * exp(-abs(uv.y) * 3.0);
        float spikes = (spikeX + spikeY) * (0.28 + vHighlight * 0.25);

        float ring = vHighlight > 0.5
          ? exp(-pow((r - 0.62) * 11.0, 2.0)) * (0.55 + 0.15 * sin(uTime * 3.2))
          : 0.0;

        vec3 col = mix(vColor, vec3(1.0, 0.99, 0.96), clamp(core * 0.8 + spikes * 0.35, 0.0, 1.0));
        float a = clamp((core + halo + spikes + ring) * uOpacity * vAlpha, 0.0, 1.0);
        gl_FragColor = vec4(col * a, a);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Soft Volumetric Category Star-Cluster Nebula Halo Shader (THREE.Points).
 * Subtly illuminates each category cluster's gravitational well in Galactic view.
 */
export function createClusterHaloMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uPixelRatio: { value: 1.0 },
      uOpacity: { value: 1.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec3 aColor;
      attribute float aRadiusKpc;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float dist = max(2.0, -mvPos.z);
        float px = aRadiusKpc * uPixelRatio * (520.0 / dist);
        gl_PointSize = clamp(px, 28.0 * uPixelRatio, 220.0 * uPixelRatio);
        gl_Position = projectionMatrix * mvPos;
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
        if (r > 1.0 || uOpacity <= 0.004) discard;
        // Soft radial cluster mist + whisper-thin boundary ring
        float mist = exp(-r * r * 3.8) * 0.36;
        float rim = exp(-pow((r - 0.72) * 8.5, 2.0)) * 0.14;
        float edgeFade = smoothstep(1.0, 0.84, r);
        float a = clamp((mist + rim) * edgeFade * uOpacity, 0.0, 0.48);
        gl_FragColor = vec4(vColor * a, a);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Volumetric 3D Fermi Bubbles & eROSITA X-Ray Shock Shell Shader (Phase 2).
 * Renders the twin bipolar gamma-ray/X-ray lobes rising +/-8.5 kpc (~50,000 ly span)
 * perpendicular to the Milky Way disk from Sagittarius A*.
 */
export function createFermiBubblesMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 0.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vObjPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        vObjPos = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vObjPos;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      float noise3(vec3 x) {
        vec3 i = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
              mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
              mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      void main() {
        if (uOpacity <= 0.004) discard;
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewDir);
        float ndv = abs(dot(N, V));

        // Sharp Fermi-LAT limb-brightened plasma shell + soft internal gamma-ray glow
        float shellRim = pow(1.0 - ndv, 2.1);
        float innerFill = 0.24 + 0.32 * (1.0 - ndv);

        // Gently rising relativistic outflow filaments from Sgr A* base
        vec3 p = normalize(vObjPos) * 3.8 + vec3(0.0, -uTime * 0.08, 0.0);
        float turb = noise3(p) * 0.65 + noise3(p * 2.3 + vec3(4.1, -2.2, 1.7)) * 0.35;

        // Pinch bright at the galactic center neck, soft cap at +/- 8.5 kpc
        float neckFocus = smoothstep(0.95, -0.75, vObjPos.y) * 0.35 + 0.65;

        vec3 gammaMagenta = vec3(0.76, 0.24, 0.94);
        vec3 erositaCyan  = vec3(0.32, 0.78, 1.00);
        vec3 coreViolet   = vec3(0.96, 0.56, 0.98);

        vec3 col = mix(gammaMagenta, erositaCyan, clamp(shellRim * 0.82, 0.0, 1.0));
        col = mix(col, coreViolet, clamp((1.0 - abs(vObjPos.y)) * 0.35 * turb, 0.0, 0.45));

        float alpha = clamp((innerFill * 0.48 + shellRim * 0.95) * (0.68 + 0.55 * turb) * neckFocus * uOpacity, 0.0, 0.88);
        gl_FragColor = vec4(col * alpha, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}

/**
 * Speed-of-Light Photon Pulse Wavefront Shader (c = 299,792,458 m/s, Phase 2).
 * Expanding spherical light shell leaving the Sun at true physical speed of light.
 */
export function createPhotonPulseMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0.0 },
      uOpacity: { value: 0.0 },
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vObjNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        vObjNormal = normalize(position);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vViewDir = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      precision highp float;
      #include <common>
      #include <logdepthbuf_pars_fragment>

      uniform float uTime;
      uniform float uOpacity;
      varying vec3 vObjNormal;
      varying vec3 vWorldNormal;
      varying vec3 vViewDir;

      void main() {
        if (uOpacity <= 0.004) discard;
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewDir);
        float fresnel = pow(1.0 - abs(dot(N, V)), 2.6);

        // Crisp equatorial ecliptic waveband + subtle wavefront meridian pulse
        float eclipticBand = exp(-pow(vObjNormal.y * 16.0, 2.0));
        float waveRipple = 0.85 + 0.15 * sin(vObjNormal.y * 28.0 - uTime * 4.0);

        vec3 amberEdge = vec3(0.95, 0.58, 0.22);
        vec3 ivoryCore = vec3(1.00, 0.94, 0.82);
        vec3 col = mix(amberEdge, ivoryCore, clamp(eclipticBand * 0.72 + fresnel * 0.42, 0.0, 1.0));

        float alpha = clamp((fresnel * 0.68 + eclipticBand * 0.55 + 0.04) * waveRipple * uOpacity, 0.0, 0.85);
        gl_FragColor = vec4(col, alpha);
        #include <logdepthbuf_fragment>
      }
    `,
  });
}




