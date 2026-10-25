import * as THREE from "three";
import { toTex, pixSprite } from "../gfx";
import type { PixBuf } from "../pix";
import { GPPU } from "../goods";
import { groundH } from "../world";

export function addSprite(root: THREE.Object3D, b: PixBuf, x: number, y: number, z: number, ppu = GPPU) {
  const s = pixSprite(b, ppu);
  s.position.set(x, y, z);
  root.add(s);
  return s;
}

export function flatDecal(root: THREE.Object3D, b: PixBuf, x: number, z: number, scale = GPPU, rot = 0) {
  const m = new THREE.MeshLambertMaterial({ map: toTex(b, false), alphaTest: 0.5, transparent: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(b.w / scale, b.h / scale), m);
  p.rotation.x = -Math.PI / 2;
  p.rotation.z = rot;
  p.position.set(x, groundH(x, z) + 0.02, z);
  p.receiveShadow = true;
  root.add(p);
}
