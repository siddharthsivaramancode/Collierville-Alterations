import * as THREE from 'three';

export { MODEL, TINTS, defaultValues, effective } from './garmentModel';

/* ------------------------------------------------------------------ *
 * Procedural mannequin + garments.
 * Every surface is swept from parametric cross-sections, so each slider
 * reshapes the real geometry. Units are metres, y is up, +z is front.
 * ------------------------------------------------------------------ */

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const FRONT = Math.PI / 2;
const BACK = Math.PI * 1.5;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};
const gauss = (x, s) => Math.exp(-((x / s) ** 2));
const angDiff = (a, b) => {
  let d = (a - b) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ============================== textures ============================== */

const texCache = new Map();
const matCache = new Map();

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Tileable smooth value noise with `cells` lattice points per side. */
function valueNoise(size, cells, seed) {
  const r = rng(seed);
  const grid = Array.from({ length: cells * cells }, () => r());
  const at = (i, j) => grid[((j + cells) % cells) * cells + ((i + cells) % cells)];
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const gx = (x / size) * cells;
      const gy = (y / size) * cells;
      const i = Math.floor(gx);
      const j = Math.floor(gy);
      const fx = smooth(gx - i);
      const fy = smooth(gy - j);
      out[y * size + x] = lerp(lerp(at(i, j), at(i + 1, j), fx), lerp(at(i, j + 1), at(i + 1, j + 1), fx), fy);
    }
  }
  return out;
}

function heightField(kind, size) {
  const h = new Float32Array(size * size);
  const coarse = valueNoise(size, 8, 11);
  const fine = valueNoise(size, 32, 29);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = y * size + x;
      const n = coarse[i] * 0.6 + fine[i] * 0.4;
      let v;
      if (kind === 'twill') {
        v = (0.5 + 0.5 * Math.sin((TAU * (x + y)) / 8)) * 0.75 + n * 0.25;
      } else if (kind === 'satin') {
        v = (0.5 + 0.5 * Math.sin((TAU * y) / 4)) * 0.2 + n * 0.8;
      } else if (kind === 'poplin') {
        v = (0.5 + 0.25 * (Math.sin((TAU * x) / 4) + Math.sin((TAU * y) / 4))) * 0.7 + n * 0.3;
      } else if (kind === 'lace') {
        const row = Math.floor(y / 32);
        const lx = ((x + (row % 2 ? 16 : 0)) % 32) - 16;
        const ly = (y % 32) - 16;
        const d = Math.hypot(lx, ly);
        const phi = Math.atan2(ly, lx);
        const petal = smooth(6.5 + 3.2 * Math.cos(5 * phi) - d + 0.5);
        const ring = gauss(d - 11.5, 1.2) * 0.8;
        const net =
          Math.max(
            gauss(Math.sin((Math.PI * (x + y)) / 6), 0.18),
            gauss(Math.sin((Math.PI * (x - y)) / 6), 0.18),
          ) * 0.4;
        v = Math.max(petal * 0.95, ring, net) * 0.9 + n * 0.1;
      } else {
        v = n;
      }
      h[i] = v;
    }
  }
  return h;
}

function dataTexture(data, size, srgb) {
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function getTexture(kind, type) {
  const key = `${kind}:${type}`;
  if (texCache.has(key)) return texCache.get(key);
  const size = 128;
  const h = heightField(kind, size);
  const data = new Uint8Array(size * size * 4);
  if (type === 'normal') {
    const strength = 2.2;
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const dx = h[y * size + ((x + 1) % size)] - h[y * size + ((x - 1 + size) % size)];
        const dy = h[((y + 1) % size) * size + x] - h[((y - 1 + size) % size) * size + x];
        const nx = -dx * strength;
        const ny = -dy * strength;
        const len = Math.hypot(nx, ny, 1);
        const i = (y * size + x) * 4;
        data[i] = ((nx / len) * 0.5 + 0.5) * 255;
        data[i + 1] = ((ny / len) * 0.5 + 0.5) * 255;
        data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
        data[i + 3] = 255;
      }
    }
  } else {
    for (let i = 0; i < size * size; i += 1) {
      const g = lerp(0.8, 1, h[i]) * 255;
      data[i * 4] = g;
      data[i * 4 + 1] = g;
      data[i * 4 + 2] = g;
      data[i * 4 + 3] = 255;
    }
  }
  const tex = dataTexture(data, size, type === 'map');
  texCache.set(key, tex);
  return tex;
}

/* ============================== materials ============================= */

const FABRICS = {
  wool: { roughness: 0.8, sheen: 0.45, sheenRoughness: 0.65, tex: 'heather', tile: 0.12, ns: 0.3 },
  satin: { roughness: 0.36, sheen: 1, sheenRoughness: 0.32, tex: 'satin', tile: 0.09, ns: 0.14, clearcoat: 0.08 },
  lace: { roughness: 0.52, sheen: 0.7, sheenRoughness: 0.4, tex: 'lace', tile: 0.07, ns: 0.9, map: true },
  poplin: { roughness: 0.7, sheen: 0.3, sheenRoughness: 0.5, tex: 'heather', tile: 0.1, ns: 0.16 },
  silk: { roughness: 0.32, sheen: 0.9, sheenRoughness: 0.3, tex: 'twill', tile: 0.03, ns: 0.15 },
  lining: { roughness: 0.3, sheen: 0.8, sheenRoughness: 0.3, tex: 'satin', tile: 0.04, ns: 0.15 },
};

function fabric(kind, color, side = THREE.FrontSide) {
  const key = `fabric|${kind}|${color}|${side}`;
  if (matCache.has(key)) return matCache.get(key);
  const f = FABRICS[kind];
  const base = new THREE.Color(color);
  const normalMap = getTexture(f.tex, 'normal').clone();
  normalMap.repeat.set(1 / f.tile, 1 / f.tile);
  normalMap.needsUpdate = true;
  let map = null;
  if (f.map) {
    map = getTexture(f.tex, 'map').clone();
    map.repeat.set(1 / f.tile, 1 / f.tile);
    map.needsUpdate = true;
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: base,
    map,
    roughness: f.roughness,
    metalness: 0,
    sheen: f.sheen,
    sheenRoughness: f.sheenRoughness,
    sheenColor: base.clone().lerp(new THREE.Color('#ffffff'), 0.45),
    clearcoat: f.clearcoat || 0,
    clearcoatRoughness: 0.4,
    normalMap,
    normalScale: new THREE.Vector2(f.ns, f.ns),
    side,
  });
  matCache.set(key, mat);
  return mat;
}

function solid(key, params) {
  const k = `solid|${key}`;
  if (matCache.has(k)) return matCache.get(k);
  const mat = new THREE.MeshPhysicalMaterial(params);
  matCache.set(k, mat);
  return mat;
}

const MANNEQUIN = () =>
  solid('mannequin', { color: '#C8B79F', roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.3 });
const LEATHER = () =>
  solid('leather', { color: '#1E1B1C', roughness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.15 });
const SOLE = () => solid('sole', { color: '#3A2B22', roughness: 0.7 });
const HORN = () => solid('horn', { color: '#2C241F', roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 });
const PEARL = () => solid('pearl', { color: '#F6F3EC', roughness: 0.25, clearcoat: 0.8 });

function shade(color, amount) {
  const c = new THREE.Color(color);
  const target = new THREE.Color(amount >= 0 ? '#ffffff' : '#000000');
  return `#${c.lerp(target, Math.abs(amount)).getHexString()}`;
}

/** Geometry only: materials and textures are cached and shared between rebuilds. */
export function disposeObject(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose();
  });
}

export function disposeCaches() {
  matCache.forEach((m) => {
    if (m.normalMap) m.normalMap.dispose();
    if (m.map) m.map.dispose();
    m.dispose();
  });
  matCache.clear();
  texCache.forEach((t) => t.dispose());
  texCache.clear();
}

/* ============================ interpolation =========================== */

function catmull(a, b, c, d, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
}

/** keys: ascending [y, ...values]. Smooth interpolation of all values at y. */
function interpKeys(keys, y) {
  const n = keys.length;
  if (y <= keys[0][0]) return keys[0].slice(1);
  if (y >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let k = 0;
  while (keys[k + 1][0] < y) k += 1;
  const t = (y - keys[k][0]) / (keys[k + 1][0] - keys[k][0]);
  const a = keys[Math.max(0, k - 1)];
  const b = keys[k];
  const c = keys[k + 1];
  const d = keys[Math.min(n - 1, k + 2)];
  return b.slice(1).map((_, j) => catmull(a[j + 1], b[j + 1], c[j + 1], d[j + 1], t));
}

/* ============================= body shape ============================= */

// [y, half-width, front depth, back depth, centre z]
const TORSO = [
  [0.76, 0.02, 0.02, 0.02, 0],
  [0.8, 0.11, 0.072, 0.085, -0.006],
  [0.86, 0.163, 0.092, 0.118, -0.012],
  [0.93, 0.17, 0.094, 0.12, -0.012],
  [1.0, 0.149, 0.088, 0.1, -0.005],
  [1.08, 0.13, 0.082, 0.088, 0],
  [1.16, 0.139, 0.087, 0.09, 0.004],
  [1.26, 0.158, 0.098, 0.092, 0.01],
  [1.34, 0.172, 0.098, 0.094, 0.008],
  [1.405, 0.188, 0.084, 0.09, 0],
  [1.45, 0.15, 0.07, 0.076, -0.004],
  [1.485, 0.078, 0.056, 0.058, -0.004],
  [1.52, 0.05, 0.046, 0.046, 0],
];

function section(y) {
  const [rx, rzF, rzB, cz] = interpKeys(TORSO, y);
  return { rx, rzF, rzB, cz };
}

function bust(y, th) {
  return (
    0.016 *
    gauss(y - 1.27, 0.065) *
    (gauss(angDiff(th, FRONT - 33 * DEG), 0.42) + gauss(angDiff(th, FRONT + 33 * DEG), 0.42))
  );
}

/** Point on an elliptical cross-section with separate front/back depth. */
function ringPoint(sec, y, th, gap = 0, bustScale = 0, extra = 0) {
  const c = Math.cos(th);
  const s = Math.sin(th);
  const rz = lerp(sec.rzB, sec.rzF, (s + 1) / 2) + gap;
  const rx = sec.rx + gap;
  const b = (bustScale ? bust(y, th) * bustScale : 0) + extra;
  return [rx * c + b * c, y, sec.cz + rz * s + b * s];
}

// [y, radius, centre z]
const LEG = [
  [0.03, 0.033, -0.004],
  [0.1, 0.036, -0.006],
  [0.22, 0.05, -0.012],
  [0.34, 0.056, -0.012],
  [0.48, 0.05, 0],
  [0.6, 0.063, 0.003],
  [0.75, 0.075, 0],
  [0.9, 0.086, -0.004],
];
const legAt = (y) => interpKeys(LEG, y);
const legX = (y) => 0.08 + 0.004 * clamp(y / 0.9, 0, 1);

const ARM_PTS = [
  [0.17, 1.415, -0.005],
  [0.2, 1.36, 0],
  [0.225, 1.2, -0.008],
  [0.238, 1.08, -0.004],
  [0.252, 0.93, 0.018],
  [0.262, 0.79, 0.04],
  [0.268, 0.66, 0.05],
];
const ARM_R = [
  [0.66, 0.024],
  [0.79, 0.026],
  [0.92, 0.032],
  [1.08, 0.036],
  [1.2, 0.041],
  [1.33, 0.049],
  [1.43, 0.052],
];
const armR = (y) => interpKeys(ARM_R, y)[0];

const armCache = {};
function arm(s) {
  if (armCache[s]) return armCache[s];
  const curve = new THREE.CatmullRomCurve3(
    ARM_PTS.map(([x, y, z]) => V(s * x, y, z)),
    false,
    'centripetal',
  );
  const steps = 240;
  const ys = [];
  for (let i = 0; i <= steps; i += 1) ys.push(curve.getPointAt(i / steps).y);
  const vAtY = (y) => {
    if (y >= ys[0]) return 0;
    for (let i = 1; i <= steps; i += 1) {
      if (ys[i] <= y) {
        const t = (ys[i - 1] - y) / (ys[i - 1] - ys[i]);
        return (i - 1 + t) / steps;
      }
    }
    return 1;
  };
  armCache[s] = { curve, vAtY };
  return armCache[s];
}

/* ============================== geometry ============================== */

/**
 * Generic (rows x cols) surface. pos(v, u) -> [x, y, z].
 * uv: 'tube' -> (u * uLen, y), 'xy' -> (x, y), 'curve' -> (u * uLen, v * vLen).
 */
function sweep(rows, cols, pos, { closed = false, uv = 'tube', uLen = 1, vLen = 1 } = {}) {
  const count = (rows + 1) * (cols + 1);
  const P = new Float32Array(count * 3);
  const T = new Float32Array(count * 2);
  let i = 0;
  for (let r = 0; r <= rows; r += 1) {
    const v = r / rows;
    for (let c = 0; c <= cols; c += 1) {
      const u = c / cols;
      const p = pos(v, u);
      P[i * 3] = p[0];
      P[i * 3 + 1] = p[1];
      P[i * 3 + 2] = p[2];
      if (uv === 'xy') {
        T[i * 2] = p[0];
        T[i * 2 + 1] = p[1];
      } else if (uv === 'curve') {
        T[i * 2] = u * uLen;
        T[i * 2 + 1] = v * vLen;
      } else {
        T[i * 2] = u * uLen;
        T[i * 2 + 1] = p[1];
      }
      i += 1;
    }
  }
  const index = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const a = r * (cols + 1) + c;
      const b = a + 1;
      const d = a + cols + 1;
      const e = d + 1;
      index.push(a, d, b, b, d, e);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(T, 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  if (closed) {
    const N = geo.attributes.normal;
    for (let r = 0; r <= rows; r += 1) {
      const a = r * (cols + 1);
      const b = a + cols;
      const nx = N.getX(a) + N.getX(b);
      const ny = N.getY(a) + N.getY(b);
      const nz = N.getZ(a) + N.getZ(b);
      const len = Math.hypot(nx, ny, nz) || 1;
      N.setXYZ(a, nx / len, ny / len, nz / len);
      N.setXYZ(b, nx / len, ny / len, nz / len);
    }
  }
  return geo;
}

/** Parallel-transport frames along a curve between v0..v1. */
function frames(curve, v0, v1, rows) {
  const pts = [];
  const tans = [];
  for (let r = 0; r <= rows; r += 1) {
    const v = lerp(v0, v1, r / rows);
    pts.push(curve.getPointAt(v));
    tans.push(curve.getTangentAt(v).normalize());
  }
  const normals = [];
  const binormals = [];
  let n = V(0, 0, 1);
  for (let r = 0; r <= rows; r += 1) {
    n = n.clone().sub(tans[r].clone().multiplyScalar(n.dot(tans[r]))).normalize();
    normals.push(n);
    binormals.push(n.clone().cross(tans[r]).normalize());
  }
  return { pts, tans, normals, binormals };
}

/** Closed tube swept along a curve between v0..v1. radius(v, y, th). */
function curveTube(curve, v0, v1, rows, cols, radius) {
  const { pts, normals, binormals } = frames(curve, v0, v1, rows);
  const len = curve.getLength() * (v1 - v0);
  return sweep(
    rows,
    cols,
    (v, u) => {
      const r = Math.round(v * rows);
      const th = u * TAU;
      const p = pts[r];
      const rad = radius(v, p.y, th);
      const c = Math.cos(th) * rad;
      const s = Math.sin(th) * rad;
      return [
        p.x + normals[r].x * c + binormals[r].x * s,
        p.y + normals[r].y * c + binormals[r].y * s,
        p.z + normals[r].z * c + binormals[r].z * s,
      ];
    },
    { closed: true, uv: 'curve', uLen: 0.2, vLen: len },
  );
}

function piping(points, radius, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  return new THREE.TubeGeometry(curve, Math.max(8, points.length * 3), radius, 6, closed);
}

function outward(fn, y, th) {
  const p = V(...fn(y, th));
  const a = V(...fn(y, th + 0.004));
  const b = V(...fn(y + 0.004, th));
  return b.sub(p).cross(a.sub(p)).normalize();
}

function onSurface(fn, y, th, lift) {
  return V(...fn(y, th)).add(outward(fn, y, th).multiplyScalar(lift));
}

function anchor(fn, y, th, lift = 0.006) {
  return { p: onSurface(fn, y, th, lift), n: outward(fn, y, th) };
}

function add(group, geo, mat, { cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = cast && mat.side !== THREE.DoubleSide;
  mesh.receiveShadow = receive;
  group.add(mesh);
  return mesh;
}

function ellipsoid(group, mat, pos, scale, quat) {
  const mesh = add(group, new THREE.SphereGeometry(1, 32, 20), mat);
  mesh.position.copy(pos);
  mesh.scale.set(...scale);
  if (quat) mesh.quaternion.copy(quat);
  return mesh;
}

function button(group, mat, p, n, r = 0.0115) {
  const mesh = add(group, new THREE.CylinderGeometry(r, r * 0.92, r * 0.38, 24), mat, { cast: false });
  mesh.position.copy(p);
  mesh.quaternion.setFromUnitVectors(V(0, 1, 0), n);
  return mesh;
}

/* ============================== mannequin ============================= */

export function buildMannequin() {
  const group = new THREE.Group();
  const skin = MANNEQUIN();

  add(
    group,
    sweep(
      90,
      96,
      (v, u) => {
        const y = lerp(0.76, 1.52, v);
        return ringPoint(section(y), y, u * TAU, 0, 1);
      },
      { closed: true, uLen: 0.9 },
    ),
    skin,
  );

  add(
    group,
    sweep(
      14,
      48,
      (v, u) => {
        const y = lerp(1.47, 1.6, v);
        const r = lerp(0.048, 0.041, v);
        const th = u * TAU;
        return [r * Math.cos(th), y, lerp(0, 0.014, v) + r * Math.sin(th)];
      },
      { closed: true, uLen: 0.3 },
    ),
    skin,
  );

  const head = ellipsoid(group, skin, V(0, 1.672, 0.014), [0.084, 0.11, 0.097]);
  head.rotation.x = -0.12;

  for (const s of [-1, 1]) {
    const { curve, vAtY } = arm(s);
    const vWrist = vAtY(0.79);
    add(group, curveTube(curve, 0, vWrist, 48, 36, (v, y) => armR(y)), skin);
    ellipsoid(group, skin, curve.getPointAt(0).add(V(0, 0.002, 0)), [0.05, 0.05, 0.05]);

    const wrist = curve.getPointAt(vWrist);
    const tan = curve.getTangentAt(vWrist).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), tan);
    ellipsoid(group, skin, wrist.clone().add(tan.clone().multiplyScalar(0.062)), [0.019, 0.068, 0.04], q);

    add(
      group,
      sweep(
        70,
        40,
        (v, u) => {
          const y = lerp(0.03, 0.9, v);
          const [r, cz] = legAt(y);
          const th = u * TAU;
          return [s * legX(y) + r * Math.cos(th), y, cz + r * Math.sin(th)];
        },
        { closed: true, uLen: 0.3 },
      ),
      skin,
    );

    // dress shoes
    const x = s * 0.08;
    ellipsoid(group, LEATHER(), V(x, 0.042, 0.048), [0.043, 0.038, 0.118]);
    ellipsoid(group, LEATHER(), V(x, 0.06, -0.01), [0.04, 0.045, 0.06]);
    const sole = ellipsoid(group, SOLE(), V(x, 0.007, 0.045), [0.046, 0.007, 0.124]);
    sole.castShadow = false;
  }

  return group;
}

/* ================================ shirt =============================== */

function buildShirt(group, { tie, tieColor }) {
  const cotton = fabric('poplin', '#F5F3EE');
  const cottonDouble = fabric('poplin', '#F5F3EE', THREE.DoubleSide);
  const pos = (y, th) => {
    const blouse = gauss(y - 1.1, 0.05) * smooth((y - 1.05) / 0.03);
    const tucked = y < 1.06 ? 0.004 : 0.006;
    const fold = (0.0008 + 0.003 * blouse) * Math.sin(9 * th + y * 14) * smooth((1.3 - y) / 0.3);
    return ringPoint(section(y), y, th, tucked + 0.008 * blouse + fold, 1);
  };
  add(group, sweep(60, 96, (v, u) => pos(lerp(0.9, 1.505, v), u * TAU), { closed: true, uLen: 0.9 }), cotton);

  // placket
  add(
    group,
    sweep(
      30,
      2,
      (v, u) => onSurface(pos, lerp(0.95, 1.47, v), FRONT + (u - 0.5) * 0.12, 0.0018).toArray(),
      { uv: 'xy' },
    ),
    cottonDouble,
  );
  if (!tie) {
    for (const y of [1.06, 1.15, 1.24, 1.33, 1.42]) {
      button(group, PEARL(), onSurface(pos, y, FRONT, 0.003), outward(pos, y, FRONT), 0.0045);
    }
  }

  // collar band: closed under a tie, open at the throat without one
  const open = tie ? 0 : 0.42;
  add(
    group,
    sweep(
      6,
      64,
      (v, u) => {
        const th = lerp(FRONT + open, FRONT + TAU - open, u);
        const front = tie ? 0 : gauss(angDiff(th, FRONT), 0.9);
        const y = lerp(1.49 - 0.02 * front, 1.538 - 0.03 * front, v);
        const r = lerp(0.066, 0.056, smooth(v * 1.6)) + 0.012 * front;
        return [r * Math.cos(th), y, 0.004 + r * Math.sin(th)];
      },
      { closed: !open, uLen: 0.35 },
    ),
    open ? cottonDouble : cotton,
  );

  // collar points, kept just above the shirt front
  for (const s of [-1, 1]) {
    add(
      group,
      sweep(
        8,
        6,
        (v, u) => {
          const spread = tie ? 0 : 1;
          const top = V(lerp(s * (0.01 + 0.018 * spread), s * 0.05, u), 1.536 - 0.024 * spread, lerp(0.058, 0.04, u));
          const tip = V(
            lerp(s * (0.02 + 0.03 * spread), s * (0.074 + 0.02 * spread), u),
            lerp(1.47, 1.48, u) - 0.012 * spread,
            lerp(0.084, 0.072, u),
          );
          const p = top.lerp(tip, v);
          const th = Math.atan2(p.z, p.x);
          const surf = V(...pos(p.y, th));
          const r = Math.hypot(surf.x, surf.z) + 0.004;
          const pr = Math.hypot(p.x, p.z);
          if (pr < r) {
            p.x *= r / pr;
            p.z *= r / pr;
          }
          return p.toArray();
        },
        { uv: 'xy' },
      ),
      cottonDouble,
    );
  }

  if (tie) {
    const silk = fabric('silk', tieColor, THREE.DoubleSide);
    ellipsoid(group, silk, onSurface(pos, 1.505, FRONT, 0.014), [0.017, 0.021, 0.012]);
    add(
      group,
      sweep(
        30,
        4,
        (v, u) => {
          const y = lerp(1.49, 1.0, v);
          let w = lerp(0.018, 0.043, smooth((1.49 - y) / 0.4));
          if (y < 1.04) w *= (y - 1.0) / 0.04;
          const x = (u - 0.5) * 2 * w;
          const sec = section(y);
          const th = Math.acos(clamp(x / (sec.rx + 0.006), -0.99, 0.99));
          return onSurface(pos, y, th, 0.0055 + 0.002 * (1 - Math.abs(u - 0.5) * 2)).toArray();
        },
        { uv: 'xy' },
      ),
      silk,
    );
  }

  // sleeves with cuffs
  for (const s of [-1, 1]) {
    const { curve, vAtY } = arm(s);
    const head = curve.getPointAt(0);
    ellipsoid(group, cotton, head.clone().add(V(0, 0.002, 0)), [0.058, 0.056, 0.058]);
    add(
      group,
      curveTube(curve, vAtY(1.4), vAtY(0.782), 40, 32, (v, y, th) => {
        const cuff = y < 0.845 ? 0.0045 : 0;
        return armR(y) + 0.008 + cuff + 0.0008 * Math.sin(y * 140 + Math.cos(th) * 2);
      }),
      cotton,
    );
  }
}

/* =============================== trousers ============================= */

function buildTrousersInto(group, e, ease, tint, { details = true } = {}) {
  const { waist, taper, hem } = e;
  const hemY = Math.max(0.004, 0.2 - 0.2 * hem);
  const waistTop = 1.065;
  const cloth = fabric('wool', tint);
  const inside = fabric('wool', shade(tint, -0.25), THREE.BackSide);
  const band = fabric('wool', shade(tint, -0.08));
  const seam = fabric('wool', shade(tint, -0.3));

  const hipPos = (y, th) => {
    const sec = section(clamp(y, 0.76, 1.52));
    const gap = ease * 0.5 + 0.004 + (1 - waist) * 0.045 * smooth((y - 0.95) / 0.11);
    const closing = smooth((y - 0.76) / 0.08);
    const drape = (1 - waist) * 0.004 * Math.sin(6 * th + 1) * smooth((y - 0.95) / 0.1);
    return ringPoint(sec, y, th, (gap + drape) * closing);
  };
  const hipGeo = sweep(26, 96, (v, u) => hipPos(lerp(0.76, waistTop, v), u * TAU), { closed: true, uLen: 0.9 });
  add(group, hipGeo, cloth);
  add(group, hipGeo, inside, { cast: false });

  const bandPos = (y, th) => {
    const p = hipPos(y, th);
    return [p[0] + Math.cos(th) * 0.004, p[1], p[2] + Math.sin(th) * 0.004];
  };
  add(
    group,
    sweep(4, 96, (v, u) => bandPos(lerp(1.028, waistTop + 0.002, v), u * TAU), { closed: true, uLen: 0.9 }),
    band,
  );

  const topR = 0.09 + ease * 0.3;
  const kneeR = lerp(0.098, 0.06, taper);
  const hemR = lerp(0.1, 0.047, taper);
  const crease = 0.001 + 0.0035 * smooth((0.05 - ease) / 0.04);
  const breakAmt = smooth((hem - 0.6) / 0.4);

  const legPos = (s) => (y, th) => {
    let shape;
    if (y >= 0.49) shape = lerp(kneeR, topR, smooth((y - 0.49) / 0.41));
    else shape = lerp(hemR, kneeR, Math.pow(clamp((y - hemY) / (0.49 - hemY), 0, 1), 0.9));
    const [lr, cz] = legAt(y);
    let r = Math.max(shape, lr + 0.005 + ease * 0.15);
    const edge = smooth((y - hemY) / 0.05);
    r += crease * (gauss(angDiff(th, FRONT), 0.09) + 0.6 * gauss(angDiff(th, BACK), 0.09)) * edge;
    r +=
      breakAmt *
      0.011 *
      gauss(y - hemY - 0.03, 0.09) *
      (0.55 + 0.45 * Math.sin(y * 210 + 2 * Math.cos(th)));
    r += ease * 0.05 * Math.sin(5 * th + y * 9 + s) * smooth((0.8 - y) / 0.3);
    return [s * legX(y) + r * Math.cos(th), y, cz + r * Math.sin(th)];
  };

  const legs = [];
  for (const s of [-1, 1]) {
    const fn = legPos(s);
    legs.push(fn);
    const geo = sweep(70, 64, (v, u) => fn(lerp(hemY, 0.9, v), u * TAU), { closed: true, uLen: 0.6 });
    add(group, geo, cloth);
    add(group, geo, inside, { cast: false });
    const ring = [];
    for (let i = 0; i < 48; i += 1) ring.push(V(...fn(hemY, (i / 48) * TAU)));
    add(group, piping(ring, 0.0025, true), seam, { cast: false });
  }

  if (details) {
    button(group, HORN(), onSurface(bandPos, 1.047, FRONT, 0.002), outward(bandPos, 1.047, FRONT), 0.008);
    for (const deg of [35, 145, 210, 270, 330]) {
      const th = deg * DEG;
      const loop = add(group, new THREE.BoxGeometry(0.011, 0.042, 0.004), band, { cast: false });
      loop.position.copy(onSurface(bandPos, 1.046, th, 0.0025));
      loop.lookAt(loop.position.clone().add(outward(bandPos, 1.046, th)));
    }
    // J-shaped fly stitch
    const fly = [];
    for (let i = 0; i <= 10; i += 1) {
      const t = i / 10;
      const off = t < 0.75 ? 0.065 : lerp(0.065, 0, (t - 0.75) / 0.25);
      fly.push(onSurface(hipPos, lerp(1.025, 0.905, t), FRONT + off, 0.0012));
    }
    add(group, piping(fly, 0.0011), seam, { cast: false });
    // slanted side pockets + back welts
    for (const s of [-1, 1]) {
      const pts = [];
      for (let i = 0; i <= 8; i += 1) {
        const t = i / 8;
        const a = lerp(34, 10, t) * DEG;
        pts.push(onSurface(hipPos, lerp(1.026, 0.9, t), s > 0 ? a : Math.PI - a, 0.0012));
      }
      add(group, piping(pts, 0.0013), seam, { cast: false });
      const welt = [];
      for (let i = 0; i <= 6; i += 1) {
        const deg = s > 0 ? lerp(288, 314, i / 6) : lerp(226, 252, i / 6);
        welt.push(onSurface(hipPos, 0.968, deg * DEG, 0.0012));
      }
      add(group, piping(welt, 0.0016), seam, { cast: false });
    }
  }

  return { hipPos, legs, hemY };
}

/* ================================ jacket ============================== */

function buildJacket(e, ease, tint) {
  const { waist, sleeve, length } = e;
  const group = new THREE.Group();
  const hemY = 0.98 - 0.32 * length;
  const cuffY = 0.9 - 0.3 * sleeve;
  const topY = 1.455;
  const buttonTop = 1.1;
  const buttonLow = 0.995;
  const vY = 1.12;

  const chest = section(1.26);
  const hip = section(0.9);
  const box = {
    rx: Math.max(chest.rx, hip.rx) + 0.01,
    rzF: Math.max(chest.rzF, hip.rzF) + 0.008,
    rzB: Math.max(chest.rzB, hip.rzB) + 0.008,
  };
  const jSec = (y) => {
    const s = section(clamp(y, 0.86, 1.52));
    const k = (1 - waist) * smooth((1.3 - y) / 0.22);
    return {
      rx: lerp(s.rx, Math.max(s.rx, box.rx), k),
      rzF: lerp(s.rzF, Math.max(s.rzF, box.rzF), k),
      rzB: lerp(s.rzB, Math.max(s.rzB, box.rzB), k),
      cz: s.cz,
    };
  };
  const loose = Math.max(0, ease - 0.02);
  const drapeAmp = 0.0012 + loose * 0.12;
  const shell = (y, th) => {
    const pad = 0.022 * gauss(y - 1.405, 0.04) * Math.cos(th) ** 2;
    const fold =
      drapeAmp *
      smooth((1.25 - y) / 0.3) *
      (0.55 * Math.sin(7 * th + 0.8 + y * 3) + 0.3 * Math.sin(13 * th + 2.1 - y * 5) + 0.15 * Math.sin(23 * th + 0.4));
    return ringPoint(jSec(y), y, th, ease, 0.6, pad + fold);
  };

  const openHalf = (y) => {
    if (y > vY) return 0.078 * Math.pow(smooth((y - vY) / (topY - vY)), 0.85);
    if (y < buttonLow) return 0.05 * Math.pow(clamp((buttonLow - y) / (buttonLow - hemY), 0, 1), 1.7);
    return 0;
  };
  const delta = (y) => Math.asin(clamp(openHalf(y) / (jSec(y).rx + ease), 0, 0.95));
  const shellUV = (v, u) => {
    const y = lerp(hemY, topY, v);
    const d = delta(y);
    return [y, lerp(FRONT + d, FRONT + TAU - d, u)];
  };
  const frontTheta = (y, x, s) => {
    const th = Math.acos(clamp(x / (jSec(y).rx + ease), -0.98, 0.98));
    return s > 0 ? th : Math.PI - th;
  };

  const cloth = fabric('wool', tint);
  const trim = fabric('wool', shade(tint, -0.12));
  const lining = fabric('lining', '#B8955C', THREE.BackSide);
  const facing = fabric('wool', shade(tint, 0.03), THREE.DoubleSide);
  const clothDouble = fabric('wool', tint, THREE.DoubleSide);

  const shellGeo = sweep(
    80,
    120,
    (v, u) => {
      const [y, th] = shellUV(v, u);
      return shell(y, th);
    },
    { uLen: 0.95 },
  );
  add(group, shellGeo, cloth);
  add(group, shellGeo, lining, { cast: false });

  // piped front edges and hem
  const edge = [];
  const rows = 40;
  for (let r = rows; r >= 0; r -= 1) edge.push(V(...shell(...shellUV(r / rows, 0))));
  for (let c = 1; c < 60; c += 1) edge.push(V(...shell(...shellUV(0, c / 60))));
  for (let r = 0; r <= rows; r += 1) edge.push(V(...shell(...shellUV(r / rows, 1))));
  add(group, piping(edge, 0.0028), trim, { cast: false });

  // collar wrapping the back of the neck
  const dTop = delta(topY);
  add(
    group,
    sweep(
      10,
      90,
      (v, u) => {
        const th = lerp(FRONT + dTop, FRONT + TAU - dTop, u);
        const front = gauss(angDiff(th, FRONT), 0.75);
        const base = V(...shell(topY, th));
        const neckR = lerp(0.062, 0.085, front);
        const top = V(neckR * Math.cos(th), 1.528 - 0.05 * front, 0.004 + neckR * 0.95 * Math.sin(th));
        const p = base.lerp(top, smooth(v));
        const bulge = Math.sin(v * Math.PI) * 0.012;
        p.x += Math.cos(th) * bulge;
        p.z += Math.sin(th) * bulge;
        return p.toArray();
      },
      { uLen: 0.4 },
    ),
    facing,
  );

  // notch lapels, rolled over the shell
  for (const s of [-1, 1]) {
    const geo = sweep(
      26,
      8,
      (v, u) => {
        const y = lerp(vY, topY, v);
        let w;
        if (v < 0.8) w = 0.068 * Math.pow(smooth(v / 0.8), 0.75);
        else if (v < 0.86) w = lerp(0.068, 0.026, (v - 0.8) / 0.06);
        else w = lerp(0.026, 0.05, (v - 0.86) / 0.14);
        const th = frontTheta(y, openHalf(y) + u * w, s);
        const lift = 0.0045 + 0.006 * (1 - u) ** 2 * smooth(v / 0.5);
        return onSurface(shell, y, th, lift).toArray();
      },
      { uv: 'xy' },
    );
    add(group, geo, facing);
    const P = geo.attributes.position;
    const outline = [];
    for (let r = 0; r <= 26; r += 1) {
      const i = r * 9 + 8;
      outline.push(V(P.getX(i), P.getY(i), P.getZ(i)));
    }
    add(group, piping(outline, 0.0024), trim, { cast: false });
  }

  for (const y of [buttonTop, buttonLow]) {
    if (y > hemY + 0.035) button(group, HORN(), onSurface(shell, y, FRONT, 0.005), outward(shell, y, FRONT));
  }

  // flap pockets + breast welt
  if (hemY < 0.875) {
    for (const s of [-1, 1]) {
      const flap = sweep(
        4,
        10,
        (v, u) => {
          const y = lerp(0.902, 0.936, v);
          return onSurface(shell, y, frontTheta(y, lerp(0.052, 0.138, u), s), 0.004 + 0.002 * (1 - v)).toArray();
        },
        { uv: 'xy' },
      );
      add(group, flap, clothDouble);
      const P = flap.attributes.position;
      const lip = [];
      for (let c = 0; c <= 10; c += 1) lip.push(V(P.getX(c), P.getY(c), P.getZ(c)));
      add(group, piping(lip, 0.0022), trim, { cast: false });
    }
  }
  const welt = [];
  for (let i = 0; i <= 8; i += 1) {
    const y = lerp(1.24, 1.252, i / 8);
    welt.push(onSurface(shell, y, frontTheta(y, lerp(0.06, 0.118, i / 8), 1), 0.003));
  }
  add(group, piping(welt, 0.0032), trim, { cast: false });

  // sleeves
  const sleeveEase = ease * 0.5 + 0.006;
  const wrinkle = 0.0008 + loose * 0.06;
  let cuffAnchor = null;
  for (const s of [-1, 1]) {
    const { curve, vAtY } = arm(s);
    const v0 = vAtY(1.405);
    const v1 = vAtY(cuffY);
    const radius = (v, y, th) =>
      armR(y) +
      sleeveEase +
      0.012 * gauss(y - 1.39, 0.05) +
      wrinkle *
        (gauss(y - 1.08, 0.07) + 1.6 * gauss(y - cuffY - 0.03, 0.06) * smooth((0.82 - cuffY) / 0.1)) *
        Math.sin(y * 150 + 1.7 * Math.cos(th));
    const geo = curveTube(curve, v0, v1, 48, 40, radius);
    add(group, geo, cloth);
    add(group, geo, lining, { cast: false });
    const head = curve.getPointAt(v0);
    const headR = radius(0, head.y, 0);
    ellipsoid(group, cloth, head, [headR * 1.02, headR * 0.9, headR * 1.02]);

    const ringAt = (v, extra) => {
      const { pts, normals, binormals } = frames(curve, v, v, 1);
      const p = pts[0];
      const r = radius(0, p.y, 0) + extra;
      const ring = [];
      for (let i = 0; i < 32; i += 1) {
        const th = (i / 32) * TAU;
        ring.push(
          p
            .clone()
            .add(normals[0].clone().multiplyScalar(Math.cos(th) * r))
            .add(binormals[0].clone().multiplyScalar(Math.sin(th) * r)),
        );
      }
      return { ring, p, r };
    };
    add(group, piping(ringAt(v1, 0).ring, 0.0026, true), trim, { cast: false });
    add(group, piping(ringAt(vAtY(1.38), 0.002).ring, 0.0022, true), trim, { cast: false });

    const outDir = (v, hint) => {
      const t = curve.getTangentAt(v).normalize();
      return hint.clone().sub(t.clone().multiplyScalar(hint.dot(t))).normalize();
    };
    for (let i = 0; i < 3; i += 1) {
      const v = vAtY(cuffY + 0.03 + i * 0.016);
      const { p, r } = ringAt(v, 0);
      const d = outDir(v, V(s, 0, -0.5));
      button(group, HORN(), p.clone().add(d.clone().multiplyScalar(r + 0.002)), d, 0.006);
    }

    if (s > 0) {
      const v = vAtY(cuffY + 0.05);
      const { p, r } = ringAt(v, 0);
      const d = outDir(v, V(1, 0, 0.6));
      cuffAnchor = { p: p.clone().add(d.clone().multiplyScalar(r + 0.006)), n: d };
    }
  }

  const anchors = [
    anchor(shell, 1.08, 40 * DEG),
    cuffAnchor,
    { p: V(0.212, 1.452, 0.02), n: V(0.25, 1, 0.45).normalize() },
    anchor(shell, hemY + 0.035, 58 * DEG),
  ];
  return { group, anchors };
}

/* ================================= gown =============================== */

function buildGown(e, ease, tint) {
  const { waist, skirt, hem, train, bustle } = e;
  const group = new THREE.Group();
  const hemY = Math.max(0.004, 0.12 - 0.12 * hem);
  const trainLen = lerp(0, 0.62, train) * lerp(1, 0.14, bustle);
  const pool = smooth((hem - 0.75) / 0.25);

  const gap = (y) => {
    const gW = (0.004 + (1 - waist) * 0.05) * gauss(y - 1.08, 0.09);
    const gB = (0.008 + (1 - waist) * 0.035) * smooth((y - 1.2) / 0.12);
    return 0.01 + ease * 0.35 + gW + gB;
  };
  const bodice = (y, th) => ringPoint(section(y), y, th, gap(y), 1);

  const hipSec = section(0.92);
  const g92 = gap(0.92);
  const hemRx = 0.25 + skirt * 0.3 + ease * 1.1 + pool * 0.05;
  const hemRzF = 0.21 + skirt * 0.24 + ease * 1.1 + pool * 0.05;
  const hemRzB = 0.24 + skirt * 0.3 + ease * 1.1 + pool * 0.05;
  const pleatAmp = 0.006 + 0.018 * skirt + ease * 0.25 + pool * 0.01;

  const skirtPos = (y, th) => {
    if (y >= 0.92) return ringPoint(section(y), y, th, gap(y), 0);
    const f = clamp((0.92 - y) / (0.92 - hemY), 0, 1);
    const fe = Math.pow(f, 1.22);
    const sec = {
      rx: lerp(hipSec.rx + g92, hemRx, fe),
      rzF: lerp(hipSec.rzF + g92, hemRzF, fe),
      rzB: lerp(hipSec.rzB + g92, hemRzB, fe) + trainLen * Math.pow(f, 2.3),
      cz: hipSec.cz,
    };
    const pleat =
      pleatAmp *
      Math.pow(f, 1.35) *
      (0.62 * Math.sin(16 * th + 1.3 + f * 2) + 0.38 * Math.sin(27 * th + 4.1 + f * 6));
    return ringPoint(sec, y, th, 0, 0, pleat);
  };

  const satin = fabric('satin', tint);
  const lace = fabric('lace', shade(tint, 0.05));
  const lining = fabric('lining', shade(tint, 0.1), THREE.BackSide);
  const trim = fabric('satin', shade(tint, -0.06));
  const trimDouble = fabric('satin', shade(tint, -0.06), THREE.DoubleSide);

  const skirtGeo = sweep(110, 200, (v, u) => skirtPos(lerp(hemY, 1.06, v), u * TAU), { closed: true, uLen: 2.4 });
  add(group, skirtGeo, satin);
  add(group, skirtGeo, lining, { cast: false });

  const neckline = (th) =>
    1.358 +
    0.024 * (gauss(angDiff(th, FRONT - 26 * DEG), 0.3) + gauss(angDiff(th, FRONT + 26 * DEG), 0.3)) -
    0.03 * gauss(angDiff(th, FRONT), 0.13) -
    0.012 * gauss(angDiff(th, BACK), 0.9);
  const bodiceGeo = sweep(
    32,
    200,
    (v, u) => {
      const th = u * TAU;
      return bodice(lerp(1.06, neckline(th), v), th);
    },
    { closed: true, uLen: 0.95 },
  );
  add(group, bodiceGeo, lace);
  add(group, bodiceGeo, lining, { cast: false });

  const neck = [];
  for (let i = 0; i < 120; i += 1) {
    const th = (i / 120) * TAU;
    neck.push(onSurface(bodice, neckline(th), th, 0.001));
  }
  add(group, piping(neck, 0.0035, true), trim, { cast: false });

  // princess seams
  for (const deg of [70, 110, 250, 290]) {
    const th = deg * DEG;
    const pts = [];
    for (let i = 0; i <= 10; i += 1) pts.push(onSurface(bodice, lerp(1.06, neckline(th) - 0.006, i / 10), th, 0.0015));
    add(group, piping(pts, 0.0016), trim, { cast: false });
  }

  const hemRing = [];
  for (let i = 0; i < 160; i += 1) hemRing.push(V(...skirtPos(hemY, (i / 160) * TAU)));
  add(group, piping(hemRing, 0.004, true), trim, { cast: false });

  // sash + bow at the back
  add(
    group,
    sweep(4, 160, (v, u) => onSurface(bodice, lerp(1.048, 1.09, v), u * TAU, 0.004).toArray(), {
      closed: true,
      uLen: 0.95,
    }),
    trim,
  );
  const knot = onSurface(bodice, 1.07, BACK, 0.016);
  ellipsoid(group, trimDouble, knot, [0.014, 0.017, 0.011]);
  for (const s of [-1, 1]) {
    const loop = add(group, new THREE.TorusGeometry(0.028, 0.0075, 12, 32), trimDouble);
    loop.position.copy(knot).add(V(s * 0.033, 0.004, -0.004));
    loop.scale.set(1.3, 0.75, 0.5);
    loop.rotation.z = s * 0.35;
    add(
      group,
      sweep(
        18,
        3,
        (v, u) => {
          const y = lerp(1.06, 0.8, v);
          const x = s * lerp(0.008, 0.05, v) + (u - 0.5) * 0.028;
          const rx = y >= 0.92 ? section(y).rx + gap(y) : hipSec.rx + g92;
          const th = BACK + Math.asin(clamp(x / rx, -0.9, 0.9));
          return onSurface(skirtPos, y, th, 0.009 + 0.004 * v).toArray();
        },
        { uv: 'xy' },
      ),
      trimDouble,
    );
  }

  // straps that sit on the shoulders
  const inside = (p) => {
    if (p.y > 1.52 || p.y < 0.76) return false;
    const sec = section(p.y);
    const rz = p.z > sec.cz ? sec.rzF : sec.rzB;
    return (p.x / sec.rx) ** 2 + ((p.z - sec.cz) / rz) ** 2 < 1;
  };
  for (const s of [-1, 1]) {
    const pts = [];
    const c = V(s * 0.104, 1.39, 0);
    for (let i = 0; i <= 18; i += 1) {
      const a = lerp(-0.12, Math.PI + 0.12, i / 18);
      const dir = V(0, Math.sin(a), Math.cos(a));
      let t = 0;
      while (t < 0.25 && inside(c.clone().add(dir.clone().multiplyScalar(t)))) t += 0.002;
      pts.push(c.clone().add(dir.clone().multiplyScalar(t + 0.006)));
    }
    add(group, piping(pts, 0.0075), trim);
  }

  const anchors = [
    anchor(skirtPos, hemY + 0.07, 30 * DEG, 0.012),
    anchor(bodice, 1.22, 50 * DEG),
    { p: V(0.106, 1.5, 0.012), n: V(0.1, 1, 0.45).normalize() },
    anchor(skirtPos, 0.98, 8 * DEG),
  ];
  return { group, anchors };
}

/* =============================== trousers ============================= */

function buildTrousers(e, ease, tint) {
  const group = new THREE.Group();
  const { hipPos, legs, hemY } = buildTrousersInto(group, e, ease, tint);
  const leg = legs[1];
  const anchors = [
    anchor(hipPos, 1.045, 42 * DEG, 0.012),
    anchor(leg, 0.55, 50 * DEG),
    anchor(leg, hemY + 0.03, 42 * DEG),
    anchor(hipPos, 0.93, 76 * DEG),
  ];
  return { group, anchors };
}

/* ================================ public ============================== */

export function buildGarment(id, e, ease, tint) {
  if (id === 'gown') return buildGown(e, ease, tint);
  if (id === 'trousers') return buildTrousers(e, ease, tint);
  return buildJacket(e, ease, tint);
}

/** The rest of the outfit: static, rebuilt only when the garment or fabric changes. */
export function buildExtras(id, tint) {
  const group = new THREE.Group();
  if (id === 'jacket') {
    const hsl = {};
    new THREE.Color(tint).getHSL(hsl);
    const warm = hsl.h < 0.05 || hsl.h > 0.9;
    const tieColor = hsl.l > 0.5 || warm ? '#24324A' : '#6A2C38';
    buildShirt(group, { tie: true, tieColor });
    buildTrousersInto(group, { waist: 0.86, taper: 0.62, hem: 0.62 }, 0.012, tint);
  } else if (id === 'trousers') {
    buildShirt(group, { tie: false });
  }
  return group;
}
