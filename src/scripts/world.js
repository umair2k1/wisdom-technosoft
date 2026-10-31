/* ------------------------------------------------------------------
   The 3D world (High-Performance Fast-Path).
   One fixed canvas, one continuous camera move.
   Stations:
   0: Hero mark
   1: Software blocks skyline
   2: Telecalling voice rings & particles
   3: Data lattice
   4: Operations gears & belt
   5: Healthcare cross & ECG
   6: Principles carousel
   7: Finale emblem
   ------------------------------------------------------------------ */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { LOGO } from '../data/logo.js';

const root = document.documentElement;

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
 const t = clamp((v - a) / (b - a));
 return t * t * (3 - 2 * t);
};
const damp = (cur, target, rate, dt) => cur + (target - cur) * (1 - Math.exp(-rate * dt));

function seeded(seed) {
 let a = seed >>> 0;
 return () => {
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
 };
}

let activeRenderer = null;

export function start(canvas) {
 if (!canvas || canvas.dataset.worldReady === 'true' || activeRenderer) return;
 canvas.dataset.worldReady = 'true';

 const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
 if (!chapters.length) return;

 const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
 const maxDPR = Math.min(window.devicePixelRatio || 1, 1.5);
 let currentDPR = 1; // Start at 1 for fast-path launch
 const rand = seeded(2026);
 const V = (x, y, z) => new THREE.Vector3(x, y, z);

 /* ---------- renderer fast-path: opaque canvas, no stencil/antialias overhead ---------- */
 const renderer = new THREE.WebGLRenderer({
  canvas,
  powerPreference: 'high-performance',
  alpha: false,
  antialias: false,
  stencil: false,
  depth: true,
 });
 activeRenderer = renderer;
 renderer.setPixelRatio(currentDPR);
 renderer.setClearColor(0x040405, 1);
 renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure = 1.05;
 renderer.debug.checkShaderErrors = false;

 const scene = new THREE.Scene();
 scene.background = new THREE.Color(0x040405);
 scene.fog = new THREE.FogExp2(0x040405, 0.02);

 const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 420);
 scene.add(camera);

 const initEnvironment = () => {
  try {
   const pmrem = new THREE.PMREMGenerator(renderer);
   const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
   scene.environment = envTex;
   scene.environmentIntensity = 0.5;
   pmrem.dispose();
  } catch (e) {
   /* lights carry scene if pmrem unavailable */
  }
 };

 /* Lights ride on camera */
 scene.add(new THREE.AmbientLight(0xffffff, 0.16));
 const key = new THREE.PointLight(0xfff1dd, 420, 0, 2);
 key.position.set(3.5, 3.5, 3);
 camera.add(key);
 const fill = new THREE.PointLight(0x2b7bff, 220, 0, 2);
 fill.position.set(-5, -2, 4);
 camera.add(fill);

 /* ---------- the route ---------- */
 const STATIONS = [
  V(0, 0, 0),       // 0 hero
  V(14, 2, -62),    // 1 software
  V(-16, -3, -126), // 2 telecalling
  V(11, 4, -190),   // 3 data
  V(-13, 0, -254),  // 4 operations
  V(15, -2, -318),  // 5 healthcare
  V(0, 0, -384),    // 6 principles
  V(0, 0, -446),    // 7 finale
 ];
 const FILL_COLORS = [0x2b7bff, 0x2b7bff, 0xe8b27a, 0x5fd0ff, 0x9fb2d6, 0x3ecf8e, 0xf4f0e8, 0xc9a27e].map(
  (c) => new THREE.Color(c),
 );
 const CAM_DIST = 11.5;
 const camCurve = new THREE.CatmullRomCurve3(
  STATIONS.map((p) => p.clone().add(V(0, 0.6, CAM_DIST))),
  false,
  'catmullrom',
  0.5,
 );
 const lookCurve = new THREE.CatmullRomCurve3(
  STATIONS.map((p) => p.clone()),
  false,
  'catmullrom',
  0.5,
 );

 /* ---------- helpers ---------- */
 let glow = null;
 function getGlowTexture() {
  if (!glow) {
   const c = document.createElement('canvas');
   c.width = c.height = 128;
   const g = c.getContext('2d');
   const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
   gr.addColorStop(0, 'rgba(255,255,255,1)');
   gr.addColorStop(0.25, 'rgba(255,255,255,0.35)');
   gr.addColorStop(1, 'rgba(255,255,255,0)');
   g.fillStyle = gr;
   g.fillRect(0, 0, 128, 128);
   glow = new THREE.CanvasTexture(c);
   glow.colorSpace = THREE.SRGBColorSpace;
  }
  return glow;
 }

 function addHalo(group, color, size, opacity, z) {
  const sprite = new THREE.Sprite(
   new THREE.SpriteMaterial({
    map: getGlowTexture(),
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
   }),
  );
  sprite.scale.set(size, size, 1);
  sprite.position.z = z;
  group.add(sprite);
  return sprite;
 }

 /* Standard materials compile in <10ms and avoid heavy clearcoat programs */
 const metal = (color, roughness = 0.26) =>
  new THREE.MeshStandardMaterial({
   color,
   metalness: 0.88,
   roughness,
  });
 const TAN = metal(0xc9a27e);
 const IVORY = metal(0xf4f0e8, 0.2);
 const STEEL = metal(0x8fa1c4, 0.3);

 /* ---------- background: stars ---------- */
 function buildStars() {
  const count = mobile ? 600 : 1200;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  const tones = [0xf4f0e8, 0xc9a27e, 0x7aa8ff];
  for (let i = 0; i < count; i++) {
   pos[i * 3] = (rand() - 0.5) * 100;
   pos[i * 3 + 1] = (rand() - 0.5) * 64;
   pos[i * 3 + 2] = 40 - rand() * 520;
   c.setHex(tones[rand() < 0.68 ? 0 : rand() < 0.6 ? 1 : 2]);
   const b = 0.3 + rand() * 0.7;
   col[i * 3] = c.r * b;
   col[i * 3 + 1] = c.g * b;
   col[i * 3 + 2] = c.b * b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(
   geo,
   new THREE.PointsMaterial({
    size: 0.085,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
   }),
  );
  points.frustumCulled = false;
  return points;
 }

 const brandAccent = (() => {
  try {
   const raw = getComputedStyle(root).getPropertyValue('--logo-accent').trim();
   return new THREE.Color(raw || '#c9a27e');
  } catch (e) {
   return new THREE.Color('#c9a27e');
  }
 })();

 function buildEmblem() {
  const group = new THREE.Group();
  const inner = new THREE.Group();
  group.add(inner);

  const [bx0, by0, bx1, by1] = LOGO.bbox;
  const cx = (bx0 + bx1) / 2;
  const cy = (by0 + by1) / 2;
  const S = 5.2 / (bx1 - bx0);
  const DEPTH = 0.36;

  const bodyMat = new THREE.MeshStandardMaterial({
   color: 0xf4f0e8,
   metalness: 0.82,
   roughness: 0.3,
   emissive: 0xf4f0e8,
   emissiveIntensity: 0.06,
  });
  const accentMat = new THREE.MeshStandardMaterial({
   color: brandAccent,
   metalness: 0.88,
   roughness: 0.28,
   emissive: brandAccent,
   emissiveIntensity: 0.1,
  });

  const pieces = LOGO.pieces.map((piece, i) => {
   const pts = piece.points.map(([x, y]) => new THREE.Vector2((x - cx) * S, -(y - cy) * S));
   const mid = pts.reduce((sum, v) => sum.add(v), new THREE.Vector2()).multiplyScalar(1 / pts.length);
   const shape = new THREE.Shape(pts.map((v) => v.clone().sub(mid)));
   const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 1,
   });
   geo.translate(0, 0, -DEPTH / 2);
   const mesh = new THREE.Mesh(geo, piece.accent ? accentMat : bodyMat);
   mesh.position.set(mid.x, mid.y, 0);
   inner.add(mesh);
   const dir = new THREE.Vector3(mid.x, mid.y, 0);
   if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
   dir.normalize();
   return { mesh, home: mesh.position.clone(), dir, spin: (rand() - 0.5) * 2, delay: i * 0.16 };
  });

  const pose = (introT, arrive, burst, drift) => {
   pieces.forEach((p) => {
    const k = clamp((introT - 0.25 - p.delay) / 1.5);
    const away = Math.max(Math.pow(1 - k, 3), clamp(arrive * 1.25 - p.delay * 0.4));
    const dist = away * 6 + Math.pow(burst, 1.6) * 16 + drift;
    p.mesh.position.copy(p.home).addScaledVector(p.dir, dist);
    p.mesh.position.z = -away * 10 + burst * 3 * p.spin;
    p.mesh.rotation.set(p.spin * away * 0.9, p.spin * away * 1.1, p.spin * (away * 1.3 + burst * 1.5));
    p.mesh.scale.setScalar(Math.max(0.01, 1 + burst * 0.8 - away * 0.25));
   });
  };

  return { group, inner, pose };
 }

 /* ---------- scene 0: hero ---------- */
 function buildHero() {
  const e = buildEmblem();
  const halo = addHalo(e.group, brandAccent, 12, 0.5, -1.2);
  let t0 = -1;
  return {
   group: e.group,
   base: 1,
   update(u, t, s, ptr) {
    if (t0 < 0) t0 = t;
    const burst = smooth(0, 0.2, s);
    e.pose(t - t0, 0, burst, s * 30);
    e.inner.rotation.set(
     -ptr.y * 0.14 + Math.sin(t * 0.27) * 0.05,
     Math.sin(t * 0.35) * 0.22 + ptr.x * 0.25 + (u - 0.5) * 0.35,
     0,
    );
    halo.material.opacity = 0.5 * clamp((t - t0) * 0.8) * (1 - burst);
    e.group.visible = s < 0.6;
   },
  };
 }

 /* ---------- scene 1: software (Blocks skyline) ---------- */
 function buildBlocks() {
  const group = new THREE.Group();
  const NG = 9;
  const gap = 0.56;
  const extra = 26;
  const total = NG * NG + extra;
  const mesh = new THREE.InstancedMesh(
   new THREE.BoxGeometry(1, 1, 1),
   new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.75, roughness: 0.3 }),
   total,
  );
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;

  const palette = [0x1b2434, 0x243049, 0x2f3d5c, 0x3a4a6e];
  const col = new THREE.Color();
  const items = [];
  const scatter = (r) => {
   const th = rand() * Math.PI * 2;
   const ph = Math.acos(2 * rand() - 1);
   return V(Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.7, Math.sin(ph) * Math.sin(th) * r);
  };

  let n = 0;
  for (let x = 0; x < NG; x++) {
   for (let z = 0; z < NG; z++) {
    const px = (x - (NG - 1) / 2) * gap;
    const pz = (z - (NG - 1) / 2) * gap;
    const d = Math.hypot(px, pz) / 2.7;
    const h = 0.22 + Math.max(0, 1 - d) * 2.2 * (0.45 + rand() * 0.75);
    items.push({
     start: scatter(4 + rand() * 3),
     end: V(px, h / 2 - 0.9, pz),
     s0: V(0.3, 0.3, 0.3),
     s1: V(0.46, h, 0.46),
     rot: V(rand() * 6, rand() * 6, rand() * 6),
     delay: rand(),
    });
    mesh.setColorAt(n++, col.setHex(rand() > 0.92 ? 0x2b7bff : palette[Math.floor(rand() * 4)]));
   }
  }
  for (let k = 0; k < extra; k++) {
   const size = 0.1 + rand() * 0.14;
   items.push({
    start: scatter(5 + rand() * 3),
    end: V((rand() - 0.5) * 4.6, 0.9 + rand() * 1.8, (rand() - 0.5) * 4.6),
    s0: V(0.05, 0.05, 0.05),
    s1: V(size, size, size),
    rot: V(rand() * 6, rand() * 6, rand() * 6),
    delay: rand() * 0.6,
   });
   mesh.setColorAt(n++, col.setHex(rand() > 0.5 ? 0x2b7bff : 0x9fc2ff));
  }
  group.add(mesh);

  const grid = new THREE.GridHelper(6.4, 14, 0x2b7bff, 0x1a2436);
  grid.position.y = -0.92;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  group.add(grid);
  addHalo(group, 0x2b7bff, 9, 0.28, -2);

  const dummy = new THREE.Object3D();
  const applyLayout = (progress) => {
   for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const p = clamp((progress * 1.25 - it.delay * 0.55) / 0.5);
    const e = p * p * (3 - 2 * p);
    dummy.position.lerpVectors(it.start, it.end, e);
    dummy.rotation.set(it.rot.x * (1 - e), it.rot.y * (1 - e), it.rot.z * (1 - e));
    dummy.scale.lerpVectors(it.s0, it.s1, e);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
   }
   mesh.instanceMatrix.needsUpdate = true;
  };
  applyLayout(0);

  let lastU = 0;
  return {
   group,
   base: 1,
   update(u, t) {
    if (Math.abs(u - lastU) > 1e-4) {
     lastU = u;
     applyLayout(u);
    }
    group.rotation.set(0.42, -0.5 + u * 1.1 + Math.sin(t * 0.2) * 0.05, 0);
   },
  };
 }

 /* ---------- scene 2: telecalling (Voice rings & particles) ---------- */
 function buildVoice() {
  const group = new THREE.Group();
  const ringMat = (opacity) =>
   new THREE.MeshBasicMaterial({
    color: 0xe8b27a,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
   });
  const rings = [];
  for (let i = 0; i < 7; i++) {
   const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.75 + i * 0.33, i % 3 === 0 ? 0.016 : 0.009, 6, 96),
    ringMat(0.62 - i * 0.06),
   );
   group.add(ring);
   rings.push(ring);
  }

  const SEG = 180;
  const wavePos = new Float32Array(SEG * 3);
  const waveGeo = new THREE.BufferGeometry();
  waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePos, 3));
  const wave = new THREE.LineLoop(
   waveGeo,
   new THREE.LineBasicMaterial({ color: 0xfff0dc, transparent: true, opacity: 0.95, toneMapped: false }),
  );
  wave.frustumCulled = false;
  group.add(wave);

  const core = new THREE.Mesh(
   new THREE.IcosahedronGeometry(0.4, 2),
   new THREE.MeshStandardMaterial({
    color: 0x1a120a,
    emissive: 0xe8b27a,
    emissiveIntensity: 1.4,
    roughness: 0.4,
    metalness: 0.2,
   }),
  );
  group.add(core);

  // Reduced particle count by 60% to avoid CPU loops
  const PN = mobile ? 80 : 160;
  const pPos = new Float32Array(PN * 3);
  const pCol = new Float32Array(PN * 3);
  const pAng = new Float32Array(PN);
  const pSeed = new Float32Array(PN);
  for (let i = 0; i < PN; i++) {
   pAng[i] = rand() * Math.PI * 2;
   pSeed[i] = rand();
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const particles = new THREE.Points(
   pGeo,
   new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
   }),
  );
  particles.frustumCulled = false;
  group.add(particles);
  addHalo(group, 0xe8b27a, 9, 0.25, -2);

  return {
   group,
   base: 1,
   update(u, t) {
    if (!group.visible) return;
    const energy = 0.3 + 0.7 * smooth(0.02, 0.4, u) * (1 - 0.55 * smooth(0.85, 1, u));

    for (let i = 0; i < SEG; i++) {
     const a = (i / SEG) * Math.PI * 2;
     const w =
      Math.sin(a * 5 + t * 3.1 + u * 10) * 0.5 + Math.sin(a * 9 - t * 2.3) * 0.3 + Math.sin(a * 2 + t * 1.1) * 0.4;
     const r = 1.5 + w * (0.1 + 0.36 * energy);
     wavePos[i * 3] = Math.cos(a) * r;
     wavePos[i * 3 + 1] = Math.sin(a) * r;
     wavePos[i * 3 + 2] = 0;
    }
    waveGeo.attributes.position.needsUpdate = true;

    for (let i = 0; i < PN; i++) {
     const p = (t * 0.1 * (0.6 + energy) + pSeed[i] + u * 0.6) % 1;
     const r = 0.55 + p * 2.7;
     pPos[i * 3] = Math.cos(pAng[i]) * r;
     pPos[i * 3 + 1] = Math.sin(pAng[i]) * r;
     pPos[i * 3 + 2] = (pSeed[i] - 0.5) * 0.5;
     const b = Math.pow(1 - p, 1.6) * (0.35 + 0.65 * energy);
     pCol[i * 3] = 0.95 * b;
     pCol[i * 3 + 1] = 0.72 * b;
     pCol[i * 3 + 2] = 0.45 * b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    rings.forEach((ring, i) => ring.scale.setScalar(1 + Math.sin(t * 2.2 - i * 0.7) * 0.04 * (0.4 + energy)));
    const beat = Math.pow(Math.max(0, Math.sin(t * 4.4)), 2);
    core.scale.setScalar(1 + beat * 0.14 * energy);
    core.material.emissiveIntensity = 1.1 + energy * 1.5;
    group.rotation.set(0.16, -0.35 + Math.sin(t * 0.2) * 0.1, 0);
   },
  };
 }

 /* ---------- scene 3: data (GPU Shader Lattice) ---------- */
 function buildData() {
  const NX = 18;
  const NY = 12;
  const NZ = mobile ? 6 : 12;
  const SP = 0.22;
  const W = (NX - 1) * SP;
  const count = NX * NY * NZ;
  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 3);
  const seed = new Float32Array(count);

  let i = 0;
  for (let x = 0; x < NX; x++) {
   for (let y = 0; y < NY; y++) {
    for (let z = 0; z < NZ; z++, i++) {
     end[i * 3] = (x - (NX - 1) / 2) * SP;
     end[i * 3 + 1] = (y - (NY - 1) / 2) * SP;
     end[i * 3 + 2] = (z - (NZ - 1) / 2) * SP;
     const r = 2.2 + rand() * 2.8;
     const th = rand() * Math.PI * 2;
     const ph = Math.acos(2 * rand() - 1);
     start[i * 3] = Math.sin(ph) * Math.cos(th) * r;
     start[i * 3 + 1] = Math.cos(ph) * r * 0.75;
     start[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
     seed[i] = rand();
    }
   }
  }

  const uniforms = {
   uP: { value: 0 },
   uTime: { value: 0 },
   uSize: { value: 2.5 },
   uW: { value: W },
   uFog: { value: scene.fog.density },
  };
  const material = new THREE.ShaderMaterial({
   uniforms,
   transparent: true,
   depthWrite: false,
   blending: THREE.AdditiveBlending,
   vertexShader: /* glsl */ `
        attribute vec3 aStart;
        attribute vec3 aEnd;
        attribute float aSeed;
        uniform float uP;
        uniform float uTime;
        uniform float uSize;
        uniform float uW;
        uniform float uFog;
        varying float vM;
        varying float vA;
        void main() {
          float sx = aEnd.x / uW + 0.5;
          float m = clamp((uP * 1.3 - sx) / 0.3, 0.0, 1.0);
          m = m * m * (3.0 - 2.0 * m);
          vec3 wob = vec3(
            sin(uTime * 0.9 + aSeed * 40.0),
            cos(uTime * 0.7 + aSeed * 27.0),
            sin(uTime * 0.8 + aSeed * 13.0)
          ) * 0.22 * (1.0 - m);
          vec3 pos = mix(aStart + wob, aEnd, m);
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mv;
          float dist = max(-mv.z, 0.1);
          gl_PointSize = uSize * (1.0 + 0.7 * m) * (12.0 / dist);
          vM = m;
          vA = exp(-pow(uFog * dist, 2.0));
        }
      `,
   fragmentShader: /* glsl */ `
        varying float vM;
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = 1.0 - smoothstep(0.0, 0.5, d);
          vec3 messy = vec3(0.80, 0.64, 0.49) * 0.55;
          vec3 clean = vec3(0.35, 0.78, 1.0);
          vec3 col = mix(messy, clean, vM);
          gl_FragColor = vec4(col * (0.55 + 0.9 * vM), a * vA * (0.4 + 0.6 * vM));
        }
      `,
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(end, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
  geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;

  const group = new THREE.Group();
  group.add(points);

  const scanMat = (color) =>
   new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
   });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 3.3), scanMat(0xa8ecff));
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.3), scanMat(0x5fd0ff));
  group.add(scan, haze);
  addHalo(group, 0x5fd0ff, 9, 0.2, -2.2);

  return {
   group,
   base: 1,
   setPixelRatio(v) {
    uniforms.uSize.value = 2.5 * v;
   },
   update(u, t) {
    if (!group.visible) return;
    uniforms.uP.value = u;
    uniforms.uTime.value = t;
    const x = (u * 1.3 - 0.15 - 0.5) * W;
    const a = Math.pow(Math.sin(clamp(u) * Math.PI), 0.6);
    scan.position.x = x;
    haze.position.x = x;
    scan.material.opacity = 0.9 * a;
    haze.material.opacity = 0.07 * a;
    group.rotation.set(0.22, -0.55 + u * 0.5, 0);
   },
  };
 }

 /* ---------- scene 4: operations (Gears & Conveyor) ---------- */
 function buildGears() {
  const group = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.y = 0.45;
  group.add(inner);

  const MODULE = 0.2;
  const make = (teeth, material) => {
   const rp = (MODULE * teeth) / 2;
   const ro = rp + 0.13;
   const rr = rp - 0.15;
   const pitch = (Math.PI * 2) / teeth;
   const shape = new THREE.Shape();
   for (let i = 0; i < teeth; i++) {
    const a = i * pitch;
    [
     [rr, -0.3],
     [ro, -0.17],
     [ro, 0.17],
     [rr, 0.3],
    ].forEach(([r, f], j) => {
     const x = Math.cos(a + f * pitch) * r;
     const y = Math.sin(a + f * pitch) * r;
     if (i === 0 && j === 0) shape.moveTo(x, y);
     else shape.lineTo(x, y);
    });
   }
   const hole = new THREE.Path();
   hole.absarc(0, 0, rp * 0.3, 0, Math.PI * 2, true);
   shape.holes.push(hole);
   const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
    curveSegments: 8,
   });
   geo.translate(0, 0, -0.21);
   return { mesh: new THREE.Mesh(geo, material), rp, teeth };
  };

  const A = make(20, TAN);
  const B = make(12, STEEL);
  const C = make(14, IVORY);
  const thB = 0.44;
  const thC = thB + Math.PI;
  B.mesh.position.set(Math.cos(thB) * (A.rp + B.rp), Math.sin(thB) * (A.rp + B.rp), 0);
  C.mesh.position.set(Math.cos(thC) * (A.rp + C.rp), Math.sin(thC) * (A.rp + C.rp), 0);
  inner.add(A.mesh, B.mesh, C.mesh);

  const meshRot = (rotA, nA, nB, th) => th * (1 + nA / nB) + Math.PI - Math.PI / nB - rotA * (nA / nB);

  const BN = 22;
  const belt = new THREE.InstancedMesh(
   new THREE.BoxGeometry(0.22, 0.22, 0.22),
   new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.4 }),
   BN,
  );
  belt.frustumCulled = false;
  const tanC = new THREE.Color(0xc9a27e);
  const blueC = new THREE.Color(0x2b7bff);
  const mix = new THREE.Color();
  for (let i = 0; i < BN; i++) belt.setColorAt(i, tanC);
  inner.add(belt);
  const rail = new THREE.Mesh(
   new THREE.BoxGeometry(7.6, 0.03, 0.03),
   new THREE.MeshBasicMaterial({ color: 0x3a4a6e, toneMapped: false }),
  );
  rail.position.y = -3.62;
  inner.add(rail);
  addHalo(group, 0x9fb2d6, 10, 0.2, -2.5);

  const dummy = new THREE.Object3D();
  return {
   group,
   base: 0.6,
   update(u, t) {
    if (!group.visible) return;
    const rotA = u * 7 + t * 0.1;
    A.mesh.rotation.z = rotA;
    B.mesh.rotation.z = meshRot(rotA, A.teeth, B.teeth, thB);
    C.mesh.rotation.z = meshRot(rotA, A.teeth, C.teeth, thC);

    const offset = u * 2.4 + t * 0.04;
    for (let i = 0; i < BN; i++) {
     const x = (((i / BN + offset) % 1) - 0.5) * 7.4;
     dummy.position.set(x, -3.45, 0);
     dummy.rotation.set(0, x * 0.4, 0);
     dummy.updateMatrix();
     belt.setMatrixAt(i, dummy.matrix);
     belt.setColorAt(i, mix.lerpColors(tanC, blueC, smooth(-0.6, 0.8, x)));
    }
    belt.instanceMatrix.needsUpdate = true;
    belt.instanceColor.needsUpdate = true;

    inner.rotation.set(0.1, -0.32 + Math.sin(t * 0.25) * 0.05, 0);
   },
  };
 }

 /* ---------- scene 5: healthcare (Soft cross & ECG trace) ---------- */
 function buildCare() {
  const group = new THREE.Group();

  const w = 0.95;
  const L = 3.0;
  const h = w / 2;
  const l = L / 2;
  const shape = new THREE.Shape();
  [
   [-h, -l],
   [h, -l],
   [h, -h],
   [l, -h],
   [l, h],
   [h, h],
   [h, l],
   [-h, l],
   [-h, h],
   [-l, h],
   [-l, -h],
   [-h, -h],
  ].forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  const geo = new THREE.ExtrudeGeometry(shape, {
   depth: 0.4,
   bevelEnabled: true,
   bevelThickness: 0.12,
   bevelSize: 0.12,
   bevelSegments: 3,
   curveSegments: 5,
  });
  geo.center();
  const material = new THREE.MeshStandardMaterial({
   color: 0xe9fff4,
   roughness: 0.24,
   metalness: 0.05,
   emissive: 0x3ecf8e,
   emissiveIntensity: 0.25,
  });
  const plus = new THREE.Mesh(geo, material);
  group.add(plus);

  // Reduced ECG trace count by 60%
  const EN = mobile ? 60 : 120;
  const ePos = new Float32Array(EN * 3);
  const eCol = new Float32Array(EN * 3);
  for (let i = 0; i < EN; i++) {
   const b = 0.1 + 0.9 * Math.pow(i / (EN - 1), 1.7);
   eCol[i * 3] = 0.3 * b;
   eCol[i * 3 + 1] = 1.0 * b;
   eCol[i * 3 + 2] = 0.7 * b;
  }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  const eLine = new THREE.Line(
   eGeo,
   new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
   }),
  );
  const ePoints = new THREE.Points(
   eGeo,
   new THREE.PointsMaterial({
    size: 0.075,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
   }),
  );
  eLine.frustumCulled = false;
  ePoints.frustumCulled = false;
  eLine.position.z = 0.6;
  ePoints.position.z = 0.6;
  group.add(eLine, ePoints);
  addHalo(group, 0x3ecf8e, 9, 0.22, -2);

  const g = (x, c, wd) => Math.exp(-((x - c) * (x - c)) / (2 * wd * wd));
  const ecg = (p) =>
   0.12 * g(p, 0.18, 0.035) -
   0.1 * g(p, 0.36, 0.012) +
   1.0 * g(p, 0.385, 0.01) -
   0.28 * g(p, 0.41, 0.012) +
   0.22 * g(p, 0.62, 0.05);

  return {
   group,
   base: 0.88,
   update(u, t) {
    if (!group.visible) return;
    const phase = u * 3.4 + t * 0.4;
    for (let i = 0; i < EN; i++) {
     const x = (i / (EN - 1) - 0.5) * 7.2;
     let p = x * 0.28 - phase;
     p -= Math.floor(p);
     ePos[i * 3] = x;
     ePos[i * 3 + 1] = ecg(p) * 1.15 - 0.1;
     ePos[i * 3 + 2] = 0;
    }
    eGeo.attributes.position.needsUpdate = true;

    const beat = Math.pow(Math.max(0, Math.sin(t * 2.6)), 10);
    plus.scale.setScalar(1 + beat * 0.06);
    material.emissiveIntensity = 0.25 + beat * 0.8;
    plus.rotation.set(Math.sin(t * 0.37) * 0.12, Math.sin(t * 0.5) * 0.35 + (u - 0.5) * 0.8, 0);
   },
  };
 }

 /* ---------- scene 6: principles (Carousel) ---------- */
 function buildPrinciples() {
  const group = new THREE.Group();
  const ring = new THREE.Group();
  const R = 3.1;
  ring.position.z = -R;
  group.add(ring);

  const defs = [
   { geo: new THREE.IcosahedronGeometry(1, 1), color: 0xf4f0e8, glow: 0xf4f0e8, flat: true },
   { geo: new THREE.TorusGeometry(0.95, 0.15, 16, 64), color: 0x8fb4ff, glow: 0x2b7bff, flat: false },
   { geo: new THREE.TorusKnotGeometry(0.62, 0.2, 96, 14, 2, 3), color: 0x9fe6ff, glow: 0x00f0ff, flat: false },
   { geo: new THREE.SphereGeometry(0.95, 32, 24), color: 0xc9a27e, glow: 0xc9a27e, flat: false },
  ];
  const slots = defs.map((d, k) => {
   const mat = new THREE.MeshStandardMaterial({
    color: d.color,
    metalness: 0.9,
    roughness: 0.2,
    flatShading: d.flat,
    emissive: d.glow,
    emissiveIntensity: 0,
   });
   const mesh = new THREE.Mesh(d.geo, mat);
   const slot = new THREE.Group();
   slot.position.set(Math.sin((k * Math.PI) / 2) * R, 0, Math.cos((k * Math.PI) / 2) * R);
   slot.add(mesh);
   ring.add(slot);
   return { slot, mesh, mat };
  });

  const bead = new THREE.Mesh(
   new THREE.SphereGeometry(0.11, 12, 10),
   new THREE.MeshBasicMaterial({ color: 0xbfe0ff, toneMapped: false }),
  );
  slots[1].mesh.add(bead);
  addHalo(group, 0xf4f0e8, 8, 0.18, -2.5);

  return {
   group,
   base: 1,
   update(u, t) {
    if (!group.visible) return;
    const v = clamp(u * 4, 0, 3.999);
    const idx = Math.floor(v);
    const act = idx + (idx < 3 ? smooth(0.55, 1, v - idx) : 0);
    ring.rotation.y = -act * (Math.PI / 2);
    slots.forEach((o, k) => {
     const d = Math.max(0, 1 - Math.abs(act - k));
     o.slot.scale.setScalar(lerp(0.52, 1.1, d));
     o.mat.emissiveIntensity = d * 0.5;
     o.mesh.rotation.set(t * 0.2 + k, t * 0.35 + k * 1.7, 0);
    });
    bead.position.set(Math.cos(t * 1.4) * 0.95, Math.sin(t * 1.4) * 0.95, 0);
   },
  };
 }

 /* ---------- scene 7: finale ---------- */
 function buildFinale() {
  const e = buildEmblem();
  addHalo(e.group, brandAccent, 11, 0.35, -1.2);
  return {
   group: e.group,
   base: 0.92,
   update(u, t, s, ptr) {
    if (!e.group.visible) return;
    e.pose(Infinity, 1 - smooth(6.1, 6.95, s), 0, 0);
    e.inner.rotation.set(
     Math.sin(t * 0.2) * 0.08 - ptr.y * 0.1,
     Math.sin(u * Math.PI * 2) * 0.4 + Math.sin(t * 0.3) * 0.1 + ptr.x * 0.2,
     0,
    );
   },
  };
 }

 /* ---------- scene builders array ---------- */
 const sceneBuilders = [
  buildHero,
  buildBlocks,
  buildVoice,
  buildData,
  buildGears,
  buildCare,
  buildPrinciples,
  buildFinale,
 ];
 const scenes = new Array(sceneBuilders.length);

 const n = Math.min(chapters.length, sceneBuilders.length);
 const sides = chapters.map((el) =>
  el.dataset.object === 'left' ? -1 : el.dataset.object === 'right' ? 1 : 0,
 );

 function layoutScene(i) {
  const sc = scenes[i];
  if (!sc) return;
  const aspect = camera.aspect;
  const halfH = Math.tan(THREE.MathUtils.degToRad(20)) * CAM_DIST;
  const halfW = halfH * aspect;
  const portrait = aspect < 0.9 || window.innerWidth < 768;
  let x = 0;
  let y = 0;
  let fit = 1;
  if (portrait) {
   y = halfH * 0.38;
   fit = clamp(halfW / 3.4, 0.45, 1);
  } else {
   x = (sides[i] || 0) * halfW * 0.5;
   fit = clamp((halfW * 0.46) / 2.9, 0.55, 1.1);
  }
  sc.group.position.set(STATIONS[i].x + x, STATIONS[i].y + y, STATIONS[i].z);
  sc.group.scale.setScalar(sc.base * fit);
 }

 function layout() {
  for (let i = 0; i < scenes.length; i++) {
   layoutScene(i);
  }
 }

 function getScene(i) {
  if (!scenes[i] && sceneBuilders[i]) {
   const sc = sceneBuilders[i]();
   scenes[i] = sc;
   scene.add(sc.group);
   layoutScene(i);
   if (currentDPR === 1 && sc.setPixelRatio) sc.setPixelRatio(1);
  }
  return scenes[i];
 }

 /* ---------- scroll geometry ---------- */
 let bounds = [];
 let vh = window.innerHeight;
 function measure() {
  vh = window.innerHeight;
  bounds = chapters.map((el) => {
   const top = el.offsetTop;
   const h = el.offsetHeight;
   return { top, h };
  });
 }

 function resize() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;
  renderer.setPixelRatio(currentDPR);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  layout();
  wakeLoop();
 }

 measure();
 resize();
 if ('ResizeObserver' in window) {
  new ResizeObserver(resize).observe(canvas);
  new ResizeObserver(measure).observe(document.documentElement);
 }
 window.addEventListener('resize', () => {
  measure();
  wakeLoop();
 });
 window.addEventListener('load', () => {
  measure();
  wakeLoop();
 });

 /* ---------- pointer parallax ---------- */
 const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
 if (!mobile) {
  window.addEventListener(
   'pointermove',
   (event) => {
    ptr.tx = (event.clientX / window.innerWidth - 0.5) * 2;
    ptr.ty = -(event.clientY / window.innerHeight - 0.5) * 2;
    wakeLoop();
   },
   { passive: true },
  );
 }

 /* ---------- unified animation loop with idle hibernation ---------- */
 const clock = new THREE.Clock();
 const camPos = new THREE.Vector3();
 const lookPos = new THREE.Vector3();
 const targetU = new Array(scenes.length).fill(0);
 const smoothU = new Array(scenes.length).fill(0);
 let sS = 0;
 let sPrev = 0;
 let fov = camera.fov;
 let first = true;
 let live = false;
 let lost = false;
 let gaveUp = false;
 let lostTimer = 0;

 let isIdle = false;
 let animFrameId = null;
 let isScrolling = false;
 let scrollTimer = null;
 let initTime = performance.now();
 let frameCount = 0;
 let frameTimeAcc = 0;

 function wakeLoop() {
  isIdle = false;
  if (!animFrameId && !lost && !gaveUp) {
   clock.getDelta();
   animFrameId = requestAnimationFrame(frame);
  }
 }

 window.addEventListener(
  'scroll',
  () => {
   isScrolling = true;
   // Fast-path: drop DPR to 1 during active scrolling for locked 60fps
   if (currentDPR > 1) {
    currentDPR = 1;
    renderer.setPixelRatio(1);
   }
   clearTimeout(scrollTimer);
   scrollTimer = setTimeout(() => {
    isScrolling = false;
   }, 150);
   wakeLoop();
  },
  { passive: true },
 );

 function frame() {
  animFrameId = null;
  if (lost || gaveUp) return;

  const raw = clock.getDelta();
  const dt = Math.min(raw, 0.05);
  const t = clock.elapsedTime;
  const y = window.scrollY || 0;

  // Upgrade pixel ratio after 2 seconds if stationary & stable
  if (currentDPR < maxDPR && !isScrolling && performance.now() - initTime > 2000) {
   frameCount++;
   frameTimeAcc += raw;
   if (frameCount >= 60) {
    if (frameTimeAcc / frameCount < 0.02) {
     currentDPR = maxDPR;
     renderer.setPixelRatio(currentDPR);
     scenes.forEach((sc) => sc && sc.setPixelRatio && sc.setPixelRatio(currentDPR));
    }
    frameCount = 0;
    frameTimeAcc = 0;
   }
  }

  /* Station index and progress */
  let i = 0;
  for (let k = 0; k < n; k++) if (y >= bounds[k].top - 2) i = k;
  let s = i;
  if (i < n - 1) {
   const span = Math.max(1, bounds[i + 1].top - bounds[i].top);
   s = i + smooth(0.6, 1, (y - bounds[i].top) / span);
  }
  for (let k = 0; k < n; k++) {
   targetU[k] = clamp((y - bounds[k].top) / Math.max(1, bounds[k].h - vh));
  }
  if (first) {
   sS = s;
   sPrev = s;
   for (let k = 0; k < n; k++) smoothU[k] = targetU[k];
   first = false;
  }

  const prevSS = sS;
  sS = damp(sS, s, 3.2, dt);
  const scrollDelta = Math.abs(sS - prevSS) + Math.abs(s - sS);

  let maxUDelta = 0;
  for (let k = 0; k < n; k++) {
   const prevU = smoothU[k];
   smoothU[k] = damp(smoothU[k], targetU[k], 4.5, dt);
   maxUDelta = Math.max(maxUDelta, Math.abs(smoothU[k] - prevU));
  }

  const prevPtrX = ptr.x;
  const prevPtrY = ptr.y;
  ptr.x = damp(ptr.x, ptr.tx, 3, dt);
  ptr.y = damp(ptr.y, ptr.ty, 3, dt);
  const ptrDelta = Math.abs(ptr.x - prevPtrX) + Math.abs(ptr.y - prevPtrY);

  /* camera */
  const tt = clamp(sS / (STATIONS.length - 1));
  camCurve.getPoint(tt, camPos);
  lookCurve.getPoint(tt, lookPos);
  camPos.x += Math.sin(t * 0.31) * 0.22 + ptr.x * 0.55;
  camPos.y += Math.cos(t * 0.23) * 0.16 + ptr.y * 0.35;
  camera.position.copy(camPos);
  camera.lookAt(lookPos);

  const lag = clamp(s - sS, -1, 1);
  camera.rotateZ(lag * 0.1 * (Math.floor(sS) % 2 === 0 ? 1 : -1));

  const speed = Math.abs(sS - sPrev) / Math.max(dt, 0.001);
  sPrev = sS;
  fov = damp(fov, 40 + clamp(speed * 7, 0, 16), 6, dt);
  if (Math.abs(camera.fov - fov) > 0.02) {
   camera.fov = fov;
   camera.updateProjectionMatrix();
  }

  /* mood fill light */
  const a = Math.min(FILL_COLORS.length - 1, Math.floor(sS));
  fill.color.copy(FILL_COLORS[a]).lerp(FILL_COLORS[Math.min(FILL_COLORS.length - 1, a + 1)], sS - a);

  /* active scenes */
  for (let k = 0; k < scenes.length; k++) {
   const visible = k < n && (k === 0 ? sS < 1.4 : sS > 0.05 && Math.abs(sS - k) < 1.4);
   if (visible) {
    const sc = scenes[k];
    if (sc) {
     sc.group.visible = true;
     sc.update(smoothU[k], t, sS, ptr);
    }
   } else if (scenes[k]) {
    scenes[k].group.visible = false;
   }
  }

  renderer.render(scene, camera);

  if (!live) {
   live = true;
   canvas.classList.add('is-live');
  }

  /* Idle hibernation threshold: when setup is complete, intro animation has settled (>2.5s),
     and scroll/pointer deltas are below 0.0005, halt rendering until wakeLoop() is triggered by user interaction. */
  if (
   setupQueue.length === 0 &&
   performance.now() - initTime > 2500 &&
   scrollDelta < 0.0005 &&
   ptrDelta < 0.0005 &&
   maxUDelta < 0.0005 &&
   !isScrolling
  ) {
   isIdle = true;
   return;
  }

  animFrameId = requestAnimationFrame(frame);
 }

 function startMasterLoop() {
  if (!animFrameId) {
   isIdle = false;
   clock.getDelta();
   animFrameId = requestAnimationFrame(frame);
  }
 }

 /* ---------- time-sliced multi-frame setup queue (1 step per tick) ---------- */
 const setupQueue = [
  // Step 0: PMREM Environment
  () => {
   initEnvironment();
  },
  // Step 1: Star field
  () => {
   scene.add(buildStars());
  },
  // Step 2: Station 0 (Hero emblem) + start loop
  () => {
   getScene(0);
   resize();
   startMasterLoop();
  },
  // Step 3: Station 1 (Blocks)
  () => {
   getScene(1);
  },
  // Step 4: Station 2 (Voice)
  () => {
   getScene(2);
  },
  // Step 5: Station 3 (Data)
  () => {
   getScene(3);
  },
  // Step 6: Station 4 (Gears)
  () => {
   getScene(4);
  },
  // Step 7: Station 5 (Healthcare)
  () => {
   getScene(5);
  },
  // Step 8: Station 6 (Principles)
  () => {
   getScene(6);
  },
  // Step 9: Station 7 (Finale)
  () => {
   getScene(7);
  },
 ];

 function runSetupQueue() {
  if (!setupQueue.length || lost || gaveUp) return;
  const step = setupQueue.shift();
  try {
   step();
  } catch (err) {
   console.warn('[stage] step error:', err);
  }
  if (setupQueue.length) {
   requestAnimationFrame(runSetupQueue);
  }
 }

 /* Run step queue across consecutive animation frames */
 requestAnimationFrame(runSetupQueue);

 /* Visibility & Context handlers */
 document.addEventListener('visibilitychange', () => {
  if (lost || gaveUp) return;
  if (document.hidden) {
   if (animFrameId) cancelAnimationFrame(animFrameId);
   animFrameId = null;
   isIdle = true;
  } else {
   wakeLoop();
  }
 });

 canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  lost = true;
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = null;
  clearTimeout(lostTimer);
  lostTimer = setTimeout(() => {
   if (!lost) return;
   gaveUp = true;
   activeRenderer = null;
   root.classList.add('no-stage');
   window.dispatchEvent(new Event('wt:stage-fail'));
  }, 5000);
 });

 canvas.addEventListener('webglcontextrestored', () => {
  clearTimeout(lostTimer);
  if (gaveUp) return;
  lost = false;
  initEnvironment();
  resize();
  wakeLoop();
 });
}
