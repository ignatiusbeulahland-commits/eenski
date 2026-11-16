import { useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";


/** Soft round sprite shared by every particle system. */
export function softTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export type SpawnOpts = {
  count: number; origin: THREE.Vector3; speed: number; spread?: number; up?: number;
  gravity?: number; life: number; size?: number; colors: string[]; drag?: number; flat?: boolean;
};
export type FxPool = {
  spawn(o: SpawnOpts): void;
  ring(origin: THREE.Vector3, color: string, vertical?: boolean, size?: number): void;
  smoke(origin: THREE.Vector3, color: string): void;
  streaks(origin: THREE.Vector3, color: string): void;
  step(dt: number): void;
};

const N = 360;
/** All transient effects live here and are advanced by the stage's single stepper. */
export const Effects = forwardRef<FxPool, { budget: number }>(function Effects({ budget }, ref) {
  const tex = useMemo(() => softTexture(), []);
  const pts = useRef<THREE.Points>(null);
  const data = useMemo(() => ({
    pos: new Float32Array(N * 3), col: new Float32Array(N * 3), vel: new Float32Array(N * 3),
    life: new Float32Array(N), max: new Float32Array(N), grav: new Float32Array(N), drag: new Float32Array(N), cursor: 0,
    base: new Float32Array(N * 3),
  }), []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("color", new THREE.BufferAttribute(data.col, 3).setUsage(THREE.DynamicDrawUsage));
    return g;
  }, [data]);
  const rings = useRef<THREE.Mesh[]>([]);
  const ringState = useRef<{ t: number; max: number; size: number }[]>(Array.from({ length: 5 }, () => ({ t: 1, max: 1, size: 1 })));
  const smokes = useRef<THREE.Sprite[]>([]);
  const smokeState = useRef<{ t: number; v: THREE.Vector3 }[]>(Array.from({ length: 12 }, () => ({ t: 1, v: new THREE.Vector3() })));
  const streaks = useRef<THREE.Mesh[]>([]);
  const streakState = useRef<{ t: number; v: number }[]>(Array.from({ length: 10 }, () => ({ t: 1, v: 0 })));
  const ringCursor = useRef(0);
  const color = useMemo(() => new THREE.Color(), []);

  const api = useMemo<FxPool>(() => ({
    spawn(o) {
      const count = Math.max(1, Math.round(o.count * budget));
      for (let k = 0; k < count; k++) {
        const i = data.cursor;
        data.cursor = (data.cursor + 1) % N;
        const a = Math.random() * Math.PI * 2;
        const e = o.flat ? (Math.random() - 0.5) * 0.4 : Math.acos(2 * Math.random() - 1) - Math.PI / 2;
        const sp = o.speed * (0.5 + Math.random() * 0.7);
        const s = o.spread ?? 0.1;
        data.pos[i * 3] = o.origin.x + (Math.random() - 0.5) * s;
        data.pos[i * 3 + 1] = o.origin.y + (Math.random() - 0.5) * s;
        data.pos[i * 3 + 2] = o.origin.z + (Math.random() - 0.5) * s;
        data.vel[i * 3] = Math.cos(a) * Math.cos(e) * sp;
        data.vel[i * 3 + 1] = Math.sin(e) * sp + (o.up ?? 0);
        data.vel[i * 3 + 2] = Math.sin(a) * Math.cos(e) * sp;
        data.life[i] = o.life * (0.7 + Math.random() * 0.5);
        data.max[i] = data.life[i]!;
        data.grav[i] = o.gravity ?? 0;
        data.drag[i] = o.drag ?? 1.2;
        color.set(o.colors[k % o.colors.length]!);
        data.base[i * 3] = color.r; data.base[i * 3 + 1] = color.g; data.base[i * 3 + 2] = color.b;
      }
    },
    ring(origin, c, vertical = false, size = 1) {
      const i = ringCursor.current++ % rings.current.length;
      const m = rings.current[i];
      if (!m) return;
      m.position.copy(origin);
      m.rotation.set(vertical ? 0 : -Math.PI / 2, 0, 0);
      (m.material as THREE.MeshBasicMaterial).color.set(c);
      ringState.current[i] = { t: 0, max: 0.9, size };
    },
    smoke(origin, c) {
      smokes.current.forEach((s, i) => {
        s.position.set(origin.x + (Math.random() - 0.5) * 0.5, origin.y + Math.random() * 1.2, origin.z + (Math.random() - 0.5) * 0.5);
        (s.material as THREE.SpriteMaterial).color.set(c);
        smokeState.current[i] = { t: 0, v: new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 0.8) };
      });
    },
    streaks(origin, c) {
      streaks.current.forEach((m, i) => {
        m.position.set(origin.x - 3 - Math.random() * 2, origin.y + (Math.random() - 0.3) * 1.8, origin.z + (Math.random() - 0.5) * 1.6);
        (m.material as THREE.MeshBasicMaterial).color.set(c);
        streakState.current[i] = { t: 0, v: 9 + Math.random() * 6 };
      });
    },
    step(dt) {
      for (let i = 0; i < N; i++) {
        if (data.life[i]! <= 0) { data.col[i * 3] = data.col[i * 3 + 1] = data.col[i * 3 + 2] = 0; continue; }
        data.life[i]! -= dt;
        const k = Math.exp(-data.drag[i]! * dt);
        data.vel[i * 3]! *= k; data.vel[i * 3 + 2]! *= k;
        data.vel[i * 3 + 1] = data.vel[i * 3 + 1]! * k - data.grav[i]! * dt;
        data.pos[i * 3]! += data.vel[i * 3]! * dt;
        data.pos[i * 3 + 1] = Math.max(0.02, data.pos[i * 3 + 1]! + data.vel[i * 3 + 1]! * dt);
        data.pos[i * 3 + 2]! += data.vel[i * 3 + 2]! * dt;
        const f = Math.max(0, data.life[i]! / data.max[i]!);
        const fade = Math.min(1, f * 2.2);
        data.col[i * 3] = data.base[i * 3]! * fade; data.col[i * 3 + 1] = data.base[i * 3 + 1]! * fade; data.col[i * 3 + 2] = data.base[i * 3 + 2]! * fade;
      }
      geo.attributes["position"]!.needsUpdate = true;
      geo.attributes["color"]!.needsUpdate = true;
      rings.current.forEach((m, i) => {
        const s = ringState.current[i]!;
        s.t += dt;
        const u = Math.min(1, s.t / s.max);
        m.visible = u < 1;
        m.scale.setScalar((0.2 + u * 2.4) * s.size);
        (m.material as THREE.MeshBasicMaterial).opacity = (1 - u) * 0.85;
      });
      smokes.current.forEach((sp, i) => {
        const s = smokeState.current[i]!;
        s.t += dt;
        const u = Math.min(1, s.t / 1.6);
        sp.visible = u < 1;
        sp.position.addScaledVector(s.v, dt);
        sp.scale.setScalar(0.6 + u * 1.4);
        (sp.material as THREE.SpriteMaterial).opacity = Math.sin(u * Math.PI) * 0.7;
      });
      streaks.current.forEach((m, i) => {
        const s = streakState.current[i]!;
        s.t += dt;
        m.visible = s.t < 0.8;
        m.position.x += s.v * dt;
        (m.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - s.t / 0.8) * 0.9;
      });
    },
  }), [budget, color, data, geo]);
  useImperativeHandle(ref, () => api, [api]);

  return (
    <group>
      <points ref={pts} geometry={geo} frustumCulled={false}>
        <pointsMaterial size={0.09} map={tex} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      {ringState.current.map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) rings.current[i] = m; }} visible={false}>
          <ringGeometry args={[0.42, 0.5, 64]} />
          <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {smokeState.current.map((_, i) => (
        <sprite key={i} ref={(m) => { if (m) smokes.current[i] = m; }} visible={false}>
          <spriteMaterial map={tex} transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
      {streakState.current.map((_, i) => (
        <mesh key={i} ref={(m) => { if (m) streaks.current[i] = m; }} visible={false}>
          <boxGeometry args={[1.4, 0.015, 0.015]} />
          <meshBasicMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
});

/** Ribbon trail that follows two points on a weapon or hand. */
export class RibbonTrail {
  mesh: THREE.Mesh;
  private pos: Float32Array;
  private alpha: Float32Array;
  private count = 0;
  constructor(private samples = 24, color = "#ffffff") {
    const g = new THREE.BufferGeometry();
    this.pos = new Float32Array(samples * 2 * 3);
    this.alpha = new Float32Array(samples * 2);
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("alpha", new THREE.BufferAttribute(this.alpha, 1).setUsage(THREE.DynamicDrawUsage));
    const idx: number[] = [];
    for (let i = 0; i < samples - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx);
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 } },
      vertexShader: "attribute float alpha; varying float vA; void main(){ vA = alpha; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform vec3 uColor; uniform float uOpacity; varying float vA; void main(){ gl_FragColor = vec4(uColor, vA * uOpacity); }",
    });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
  }
  set color(c: string) { (this.mesh.material as THREE.ShaderMaterial).uniforms["uColor"]!.value.set(c); }
  push(a: THREE.Vector3, b: THREE.Vector3, opacity: number) {
    this.pos.copyWithin(6, 0, (this.samples - 1) * 6);
    a.toArray(this.pos, 0); b.toArray(this.pos, 3);
    this.count = Math.min(this.samples, this.count + 1);
    for (let i = 0; i < this.samples; i++) { const f = i < this.count ? 1 - i / this.samples : 0; this.alpha[i * 2] = f; this.alpha[i * 2 + 1] = f * 0.25; }
    const g = this.mesh.geometry;
    g.attributes["position"]!.needsUpdate = true;
    g.attributes["alpha"]!.needsUpdate = true;
    (this.mesh.material as THREE.ShaderMaterial).uniforms["uOpacity"]!.value = opacity;
  }
}
