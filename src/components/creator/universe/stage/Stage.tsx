import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Environment, Lightformer, Sparkles } from "@react-three/drei";
import CameraControlsImpl from "camera-controls";
import type { AccessoryKind, BodyId, WorldId } from "@/lib/creator/universe/cast";
import {
  BONES, blendPose, clipAt, cuesBetween, sampleMove, settle,
  type FxCue, type MoveDef, type Pose, type Shot,
} from "@/lib/creator/universe/motion";
import { Effects, RibbonTrail, softTexture, type FxPool } from "./Effects";
import { Figure, type FigureHandle, type Palette } from "./Figure";
import { World, B } from "./Worlds";

export type StageApi = {
  play(move: MoveDef, then?: MoveDef[]): void;
  view(v: "front" | "side" | "back"): void;
  rotate(deg: number): void;
  zoom(dir: 1 | -1): void;
  reset(): void;
};
export type StageProps = {
  body: BodyId;
  accessories: AccessoryKind[];
  palette: Palette;
  world: WorldId;
  fxColors: { primary: string; secondary: string };
  idle: MoveDef;
  intro?: MoveDef[] | undefined;
  autoRotate: boolean;
  reduced: boolean;
  immersive: boolean;
  paused?: boolean | undefined;
  apiRef: MutableRefObject<StageApi | null>;
  onPlaying?: ((move: MoveDef | null) => void) | undefined;
  onReady?: (() => void) | undefined;
};

const HOME = { pos: new THREE.Vector3(0, 1.3, 5.4), target: new THREE.Vector3(0, 0.9, 0) };
const SHOT: Record<Exclude<Shot, "orbit">, [number, number, number, number, number, number]> = {
  hero: [0, 1.25, 4.9, 0, 0.9, 0],
  low: [0.8, 0.45, 4.1, 0, 1.05, 0],
  close: [0.6, 1.45, 3.1, 0, 1.15, 0],
  side: [4.6, 1.15, 0.9, 0, 0.9, 0],
  wide: [1.8, 2.4, 7.2, 0, 1, 0],
  top: [0.7, 4.6, 3.6, 0, 1.2, 0],
};
const D = THREE.MathUtils.degToRad;

type Runtime = {
  move: MoveDef; t: number; queue: MoveDef[]; from: Pose | null; blend: number; last: Pose | null;
  clipKey: string; figure: FigureHandle | null; rest: Map<THREE.Object3D, THREE.Quaternion>;
  now: number; lastUser: number; orbit: boolean; saved: { pos: THREE.Vector3; target: THREE.Vector3 } | null;
  shake: number; flash: number; trailUntil: number; sparkle: { until: number; at: FxCue["at"] };
  glow: { start: number; dur: number }; holo: { start: number; dur: number }; wings: { start: number; dur: number };
  emitAcc: number; prevRoot: THREE.Vector3; motion: number;
};

function Director(p: StageProps & { fxRef: MutableRefObject<FxPool | null>; contentRef: MutableRefObject<THREE.Group | null>; trail: RibbonTrail; shadow: MutableRefObject<THREE.Mesh | null>; beam: MutableRefObject<THREE.Mesh | null>; flashLight: MutableRefObject<THREE.PointLight | null>; rt: MutableRefObject<Runtime> }) {
  const controls = useRef<CameraControls>(null);
  const { gl, size } = useThree();
  // Narrow (portrait) stages pull the camera back so the full figure stays in frame.
  const fit = Math.max(1, (0.85 * size.height) / Math.max(1, size.width));
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const look = (c: CameraControls, px: number, py: number, pz: number, tx: number, ty: number, tz: number, smooth: boolean) => {
    const f = fitRef.current;
    c.setLookAt(tx + (px - tx) * f, ty + (py - ty) * f, tz + (pz - tz) * f, tx, ty, tz, smooth);
  };
  const v1 = useMemo(() => new THREE.Vector3(), []);
  const v2 = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const e = useMemo(() => new THREE.Euler(), []);
  const rt = p.rt;
  const props = useRef(p);
  props.current = p;

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    look(c, HOME.pos.x, HOME.pos.y, HOME.pos.z, HOME.target.x, HOME.target.y, HOME.target.z, false);
    const mark = () => { rt.current.lastUser = rt.current.now; rt.current.orbit = false; };
    c.addEventListener("controlstart", mark);
    return () => c.removeEventListener("controlstart", mark);
  }, [rt]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    c.mouseButtons.right = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.middle = CameraControlsImpl.ACTION.NONE;
    c.mouseButtons.wheel = p.immersive ? CameraControlsImpl.ACTION.DOLLY : CameraControlsImpl.ACTION.NONE;
    c.touches.one = CameraControlsImpl.ACTION.TOUCH_ROTATE;
    c.touches.two = p.immersive ? CameraControlsImpl.ACTION.TOUCH_DOLLY : CameraControlsImpl.ACTION.NONE;
    c.touches.three = CameraControlsImpl.ACTION.NONE;
    // Inline: let vertical swipes scroll the page; horizontal drags rotate. Full screen: every gesture is for the viewer.
    const el = gl.domElement;
    const id = requestAnimationFrame(() => { el.style.touchAction = p.immersive ? "none" : "pan-y"; });
    return () => cancelAnimationFrame(id);
  }, [p.immersive, gl]);

  useEffect(() => {
    props.current.apiRef.current = {
      play(move, then = []) {
        const r = rt.current;
        if (r.last) r.from = settle(r.last);
        r.blend = 0; r.move = move; r.t = 0; r.queue = then; r.clipKey = "";
        props.current.onPlaying?.(move);
        if (move.shots?.length && !props.current.reduced && controls.current && !r.saved) {
          const pos = controls.current.getPosition(new THREE.Vector3());
          const target = controls.current.getTarget(new THREE.Vector3());
          r.saved = { pos, target };
        }
      },
      view(v) { controls.current?.rotateTo(v === "front" ? 0 : v === "side" ? Math.PI / 2 : Math.PI, D(78), !props.current.reduced); rt.current.lastUser = rt.current.now; },
      rotate(deg) { controls.current?.rotate(D(deg), 0, !props.current.reduced); rt.current.lastUser = rt.current.now; },
      zoom(dir) { controls.current?.dolly(dir * 0.9, !props.current.reduced); rt.current.lastUser = rt.current.now; },
      reset() {
        rt.current.saved = null; rt.current.orbit = false; rt.current.lastUser = rt.current.now;
        if (controls.current) look(controls.current, HOME.pos.x, HOME.pos.y, HOME.pos.z, HOME.target.x, HOME.target.y, HOME.target.z, !props.current.reduced);
      },
    };
    return () => { props.current.apiRef.current = null; };
  }, [rt]);

  const fire = (cue: FxCue) => {
    const r = rt.current; const s = props.current; const fx = p.fxRef.current; const f = r.figure;
    if (!f) return;
    const base = f.group.getWorldPosition(v1).clone();
    const at = cue.at === "head" ? base.clone().setY(base.y + 1.5) : cue.at === "hand" ? f.tipA.getWorldPosition(v2).clone() : cue.at === "body" ? base.clone().setY(base.y + 0.9) : base.clone().setY(0.06);
    const c = [s.fxColors.primary, s.fxColors.secondary, s.palette.glow];
    switch (cue.fx) {
      case "burst": fx?.spawn({ count: 60, origin: at, speed: 2.4, colors: [...c, "#ffffff"], life: 1.1, gravity: 0.5 }); break;
      case "ring": fx?.ring(at, s.fxColors.primary, cue.at !== "feet", cue.at === "feet" ? 1 : 0.7); break;
      case "dust": fx?.spawn({ count: 40, origin: at, speed: 1.7, flat: true, up: 0.5, gravity: 1.4, colors: ["#c9d1e6", "#9aa3ba", "#e6ebf5"], life: 0.9, drag: 2.5 }); break;
      case "confetti": fx?.spawn({ count: 90, origin: base.clone().setY(2.6), speed: 1.8, gravity: 1.3, colors: [B.lime, B.sky, B.gold, B.ice, s.fxColors.primary], life: 2.2, drag: 1.6, spread: 0.6 }); break;
      case "smoke": fx?.smoke(base, "#9fb0d8"); break;
      case "streaks": fx?.streaks(base, s.fxColors.secondary); break;
      case "trail": r.trailUntil = r.now + (cue.dur ?? 1); break;
      case "sparkle": r.sparkle = { until: r.now + (cue.dur ?? 1), at: cue.at }; break;
      case "glow": r.glow = { start: r.now, dur: cue.dur ?? 1.5 }; break;
      case "holo": r.holo = { start: r.now, dur: cue.dur ?? 1 }; break;
      case "wings": r.wings = { start: r.now, dur: cue.dur ?? 2 }; break;
      case "shake": if (!s.reduced) r.shake = Math.max(r.shake, 0.07 * (cue.power ?? 1)); break;
      case "flash": r.flash = 1; break;
    }
  };
  const shot = (name: Shot) => {
    const c = controls.current; const r = rt.current;
    if (!c || props.current.reduced) return;
    r.orbit = name === "orbit";
    if (name === "orbit") return;
    const sh = SHOT[name];
    look(c, sh[0], sh[1], sh[2], sh[3], sh[4], sh[5], true);
  };

  useFrame((_, delta) => {
    const s = props.current; const r = rt.current; const fx = p.fxRef.current;
    if (s.paused) return;
    const dt = Math.min(delta, 0.05);
    r.now += dt;
    const f = r.figure;
    if (f) {
      const prevT = r.t;
      r.t += dt;
      if (!r.move.loop && r.t >= r.move.duration) {
        if (r.last) r.from = settle(r.last);
        r.blend = 0; r.clipKey = "";
        const hadShots = Boolean(r.move.shots?.length);
        r.move = r.queue.shift() ?? s.idle;
        r.t = 0;
        s.onPlaying?.(r.move.loop ? null : r.move);
        if (hadShots && !r.move.shots?.length && r.saved && controls.current) {
          const { pos, target } = r.saved;
          controls.current.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true);
          r.saved = null; r.orbit = false;
        }
      }
      const m = r.move;
      let pose = sampleMove(m, r.t, s.reduced);
      if (r.from) {
        r.blend += dt;
        const k = r.blend / 0.35;
        pose = blendPose(r.from, pose, k);
        if (k >= 1) r.from = null;
      }
      r.last = pose;
      // Clip crossfade.
      const c = clipAt(m, r.t);
      const key = `${m.id}:${c.index}`;
      if (key !== r.clipKey) {
        r.clipKey = key;
        const next = f.actions.get(c.clip) ?? f.actions.get("idle") ?? null;
        if (next && next !== f.current) {
          next.reset().setEffectiveTimeScale(c.speed).setEffectiveWeight(1).fadeIn(0.25).play();
          f.current?.fadeOut(0.25);
          f.current = next;
        } else next?.setEffectiveTimeScale(c.speed);
      }
      // Reset to bind pose so overrides never accumulate on bones a clip leaves alone.
      r.rest.forEach((rest, bone) => bone.quaternion.copy(rest));
      f.mixer.update(dt);
      for (const name of BONES) {
        const b = pose.bones[name]; const bone = f.bones[name];
        if (!b || !bone || b.w <= 0.001) continue;
        q.setFromEuler(e.set(D(b.x), D(b.y), D(b.z), "XYZ"));
        bone.quaternion.slerp(q, Math.min(1, b.w));
      }
      const R = pose.root;
      f.group.position.set(R.x, R.y, R.z);
      f.group.rotation.set(D(R.rx), D(R.ry), D(R.rz), "YXZ");
      f.group.scale.setScalar(Math.max(0.001, R.s));
      if (f.prop) f.prop.rotation.x = D(pose.spin);
      // Cues.
      const from = prevT === 0 && r.t === dt ? -1 : prevT;
      if (!m.loop) {
        cuesBetween(m.fx, from, r.t).forEach(fire);
        if (!s.reduced) cuesBetween(m.shots, from, r.t).forEach((sc) => shot(sc.shot));
      }
      // Continuous effects.
      const speed = r.prevRoot.distanceTo(f.group.position) / Math.max(dt, 1e-3);
      r.prevRoot.copy(f.group.position);
      r.motion += (Math.min(1, speed / 3) - r.motion) * Math.min(1, dt * 6);
      if (f.cape) f.cape.rotation.x = 0.12 + r.motion * 0.7 + Math.sin(r.now * 2.2) * 0.04;
      const wingEnv = r.now < r.wings.start + r.wings.dur ? Math.min(1, (r.now - r.wings.start) / 0.5, (r.wings.start + r.wings.dur - r.now) / 0.5) : 0;
      if (f.wings) {
        f.wings.visible = f.hasWings || wingEnv > 0.01;
        f.wings.scale.setScalar(f.hasWings ? 1 + wingEnv * 0.45 : Math.max(0.001, wingEnv * 1.3));
        const flap = s.reduced ? 0 : 0.18 + wingEnv * 0.2;
        f.wings.children.forEach((w) => { w.rotation.y = Math.sign(w.scale.x || 1) * (0.35 + Math.sin(r.now * (2 + wingEnv * 4)) * flap); });
      }
      if (f.orbiters && !s.reduced) f.orbiters.rotation.y += dt * 0.8;
      const glowU = r.now < r.glow.start + r.glow.dur ? Math.sin(((r.now - r.glow.start) / r.glow.dur) * Math.PI) : 0;
      const holoOn = r.now < r.holo.start + r.holo.dur;
      for (const mat of f.materials) {
        mat.emissive.set(holoOn ? B.sky : s.fxColors.primary);
        mat.emissiveIntensity = holoOn ? 0.6 + Math.random() * 0.5 : glowU * 0.55;
        const op = holoOn ? 0.45 + Math.random() * 0.35 : 1;
        if ((op < 1) !== mat.transparent) { mat.transparent = op < 1; mat.needsUpdate = true; }
        mat.opacity = op;
      }
      if (p.beam.current) {
        p.beam.current.visible = holoOn;
        if (holoOn) { const u = (r.now - r.holo.start) / r.holo.dur; (p.beam.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(u * Math.PI) * 0.35; p.beam.current.position.x = f.group.position.x; p.beam.current.position.z = f.group.position.z; }
      }
      r.emitAcc += dt;
      if (r.emitAcc > 0.06 && fx) {
        r.emitAcc = 0;
        const base = f.group.position;
        if (r.now < r.sparkle.until) {
          const at = r.sparkle.at === "head" ? 1.55 : r.sparkle.at === "hand" ? -1 : 0.9;
          const o = at < 0 ? f.tipA.getWorldPosition(v2).clone() : v1.set(base.x, base.y + at, base.z).clone();
          fx.spawn({ count: 3, origin: o, speed: 0.6, spread: 0.9, colors: [s.fxColors.primary, "#ffffff", s.palette.glow], life: 0.8, up: 0.25 });
        }
        if (holoOn) fx.spawn({ count: 3, origin: v1.set(base.x, base.y + Math.random() * 1.7, base.z).clone(), speed: 0.3, spread: 0.8, colors: [B.sky, B.lime], life: 0.6, up: 0.6 });
        if (s.accessories.includes("aura") && !s.reduced) fx.spawn({ count: 1, origin: v1.set(base.x, base.y + 0.2 + Math.random() * 1.2, base.z).clone(), speed: 0.15, spread: 1, colors: [s.palette.glow, s.fxColors.primary], life: 1.4, up: 0.45 });
      }
      // Weapon or hand trail.
      const trailOn = r.now < r.trailUntil && !s.reduced;
      p.trail.color = s.fxColors.primary;
      p.trail.push(f.tipA.getWorldPosition(v1), f.tipB.getWorldPosition(v2), trailOn ? 0.85 : 0);
      if (p.shadow.current) {
        const h = f.group.position.y;
        p.shadow.current.position.set(f.group.position.x, 0.015, f.group.position.z);
        p.shadow.current.scale.setScalar(Math.max(0.4, 1 - h * 0.35) * Math.max(0.1, R.s));
        (p.shadow.current.material as THREE.MeshBasicMaterial).opacity = 0.45 * Math.max(0.2, 1 - h * 0.6);
      }
    }
    // Flash, shake and camera.
    r.flash = Math.max(0, r.flash - dt * 3);
    if (p.flashLight.current) p.flashLight.current.intensity = r.flash * 40;
    if (p.contentRef.current) {
      r.shake = Math.max(0, r.shake - dt * 0.25);
      const k = r.shake;
      p.contentRef.current.position.set((Math.random() - 0.5) * k, (Math.random() - 0.5) * k, 0);
    }
    const c = controls.current;
    if (c && !s.reduced) {
      if (r.orbit) c.rotate(dt * 0.7, 0, false);
      else if (s.autoRotate && r.now - r.lastUser > 2.5 && !r.saved) c.rotate(dt * 0.28, 0, false);
    }
    fx?.step(dt);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={2}
      maxDistance={11}
      minPolarAngle={D(25)}
      maxPolarAngle={D(92)}
      smoothTime={0.35}
      draggingSmoothTime={0.12}
      truckSpeed={0}
    />
  );
}

function Scene(props: StageProps) {
  const fxRef = useRef<FxPool | null>(null);
  const contentRef = useRef<THREE.Group | null>(null);
  const shadow = useRef<THREE.Mesh | null>(null);
  const beam = useRef<THREE.Mesh | null>(null);
  const flashLight = useRef<THREE.PointLight | null>(null);
  const trail = useMemo(() => new RibbonTrail(26), []);
  const shadowTex = useMemo(() => softTexture(), []);
  const rt = useRef<Runtime>({
    move: props.intro?.[0] ?? props.idle, t: 0, queue: props.intro?.slice(1) ?? [], from: null, blend: 0, last: null,
    clipKey: "", figure: null, rest: new Map(), now: 0, lastUser: -10, orbit: false, saved: null, shake: 0, flash: 0,
    trailUntil: 0, sparkle: { until: 0, at: "body" }, glow: { start: 0, dur: 0 }, holo: { start: 0, dur: 0 }, wings: { start: 0, dur: 0 },
    emitAcc: 0, prevRoot: new THREE.Vector3(), motion: 0,
  });
  // Idle changes when the character changes.
  useEffect(() => { if (rt.current.move.loop) { rt.current.move = props.idle; rt.current.t = 0; rt.current.clipKey = ""; } }, [props.idle]);
  const onReady = (h: FigureHandle | null) => {
    rt.current.figure = h;
    rt.current.rest = new Map();
    if (h) {
      for (const b of BONES) { const bone = h.bones[b]; if (bone) rt.current.rest.set(bone, bone.quaternion.clone()); }
      rt.current.clipKey = "";
      props.onReady?.();
      if (!rt.current.move.loop) props.onPlaying?.(rt.current.move);
    }
  };
  const fxBudget = props.reduced ? 0.35 : 1;
  return (
    <>
      <World id={props.world} fx={props.reduced ? 0.3 : 1} />
      <hemisphereLight args={[B.ice, B.midnight, 0.85]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-3, 3, -4]} intensity={1.4} color={B.gold} />
      <directionalLight position={[3, 2, -4]} intensity={0.8} color={B.lime} />
      <pointLight ref={flashLight} position={[0, 1.6, 1.6]} intensity={0} color="#ffffff" />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={1.1} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={2} color={B.cobaltGlow} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        <Lightformer intensity={2} color={B.gold} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>
      <group ref={contentRef}>
        <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={shadowTex} color="#050c2a" transparent opacity={0.45} depthWrite={false} />
        </mesh>
        <Suspense fallback={null}>
          <Figure body={props.body} accessories={props.accessories} palette={props.palette} onReady={onReady} />
        </Suspense>
        <mesh ref={beam} position={[0, 1.6, 0]} visible={false}>
          <cylinderGeometry args={[0.55, 0.55, 3.2, 32, 1, true]} />
          <meshBasicMaterial color={B.skyLight} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
        <LimeHalo reduced={props.reduced} />
        <primitive object={trail.mesh} />
        <Effects ref={fxRef} budget={fxBudget} />
        {props.accessories.includes("aura") && !props.reduced && (
          <Sparkles count={24} scale={[1.6, 2, 1.6]} position={[0, 1, 0]} size={2.5} speed={0.6} color={props.palette.glow} />
        )}
      </group>
      <Director {...props} fxRef={fxRef} contentRef={contentRef} trail={trail} shadow={shadow} beam={beam} flashLight={flashLight} rt={rt} />
    </>
  );
}

/** Signature neon dot halo: a slow ring of lime-to-gold dots around the pedestal, shared by every world. */
function LimeHalo({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const N = 48;
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new THREE.Object3D(); const c = new THREE.Color(); const lime = new THREE.Color(B.lime); const gold = new THREE.Color(B.gold);
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2; const k = 0.5 + 0.5 * Math.sin(a * 2);
      o.position.set(Math.cos(a) * 1.7, 0.03, Math.sin(a) * 1.7);
      o.scale.setScalar(0.6 + k * 0.6);
      o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.copy(gold).lerp(lime, k));
    }
    m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, []);
  useFrame((_, dt) => { if (ref.current && !reduced) ref.current.rotation.y += Math.min(dt, 0.05) * 0.12; });
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, N]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <Sparkles count={reduced ? 8 : 22} scale={[4.2, 2.6, 4.2]} position={[0, 1.3, 0]} size={1.6} speed={reduced ? 0 : 0.2} color={B.lime} opacity={0.55} />
    </group>
  );
}

export default function Stage(props: StageProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={props.paused ? "never" : "always"}
      camera={{ fov: 35, near: 0.1, far: 100, position: [HOME.pos.x, HOME.pos.y, HOME.pos.z] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      <Scene {...props} />
    </Canvas>
  );
}
