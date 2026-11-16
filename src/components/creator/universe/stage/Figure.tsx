import { useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { createPortal } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { AccessoryKind, BodyId } from "@/lib/creator/universe/cast";
import { BONES, type BoneName } from "@/lib/creator/universe/motion";
import femaleB from "@/assets/dashboard/models/female-b.glb.asset.json";
import femaleC from "@/assets/dashboard/models/female-c.glb.asset.json";
import femaleD from "@/assets/dashboard/models/female-d.glb.asset.json";
import femaleE from "@/assets/dashboard/models/female-e.glb.asset.json";
import femaleF from "@/assets/dashboard/models/female-f.glb.asset.json";
import maleA from "@/assets/dashboard/models/male-a.glb.asset.json";
import maleD from "@/assets/dashboard/models/male-d.glb.asset.json";
import maleE from "@/assets/dashboard/models/male-e.glb.asset.json";
import maleF from "@/assets/dashboard/models/male-f.glb.asset.json";
import maleG from "@/assets/dashboard/models/male-g.glb.asset.json";
import knight from "@/assets/dashboard/models/knight.glb.asset.json";
import raider from "@/assets/dashboard/models/raider.glb.asset.json";
import robot from "@/assets/dashboard/models/robot.glb.asset.json";
import soldier from "@/assets/dashboard/models/soldier.glb.asset.json";
import alien from "@/assets/dashboard/models/alien.glb.asset.json";
import swordModel from "@/assets/dashboard/models/weapon-sword.glb.asset.json";
import spearModel from "@/assets/dashboard/models/weapon-spear.glb.asset.json";
import shieldModel from "@/assets/dashboard/models/shield-round.glb.asset.json";

export const BODY_URL: Record<BodyId, string> = {
  "female-b": femaleB.url, "female-c": femaleC.url, "female-d": femaleD.url, "female-e": femaleE.url, "female-f": femaleF.url,
  "male-a": maleA.url, "male-d": maleD.url, "male-e": maleE.url, "male-f": maleF.url, "male-g": maleG.url,
  knight: knight.url, raider: raider.url, robot: robot.url, soldier: soldier.url, alien: alien.url,
};
export const FIGURE_HEIGHT = 1.7;

export type FigureHandle = {
  group: THREE.Group;
  bones: Partial<Record<BoneName, THREE.Object3D>>;
  mixer: THREE.AnimationMixer;
  actions: Map<string, THREE.AnimationAction>;
  current: THREE.AnimationAction | null;
  materials: THREE.MeshStandardMaterial[];
  prop: THREE.Object3D | null;
  tipA: THREE.Object3D;
  tipB: THREE.Object3D;
  cape: THREE.Object3D | null;
  wings: THREE.Object3D | null;
  orbiters: THREE.Object3D | null;
  hasWings: boolean;
};
export type Palette = { primary: string; metal: string; glow: string };

function Mats({ palette }: { palette: Palette }) {
  return useMemo(() => ({
    primary: new THREE.MeshStandardMaterial({ color: palette.primary, roughness: 0.45, metalness: 0.25 }),
    metal: new THREE.MeshStandardMaterial({ color: palette.metal, roughness: 0.32, metalness: 0.75 }),
    glow: new THREE.MeshStandardMaterial({ color: palette.glow, emissive: palette.glow, emissiveIntensity: 1.6, roughness: 0.4, transparent: true, opacity: 0.92 }),
    dark: new THREE.MeshStandardMaterial({ color: "#0A1F55", roughness: 0.5, metalness: 0.3 }),
    wing: new THREE.MeshStandardMaterial({ color: "#F4F7FC", emissive: palette.glow, emissiveIntensity: 0.45, roughness: 0.5, transparent: true, opacity: 0.9, side: THREE.DoubleSide }),
  }), [palette.primary, palette.metal, palette.glow]);
}

const wingGeo = (() => {
  const w = new THREE.Shape();
  w.moveTo(0, 0);
  w.bezierCurveTo(0.12, 0.16, 0.34, 0.3, 0.56, 0.26);
  w.lineTo(0.5, 0.16); w.lineTo(0.6, 0.1); w.lineTo(0.48, 0.04); w.lineTo(0.55, -0.04);
  w.lineTo(0.4, -0.05); w.lineTo(0.44, -0.14); w.lineTo(0.26, -0.1);
  w.bezierCurveTo(0.16, -0.08, 0.06, -0.06, 0, -0.03);
  return new THREE.ShapeGeometry(w, 8);
})();

function Spikes({ count, r, h, mat }: { count: number; r: number; h: number; mat: THREE.Material }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.sin(a) * r, h / 2, Math.cos(a) * r]} material={mat}>
            <coneGeometry args={[0.03, h, 4]} />
          </mesh>
        );
      })}
    </>
  );
}

/** One rigged CC0 body plus Enski-made accessories mounted on its bones. */
export function Figure({ body, accessories, palette, onReady }: {
  body: BodyId; accessories: AccessoryKind[]; palette: Palette; onReady: (h: FigureHandle | null) => void;
}) {
  const gltf = useGLTF(BODY_URL[body]);
  const sword = useGLTF(swordModel.url);
  const spear = useGLTF(spearModel.url);
  const shield = useGLTF(shieldModel.url);
  const m = Mats({ palette });
  const scene = useMemo(() => {
    const s = cloneSkinned(gltf.scene) as THREE.Group;
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
        mesh.frustumCulled = false;
      }
    });
    return s;
  }, [gltf.scene]);
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const h = Math.max(0.1, box.max.y - box.min.y);
    return FIGURE_HEIGHT / h;
  }, [scene]);
  const [bones, setBones] = useState<Partial<Record<BoneName, THREE.Object3D>>>({});
  const tipA = useMemo(() => new THREE.Object3D(), []);
  const tipB = useMemo(() => new THREE.Object3D(), []);
  const [root, setRoot] = useState<THREE.Group | null>(null);
  const [propRef, setPropRef] = useState<THREE.Group | null>(null);
  const [capeRef, setCapeRef] = useState<THREE.Group | null>(null);
  const [wingRef, setWingRef] = useState<THREE.Group | null>(null);
  const [orbitRef, setOrbitRef] = useState<THREE.Group | null>(null);
  const has = (k: AccessoryKind) => accessories.includes(k);
  const weapon = has("spear") ? "spear" : has("sword") ? "sword" : has("sceptre") ? "sceptre" : null;
  const crown = has("grand-crown") ? "grand" : has("crown") ? "crown" : null;

  useLayoutEffect(() => {
    const found: Partial<Record<BoneName, THREE.Object3D>> = {};
    for (const b of BONES) { const o = scene.getObjectByName(b); if (o) found[b] = o; }
    setBones(found);
  }, [scene]);

  useLayoutEffect(() => {
    if (!root || !bones.head) return;
    const mixer = new THREE.AnimationMixer(scene);
    const actions = new Map<string, THREE.AnimationAction>();
    for (const clip of gltf.animations) actions.set(clip.name, mixer.clipAction(clip));
    const materials: THREE.MeshStandardMaterial[] = [];
    scene.traverse((o) => { const mesh = o as THREE.Mesh; if (mesh.isMesh) materials.push(mesh.material as THREE.MeshStandardMaterial); });
    const idle = actions.get("idle") ?? null;
    idle?.play();
    onReady({ group: root, bones, mixer, actions, current: idle, materials, prop: propRef, tipA, tipB, cape: capeRef, wings: wingRef, orbiters: orbitRef, hasWings: has("wings") });
    return () => { mixer.stopAllAction(); onReady(null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, bones, scene, gltf.animations, propRef, capeRef, wingRef, orbitRef, accessories.join(",")]);

  const swordObj = useMemo(() => sword.scene.clone(), [sword.scene]);
  const sword2 = useMemo(() => sword.scene.clone(), [sword.scene]);
  const spearObj = useMemo(() => spear.scene.clone(), [spear.scene]);
  const shieldObj = useMemo(() => shield.scene.clone(), [shield.scene]);

  return (
    <group ref={setRoot}>
      <group scale={scale}>
        <primitive object={scene} />
        {bones.head && createPortal(
          <group>
            {crown && (
              <group position={[0, 0.43, -0.02]}>
                <mesh material={m.metal}><cylinderGeometry args={[0.17, 0.16, 0.06, 24, 1, true]} /></mesh>
                <group position={[0, 0.03, 0]}><Spikes count={crown === "grand" ? 8 : 5} r={0.16} h={crown === "grand" ? 0.16 : 0.09} mat={m.metal} /></group>
                <mesh position={[0, 0.0, 0.17]} material={m.glow}><octahedronGeometry args={[0.03]} /></mesh>
                {crown === "grand" && <mesh position={[0, 0.2, 0]} material={m.glow}><torusGeometry args={[0.2, 0.012, 8, 48]} /></mesh>}
              </group>
            )}
            {has("halo") && (
              <mesh position={[0, 0.54, -0.04]} rotation={[Math.PI / 2 - 0.15, 0, 0]} material={m.glow}><torusGeometry args={[0.17, 0.018, 10, 48]} /></mesh>
            )}
            {has("circlet") && (
              <group position={[0, 0.34, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={m.metal}><torusGeometry args={[0.24, 0.012, 8, 48]} /></mesh>
                <mesh position={[0, 0.03, 0.24]} material={m.glow}><octahedronGeometry args={[0.04]} /></mesh>
              </group>
            )}
            {has("mask") && (
              <group position={[0, 0.115, 0.215]}>
                <mesh material={m.dark}><boxGeometry args={[0.44, 0.13, 0.03]} /></mesh>
                <mesh position={[-0.09, 0.005, 0.017]} material={m.glow}><boxGeometry args={[0.1, 0.025, 0.01]} /></mesh>
                <mesh position={[0.09, 0.005, 0.017]} material={m.glow}><boxGeometry args={[0.1, 0.025, 0.01]} /></mesh>
              </group>
            )}
            {has("hood") && (
              <group>
                {/* A wrapped cowl at the neck: reads as a hooded scarf without hiding the face. */}
                <mesh position={[0, 0.0, 0.0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.05, 0.9, 1]} material={m.primary}><torusGeometry args={[0.19, 0.045, 10, 32]} /></mesh>
                <mesh position={[0, -0.02, -0.16]} rotation={[0.25, 0, 0]} material={m.primary}><boxGeometry args={[0.22, 0.2, 0.05]} /></mesh>
              </group>
            )}
            {has("visor") && (
              <mesh position={[0, 0.12, 0.22]} material={m.glow}><boxGeometry args={[0.48, 0.09, 0.03]} /></mesh>
            )}
            {has("crest") && (
              <group position={[0, 0.5, -0.02]}>
                {[0, 1, 2, 3].map((i) => (
                  <mesh key={i} position={[0, 0.03 + i * 0.012, 0.09 - i * 0.07]} rotation={[0.4 - i * 0.25, 0, 0]} material={i % 2 ? m.metal : m.primary}><boxGeometry args={[0.05, 0.12, 0.07]} /></mesh>
                ))}
              </group>
            )}
          </group>,
          bones.head,
        )}
        {bones.torso && createPortal(
          <group>
            {has("cape") && (
              <group ref={setCapeRef} position={[0, 0.16, -0.16]}>
                <mesh position={[0, -0.17, -0.02]} material={m.primary}><boxGeometry args={[0.34, 0.36, 0.02]} /></mesh>
                <mesh position={[0, -0.0, 0.0]} material={m.metal}><boxGeometry args={[0.36, 0.03, 0.04]} /></mesh>
              </group>
            )}
            <group ref={setWingRef} position={[0, 0.14, -0.17]} visible={has("wings")}>
              {[-1, 1].map((side) => (
                <group key={side} rotation={[0, side * 0.35, 0]} scale={[side, 1, 1]}>
                  <mesh geometry={wingGeo} material={m.wing} position={[0.04, 0, 0]} />
                  <mesh geometry={wingGeo} material={m.glow} position={[0.06, 0.01, -0.005]} scale={0.72} />
                </group>
              ))}
            </group>
          </group>,
          bones.torso,
        )}
        {bones["arm-right"] && createPortal(
          <group position={[-0.25, -0.005, 0.01]}>
            <group ref={setPropRef}>
              {weapon === "sword" && <primitive object={swordObj} rotation={[Math.PI / 2, 0, 0]} />}
              {weapon === "spear" && <primitive object={spearObj} position={[0, 0, -0.22]} rotation={[Math.PI / 2, 0, 0]} />}
              {weapon === "sceptre" && (
                <group>
                  <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} material={m.metal}><cylinderGeometry args={[0.014, 0.018, 0.36, 10]} /></mesh>
                  <mesh position={[0, 0, 0.32]} material={m.glow}><icosahedronGeometry args={[0.045, 0]} /></mesh>
                  <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]} material={m.metal}><torusGeometry args={[0.05, 0.008, 6, 20]} /></mesh>
                </group>
              )}
              <primitive object={tipA} position={[0, 0, weapon === "spear" ? 0.36 : weapon ? 0.32 : 0.05]} />
              <primitive object={tipB} position={[0, 0, weapon ? 0.08 : 0]} />
            </group>
          </group>,
          bones["arm-right"],
        )}
        {bones["arm-left"] && (has("shield") || has("twin-blade")) && createPortal(
          <group position={[0.25, -0.005, 0.01]}>
            {has("shield") && <primitive object={shieldObj} position={[0.02, 0, 0.06]} rotation={[0, Math.PI / 2, 0]} scale={0.8} />}
            {has("twin-blade") && <primitive object={sword2} rotation={[Math.PI / 2, 0, 0]} />}
          </group>,
          bones["arm-left"],
        )}
      </group>
      {(has("ribbons") || has("drones") || has("stars")) && (
        <group ref={setOrbitRef}>
          {(has("drones") ? [0, 1] : [0, 1, 2, 3, 4]).map((i, _, arr) => {
            const a = (i / arr.length) * Math.PI * 2;
            return has("drones") ? (
              <group key={i} position={[Math.cos(a) * 0.75, 1.55, Math.sin(a) * 0.75]}>
                <mesh material={m.dark}><boxGeometry args={[0.14, 0.09, 0.14]} /></mesh>
                <mesh position={[0, 0, 0.072]} material={m.glow}><boxGeometry args={[0.06, 0.03, 0.01]} /></mesh>
              </group>
            ) : has("stars") ? (
              <mesh key={i} position={[Math.cos(a) * 0.75, 0.5 + i * 0.28, Math.sin(a) * 0.75]} material={m.glow}>
                <octahedronGeometry args={[0.06]} />
              </mesh>
            ) : (
              <mesh key={i} position={[Math.cos(a) * 0.7, 0.5 + i * 0.25, Math.sin(a) * 0.7]} rotation={[0, -a, 0.6]} material={i % 2 ? m.glow : m.primary}>
                <torusGeometry args={[0.18, 0.012, 6, 32, Math.PI * 0.9]} />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
}
