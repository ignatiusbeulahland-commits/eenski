import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles, Stars } from "@react-three/drei";
import type { WorldId } from "@/lib/creator/universe/cast";

// Brand palette for 3D (mirrors the CSS tokens; three.js needs literal colours).
export const B = {
  cobalt: "#1A42A6", cobaltGlow: "#2656C4", cobaltPress: "#112D74", sky: "#3D8EF0", skyLight: "#7CC2F7",
  ice: "#E6F0FE", midnight: "#0A1F55", lime: "#C2F24A", gold: "#E4C77A", silver: "#D3D9EA", soft: "#F4F7FC",
};

function Backdrop({ top, bottom, glow }: { top: string; bottom: string; glow?: string }) {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { uTop: { value: new THREE.Color(top) }, uBottom: { value: new THREE.Color(bottom) }, uGlow: { value: new THREE.Color(glow ?? top) } },
    vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow; varying vec3 vP;
      void main(){ float h = clamp(vP.y*0.5+0.5,0.0,1.0); vec3 c = mix(uBottom,uTop,smoothstep(0.3,0.85,h));
      float g = pow(max(0.0, dot(vP, normalize(vec3(0.45,0.25,-0.85)))), 6.0); c += uGlow*g*0.55; gl_FragColor = vec4(c,1.0); }`,
  }), [top, bottom, glow]);
  return <mesh material={mat} scale={40}><sphereGeometry args={[1, 32, 16]} /></mesh>;
}

function tileTexture(a: string, b: string, line: string, n = 8) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const s = 256 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = line; g.lineWidth = 2;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 256); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(256, i * s); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.anisotropy = 4;
  return t;
}

function Disc({ r = 3.2, color, map, rough = 0.6, metal = 0.1, y = 0 }: { r?: number; color: string; map?: THREE.Texture; rough?: number; metal?: number; y?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <circleGeometry args={[r, 64]} />
      <meshStandardMaterial color={color} map={map ?? null} roughness={rough} metalness={metal} />
    </mesh>
  );
}
function GlowRing({ r, color, y = 0.01, w = 0.04 }: { r: number; color: string; y?: number; w?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <ringGeometry args={[r, r + w, 96]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
    </mesh>
  );
}

function Studio({ fx }: { fx: number }) {
  return (
    <>
      <color attach="background" args={[B.midnight]} />
      <fog attach="fog" args={[B.midnight, 8, 20]} />
      <Backdrop top={B.cobaltPress} bottom={B.midnight} glow={B.cobaltGlow} />
      <Disc r={7} color={B.midnight} rough={0.3} metal={0.6} y={-0.24} />
      <Disc r={1.6} color={B.cobaltPress} rough={0.2} metal={0.7} y={-0.001} />
      <mesh position={[0, -0.12, 0]}><cylinderGeometry args={[1.6, 1.75, 0.24, 64]} /><meshStandardMaterial color={B.midnight} metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.62, 1.68, 96]} /><meshStandardMaterial color={B.gold} metalness={1} roughness={0.25} /></mesh>
      <GlowRing r={1.25} color={B.lime} w={0.018} />
      <mesh position={[0, 2.3, -3.6]}><torusGeometry args={[2.3, 0.04, 8, 96, Math.PI]} /><meshStandardMaterial color={B.gold} metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0, 2.3, -3.65]}><torusGeometry args={[2.0, 0.012, 6, 96, Math.PI]} /><meshBasicMaterial color={B.lime} toneMapped={false} /></mesh>
      <Sparkles count={Math.round(36 * fx)} scale={[7, 4, 7]} position={[0, 2, 0]} size={2} speed={0.25} color={B.gold} opacity={0.75} />
      <spotLight position={[2.5, 6, 3]} angle={0.5} penumbra={0.8} intensity={55} color="#fff2cf" />
    </>
  );
}

function Palace({ fx }: { fx: number }) {
  const floor = useMemo(() => tileTexture("#123282", "#0A1F55", "#C9AE62"), []);
  return (
    <>
      <color attach="background" args={[B.cobaltPress]} />
      <fog attach="fog" args={[B.cobaltPress, 7, 18]} />
      <Backdrop top={B.cobalt} bottom={B.cobaltPress} glow={B.gold} />
      <Disc r={6} color="#aab3cf" map={floor} rough={0.3} metal={0.3} />
      <GlowRing r={1.2} color={B.gold} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI * 0.15 + (i / 7) * Math.PI * 0.7 + Math.PI;
        const x = Math.cos(a) * 4.2, z = Math.sin(a) * 4.2;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 2.2, 0]}><cylinderGeometry args={[0.28, 0.32, 4.4, 16]} /><meshStandardMaterial color="#A9B4D3" roughness={0.4} metalness={0.3} /></mesh>
            <mesh position={[0, 4.45, 0]}><boxGeometry args={[0.8, 0.18, 0.8]} /><meshStandardMaterial color={B.gold} metalness={0.9} roughness={0.25} /></mesh>
            <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.8, 0.2, 0.8]} /><meshStandardMaterial color={B.gold} metalness={0.9} roughness={0.25} /></mesh>
          </group>
        );
      })}
      <mesh position={[0, 3.5, -5.5]}><torusGeometry args={[2.4, 0.12, 12, 48, Math.PI]} /><meshStandardMaterial color={B.gold} metalness={0.9} roughness={0.2} /></mesh>
      <spotLight position={[0, 7, 1.5]} angle={0.42} penumbra={0.7} intensity={65} color="#fff2cf" />
      <Sparkles count={Math.round(70 * fx)} scale={[8, 5, 8]} position={[0, 2.4, 0]} size={3} speed={0.3} color={B.gold} />
    </>
  );
}

function Battlefield({ fx }: { fx: number }) {
  const rocks = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 + 0.3; const r = 3.4 + (i % 3) * 0.9;
    return { p: [Math.cos(a) * r, 0.2, Math.sin(a) * r - 0.6] as [number, number, number], s: 0.35 + (i % 4) * 0.18 };
  }), []);
  return (
    <>
      <color attach="background" args={["#0d1a42"]} />
      <fog attach="fog" args={["#1a2550", 5, 16]} />
      <Backdrop top="#0A1F55" bottom="#3a2f3a" glow="#ffb45c" />
      <Disc r={8} color="#22263a" rough={0.95} />
      <GlowRing r={1.1} color="#ffb45c" w={0.02} />
      {rocks.map((r, i) => (
        <mesh key={i} position={r.p} scale={r.s} rotation={[i, i * 2, 0]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#353a52" roughness={0.9} flatShading /></mesh>
      ))}
      {[-2.6, 2.8].map((x, i) => (
        <group key={i} position={[x, 0, -3.2]} rotation={[0, 0, i ? -0.25 : 0.2]}>
          <mesh position={[0, 0.9, 0]}><boxGeometry args={[0.06, 1.8, 0.04]} /><meshStandardMaterial color={B.silver} metalness={0.9} roughness={0.3} /></mesh>
        </group>
      ))}
      <directionalLight position={[-4, 3, -4]} intensity={4} color="#ffb45c" />
      <Sparkles count={Math.round(80 * fx)} scale={[9, 4, 9]} position={[0, 1.6, 0]} size={2.6} speed={0.8} color="#ffb45c" />
      <Sparkles count={Math.round(24 * fx)} scale={[10, 2, 10]} position={[0, 0.6, -1]} size={18} speed={0.15} color="#8c93ad" opacity={0.18} noise={2} />
    </>
  );
}

function Neon({ fx }: { fx: number }) {
  const windows = useMemo(() => {
    const c = document.createElement("canvas"); c.width = 64; c.height = 128; const g = c.getContext("2d")!;
    g.fillStyle = "#08173f"; g.fillRect(0, 0, 64, 128);
    for (let y = 6; y < 128; y += 10) for (let x = 4; x < 64; x += 10) { if ((x * 7 + y * 3) % 5 < 2) { g.fillStyle = (x + y) % 3 ? "#2656C4" : "#C2F24A"; g.fillRect(x, y, 5, 4); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
  }, []);
  const lines = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (lines.current) lines.current.children.forEach((c, i) => { c.position.x += dt * (1.2 + i * 0.3) * fx; if (c.position.x > 7) c.position.x = -7; }); });
  return (
    <>
      <color attach="background" args={["#050f2e"]} />
      <fog attach="fog" args={["#050f2e", 6, 18]} />
      <Backdrop top="#050f2e" bottom={B.midnight} glow={B.cobaltGlow} />
      <Disc r={8} color="#0b1640" rough={0.25} metal={0.6} />
      <GlowRing r={1.15} color={B.lime} w={0.025} />
      <GlowRing r={1.45} color={B.gold} w={0.012} />
      {Array.from({ length: 10 }, (_, i) => {
        const x = -7 + i * 1.55, h = 2 + ((i * 37) % 5) * 0.9;
        return <mesh key={i} position={[x, h / 2, -6 - (i % 3)]}><boxGeometry args={[1.2, h, 1]} /><meshStandardMaterial map={windows} emissive="#ffffff" emissiveMap={windows} emissiveIntensity={0.9} /></mesh>;
      })}
      <mesh position={[0, 2.4, -4]} rotation={[0, 0, 0]}><torusGeometry args={[2.2, 0.03, 8, 64]} /><meshBasicMaterial color={B.cobaltGlow} toneMapped={false} /></mesh>
      <group ref={lines}>
        {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-7 + i * 3.5, 0.6 + i * 0.7, -3.4]}><boxGeometry args={[1.6, 0.02, 0.02]} /><meshBasicMaterial color={i % 2 ? B.lime : B.cobaltGlow} toneMapped={false} /></mesh>)}
      </group>
      <pointLight position={[-2.5, 2, 1.5]} intensity={8} color={B.cobaltGlow} />
      <pointLight position={[2.5, 1.5, 1]} intensity={5} color={B.lime} />
      <Sparkles count={Math.round(30 * fx)} scale={[8, 4, 6]} position={[0, 2, -1]} size={2} speed={0.4} color={B.lime} />
    </>
  );
}

function Citadel({ fx }: { fx: number }) {
  return (
    <>
      <color attach="background" args={[B.midnight]} />
      <fog attach="fog" args={[B.cobaltPress, 8, 22]} />
      <Backdrop top={B.midnight} bottom={B.cobaltPress} glow={B.gold} />
      <Disc r={9} color="#1b2a63" rough={0.9} />
      <Disc r={1.4} color="#2b3a78" rough={0.5} metal={0.3} y={0.005} />
      <GlowRing r={1.4} color={B.gold} w={0.02} y={0.012} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = Math.PI + 0.25 + (i / 6) * (Math.PI - 0.5); const r = 4.6;
        return <mesh key={i} position={[Math.cos(a) * r, 1.2, Math.sin(a) * r]} rotation={[0, -a, 0.05 * (i % 2 ? 1 : -1)]}><boxGeometry args={[0.6, 2.4 + (i % 2) * 0.6, 0.45]} /><meshStandardMaterial color="#3a4778" roughness={0.9} flatShading /></mesh>;
      })}
      {[-1.8, 1.8].map((x, i) => (
        <group key={i} position={[x, 0, -2.8]}>
          <mesh position={[0, 1.4, 0]}><cylinderGeometry args={[0.03, 0.03, 2.8, 8]} /><meshStandardMaterial color={B.gold} metalness={0.8} roughness={0.3} /></mesh>
          <mesh position={[0.32, 2.2, 0]}><boxGeometry args={[0.6, 0.9, 0.02]} /><meshStandardMaterial color={B.cobalt} /></mesh>
          <mesh position={[0.32, 2.25, 0.012]}><circleGeometry args={[0.13, 20]} /><meshBasicMaterial color={B.lime} /></mesh>
        </group>
      ))}
      <directionalLight position={[3, 6, 2]} intensity={3} color="#fff2cf" />
      <mesh position={[2.5, 4, -3]} rotation={[0, 0, 0.5]}><coneGeometry args={[1.4, 8, 24, 1, true]} /><meshBasicMaterial color="#fff6dc" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} /></mesh>
      <Sparkles count={Math.round(50 * fx)} scale={[8, 4, 8]} position={[0, 2, 0]} size={2.4} speed={0.2} color="#fff2cf" />
    </>
  );
}

function Arena({ fx }: { fx: number }) {
  const grid = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, uniforms: { uTime: { value: 0 }, uA: { value: new THREE.Color(B.cobaltGlow) }, uB: { value: new THREE.Color(B.lime) } },
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: `uniform float uTime; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
      void main(){ vec2 p = (vUv-0.5)*24.0; p.y += uTime*0.6; vec2 g = abs(fract(p)-0.5); float l = smoothstep(0.47,0.5,max(g.x,g.y));
      float d = length(vUv-0.5)*2.0; float fade = 1.0-smoothstep(0.2,1.0,d);
      float pulse = smoothstep(0.02,0.0,abs(fract(d*2.0-uTime*0.25)-0.5)-0.47);
      vec3 c = mix(uA,uB,pulse*0.6); gl_FragColor = vec4(c*(l*0.7+pulse*0.4), (l*0.55+pulse*0.35)*fade); }`,
  }), []);
  const panels = useRef<THREE.Group>(null);
  useFrame((s, dt) => {
    grid.uniforms["uTime"]!.value = s.clock.elapsedTime * fx;
    if (panels.current) panels.current.rotation.y += dt * 0.1 * fx;
  });
  return (
    <>
      <color attach="background" args={["#071648"]} />
      <fog attach="fog" args={["#071648", 7, 18]} />
      <Backdrop top={B.cobaltPress} bottom="#071648" glow={B.cobaltGlow} />
      <Disc r={9} color="#0a1b55" rough={0.4} metal={0.5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} material={grid}><planeGeometry args={[18, 18]} /></mesh>
      <group ref={panels}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2; return (
            <group key={i} position={[Math.cos(a) * 3.6, 1.8 + (i % 2) * 0.6, Math.sin(a) * 3.6]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh><planeGeometry args={[1.3, 0.8]} /><meshBasicMaterial color={B.cobaltGlow} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} /></mesh>
              <mesh position={[-0.35, 0.18, 0.01]}><planeGeometry args={[0.4, 0.06]} /><meshBasicMaterial color={B.lime} toneMapped={false} /></mesh>
              <mesh position={[0, -0.1, 0.01]}><planeGeometry args={[1.05, 0.03]} /><meshBasicMaterial color={B.gold} toneMapped={false} /></mesh>
            </group>
          );
        })}
      </group>
      <pointLight position={[0, 3.5, 2]} intensity={10} color={B.cobaltGlow} />
      <Sparkles count={Math.round(30 * fx)} scale={[7, 4, 7]} position={[0, 2, 0]} size={2} speed={0.5} color={B.lime} />
    </>
  );
}

function Cosmos({ fx }: { fx: number }) {
  const plats = useRef<THREE.Group>(null);
  useFrame((s) => { plats.current?.children.forEach((c, i) => { c.position.y = c.userData["y"] + Math.sin(s.clock.elapsedTime * 0.6 * fx + i) * 0.15; }); });
  return (
    <>
      <color attach="background" args={["#050c2a"]} />
      <Backdrop top="#050c2a" bottom={B.cobaltPress} glow={B.cobaltGlow} />
      <Stars radius={30} depth={20} count={Math.round(1400 * Math.max(0.4, fx))} factor={3} fade speed={0.6 * fx} />
      <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[1.5, 1.1, 0.3, 48]} /><meshStandardMaterial color={B.cobaltPress} roughness={0.25} metalness={0.6} emissive={B.cobaltGlow} emissiveIntensity={0.25} /></mesh>
      <GlowRing r={1.5} color={B.gold} w={0.025} />
      <group ref={plats}>
        {[[-3, 1.2, -2.5, 0.6], [3.2, 2.2, -3, 0.45], [-2.2, 3.2, -4.5, 0.4], [2.4, 0.5, -1.6, 0.35]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x!, y!, z!]} userData={{ y }}><cylinderGeometry args={[r!, r! * 0.7, 0.14, 24]} /><meshStandardMaterial color={B.silver} metalness={0.5} roughness={0.3} emissive={B.cobaltGlow} emissiveIntensity={0.2} /></mesh>
        ))}
      </group>
      <pointLight position={[1.5, 3, 2]} intensity={10} color={B.cobaltGlow} />
      <Sparkles count={Math.round(80 * fx)} scale={[9, 6, 9]} position={[0, 2.5, 0]} size={3} speed={0.2} color={B.gold} />
    </>
  );
}

function Legend({ fx }: { fx: number }) {
  const halo = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (halo.current) halo.current.rotation.z += dt * 0.15 * fx; });
  return (
    <>
      <color attach="background" args={[B.cobaltPress]} />
      <Backdrop top={B.cobalt} bottom={B.midnight} glow={B.gold} />
      <Disc r={6} color={B.midnight} rough={0.2} metal={0.8} />
      <GlowRing r={1.2} color={B.gold} w={0.05} />
      <GlowRing r={1.6} color={B.lime} w={0.012} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2; return <mesh key={i} position={[Math.cos(a) * 4.4, 2.6, Math.sin(a) * 4.4]}><boxGeometry args={[0.35, 5.2, 0.35]} /><meshStandardMaterial color={B.gold} metalness={1} roughness={0.2} /></mesh>;
      })}
      <mesh ref={halo} position={[0, 2.4, -3.5]}><torusGeometry args={[2.6, 0.05, 8, 96]} /><meshBasicMaterial color={B.gold} toneMapped={false} /></mesh>
      <spotLight position={[0, 7, 2]} angle={0.45} penumbra={0.6} intensity={90} color="#fff2cf" />
      <Sparkles count={Math.round(90 * fx)} scale={[8, 6, 8]} position={[0, 2.5, 0]} size={3.2} speed={0.3} color={B.gold} />
    </>
  );
}

export function World({ id, fx }: { id: WorldId; fx: number }) {
  switch (id) {
    case "palace": return <Palace fx={fx} />;
    case "battlefield": return <Battlefield fx={fx} />;
    case "neon": return <Neon fx={fx} />;
    case "citadel": return <Citadel fx={fx} />;
    case "arena": return <Arena fx={fx} />;
    case "cosmos": return <Cosmos fx={fx} />;
    case "legend": return <Legend fx={fx} />;
    default: return <Studio fx={fx} />;
  }
}
