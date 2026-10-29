// The inside of a building you can enter: one room on its own map (world/town/interiors.ts).
// The room, its walls and furniture are drawn from the same Interior the server walks on, and the
// walk grid is copied from interiorRows at the end, so both sides agree cell for cell.
import { indoorLaundry } from "./construction/indoor-laundry"
import * as THREE from "three"
import { GB, colorMat } from "./gfx"
import { barrel, bench, crate, fireLights, glowMats, M, sack, table, addSprite, type V2 } from "./build"
import { basket, hanging, heap, GPPU } from "./goods"
import { blocked, groundH, WN } from "./world"
import { hash2 } from "./pix"
import { INTERIORS, interiorRows, type Furniture, type Interior } from "../town/interiors.ts"
import { HOUSEHOLDS } from "../town/houses.ts"
import { Kit, furnish, paintOf, stockShelf, topOf, wood, woodOf, type Spot, type Stock, type Wood, type WoodId } from "./construction/furnishings.ts"
import { fromBeams, hang as hangOn, hookOf, lying, ON_WALLS } from "./construction/belongings.ts"
import { floorPlan } from "../town/floorplan.ts"
import { ROOM_SCALE } from "../town/interiors.ts"
import { SIZES } from "../town/fit.ts"

import { INDOOR } from "../maps/ground-layouts.ts"

export { INDOOR }

const WALL_H = 2.3
const WALL_T = 0.22
/** low enough to see the shopkeeper over it */
const COUNTER_H = 0.6

const coal = colorMat(0xff8a3a)
const rugMat = colorMat(0x7a2e2e)
const rugEdge = colorMat(0xc89a4a)
const rugMat2 = colorMat(0x3a4a6a)
const windowMat = new THREE.MeshLambertMaterial({ color: 0x9ab8d0, emissive: new THREE.Color(0x6a88a8), emissiveIntensity: 0.5 })
const cloth = [colorMat(0x8a3a3a), colorMat(0x3a5a7a), colorMat(0xc8b890), colorMat(0x4a6a3a), colorMat(0x6a4a7a)]
const bottle = [colorMat(0x3a6a5a), colorMat(0x6a3a2a), colorMat(0x8aa8b0), colorMat(0x5a4a7a)]

/** What sits on the shelves, by the building's shop. */
const SHELF_GOODS: Record<string, string[]> = {
  bakery: ["bread", "bread", "cheese"],
  inn: ["jar", "bread", "cheese"],
  tavern: ["jar", "grape", "sausage"],
  apothecary: ["jar", "jar", "garlic"],
  general: ["jar", "onion", "clay"],
  crystal: ["jar", "jar", "clay"],
  buyer: ["fish", "clay", "egg"],
}

/** What each shop keeps on its open shelves. */
const STOCK: Record<string, Stock> = { bakery: "bread", apothecary: "jars", crystal: "jars", tavern: "bottles", inn: "bottles", general: "sundries" }

/** Hanging from the beams, by shop. */
const HANGING: Record<string, string[]> = {
  bakery: ["garlic"],
  apothecary: ["herb", "herb", "garlic"],
  tavern: ["sausage", "garlic"],
  inn: ["garlic"],
  general: ["garlic"],
}

function wall(root: THREE.Group, x0: number, z0: number, x1: number, z1: number, y0: number, holes: [number, number][] = []) {
  // a plaster wall on a wooden skirting, with a beam along the top; `holes` are gaps along its length
  const g = new THREE.Group()
  const gb = new GB()
  const alongX = x1 - x0 > z1 - z0
  const a0 = alongX ? x0 : z0,
    a1 = alongX ? x1 : z1
  const cuts = [...holes].sort((p, q) => p[0] - q[0])
  let at = a0
  const piece = (s: number, e: number) => {
    if (e - s < 0.01) return
    const [bx0, bz0, bx1, bz1] = alongX ? [s, z0, e, z1] : [x0, s, x1, e]
    gb.box(M.plaster, M.woodDark, bx0, y0, bz0, bx1, y0 + WALL_H, bz1, 2)
    gb.box(M.woodDark, null, bx0 - 0.01, y0, bz0 - 0.01, bx1 + 0.01, y0 + 0.28, bz1 + 0.01, 2)
  }
  for (const [s, e] of cuts) {
    piece(at, s)
    at = e
  }
  piece(at, a1)
  // the lintel over each gap
  for (const [s, e] of cuts) {
    const [bx0, bz0, bx1, bz1] = alongX ? [s, z0, e, z1] : [x0, s, x1, e]
    gb.box(M.woodDark, M.woodDark, bx0, y0 + 1.75, bz0, bx1, y0 + WALL_H, bz1, 2)
  }
  g.add(gb.build())
  root.add(g)
  return g
}

/**
 * Walls facing the camera are cut down to their skirting, as in a doll's house, so the room is
 * always seen into; which ones changes as the camera turns.
 */
export const cutaways: { obj: THREE.Object3D; at: V2; normal: V2 }[] = []
export function updateCutaways(cam: THREE.Vector3) {
  for (const c of cutaways) {
    const facing = (cam.x - c.at[0]) * c.normal[0] + (cam.z - c.at[1]) * c.normal[1] > 0
    const want = facing ? 0.12 : 1
    c.obj.scale.y += (want - c.obj.scale.y) * 0.25
  }
}

function bolts(root: THREE.Group, f: Furniture, y0: number, seed: number) {
  // cloth on the shelves of a tailor or weaver: rolled bolts in a row
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(M.woodDark, M.wood, x - w / 2, y0, z - d / 2, x + w / 2, y0 + 1.7, z - d / 2 + 0.04, 2)
  for (const b of [0.05, 0.6, 1.15]) {
    gb.box(M.wood, M.wood, x - w / 2, y0 + b, z - d / 2, x + w / 2, y0 + b + 0.05, z + d / 2, 2)
    for (let k = 0; k < 4; k++) {
      const cx = x - w / 2 + 0.25 + k * ((w - 0.5) / 3)
      gb.box(cloth[(k + seed + Math.round(b * 10)) % cloth.length], null, cx - 0.17, y0 + b + 0.05, z - d / 2 + 0.06, cx + 0.17, y0 + b + 0.36, z + d / 2 - 0.04, 1)
    }
  }
  root.add(gb.build())
}

function hearth(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(M.stoneDark, M.stone, x - w / 2, y0, z - d / 2, x + w / 2, y0 + 0.9, z + d / 2, 4)
  gb.box(M.stone, M.stoneDark, x - w / 2 - 0.05, y0 + 0.9, z - d / 2 - 0.1, x + w / 2 + 0.05, y0 + 1.05, z + d / 2 + 0.1, 4)
  gb.box(M.stone, M.stone, x - w / 2, y0 + 1.05, z - d / 3, x + w / 2 - 0.15, y0 + WALL_H, z + d / 3, 4)
  gb.box(M.dark, null, x + w / 2 - 0.02, y0 + 0.08, z - d / 3, x + w / 2 + 0.01, y0 + 0.7, z + d / 3, 1)
  gb.box(coal, null, x + w / 2 - 0.01, y0 + 0.08, z - d / 4, x + w / 2 + 0.02, y0 + 0.28, z + d / 4, 1)
  root.add(gb.build())
  const l = new THREE.PointLight(0xff8a3a, 2.2, 7, 1.4)
  l.position.set(x + w / 2 + 0.5, y0 + 0.6, z)
  root.add(l)
  fireLights.push({ light: l, base: 2.2, seed: x * 3 + z })
}

function counter(root: THREE.Group, f: Furniture, y0: number, shop: string | undefined, seed: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(M.woodV, M.woodDark, x - w / 2, y0, z - d / 2, x + w / 2, y0 + COUNTER_H - 0.06, z + d / 2, 2)
  gb.box(M.woodDark, M.wood, x - w / 2 - 0.05, y0 + COUNTER_H - 0.06, z - d / 2 - 0.05, x + w / 2 + 0.05, y0 + COUNTER_H, z + d / 2 + 0.05, 2)
  root.add(gb.build())
  counterGoods(root, f, y0, shop, seed)
}

/** What the shop sets out on its counter: bottles in a row, a basket of its goods. */
function counterGoods(root: THREE.Group, f: Furniture, y0: number, shop: string | undefined, seed: number) {
  const { x, z, w } = f
  const top = y0 + (topOf(f.name ?? "") ?? COUNTER_H)
  if (shop === "apothecary" || shop === "crystal" || shop === "tavern" || shop === "inn") {
    const gb = new GB()
    for (let k = 0; k < 4; k++) {
      const bx = x - w / 2 + 0.3 + k * 0.22
      gb.cyl(bottle[(k + seed) % bottle.length], null, bx, z, top, top + 0.2, 0.05, 0.05, 6, 1)
    }
    root.add(gb.build())
  }
  const g = new THREE.Group()
  g.position.set(x + w / 2 - 0.4, 0, z + 0.1)
  root.add(g)
  const goods = SHELF_GOODS[shop ?? ""]
  if (goods) addSprite(g, basket(goods[seed % goods.length], seed, 26, 22), 0, top, 0)
}

/**
 * Which way a piece faces: away from the wall it stands nearest, out into the room. The room is
 * laid out half again as large as life (interiors.ts ROOM_SCALE) so there is room to walk, but a
 * chair drawn that wide would be a bench: each piece is drawn a little smaller than the floor it
 * keeps, its back still to its wall.
 */
const SHRINK = 0.78
/** how much larger than life the things on the walls and beams are drawn */
const WALL_SCALE = 1.45
function spotOf(it: Interior, f: Furniture, y0: number): Spot {
  const gaps: [number, Spot["face"]][] = [
    [f.z - f.d / 2 - it.z0, 0],
    [f.x - f.w / 2 - it.x0, 1],
    [it.x1 - (f.x + f.w / 2), 3],
    [it.z1 - (f.z + f.d / 2), 2],
  ]
  const [gap, near] = gaps.reduce((a, b) => (b[0] < a[0] ? b : a))
  const face = gap < 0.8 ? near : 0
  if (f.kind === "hearth" || f.kind === "stair") return { x: f.x, z: f.z, w: f.w, d: f.d, y: y0, face }
  const across = f.kind === "counter" ? 1 : SHRINK
  const side = face === 1 || face === 3
  const w = f.w * (side ? SHRINK : across),
    d = f.d * (side ? across : SHRINK)
  if (gap >= 0.8) return { x: f.x, z: f.z, w, d, y: y0, face }
  // keep the back against the wall
  const x = face === 1 ? f.x - f.w / 2 + w / 2 : face === 3 ? f.x + f.w / 2 - w / 2 : f.x
  const z = face === 0 ? f.z - f.d / 2 + d / 2 : face === 2 ? f.z + f.d / 2 - d / 2 : f.z
  return { x, z, w, d, y: y0, face }
}

/** The fire's light, flickering, in front of the hearth's mouth. */
function fireLight(root: THREE.Group, s: Spot) {
  const out = s.face === 0 ? [0, 1] : s.face === 2 ? [0, -1] : s.face === 1 ? [1, 0] : [-1, 0]
  const depth = s.face === 1 || s.face === 3 ? s.w : s.d
  const l = new THREE.PointLight(0xff8a3a, 2.2, 7, 1.4)
  l.position.set(s.x + out[0] * (depth / 2 + 0.5), s.y + 0.6, s.z + out[1] * (depth / 2 + 0.5))
  root.add(l)
  fireLights.push({ light: l, base: 2.2, seed: s.x * 3 + s.z })
}

/** Tall pieces nothing is hung above. */
const TALL = new Set(["shelf", "stair", "hearth", "loom", "rack", "partition"])

/**
 * The walls of each ground-floor room, dressed: the plan's wall pieces first (an axe rack, herbs
 * hung to dry, the town map), then what every room of its use has, in the gaps between windows and
 * tall furniture. Then what hangs from the beams, and a rug under the table.
 */
function dress(root: THREE.Group, gb: GB, it: Interior, y0: number, seed: number, wd: Wood) {
  const plan = floorPlan(it.house.id)
  const K = ROOM_SCALE
  const windows = [it.x0 + (it.x1 - it.x0) * 0.3, it.x0 + (it.x1 - it.x0) * 0.7]
  const pieces = it.house.plan.furniture
    .filter((f) => !/（(外|2階)）$/.test(f))
    .map((f) => f.replace(/×\d+$/, ""))
    .filter((f) => SIZES[f] === "wall" && ON_WALLS[f] && f !== "大鍋")
  const wallTraces = it.furniture.filter((f) => f.kind === "trace" && f.z - it.z0 < 0.3)
  type Slot = { x: number; z: number; face: Spot["face"]; use: string; room: number }
  const slots: Slot[] = []
  plan.rooms
    .filter((r) => r.floor === 0)
    .forEach((r, ri) => {
      const rx0 = it.x0 + r.x0 * K,
        rx1 = it.x0 + r.x1 * K,
        rz0 = it.z0 + r.z0 * K,
        rz1 = it.z0 + r.z1 * K
      const walls: { a: number; b: number; at: (t: number) => [number, number]; face: Spot["face"] }[] = []
      if (r.z0 < 0.05) walls.push({ a: rx0, b: rx1, at: (t) => [t, it.z0], face: 0 })
      if (r.x0 < 0.05) walls.push({ a: rz0, b: rz1, at: (t) => [it.x0, t], face: 1 })
      if (r.x1 > plan.W - 0.05) walls.push({ a: rz0, b: rz1, at: (t) => [it.x1, t], face: 3 })
      for (const w of walls) {
        const n = Math.floor((w.b - w.a - 0.4) / 1.3)
        for (let i = 0; i < n; i++) {
          const t = w.a + 0.2 + (w.b - w.a - 0.4) * ((i + 0.5) / n)
          const [x, z] = w.at(t)
          if (w.face === 0 && windows.some((wx) => Math.abs(wx - x) < 0.75)) continue
          if (w.face !== 0 && z > it.z1 - 1.2) continue // too near the cut-down front
          if (wallTraces.some((f) => Math.hypot(f.x - x, f.z - z) < 0.8)) continue
          const blocked = it.furniture.some((f) => TALL.has(f.kind) && Math.abs(x - f.x) < f.w / 2 + 0.45 && Math.abs(z - f.z) < f.d / 2 + 0.45)
          if (!blocked) slots.push({ x, z, face: w.face, use: r.use, room: ri })
        }
      }
    })
  // the plan's own wall pieces go to work rooms first, then anywhere
  const order = [...slots].sort((a, b) => Number(!/作業場|売り場|土間|貯蔵/.test(a.use)) - Number(!/作業場|売り場|土間|貯蔵/.test(b.use)))
  const taken = new Set<Slot>()
  for (const [i, piece] of pieces.entries()) {
    const s = order.find((x) => !taken.has(x))
    if (!s) break
    taken.add(s)
    const hook = hookOf(piece)
    hangOn(new Kit(gb, { x: s.x, z: s.z, w: 1, d: 0.2, y: y0 + hook, face: s.face }, WALL_SCALE), wd, { piece }, seed + i * 17)
  }
  slots.forEach((s, i) => {
    if (taken.has(s) || hash2(seed, i, 91) < 0.25) return
    hangOn(new Kit(gb, { x: s.x, z: s.z, w: 1, d: 0.2, y: y0 + 1.5, face: s.face }, WALL_SCALE), wd, { use: s.use }, seed + i * 29)
  })
  // the beams, and rugs where people sit
  plan.rooms
    .filter((r) => r.floor === 0)
    .forEach((r, ri) => {
      const cx = it.x0 + ((r.x0 + r.x1) / 2) * K,
        z = it.z0 + r.z0 * K + 0.5
      if (/台所|貯蔵|作業場|食事|住まい/.test(r.use) && hash2(seed, ri, 93) > 0.3)
        fromBeams(new Kit(gb, { x: cx, z, w: 1, d: 0.2, y: y0 + WALL_H - 0.05, face: 0 }, WALL_SCALE), r.use, seed + ri, it.house.shop === "apothecary")
    })
  for (const f of it.furniture) {
    if (!/^(食卓|大きな食卓|長卓|卓)$/.test(f.name ?? "") && f.kind !== "hearth") continue
    const rg = new GB()
    const s = spotOf(it, f, y0)
    const [w, d] = f.kind === "hearth" ? [Math.min(f.w, f.d) * 0.9, 0.9] : [s.w + 1.0, s.d + 1.0]
    const front = f.kind === "hearth" ? new Kit(rg, s).at(0, (s.face === 1 || s.face === 3 ? s.w : s.d) / 2 + 0.55) : [s.x, s.z]
    const rot = f.kind === "hearth" && (s.face === 1 || s.face === 3)
    const [rw, rd] = rot ? [d, w] : [w, d]
    rg.box(rugEdge, rugEdge, front[0] - rw / 2, y0, front[1] - rd / 2, front[0] + rw / 2, y0 + 0.008, front[1] + rd / 2, 2)
    const rm = hash2(seed, Math.round(f.x * 10), 95) > 0.5 ? rugMat : rugMat2
    rg.box(rm, rm, front[0] - rw / 2 + 0.08, y0 + 0.008, front[1] - rd / 2 + 0.08, front[0] + rw / 2 - 0.08, y0 + 0.012, front[1] + rd / 2 - 0.08, 2)
    root.add(rg.build(false))
  }
}

/** The wood of the household's furniture; a painted chest, bench or cradle where the house paints them. */
function woodFor(it: Interior): (name: string) => WoodId {
  const living = it.house.household ? HOUSEHOLDS.find((h) => h.id === it.house.household)?.living : it.house.kind === "public" ? "ゆとりがある" : undefined
  const base = woodOf(living, it.house.seed)
  const paints = living !== "慎ましい" && hash2(it.house.seed, 5, 73) > 0.55
  return (name) => (paints && /^(衣装箱|長椅子|揺りかご)$/.test(name) ? paintOf(it.house.seed) : base)
}

function workbench(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(M.wood, M.wood, x - w / 2, y0 + 0.74, z - d / 2, x + w / 2, y0 + 0.82, z + d / 2, 2)
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) gb.box(M.woodDark, null, x + sx * (w / 2 - 0.08) - 0.05, y0, z + sz * (d / 2 - 0.08) - 0.05, x + sx * (w / 2 - 0.08) + 0.05, y0 + 0.74, z + sz * (d / 2 - 0.08) + 0.05, 2)
  gb.box(M.woodDark, null, x - w / 2 + 0.1, y0 + 0.2, z - d / 2 + 0.1, x + w / 2 - 0.1, y0 + 0.25, z + d / 2 - 0.1, 2)
  // tools on top
  gb.box(M.iron, null, x - 0.1, y0 + 0.82, z - 0.3, x + 0.1, y0 + 0.86, z + 0.1, 1)
  gb.box(M.woodV, null, x - 0.2, y0 + 0.82, z + 0.25, x + 0.15, y0 + 0.9, z + 0.4, 1)
  root.add(gb.build())
}

function rack(root: THREE.Group, f: Furniture, y0: number, seed: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  for (const s of [-1, 1]) gb.box(M.woodDark, null, x - 0.04, y0, z + s * (d / 2 - 0.04) - 0.04, x + 0.04, y0 + 1.6, z + s * (d / 2 - 0.04) + 0.04, 2)
  gb.box(M.woodDark, null, x - 0.03, y0 + 1.55, z - d / 2, x + 0.03, y0 + 1.62, z + d / 2, 2)
  for (let k = 0; k < 3; k++) {
    const cz = z - d / 2 + 0.25 + k * ((d - 0.5) / 2)
    gb.box(cloth[(k + seed) % cloth.length], null, x - w / 2 + 0.06, y0 + 0.75, cz - 0.16, x + w / 2 - 0.06, y0 + 1.52, cz + 0.16, 1)
  }
  root.add(gb.build())
}

function loom(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) gb.box(M.woodDark, null, x + sx * (w / 2 - 0.05) - 0.04, y0, z + sz * (d / 2 - 0.05) - 0.04, x + sx * (w / 2 - 0.05) + 0.04, y0 + 1.3, z + sz * (d / 2 - 0.05) + 0.04, 2)
  gb.box(M.woodDark, null, x - w / 2, y0 + 1.25, z - d / 2, x + w / 2, y0 + 1.32, z + d / 2, 2)
  gb.box(cloth[2], null, x - w / 2 + 0.1, y0 + 0.62, z - 0.05, x + w / 2 - 0.1, y0 + 1.2, z + 0.02, 1)
  gb.box(M.wood, M.wood, x - w / 2 + 0.05, y0 + 0.6, z - d / 2 + 0.05, x + w / 2 - 0.05, y0 + 0.66, z + d / 2 - 0.05, 2)
  root.add(gb.build())
}

function chest(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(M.woodDark, M.wood, x - w / 2, y0, z - d / 2, x + w / 2, y0 + 0.55, z + d / 2, 2)
  for (const t of [-0.3, 0.3]) gb.box(M.iron, M.iron, x + t * w - 0.03, y0, z - d / 2 - 0.01, x + t * w + 0.03, y0 + 0.56, z + d / 2 + 0.01, 1)
  gb.box(M.iron, null, x - 0.06, y0 + 0.3, z + d / 2, x + 0.06, y0 + 0.44, z + d / 2 + 0.02, 1)
  root.add(gb.build())
}

function rug(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  gb.box(rugEdge, rugEdge, x - w / 2, y0, z - d / 2, x + w / 2, y0 + 0.012, z + d / 2, 2)
  gb.box(rugMat, rugMat, x - w / 2 + 0.08, y0, z - d / 2 + 0.08, x + w / 2 - 0.08, y0 + 0.016, z + d / 2 - 0.08, 2)
  root.add(gb.build())
}

function lamp(root: THREE.Group, x: number, z: number, y0: number) {
  // a lamp hanging from the ceiling beam: the room's light, day and night
  const gb = new GB()
  gb.box(M.rope, null, x - 0.01, y0 + 1.95, z - 0.01, x + 0.01, y0 + WALL_H + 0.4, z + 0.01, 1)
  gb.box(M.iron, null, x - 0.12, y0 + 1.8, z - 0.12, x + 0.12, y0 + 1.95, z + 0.12, 1)
  root.add(gb.build())
  const glass = new THREE.MeshLambertMaterial({ color: 0xffd890, emissive: new THREE.Color(0xffb050), emissiveIntensity: 1.2 })
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.16), glass)
  m.position.set(x, y0 + 1.73, z)
  root.add(m)
  const l = new THREE.PointLight(0xffc070, 2.4, 9, 1.3)
  l.position.set(x, y0 + 1.6, z)
  root.add(l)
  fireLights.push({ light: l, base: 2.4, seed: x + z * 7 })
}

/** A stool or a chair; one left pulled out stands a little askew. */
function chair(gb: GB, f: Furniture, y0: number) {
  const { x, z, w, d } = f
  const s = Math.min(w, d) * 0.9
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) gb.box(M.woodDark, null, x + sx * (s / 2 - 0.05) - 0.03, y0, z + sz * (s / 2 - 0.05) - 0.03, x + sx * (s / 2 - 0.05) + 0.03, y0 + 0.42, z + sz * (s / 2 - 0.05) + 0.03, 1)
  gb.box(M.wood, M.woodDark, x - s / 2, y0 + 0.42, z - s / 2, x + s / 2, y0 + 0.48, z + s / 2, 2)
  // a back on the side away from the table
  if (!/揺り/.test(f.name ?? "")) gb.box(M.woodDark, null, x - s / 2, y0 + 0.48, z + s / 2 - 0.05, x + s / 2, y0 + 0.95, z + s / 2, 1)
}

/** A stair up to the floor above, rising towards the back wall (or along it); its head goes into the dark. */
function stair(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  const alongZ = d >= w
  const n = 9,
    run = (alongZ ? d : w) / n,
    rise = (WALL_H + 0.3) / n
  for (let k = 0; k < n; k++) {
    // the steps climb from the front (or the west) to the back (or the east)
    const a0 = alongZ ? z + d / 2 - (k + 1) * run : x - w / 2 + k * run
    const a1 = a0 + run
    const [bx0, bz0, bx1, bz1] = alongZ ? [x - w / 2, a0, x + w / 2, a1] : [a0, z - d / 2, a1, z + d / 2]
    gb.box(M.wood, M.woodDark, bx0, y0 + k * rise, bz0, bx1, y0 + (k + 1) * rise, bz1, 2)
  }
  // the open string and a handrail on the room side
  const side = alongZ ? x - w / 2 : z + d / 2
  for (let k = 0; k <= n; k += 3) {
    const a = alongZ ? z + d / 2 - k * run : x - w / 2 + k * run
    if (alongZ) gb.box(M.woodDark, null, side - 0.03, y0, a - 0.03, side + 0.03, y0 + k * rise + 0.9, a + 0.03, 1)
    else gb.box(M.woodDark, null, a - 0.03, y0, side - 0.03, a + 0.03, y0 + k * rise + 0.9, side + 0.03, 1)
  }
  // the hole in the ceiling it climbs into, dark above the top steps
  if (alongZ) gb.box(M.dark, null, x - w / 2, y0 + WALL_H - 0.02, z - d / 2, x + w / 2, y0 + WALL_H + 0.3, z - d / 2 + run * 3, 1)
  else gb.box(M.dark, null, x + w / 2 - run * 3, y0 + WALL_H - 0.02, z - d / 2, x + w / 2, y0 + WALL_H + 0.3, z + d / 2, 1)
  root.add(gb.build())
}

/** A partition inside the room: a plastered wall (kept low, as the room is seen into from above), a plank half wall, or a curtain on a rod. */
function partition(root: THREE.Group, f: Furniture, y0: number) {
  const gb = new GB()
  const { x, z, w, d } = f
  const [x0, z0, x1, z1] = [x - w / 2, z - d / 2, x + w / 2, z + d / 2]
  if (f.kind === "partition") {
    gb.box(M.plaster, M.woodDark, x0, y0, z0, x1, y0 + 1.5, z1, 2)
    gb.box(M.woodDark, null, x0 - 0.01, y0, z0 - 0.01, x1 + 0.01, y0 + 0.2, z1 + 0.01, 2)
    gb.box(M.woodDark, M.woodDark, x0 - 0.02, y0 + 1.5, z0 - 0.02, x1 + 0.02, y0 + 1.58, z1 + 0.02, 2)
  } else if (f.kind === "lowwall") {
    gb.box(M.woodV, M.woodDark, x0, y0, z0, x1, y0 + 0.9, z1, 2)
    gb.box(M.woodDark, M.wood, x0 - 0.03, y0 + 0.9, z0 - 0.03, x1 + 0.03, y0 + 0.96, z1 + 0.03, 2)
  } else {
    // a curtain: the rod at the top, the cloth hanging in folds to just above the floor
    const along = w >= d
    gb.box(M.woodDark, null, x0, y0 + 1.85, z0 + (along ? d / 2 - 0.02 : 0), x1, y0 + 1.9, z1 - (along ? d / 2 - 0.02 : 0), 1)
    const len = along ? w : d,
      folds = Math.max(2, Math.round(len / 0.25))
    for (let k = 0; k < folds; k++) {
      const a = (along ? x0 : z0) + (k / folds) * len,
        b = a + len / folds
      const off = k % 2 ? 0.03 : -0.03
      if (along) gb.box(cloth[(k % 2) + 0], null, a, y0 + 0.08, z + off - 0.02, b, y0 + 1.85, z + off + 0.02, 1)
      else gb.box(cloth[(k % 2) + 0], null, x + off - 0.02, y0 + 0.08, a, x + off + 0.02, y0 + 1.85, b, 1)
    }
  }
  root.add(gb.build())
}

/** What the plan's traces of life look like: things on the table, at the fire, on the wall, by the door, on the floor. */
const TRACE_GOODS: [RegExp, string][] = [
  [/パン/, "bread"],
  [/チーズ/, "cheese"],
  [/薬草|干し|花/, "garlic"],
  [/玉ねぎ/, "onion"],
  [/林檎|果/, "apple"],
  [/魚/, "fish"],
  [/卵/, "egg"],
  [/葡萄/, "grape"],
  [/蕪/, "turnip"],
  [/茶|椀|杯|皿|壺|瓶|鍋/, "jar"],
]
function trace(root: THREE.Group, props: GB, f: Furniture, y0: number, seed: number, onTable: (x: number, z: number) => number) {
  const name = f.name ?? ""
  const good = TRACE_GOODS.find(([re]) => re.test(name))?.[1]
  const h = /床/.test(name) || /くず|跡|粉|藁|羽根|籾/.test(name) ? 0 : null
  if (h === 0) {
    // scraps and dust on the floor: a few flecks
    const fleck = colorMat(/粉/.test(name) ? 0xe8e0d0 : /藁|籾/.test(name) ? 0xc8a85a : /泥|足跡|灰|煤/.test(name) ? 0x4a3a2a : /鉄/.test(name) ? 0x5a5a62 : 0xb08a5a)
    for (let k = 0; k < 7; k++) {
      const fx = f.x + (((seed * 13 + k * 37) % 100) / 100 - 0.5) * f.w * 1.6,
        fz = f.z + (((seed * 7 + k * 53) % 100) / 100 - 0.5) * f.d * 1.6
      props.box(fleck, null, fx - 0.05, y0 + 0.002, fz - 0.04, fx + 0.05, y0 + 0.01, fz + 0.04, 1)
    }
    return
  }
  const y = onTable(f.x, f.z)
  if (good) {
    const g = new THREE.Group()
    g.position.set(f.x, 0, f.z)
    root.add(g)
    addSprite(g, heap(good, 14, 10, seed), 0, y, 0)
    return
  }
  // cloth, leather, paper and tools: a small slab in a colour of its own
  const c = /外套|前掛け|膝掛け|手袋|首巻き|布|靴下|長靴|帽子/.test(name)
    ? cloth[seed % cloth.length]
    : /帳|書|札|紙|地図|暦|本/.test(name)
      ? colorMat(0xe8dcc0)
      : /斧|鋏|鉄|兜|蹄鉄|鍵|鎌|蝶番/.test(name)
        ? M.iron
        : M.woodV
  const tall = /外套|前掛け|靴下|網|紐|束/.test(name) && y > y0 + 0.9 ? 0.45 : 0.08
  props.box(c, null, f.x - f.w / 2, y, f.z - f.d / 2, f.x + f.w / 2, y + tall, f.z + f.d / 2, 1)
}

/** The exchange board on the hall's back wall: a cork board pinned with orders (town/boards.ts). */
function noticeBoard(root: THREE.Group, x: number, z: number, y0: number) {
  const gb = new GB()
  gb.box(M.woodDark, M.woodDark, x - 0.85, y0 + 0.9, z, x + 0.85, y0 + 1.95, z + 0.06, 2)
  gb.box(colorMat(0x9a7a52), null, x - 0.78, y0 + 0.97, z + 0.06, x + 0.78, y0 + 1.88, z + 0.07, 1)
  const paper = [colorMat(0xece4d0), colorMat(0xd8d0bc), colorMat(0xf2ead8)]
  for (let k = 0; k < 9; k++) {
    const px = x - 0.62 + (k % 3) * 0.5 + ((k * 37) % 7) * 0.02,
      py = y0 + 1.05 + Math.floor(k / 3) * 0.27
    gb.box(paper[k % 3], null, px, py, z + 0.07, px + 0.28, py + 0.2, z + 0.075, 1)
  }
  root.add(gb.build())
}

/** The builder for one room. */
export function buildInterior(it: Interior) {
  return (root: THREE.Group) => {
    const y0 = groundH(it.x0 + 1, it.z0 + 1) + 0.02
    const shop = it.house.shop
    const seed = it.house.seed
    const gb = new GB()
    // floorboards, and a dark band of floor just outside the walls
    gb.box(M.wood, M.wood, it.x0, y0 - 0.1, it.z0, it.x1, y0, it.z1, 2)
    root.add(gb.build())
    // the walls: the back one with windows, the front one with the door
    cutaways.length = 0
    const cx = (it.x0 + it.x1) / 2,
      cz = (it.z0 + it.z1) / 2
    const doorX = (it.door[0] + 0.5) / 2
    cutaways.push(
      { obj: wall(root, it.x0 - WALL_T, it.z0 - WALL_T, it.x1 + WALL_T, it.z0, y0), at: [cx, it.z0], normal: [0, -1] },
      { obj: wall(root, it.x0 - WALL_T, it.z1, it.x1 + WALL_T, it.z1 + WALL_T, y0, it.floor === 0 ? [[doorX - 0.55, doorX + 0.55]] : []), at: [cx, it.z1], normal: [0, 1] },
      { obj: wall(root, it.x0 - WALL_T, it.z0, it.x0, it.z1, y0), at: [it.x0, cz], normal: [-1, 0] },
      { obj: wall(root, it.x1, it.z0, it.x1 + WALL_T, it.z1, y0), at: [it.x1, cz], normal: [1, 0] },
    )
    // windows on the back wall, glowing a little with the light outside
    const wb = new GB()
    for (const wx of [it.x0 + (it.x1 - it.x0) * 0.3, it.x0 + (it.x1 - it.x0) * 0.7]) {
      wb.box(windowMat, null, wx - 0.35, y0 + 1.1, it.z0 + 0.005, wx + 0.35, y0 + 1.7, it.z0 + 0.02, 1)
      wb.box(M.woodDark, null, wx - 0.03, y0 + 1.1, it.z0 + 0.02, wx + 0.03, y0 + 1.7, it.z0 + 0.04, 1)
      wb.box(M.woodDark, null, wx - 0.4, y0 + 1.05, it.z0 + 0.01, wx + 0.4, y0 + 1.1, it.z0 + 0.08, 1)
    }
    root.add(wb.build())
    glowMats.push(windowMat)
    // a door mat inside the door
    if (it.floor === 0) {
      const dm = new GB()
      dm.box(M.sack, M.sack, doorX - 0.45, y0, it.z1 - 0.7, doorX + 0.45, y0 + 0.012, it.z1 - 0.15, 2)
      root.add(dm.build())
    }

    const props = new GB()
    let shelves = 0
    const woodOfPiece = woodFor(it)
    it.furniture.forEach((f, k) => {
      // a piece drawn as itself (construction/furnishings.ts); the rest by its kind below
      const own = f.kind !== "trace" && f.kind !== "partition" && f.kind !== "lowwall" && f.kind !== "curtain" && f.kind !== "stair" && f.name
      const spot = spotOf(it, f, y0)
      if (own && furnish(props, f.name!, spot, wood(woodOfPiece(f.name!)), seed + k * 13)) {
        if (f.kind === "counter") counterGoods(root, f, y0, shop, seed)
        if (f.kind === "hearth") fireLight(root, spot)
        return
      }
      switch (f.kind) {
        case "counter":
          counter(root, f, y0, shop, seed)
          break
        case "shelf":
          if (shop === "tailor" || it.house.plan.workshop?.includes("機織り")) bolts(root, f, y0, seed + shelves)
          else stockShelf(props, f.name === "棚" ? { x: f.x, z: f.z, w: f.w, d: f.d, y: y0, face: 0 } : spot, wood(woodOfPiece(f.name ?? "棚")), seed + shelves * 11, STOCK[shop ?? ""] ?? "stores")
          shelves++
          break
        case "hearth":
          hearth(root, f, y0)
          break
        case "table":
          table(props, f.x, f.z, f.w, f.d)
          break
        case "bed": {
          const x0 = f.x - f.w / 2,
            x1 = f.x + f.w / 2
          const z0 = f.z - f.d / 2,
            z1 = f.z + f.d / 2
          props.box(M.woodDark, null, x0, y0 + 0.12, z0, x1, y0 + 0.3, z1, 2)
          props.box(cloth[2], null, x0 + 0.04, y0 + 0.3, z0 + 0.04, x1 - 0.04, y0 + 0.4, z1 - 0.04, 2)
          props.box(cloth[1], null, x0 + 0.04, y0 + 0.4, z0 + f.d * 0.3, x1 - 0.04, y0 + 0.43, z1 - 0.04, 2)
          props.box(M.woodV, null, x0, y0, z0, x1, y0 + 0.65, z0 + 0.07, 2)
          break
        }
        case "bench":
          bench(props, f.x, f.z, f.w)
          break
        case "barrel":
          barrel(props, f.x, f.z)
          break
        case "crate":
          crate(props, f.x, f.z, 0.55)
          sack(props, f.x - 0.55, f.z + 0.1)
          break
        case "workbench":
          workbench(root, f, y0)
          break
        case "rack":
          rack(root, f, y0, seed)
          break
        case "loom":
          loom(root, f, y0)
          break
        case "chest":
          chest(root, f, y0)
          break
        case "rug":
          rug(root, f, y0)
          break
        case "chair":
          chair(props, f, y0)
          break
        case "stair":
          stair(root, f, y0)
          break
        case "partition":
        case "lowwall":
        case "curtain":
          partition(root, f, y0)
          break
      }
    })
    // the traces of the life lived here, where the plan lays them
    const tops = it.furniture.filter((f) => f.kind === "table" || f.kind === "workbench" || f.kind === "counter" || f.kind === "hearth")
    const heightAt = (x: number, z: number) => {
      const t = tops.find((f) => Math.abs(x - f.x) <= f.w / 2 + 0.05 && Math.abs(z - f.z) <= f.d / 2 + 0.05)
      return y0 + (!t ? 0.02 : t.kind === "hearth" ? 1.06 : (topOf(t.name ?? "") ?? (t.kind === "counter" ? COUNTER_H : t.kind === "workbench" ? 0.82 : 0.62)))
    }
    it.furniture
      .filter((f) => f.kind === "trace")
      .forEach((f, k) => {
        const onWall = f.z - it.z0 < 0.3
        const name = f.name ?? ""
        // flecks on the floor stay flecks; anything else is drawn as what it is, on a shelf if it is on a wall
        if (!/床/.test(name) && !/くず|跡|粉|藁|羽根|籾/.test(name)) {
          const y = onWall ? y0 + 1.3 : heightAt(f.x, f.z)
          if (onWall && /前掛け|外套|服|帽子|膝掛け|皮/.test(name)) {
            if (hangOn(new Kit(props, { x: f.x, z: it.z0, w: 1, d: 0.2, y: y + 0.5, face: 0 }, WALL_SCALE), wood(woodOfPiece("")), { piece: /皮/.test(name) ? "干した皮" : "吊るした服" }, seed + k)) return
          }
          if (onWall) props.box(M.wood, M.wood, f.x - 0.3, y - 0.035, it.z0, f.x + 0.3, y, it.z0 + 0.22, 1)
          if (lying(new Kit(props, { x: f.x, z: onWall ? it.z0 + 0.11 : f.z, w: 0.5, d: 0.3, y, face: 0 }, 1.3), name, seed + k * 11)) return
        }
        trace(root, props, f, y0, seed + k * 11, (x, z) => (onWall ? y0 + 1.3 : heightAt(x, z)))
      })
    dress(root, props, it, y0, seed, wood(woodOfPiece("")))
    root.add(props.build())
    if (it.drying) {
      const line = indoorLaundry(it.drying.z1 - it.drying.z0, seed)
      line.rotation.y = Math.PI / 2
      line.position.set(it.drying.x, y0 + 1.9, (it.drying.z0 + it.drying.z1) / 2)
      root.add(line)
    }
    // what hangs from the beams
    const hang = HANGING[shop ?? ""] ?? []
    hang.forEach((k, i) => {
      const g = new THREE.Group()
      g.position.set(it.x0 + 0.8 + i * 0.5, 0, it.z0 + 0.3)
      root.add(g)
      addSprite(g, hanging(k, seed + i), 0, y0 + WALL_H - 34 / GPPU, 0)
    })
    lamp(root, (it.x0 + it.x1) / 2, (it.z0 + it.z1) / 2 + 0.6, y0)
    if (it.house.id === "h-m5") noticeBoard(root, (it.keeper[0] + 0.5) / 2, it.z0 + 0.06, y0)

    // the walk grid is the server's, exactly
    const rows = interiorRows(it)
    for (let j = 0; j < WN; j++) for (let i = 0; i < WN; i++) blocked[j * WN + i] = rows[j]?.[i] === "." ? 0 : 1
  }
}

/** The room's centre, for residents to face. */
export const roomCentre = (it: Interior): V2 => [(it.x0 + it.x1) / 2, (it.z0 + it.z1) / 2]

export const INDOOR_WORLDS = INTERIORS.map((it) => ({ id: it.id, it }))
