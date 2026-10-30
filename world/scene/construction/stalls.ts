import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { getTexturedMaterial as mat } from "../../../lib/graphics/get-textured-material"
import { Rng } from "#/lib/engine/random"
import { clothStripeTex } from "#/world/scene/textures/cloth-stripe-tex"
import { heap } from "#/world/scene/heap"
import { basket } from "#/world/scene/basket"
import { hanging } from "#/world/scene/hanging"
import { GPPU } from "#/world/scene/goods"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M } from "./materials"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { barrel } from "#/world/scene/construction/barrel"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import type { V2 } from "#/world/scene/construction/registry"

type Goods = "apple" | "appleG" | "pear" | "plum" | "onion" | "turnip" | "cabbage" | "egg" | "grape" | "carrot" | "bread" | "cheese" | "fish" | "jug"

/** Market stall: table with crates/baskets of goods and a striped awning. rot: facing (0 = customers on +z). */
export function stall(inputProps: { root: THREE.Group; x: number; z: number; goods: Goods[]; stripe: [string, string]; hang: string[]; seed: number; facing: "n" | "s" | "e" | "w" }) {
  const root = inputProps.root
  const x = inputProps.x
  const z = inputProps.z
  const goods = inputProps.goods
  const stripe = inputProps.stripe
  const hang = inputProps.hang
  const seed = inputProps.seed
  const facing = inputProps.facing

  const g = new THREE.Group()
  const gb = new GB()
  const y0 = groundH(x, z)
  const w = 2.0,
    d = 0.9,
    h = 0.72
  // local coords: x along stall, z towards customers
  gb.box({ side: M.wood, top: M.wood, x0: -w / 2, y0: h - 0.07, z0: -d / 2, x1: w / 2, y1: h, z1: d / 2, repeat: 2 })
  gb.box({ side: M.woodV, top: null, x0: -w / 2 + 0.05, y0: 0.1, z0: d / 2 - 0.04, x1: w / 2 - 0.05, y1: h - 0.07, z1: d / 2 - 0.02, repeat: 2 }) // front board
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const tall = sz < 0 ? 2.15 : 1.75
      gb.box({ side: M.woodDark, top: M.woodDark, x0: sx * (w / 2) - 0.05, y0: -0.2, z0: sz * (d / 2 + 0.05) - 0.05, x1: sx * (w / 2) + 0.05, y1: tall, z1: sz * (d / 2 + 0.05) + 0.05, repeat: 2 })
    }
  const awn = mat(clothStripeTex(stripe[0], stripe[1], seed), { alpha: true, side: THREE.DoubleSide })
  gb.quad({
    material: awn,
    a: [-w / 2 - 0.15, 1.7, d / 2 + 0.45],
    b: [w / 2 + 0.15, 1.7, d / 2 + 0.45],
    c: [w / 2 + 0.15, 2.18, -d / 2 - 0.1],
    d: [-w / 2 - 0.15, 2.18, -d / 2 - 0.1],
    repeatU: 0.5,
    repeatV: 0,
  })
  gb.box({ side: M.woodDark, top: null, x0: -w / 2, y0: 1.62, z0: d / 2 + 0.03, x1: w / 2, y1: 1.68, z1: d / 2 + 0.08, repeat: 2 })
  // crates on the table; what is for sale sits in its own group, so a stall can be shut under its cloth
  const n = goods.length
  const r = new Rng(seed)
  const wares = new THREE.Group()
  const shelf = new GB()
  goods.forEach((k, i) => {
    const cx = -w / 2 + (i + 0.5) * (w / n)
    const isBasket = k === "egg" || k === "bread" || r.next() < 0.3
    if (!isBasket) {
      shelf.box({ side: M.wood, top: M.woodDark, x0: cx - w / n / 2 + 0.04, y0: h, z0: -0.3, x1: cx + w / n / 2 - 0.04, y1: h + 0.16, z1: 0.3, repeat: 2 })
      const s = addSprite({ root: wares, b: heap({ kind: k, w: Math.round((w / n - 0.08) * GPPU), h: 22, seed: seed * 10 + i }), x: cx, y: h + 0.06, z: 0.12 })
      void s
    } else {
      addSprite({ root: wares, b: basket({ kind: k, seed: seed * 10 + i, w: 32, h: 26 }), x: cx, y: h, z: 0.1 })
    }
  })
  if (n) wares.add(shelf.build())
  g.add(wares)
  // goods also stacked on the ground in front; a stall with no one to sell is shut under a cloth
  if (n) addSprite({ root: wares, b: basket({ kind: goods[r.int(n)], seed: seed + 99, w: 30, h: 24 }), x: -w / 2 - 0.25, y: 0, z: d / 2 + 0.15 })
  const cloth = new GB()
  cloth.box({ side: M.linen, top: M.linen, x0: -w / 2 - 0.02, y0: h - 0.3, z0: -0.34, x1: w / 2 + 0.02, y1: h + 0.05, z1: 0.34, repeat: 2 })
  const cover = cloth.build()
  cover.visible = !n
  g.add(cover)
  barrel({ gb: new GB(), x: 0, z: 0 }) // no-op keeps tree-shaking quiet
  // hanging goods under the awning
  hang.forEach((k, i) => addSprite({ root: wares, b: hanging(k, seed + i), x: -w / 2 + 0.3 + i * 0.45, y: 1.75 - 34 / GPPU, z: d / 2 + 0.25 }))
  // crate stack behind
  const cb = new GB()
  crate({ gb: cb, x: w / 2 - 0.3, z: -d / 2 - 0.45, s: 0.5, y: 0 })
  crate({ gb: cb, x: w / 2 - 0.3, z: -d / 2 - 0.45, s: 0.42, y: 0.4 })
  sack({ gb: cb, x: -w / 2 + 0.3, z: -d / 2 - 0.4, y: 0 })
  g.add(cb.build())
  g.add(gb.build())
  g.position.set(x, y0, z)
  const rot = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing]
  g.rotation.y = rot
  root.add(g)
  const cs = Math.cos(rot),
    sn = Math.sin(rot)
  const L = (lx: number, lz: number): V2 => [x + lx * cs + lz * sn, z - lx * sn + lz * cs]
  const pa = L(-w / 2 - 0.3, -d / 2 - 0.9),
    pb = L(w / 2 + 0.6, d / 2 + 0.5)
  blockRect({ x0: Math.min(pa[0], pb[0]), z0: Math.min(pa[1], pb[1]), x1: Math.max(pa[0], pb[0]), z1: Math.max(pa[1], pb[1]) })
  return { seller: L(0, -d / 2 - 0.15), buyer: L(0, d / 2 + 0.8), wares, cover, group: g }
}

export type { Goods }
