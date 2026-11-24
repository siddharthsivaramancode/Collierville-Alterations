import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  MODEL,
  buildExtras,
  buildGarment,
  buildMannequin,
  disposeCaches,
  disposeObject,
  effective,
  TINTS,
} from '../lib/garment3d';

const START_DIR = new THREE.Vector3(0.55, 0.14, 1).normalize();

function shadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(26,28,32,0.34)');
  g.addColorStop(0.55, 'rgba(26,28,32,0.12)');
  g.addColorStop(1, 'rgba(26,28,32,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Software rasterisers (SwiftShader, llvmpipe) speckle shared edges under MSAA and run slowly. */
function isSoftwareRenderer() {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(String(name));
  } catch {
    return false;
  }
}

/* Studio backdrop rendered inside the scene so the canvas stays fully opaque. */
function backdropTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.translate(200, 190);
  ctx.scale(1, 1.25);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 330);
  g.addColorStop(0, '#FFFFFF');
  g.addColorStop(0.42, '#F8F4ED');
  g.addColorStop(1, '#E6DCCD');
  ctx.fillStyle = g;
  ctx.fillRect(-200, -190, 400, 500);
  ctx.restore();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Fit3D({
  garmentId,
  garmentLabel,
  values,
  t,
  tintId,
  fitted,
  pins,
  activePin,
  onPin,
  onError,
}) {
  const mountRef = useRef(null);
  const pinRefs = useRef([]);
  const live = useRef({});
  const api = useRef({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    live.current = { garmentId, values, t, tintId, fitted };
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let renderer;
    const software = isSoftwareRenderer();
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !software });
    } catch (error) {
      onError?.(error);
      return undefined;
    }

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const small = window.innerWidth < 640;
    renderer.setPixelRatio(software ? 1 : Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2));
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);

    /* Studio lighting: soft image-based light plus a shadow-casting key and a cool rim. */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room, 0.04).texture;
    scene.environment = envMap;
    const backdrop = backdropTexture();
    scene.background = backdrop;
    scene.environmentIntensity = 0.36;

    scene.add(new THREE.HemisphereLight('#ffffff', '#d9cdb9', 0.25));
    const key = new THREE.DirectionalLight('#fff1df', 3.1);
    key.position.set(1.7, 3.4, 2.4);
    key.target.position.set(0, 0.85, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    key.shadow.camera.left = -1.1;
    key.shadow.camera.right = 1.1;
    key.shadow.camera.top = 1.25;
    key.shadow.camera.bottom = -1.1;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 8;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.018;
    scene.add(key, key.target);
    const rim = new THREE.DirectionalLight('#dbe5ff', 1.5);
    rim.position.set(-2.6, 2.4, -2.8);
    scene.add(rim);
    const fill = new THREE.DirectionalLight('#ffffff', 0.35);
    fill.position.set(-2.4, 1.0, 2.6);
    scene.add(fill);

    const mannequin = buildMannequin();
    scene.add(mannequin);

    /* Display plinth with a brass edge */
    const stage = new THREE.Group();
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.6, 0.05, 128),
      new THREE.MeshPhysicalMaterial({ color: '#EFE9DF', roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
    );
    plinth.position.y = -0.025;
    plinth.receiveShadow = true;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.586, 0.0055, 12, 160),
      new THREE.MeshStandardMaterial({ color: '#B88E4A', roughness: 0.28, metalness: 1 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.001;
    stage.add(plinth, ring);
    scene.add(stage);

    const shadowTex = shadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.052;
    scene.add(shadow);

    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.85;
    controls.minPolarAngle = 0.85;
    controls.maxPolarAngle = 1.75;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 1.1;
    canvas.style.touchAction = 'pan-y';

    const startCam = MODEL[live.current.garmentId].camera;
    controls.target.set(0, startCam.y, 0);
    camera.position.copy(START_DIR).multiplyScalar(startCam.d).add(controls.target);

    let idleTimer = 0;
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      window.clearTimeout(idleTimer);
      setTouched(true);
    });
    controls.addEventListener('end', () => {
      window.clearTimeout(idleTimer);
      if (!reduceMotion) {
        idleTimer = window.setTimeout(() => {
          controls.autoRotate = true;
        }, 6000);
      }
    });

    let width = 1;
    let height = 1;
    const resize = () => {
      width = Math.max(1, mount.clientWidth);
      height = Math.max(1, mount.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let garment = null;
    let signature = '';
    let extras = null;
    let extrasSig = '';
    const rebuild = () => {
      const s = live.current;
      const { vals, ease } = effective(s.garmentId, s.values, s.t);
      const tint = TINTS.find((x) => x.id === s.tintId)?.color || TINTS[0].color;
      const nextExtras = `${s.garmentId}|${tint}`;
      if (nextExtras !== extrasSig) {
        extrasSig = nextExtras;
        if (extras) {
          scene.remove(extras);
          disposeObject(extras);
        }
        extras = buildExtras(s.garmentId, tint);
        scene.add(extras);
      }
      const next = `${s.garmentId}|${tint}|${ease.toFixed(3)}|${Object.values(vals)
        .map((v) => v.toFixed(3))
        .join(',')}`;
      if (next === signature) return;
      signature = next;
      if (garment) {
        scene.remove(garment.group);
        disposeObject(garment.group);
      }
      garment = buildGarment(s.garmentId, vals, ease, tint);
      scene.add(garment.group);
    };

    const tmp = new THREE.Vector3();
    const toCam = new THREE.Vector3();
    const offset = new THREE.Vector3();
    let desiredY = startCam.y;
    let desiredD = startCam.d;
    let dist = startCam.d;

    const frame = () => {
      rebuild();

      const cam = MODEL[live.current.garmentId].camera;
      desiredY = cam.y;
      desiredD = cam.d * Math.max(1, 0.86 / camera.aspect);
      const k = reduceMotion ? 1 : 0.08;
      controls.target.y += (desiredY - controls.target.y) * k;
      dist += (desiredD - dist) * k;
      offset.copy(camera.position).sub(controls.target).setLength(dist);
      camera.position.copy(controls.target).add(offset);

      controls.update();
      renderer.render(scene, camera);

      const showPins = live.current.fitted && garment;
      for (let i = 0; i < pinRefs.current.length; i += 1) {
        const el = pinRefs.current[i];
        const anchor = garment?.anchors[i];
        if (!el) continue;
        if (!showPins || !anchor) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          continue;
        }
        tmp.copy(anchor.p).project(camera);
        toCam.copy(camera.position).sub(anchor.p).normalize();
        const facing = anchor.n.dot(toCam) > -0.05;
        const x = (tmp.x * 0.5 + 0.5) * width;
        const y = (-tmp.y * 0.5 + 0.5) * height;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
        el.style.opacity = facing ? '1' : '0.18';
        el.style.pointerEvents = facing ? 'auto' : 'none';
      }
    };

    let running = false;
    const start = () => {
      if (running) return;
      running = true;
      renderer.setAnimationLoop(frame);
    };
    const stop = () => {
      running = false;
      renderer.setAnimationLoop(null);
    };

    let inView = true;
    const sync = () => (inView && !document.hidden ? start() : stop());
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.02 },
    );
    observer.observe(mount);
    document.addEventListener('visibilitychange', sync);
    sync();

    api.current.reset = () => {
      offset.copy(START_DIR).setLength(dist);
      camera.position.copy(controls.target).add(offset);
      controls.autoRotate = !reduceMotion;
    };

    return () => {
      stop();
      window.clearTimeout(idleTimer);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      controls.dispose();
      if (garment) disposeObject(garment.group);
      if (extras) disposeObject(extras);
      disposeObject(mannequin);
      disposeCaches();
      plinth.geometry.dispose();
      plinth.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      envMap.dispose();
      backdrop.dispose();
      pmrem.dispose();
      room.traverse((node) => {
        if (node.geometry) node.geometry.dispose();
        if (node.material) node.material.dispose();
      });
      shadow.geometry.dispose();
      shadow.material.dispose();
      shadowTex.dispose();
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mx-auto mt-1 aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[3px] bg-[radial-gradient(ellipse_at_50%_38%,#FFFFFF_0%,#F7F2EA_45%,#E9E0D2_100%)]">
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        role="img"
        aria-label={`Interactive 3D ${garmentLabel} on a dress form. Drag to rotate. ${
          fitted
            ? 'Showing the custom tailored fit with numbered alteration pins.'
            : 'Showing an off-the-rack fit.'
        }`}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pins.map((item, index) => (
          <button
            key={item.title}
            ref={(node) => {
              pinRefs.current[index] = node;
            }}
            type="button"
            tabIndex={fitted ? 0 : -1}
            aria-hidden={!fitted}
            aria-pressed={activePin === index}
            aria-label={`Pin ${index + 1}: ${item.title}`}
            onClick={() => onPin(index)}
            style={{ opacity: 0, pointerEvents: 'none' }}
            className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-linen bg-brass text-[11px] font-semibold text-linen shadow-pin transition-[opacity,box-shadow] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              activePin === index ? 'ring-[6px] ring-brass/35' : 'ring-4 ring-brass/15'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => api.current.reset?.()}
        className="absolute right-2 top-2 rounded-full border border-line bg-white/85 px-3 py-1.5 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-muted backdrop-blur transition-colors hover:border-brass/50 hover:text-ink"
      >
        Reset view
      </button>

      <p
        className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-muted/80 backdrop-blur transition-opacity duration-500 ${
          touched ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        Drag to rotate
      </p>
    </div>
  );
}
