import * as THREE from "three";
import { colorMat } from "../gfx";
import { M } from "./materials.ts";

// ---------------------------------------------------------------- pigs & sheep (simple meshes)
export function pigMesh(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.7), M.pig);
  body.position.y = 0.32;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.24), M.pig);
  head.position.set(0, 0.36, 0.44);
  // eyes only: no snout (ui.md §6.4.2)
  g.add(body, head);
  for (const [x, z] of [
    [-0.14, -0.24],
    [0.14, -0.24],
    [-0.14, 0.22],
    [0.14, 0.22],
  ]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.18, 0.09), M.pig);
    l.position.set(x, 0.09, z);
    g.add(l);
  }
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), M.dark);
    e.position.set(s * 0.08, 0.42, 0.565);
    g.add(e);
  }
  g.traverse((o) => {
    o.castShadow = true;
  });
  return g;
}

export function sheepMesh(): THREE.Group {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), M.wool);
  body.scale.set(1, 0.85, 1.35);
  body.position.y = 0.45;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.26), colorMat(0x2e2830));
  head.position.set(0, 0.55, 0.48);
  g.add(body, head);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), colorMat(0xe8e0c8));
    e.position.set(s * 0.06, 0.6, 0.61);
    g.add(e);
  }
  for (const [x, z] of [
    [-0.13, -0.22],
    [0.13, -0.22],
    [-0.13, 0.22],
    [0.13, 0.22],
  ]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.26, 0.06), colorMat(0x2e2830));
    l.position.set(x, 0.13, z);
    g.add(l);
  }
  g.traverse((o) => {
    o.castShadow = true;
  });
  return g;
}
