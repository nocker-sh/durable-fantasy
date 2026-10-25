import * as THREE from "three";
import { GB, mat } from "../gfx";
import { PixBuf, pick } from "../pix";
import { groundH, blockCircle } from "../world";
import { M } from "./materials.ts";
import { updaters } from "./registry.ts";

export function windmill(root: THREE.Group, x: number, z: number) {
  const y0 = groundH(x, z);
  const gb = new GB();
  gb.cyl(M.ashlar, null, x, z, y0 - 0.3, y0 + 4.2, 1.35, 0.95, 10, 4);
  gb.box(M.wood, null, x - 0.3, y0, z + 1.14, x + 0.3, y0 + 1.1, z + 1.3, 2);
  root.add(gb.build());
  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.25, 1.4, 10), M.thatch);
  cap.position.set(x, y0 + 4.9, z);
  cap.castShadow = true;
  root.add(cap);
  const hub = new THREE.Group();
  hub.position.set(x, y0 + 4.3, z + 1.15);
  const sailM = mat(sailTex(), { alpha: true, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Group();
    arm.rotation.z = (i * Math.PI) / 2;
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.2, 0.06), M.woodDark);
    beam.position.y = 1.6;
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.5), sailM);
    sail.position.set(0.4, 1.9, 0.02);
    beam.castShadow = sail.castShadow = true;
    arm.add(beam, sail);
    hub.add(arm);
  }
  root.add(hub);
  updaters.push((_t, dt) => {
    hub.rotation.z -= dt * 0.5;
  });
  blockCircle(x, z, 1.5);
}

function sailTex(): PixBuf {
  const b = new PixBuf(22, 80);
  b.fill((x, y) => {
    const frame = x < 2 || x > 19 || y % 10 < 2;
    if (frame) return pick("wood", 0.5, x, y);
    if ((x + y) % 7 === 0) return null;
    return pick("cLinen", 0.62 + Math.sin(x * 0.5) * 0.08, x, y);
  });
  return b;
}
