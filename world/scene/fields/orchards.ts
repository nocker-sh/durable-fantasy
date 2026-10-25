import * as THREE from "three";
import { GB, colorMat, mat } from "../gfx";
import { M, fence } from "../build";
import { hash2 } from "../pix";
import { leafTex } from "../textures";
import { blockRect, groundH } from "../world";
import { type Spot, instanced } from "./instancing.ts";
import { broadleaves } from "./vegetation.ts";

export function orchard(root: THREE.Group, x0: number, z0: number, cols: number, rows: number) {
  // Otto's orchard: apple, pear and plum in rows, a fence round it, a ladder left against a tree
  const spots: Spot[] = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) spots.push({ x: x0 + 0.8 + i * 1.9, z: z0 + 0.8 + j * 1.9, s: 0.7 + hash2(i, j, 3) * 0.15, r: i * 1.7 + j });
  broadleaves(root, spots, M.leaf);
  // fruit: dots of red and yellow among the leaves
  const fruit = colorMat(0xc04a3a),
    pear = colorMat(0xc8b048);
  const fg = new THREE.SphereGeometry(0.07, 5, 4);
  instanced(
    root,
    fg,
    fruit,
    spots.filter((_, k) => k % 3 !== 2).flatMap((s) => [0, 1, 2, 3].map((k) => ({ ...s, r: s.r + k * 1.6 }))),
    (s) => [
      [s.x + Math.cos(s.r) * 0.55 * s.s, groundH(s.x, s.z) + 1.35 * s.s, s.z + Math.sin(s.r) * 0.55 * s.s],
      [0, 0, 0],
      [1, 1, 1],
    ],
  );
  instanced(
    root,
    fg,
    pear,
    spots.filter((_, k) => k % 3 === 2).flatMap((s) => [0, 1, 2].map((k) => ({ ...s, r: s.r + k * 2 }))),
    (s) => [
      [s.x + Math.cos(s.r) * 0.55 * s.s, groundH(s.x, s.z) + 1.35 * s.s, s.z + Math.sin(s.r) * 0.55 * s.s],
      [0, 0, 0],
      [1, 1, 1],
    ],
  );
  const x1 = x0 + cols * 1.9 + 0.2,
    z1 = z0 + rows * 1.9 + 0.2;
  fence(
    root,
    [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
      [x0, z0],
    ],
    [[x1, (z0 + z1) / 2]],
    0.6,
  );
}

export function vineyard(root: THREE.Group, x0: number, z0: number, rows: number, len: number) {
  // rows of hardy small grapes on posts and wire, for the brewery
  const gb = new GB();
  const vine = mat(leafTex("leaf2", 41));
  for (let j = 0; j < rows; j++) {
    const z = z0 + j * 1.3;
    for (let x = x0; x <= x0 + len; x += 1.5) {
      const y = groundH(x, z);
      gb.box(M.woodDark, null, x - 0.04, y, z - 0.04, x + 0.04, y + 1.0, z + 0.04, 2);
    }
    for (let x = x0; x < x0 + len; x += 0.5) {
      const y = groundH(x, z);
      gb.box(vine, vine, x, y + 0.45, z - 0.16, x + 0.5, y + 0.92, z + 0.16, 1);
    }
    blockRect(x0 - 0.1, z - 0.25, x0 + len + 0.1, z + 0.25);
  }
  root.add(gb.build());
}
