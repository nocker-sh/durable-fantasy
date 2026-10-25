import * as THREE from "three";
import { GB } from "../gfx";
import { heap } from "../goods";
import { groundH, blockCircle } from "../world";
import type { Goods } from "./stalls.ts";
import { M } from "./materials.ts";
import { barrel, sack } from "./furniture.ts";
import { addSprite } from "./sprites.ts";

export function cart(root: THREE.Group, x: number, z: number, rot: number, load: Goods | "hay" | "barrels") {
  const g = new THREE.Group();
  const gb = new GB();
  gb.box(M.wood, M.wood, -0.6, 0.5, -0.9, 0.6, 0.62, 0.9, 2);
  for (const s of [-1, 1]) gb.box(M.woodV, M.woodDark, s * 0.6 - 0.04, 0.62, -0.9, s * 0.6 + 0.04, 0.9, 0.9, 2);
  gb.box(M.woodV, M.woodDark, -0.6, 0.62, 0.86, 0.6, 0.9, 0.9, 2);
  for (const s of [-1, 1]) gb.box(M.woodDark, M.woodDark, s * 0.25 - 0.04, 0.5, -2.0, s * 0.25 + 0.04, 0.58, -0.9, 2); // shafts
  const wheel = (s: number) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 12), M.woodDark);
    w.rotation.z = Math.PI / 2;
    w.position.set(s * 0.68, 0.48, 0.1);
    w.castShadow = true;
    g.add(w);
  };
  wheel(-1);
  wheel(1);
  if (load === "hay") {
    const hm = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M.hay);
    hm.scale.set(0.85, 0.8, 1.2);
    hm.position.y = 0.62;
    hm.castShadow = true;
    g.add(hm);
  } else if (load === "barrels") {
    barrel(gb, -0.28, -0.4, 0.55, 0.22, 0.62);
    barrel(gb, 0.28, -0.4, 0.55, 0.22, 0.62);
    barrel(gb, 0, 0.35, 0.55, 0.22, 0.62);
  } else {
    addSprite(g, heap(load, 70, 30, 5), 0, 0.6, 0.0);
    sack(gb, -0.3, 0.55, 0.62);
    sack(gb, 0.3, 0.6, 0.62);
  }
  g.add(gb.build());
  g.position.set(x, groundH(x, z) - 0.02, z);
  g.rotation.y = rot;
  root.add(g);
  blockCircle(x, z, 1.0);
  blockCircle(x - Math.sin(rot) * 1.4, z - Math.cos(rot) * 1.4, 0.4);
}

export function haystack(root: THREE.Group, x: number, z: number, s = 1) {
  const y0 = groundH(x, z);
  const m = new THREE.Mesh(new THREE.ConeGeometry(0.9 * s, 1.8 * s, 9), M.hay);
  m.position.set(x, y0 + 0.85 * s, z);
  m.castShadow = true;
  m.receiveShadow = true;
  root.add(m);
  const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6), M.woodDark);
  p.position.set(x, y0 + 1.95 * s, z);
  root.add(p);
  blockCircle(x, z, 0.9 * s);
}
