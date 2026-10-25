import * as THREE from "three";
import { GB, mat } from "../gfx";
import { Rng } from "../pix";
import { clothStripeTex } from "../textures";
import { heap, basket, hanging, GPPU } from "../goods";
import { groundH, blockRect } from "../world";
import { M } from "./materials.ts";
import { addSprite } from "./sprites.ts";
import { barrel, crate, sack } from "./furniture.ts";
import type { V2 } from "./registry.ts";

type Goods = "apple" | "appleG" | "pear" | "plum" | "onion" | "turnip" | "cabbage" | "egg" | "grape" | "carrot" | "bread" | "cheese" | "fish" | "jug";

/** Market stall: table with crates/baskets of goods and a striped awning. rot: facing (0 = customers on +z). */
export function stall(root: THREE.Group, x: number, z: number, goods: Goods[], stripe: [string, string], hang: string[], seed: number, facing: "n" | "s" | "e" | "w") {
  const g = new THREE.Group();
  const gb = new GB();
  const y0 = groundH(x, z);
  const w = 2.0,
    d = 0.9,
    h = 0.72;
  // local coords: x along stall, z towards customers
  gb.box(M.wood, M.wood, -w / 2, h - 0.07, -d / 2, w / 2, h, d / 2, 2);
  gb.box(M.woodV, null, -w / 2 + 0.05, 0.1, d / 2 - 0.04, w / 2 - 0.05, h - 0.07, d / 2 - 0.02, 2); // front board
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const tall = sz < 0 ? 2.15 : 1.75;
      gb.box(M.woodDark, M.woodDark, sx * (w / 2) - 0.05, -0.2, sz * (d / 2 + 0.05) - 0.05, sx * (w / 2) + 0.05, tall, sz * (d / 2 + 0.05) + 0.05, 2);
    }
  const awn = mat(clothStripeTex(stripe[0], stripe[1], seed), { alpha: true, side: THREE.DoubleSide });
  gb.quad(awn, [-w / 2 - 0.15, 1.7, d / 2 + 0.45], [w / 2 + 0.15, 1.7, d / 2 + 0.45], [w / 2 + 0.15, 2.18, -d / 2 - 0.1], [-w / 2 - 0.15, 2.18, -d / 2 - 0.1], 0.5, 0);
  gb.box(M.woodDark, null, -w / 2, 1.62, d / 2 + 0.03, w / 2, 1.68, d / 2 + 0.08, 2);
  // crates on the table; what is for sale sits in its own group, so a stall can be shut under its cloth
  const n = goods.length;
  const r = new Rng(seed);
  const wares = new THREE.Group();
  const shelf = new GB();
  goods.forEach((k, i) => {
    const cx = -w / 2 + (i + 0.5) * (w / n);
    const isBasket = k === "egg" || k === "bread" || r.next() < 0.3;
    if (!isBasket) {
      shelf.box(M.wood, M.woodDark, cx - w / n / 2 + 0.04, h, -0.3, cx + w / n / 2 - 0.04, h + 0.16, 0.3, 2);
      const s = addSprite(wares, heap(k, Math.round((w / n - 0.08) * GPPU), 22, seed * 10 + i), cx, h + 0.06, 0.12);
      void s;
    } else {
      addSprite(wares, basket(k, seed * 10 + i, 32, 26), cx, h, 0.1);
    }
  });
  if (n) wares.add(shelf.build());
  g.add(wares);
  // goods also stacked on the ground in front; a stall with no one to sell is shut under a cloth
  if (n) addSprite(wares, basket(goods[r.int(n)], seed + 99, 30, 24), -w / 2 - 0.25, 0, d / 2 + 0.15);
  const cloth = new GB();
  cloth.box(M.linen, M.linen, -w / 2 - 0.02, h - 0.3, -0.34, w / 2 + 0.02, h + 0.05, 0.34, 2);
  const cover = cloth.build();
  cover.visible = !n;
  g.add(cover);
  barrel(new GB(), 0, 0); // no-op keeps tree-shaking quiet
  // hanging goods under the awning
  hang.forEach((k, i) => addSprite(wares, hanging(k, seed + i), -w / 2 + 0.3 + i * 0.45, 1.75 - 34 / GPPU, d / 2 + 0.25));
  // crate stack behind
  const cb = new GB();
  crate(cb, w / 2 - 0.3, -d / 2 - 0.45, 0.5, 0);
  crate(cb, w / 2 - 0.3, -d / 2 - 0.45, 0.42, 0.4);
  sack(cb, -w / 2 + 0.3, -d / 2 - 0.4, 0);
  g.add(cb.build());
  g.add(gb.build());
  g.position.set(x, y0, z);
  const rot = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing];
  g.rotation.y = rot;
  root.add(g);
  const cs = Math.cos(rot),
    sn = Math.sin(rot);
  const L = (lx: number, lz: number): V2 => [x + lx * cs + lz * sn, z - lx * sn + lz * cs];
  const pa = L(-w / 2 - 0.3, -d / 2 - 0.9),
    pb = L(w / 2 + 0.6, d / 2 + 0.5);
  blockRect(Math.min(pa[0], pb[0]), Math.min(pa[1], pb[1]), Math.max(pa[0], pb[0]), Math.max(pa[1], pb[1]));
  return { seller: L(0, -d / 2 - 0.15), buyer: L(0, d / 2 + 0.8), wares, cover, group: g };
}

export type { Goods };
