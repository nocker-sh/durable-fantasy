// The furniture each house plan names (town/fit.ts SIZES), drawn piece by piece: a bed is a bed with
// its quilt, a book case has its books, a spinning wheel its wheel. Every piece is drawn in its own
// footprint, in the frame of the wall it stands against, out of the wood the household can afford
// (woodOf): pine in a modest home, oak or birch in most, walnut, black oak or a painted chest where
// there is more to spend.
import type * as THREE from "three"
import { GB, colorMat, mat } from "../gfx"
import { hash2, pick, PixBuf, vnoise } from "../pix"
import { plainTex } from "../textures"
import { M } from "./materials.ts"

// ---------------------------------------------------------------- woods

export const WOOD_IDS = ["pine", "oak", "birch", "walnut", "blackOak", "paintBlue", "paintRed", "paintGreen"] as const

export type WoodId = (typeof WOOD_IDS)[number]

export const WOOD_NAME: Record<WoodId, string> = {
  pine: "松",
  oak: "樫",
  birch: "白樺",
  walnut: "胡桃",
  blackOak: "黒樫",
  paintBlue: "青塗り",
  paintRed: "赤塗り",
  paintGreen: "緑塗り",
}

export interface Wood {
  id: WoodId
  /** the planks of its sides */
  body: THREE.Material
  /** legs, frames and edges */
  dark: THREE.Material
  /** what is sat at or set down on */
  top: THREE.Material
  /** a painted piece's flowers and borders; plain wood has none */
  trim: THREE.Material | null
}

/** Planks of the given wood (a palette ramp, scene/pix.ts), as scene/textures/wood.ts draws them. */
function grain(ramp: string, light: number, seed: number, vertical = false): PixBuf {
  const b = new PixBuf(32, 32)
  b.fill((x, y) => {
    const a = vertical ? x : y,
      o = vertical ? y : x
    const k = Math.floor(a / 8),
      f = a / 8 - k
    let v = light + (hash2(k, 0, seed) - 0.5) * 0.18 + (vnoise(o, k * 7, 0.18, seed) - 0.5) * 0.14
    if (f > 0.85) v = light - 0.28
    if (hash2(o, k, seed + 9) > 0.975) v -= 0.18
    return pick(ramp, v, x, y, 0.4)
  })
  return b
}

const woods = new Map<WoodId, Wood>()

export function wood(id: WoodId): Wood {
  const hit = woods.get(id)
  if (hit) return hit
  const painted = id.startsWith("paint")
  const w: Wood = painted
    ? { id, body: mat(plainTex(id, 0.55, 0.12, 3, 32)), dark: mat(grain("pine", 0.35, 4)), top: mat(grain("pine", 0.6, 5)), trim: mat(plainTex("cHoney", 0.75, 0.1, 6, 16)) }
    : { id, body: mat(grain(id, 0.55, 2, true)), dark: mat(grain(id, 0.3, 3)), top: mat(grain(id, 0.62, 4)), trim: null }
  woods.set(id, w)
  return w
}

/** What a household's furniture is made of, by how well off it is; the seed picks between the woods of a kind. */
export function woodOf(living: "慎ましい" | "ふつう" | "ゆとりがある" | undefined, seed: number): WoodId {
  const t = hash2(seed, 7, 61)
  if (living === "慎ましい") return "pine"
  if (living === "ゆとりがある") return t < 0.45 ? "walnut" : t < 0.7 ? "blackOak" : "oak"
  return t < 0.6 ? "oak" : t < 0.85 ? "birch" : "pine"
}

/** The paint a chest is decorated with, in a house that paints its chests. */
export const paintOf = (seed: number): WoodId => (["paintBlue", "paintRed", "paintGreen"] as const)[Math.floor(hash2(seed, 3, 67) * 3)]

// ---------------------------------------------------------------- other stuff

const cloth = ["cRed", "cBlue", "cMustard", "cGreen", "cPlum", "cWine", "cSky", "cHoney"].map((r) => mat(plainTex(r, 0.55, 0.2, 9, 16)))
const linen = mat(plainTex("cLinen", 0.75, 0.12, 5, 16))
const paper = colorMat(0xe8dcc0)
const glass = colorMat(0x8aa8b0)
const clay = mat(plainTex("redsand", 0.5, 0.2, 7, 16))
const glaze = [colorMat(0x5a7a7a), colorMat(0x8a5a3a), colorMat(0xb8a888), colorMat(0x4a5a7a)]
const books = [0x6a2a2a, 0x2a3a5a, 0x3a4a2a, 0x6a5a3a, 0x4a2a4a, 0x7a6a5a].map(colorMat)
const brass = colorMat(0xb89a4a)
const wax = colorMat(0xe8dcb8)
const ash = colorMat(0x8a8684)
const charcoal = colorMat(0x22222a)
const flourSack = colorMat(0xd8d0bc)
const flourDust = colorMat(0xe8e2d4)
const grainMat = colorMat(0xc8a858)
const milk = colorMat(0xf0ece0)
const cheese = [colorMat(0xe8d080), colorMat(0xd8b860), colorMat(0xc89a48)]
const willow = mat(plainTex("thatch", 0.55, 0.3, 11, 16))

// ---------------------------------------------------------------- where a piece stands

/** A piece's footprint (tiles or m, whichever the caller draws in) and the way its front faces: 0 +z, 1 +x, 2 -z, 3 -x. */
export interface Spot {
  x: number
  z: number
  /** size along x and z */
  w: number
  d: number
  /** the floor under it */
  y: number
  face: 0 | 1 | 2 | 3
}

/**
 * Draws in the piece's own frame: u across its front (−W/2…W/2), v from its back (−D/2) to its
 * front (D/2), y up from the floor.
 */
export class Kit {
  readonly W: number
  readonly D: number
  /**
   * `scale` draws a small thing larger than life, to sit right in a room drawn half again as large
   * (W and D stay the footprint's own).
   */
  constructor(
    readonly gb: GB,
    readonly s: Spot,
    readonly scale = 1,
  ) {
    const side = s.face === 1 || s.face === 3
    this.W = (side ? s.d : s.w) / scale
    this.D = (side ? s.w : s.d) / scale
  }
  /** a point of the frame, in the world */
  at(u: number, v: number): [number, number] {
    const { x, z, face } = this.s
    u *= this.scale
    v *= this.scale
    return face === 0 ? [x + u, z + v] : face === 2 ? [x - u, z - v] : face === 1 ? [x + v, z - u] : [x - v, z + u]
  }
  box(side: THREE.Material, top: THREE.Material | null, u0: number, y0: number, v0: number, u1: number, y1: number, v1: number, r = 1) {
    const [ax, az] = this.at(u0, v0),
      [bx, bz] = this.at(u1, v1)
    const y = this.s.y,
      k = this.scale
    this.gb.box(side, top, Math.min(ax, bx), y + Math.min(y0, y1) * k, Math.min(az, bz), Math.max(ax, bx), y + Math.max(y0, y1) * k, Math.max(az, bz), r)
  }
  cyl(side: THREE.Material, top: THREE.Material | null, u: number, v: number, y0: number, y1: number, r0: number, r1 = r0, seg = 8) {
    const [x, z] = this.at(u, v)
    const k = this.scale
    this.gb.cyl(side, top, x, z, this.s.y + y0 * k, this.s.y + y1 * k, r0 * k, r1 * k, seg, 1)
  }
  /** four square legs, `inset` in from the corners */
  legs(m: THREE.Material, h: number, t = 0.05, inset = 0.04, W = this.W, D = this.D, v = 0) {
    for (const su of [-1, 1])
      for (const sv of [-1, 1]) {
        const u = su * (W / 2 - inset - t / 2),
          vv = v + sv * (D / 2 - inset - t / 2)
        this.box(m, null, u - t / 2, 0, vv - t / 2, u + t / 2, h, vv + t / 2)
      }
  }
  /** a slab: a table top, a shelf board, a seat */
  slab(m: THREE.Material, y: number, t: number, W = this.W, D = this.D, v = 0, u = 0) {
    this.box(m, m, u - W / 2, y, v - D / 2, u + W / 2, y + t, v + D / 2)
  }
}

type Builder = (k: Kit, wd: Wood, seed: number) => void

const r = (seed: number, n: number) => hash2(seed, n, 71)

// ---------------------------------------------------------------- beds and seats

function bed(k: Kit, wd: Wood, seed: number, child = false) {
  const { W, D } = k
  const h = child ? 0.32 : 0.4
  k.box(wd.dark, wd.top, -W / 2, 0, -D / 2, W / 2, child ? 0.75 : 1.0, -D / 2 + 0.06) // headboard
  k.box(wd.dark, wd.top, -W / 2, 0, D / 2 - 0.06, W / 2, child ? 0.6 : 0.62, D / 2) // footboard
  for (const s of [-1, 1]) k.box(wd.body, wd.top, s * W / 2 - 0.04, 0.12, -D / 2, s * W / 2 + (s < 0 ? 0.04 : 0) - (s > 0 ? 0 : 0), h, D / 2)
  if (wd.trim) k.box(wd.trim, null, -W * 0.25, 0.7, -D / 2 + 0.061, W * 0.25, 0.85, -D / 2 + 0.065)
  k.box(linen, linen, -W / 2 + 0.05, h, -D / 2 + 0.06, W / 2 - 0.05, h + 0.12, D / 2 - 0.06) // mattress
  // a pillow at the head, a quilt over the rest, turned back at the top
  const pw = W > 1.2 ? W / 2 - 0.1 : W - 0.2
  for (const pu of W > 1.2 ? [-W / 4, W / 4] : [0]) k.box(linen, linen, pu - pw / 2, h + 0.12, -D / 2 + 0.1, pu + pw / 2, h + 0.22, -D / 2 + 0.4)
  const q = cloth[Math.floor(r(seed, 1) * cloth.length)]
  k.box(q, q, -W / 2 + 0.03, h + 0.1, -D / 2 + 0.5, W / 2 - 0.03, h + 0.17, D / 2 - 0.08)
  k.box(q, null, -W / 2 + 0.02, h - 0.12, -D / 2 + 0.5, -W / 2 + 0.03, h + 0.17, D / 2 - 0.08) // hanging over the sides
  k.box(q, null, W / 2 - 0.03, h - 0.12, -D / 2 + 0.5, W / 2 - 0.02, h + 0.17, D / 2 - 0.08)
  if (child) for (const s of [-1, 1]) for (let t = 0; t < 5; t++) k.box(wd.dark, null, s * W / 2 - 0.02, h, -D / 2 + 0.3 + t * ((D - 0.6) / 4) - 0.02, s * W / 2 + 0.02, h + 0.3, -D / 2 + 0.3 + t * ((D - 0.6) / 4) + 0.02)
}

function chair(k: Kit, wd: Wood) {
  const s = Math.min(k.W, k.D) * 0.92
  k.legs(wd.dark, 0.44, 0.045, 0.02, s, s)
  k.slab(wd.top, 0.44, 0.05, s, s)
  // a ladder back of three rungs between two tall back posts
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (s / 2 - 0.045), 0.44, -s / 2, su * (s / 2 - 0.045) + (su < 0 ? 0.045 : -0.045) * -1, 0.98, -s / 2 + 0.045)
  for (const y of [0.62, 0.76, 0.9]) k.box(wd.body, null, -s / 2 + 0.04, y, -s / 2 + 0.005, s / 2 - 0.04, y + 0.05, -s / 2 + 0.04)
}

function settle(k: Kit, wd: Wood, seed: number) {
  // a bench with a back, a cushion along it
  const { W, D } = k
  for (const u of [-W / 2 + 0.05, 0, W / 2 - 0.05]) for (const v of [-D / 2 + 0.05, D / 2 - 0.05]) k.box(wd.dark, null, u - 0.03, 0, v - 0.03, u + 0.03, 0.42, v + 0.03)
  k.slab(wd.top, 0.42, 0.05)
  k.box(wd.body, wd.top, -W / 2, 0.47, -D / 2, W / 2, 0.92, -D / 2 + 0.05)
  if (wd.trim) k.box(wd.trim, null, -W * 0.3, 0.64, -D / 2 + 0.05, W * 0.3, 0.78, -D / 2 + 0.055)
  for (const s of [-1, 1]) k.box(wd.dark, wd.top, s * W / 2 - 0.04, 0.47, -D / 2, s * W / 2 + 0.0, 0.66, D / 2)
  const c = cloth[Math.floor(r(seed, 2) * cloth.length)]
  if (r(seed, 3) > 0.35) k.box(c, c, -W / 2 + 0.1, 0.47, -D / 2 + 0.07, -W / 2 + 0.1 + W * 0.45, 0.52, D / 2 - 0.04)
}

function rocker(k: Kit, wd: Wood, seed: number) {
  // a rocking chair by the fire: curved rockers (in three pieces), arms, a tall back, a blanket over it
  const { W, D } = k
  const s = W * 0.8
  for (const su of [-1, 1]) {
    const u = su * (s / 2 - 0.03)
    k.box(wd.dark, null, u - 0.025, 0.02, -D * 0.25, u + 0.025, 0.06, D * 0.25)
    k.box(wd.dark, null, u - 0.025, 0.05, -D * 0.45, u + 0.025, 0.09, -D * 0.25)
    k.box(wd.dark, null, u - 0.025, 0.05, D * 0.25, u + 0.025, 0.09, D * 0.45)
    for (const v of [-D * 0.2, D * 0.2]) k.box(wd.dark, null, u - 0.025, 0.04, v - 0.025, u + 0.025, 0.42, v + 0.025)
    k.box(wd.top, null, u - 0.03, 0.62, -D * 0.25, u + 0.03, 0.66, D * 0.25) // arm
    k.box(wd.dark, null, u - 0.025, 0.42, D * 0.2 - 0.025, u + 0.025, 0.62, D * 0.2 + 0.025)
  }
  k.slab(wd.top, 0.42, 0.05, s, D * 0.5)
  k.box(wd.body, wd.top, -s / 2, 0.47, -D * 0.25, s / 2, 1.15, -D * 0.25 + 0.05)
  const c = cloth[Math.floor(r(seed, 4) * cloth.length)]
  k.box(c, c, -s / 2 + 0.06, 0.6, -D * 0.25 + 0.05, s / 2 - 0.06, 1.12, -D * 0.25 + 0.08)
  k.box(c, c, -s / 2 + 0.06, 0.47, -D * 0.2, s / 2 - 0.06, 0.5, D * 0.15)
}

function cradle(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  for (const sv of [-1, 1]) k.box(wd.dark, null, -W / 2 + 0.04, 0, sv * (D / 2 - 0.06) - 0.03, W / 2 - 0.04, 0.06, sv * (D / 2 - 0.06) + 0.03) // the rockers, across
  k.box(wd.body, linen, -W / 2 + 0.05, 0.08, -D / 2 + 0.03, W / 2 - 0.05, 0.42, D / 2 - 0.03)
  k.box(wd.dark, wd.top, -W / 2 + 0.05, 0.08, -D / 2 + 0.03, W / 2 - 0.05, 0.6, -D / 2 + 0.07) // the hood end
  const c = cloth[Math.floor(r(seed, 5) * cloth.length)]
  k.box(c, c, -W / 2 + 0.08, 0.42, -D / 2 + 0.25, W / 2 - 0.08, 0.45, D / 2 - 0.07)
}

// ---------------------------------------------------------------- tables and desks

function diningTable(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  k.legs(wd.dark, 0.7, 0.07, 0.06)
  for (const sv of [-1, 1]) k.box(wd.dark, null, -W / 2 + 0.08, 0.58, sv * (D / 2 - 0.1) - 0.02, W / 2 - 0.08, 0.68, sv * (D / 2 - 0.1) + 0.02) // aprons
  k.box(wd.dark, null, -W / 2 + 0.12, 0.1, -0.03, W / 2 - 0.12, 0.16, 0.03) // stretcher
  k.slab(wd.top, 0.7, 0.06)
  // a runner, a jug and a bowl or two left on it
  if (r(seed, 6) > 0.4) k.box(linen, linen, -W * 0.3, 0.76, -D * 0.2, W * 0.3, 0.765, D * 0.2)
  k.cyl(clay, null, -W * 0.2, 0, 0.76, 0.92, 0.06, 0.05)
  k.cyl(glaze[Math.floor(r(seed, 7) * 4)], null, W * 0.15, D * 0.1, 0.76, 0.81, 0.06, 0.09)
}

function roundTable(k: Kit, wd: Wood) {
  const rr = Math.min(k.W, k.D) / 2
  k.cyl(wd.dark, null, 0, 0, 0, 0.06, rr * 0.5, rr * 0.45)
  k.cyl(wd.dark, null, 0, 0, 0.06, 0.68, 0.06, 0.06)
  k.cyl(wd.body, wd.top, 0, 0, 0.68, 0.74, rr, rr, 12)
  k.cyl(clay, null, rr * 0.3, 0, 0.74, 0.86, 0.05, 0.04)
}

function mapTable(k: Kit, wd: Wood) {
  diningTable(k, wd, 1)
  const { W, D } = k
  k.box(paper, paper, -W / 2 + 0.12, 0.765, -D / 2 + 0.1, W / 2 - 0.12, 0.768, D / 2 - 0.1)
  k.box(colorMat(0x6a8a6a), null, -W * 0.2, 0.768, -D * 0.15, W * 0.05, 0.771, D * 0.2) // the woods drawn on it
  k.box(colorMat(0x5a7a9a), null, W * 0.1, 0.768, -D * 0.35, W * 0.13, 0.771, D * 0.35) // the river
  for (const [u, v] of [
    [-W / 2 + 0.14, -D / 2 + 0.12],
    [W / 2 - 0.2, D / 2 - 0.16],
  ])
    k.box(M.stoneDark, null, u, 0.768, v, u + 0.06, 0.82, v + 0.05)
}

function desk(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  // a pedestal of drawers on one side, legs on the other, a slanted writing top
  k.box(wd.body, null, W / 2 - 0.38, 0, -D / 2, W / 2, 0.72, D / 2)
  for (let t = 0; t < 3; t++) {
    k.box(wd.dark, null, W / 2 - 0.35, 0.06 + t * 0.22, D / 2, W / 2 - 0.03, 0.24 + t * 0.22, D / 2 + 0.01)
    k.box(brass, null, W / 2 - 0.21, 0.14 + t * 0.22, D / 2 + 0.01, W / 2 - 0.17, 0.16 + t * 0.22, D / 2 + 0.03)
  }
  for (const v of [-D / 2 + 0.05, D / 2 - 0.05]) k.box(wd.dark, null, -W / 2 + 0.03, 0, v - 0.025, -W / 2 + 0.08, 0.72, v + 0.025)
  k.slab(wd.top, 0.72, 0.05)
  k.box(wd.dark, wd.top, -W / 2, 0.77, -D / 2, W / 2, 0.95, -D / 2 + 0.12) // a rack of pigeonholes at the back
  for (let t = 0; t < 4; t++) k.box(paper, null, -W / 2 + 0.1 + t * (W / 4), 0.8, -D / 2 + 0.11, -W / 2 + 0.2 + t * (W / 4), 0.9, -D / 2 + 0.125)
  // a ledger open, an inkwell, a candle
  k.box(paper, paper, -0.22, 0.77, -0.02, 0.18, 0.79, D / 2 - 0.1)
  k.box(books[Math.floor(r(seed, 8) * books.length)], null, -0.23, 0.765, -0.03, 0.19, 0.775, D / 2 - 0.09)
  k.cyl(M.dark, null, W / 2 - 0.2, D * 0.1, 0.77, 0.83, 0.03, 0.025)
  k.cyl(brass, null, -W / 2 + 0.15, 0, 0.77, 0.79, 0.05, 0.05)
  k.cyl(wax, null, -W / 2 + 0.15, 0, 0.79, 0.92, 0.015, 0.015, 6)
}

function sewingTable(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  k.legs(wd.dark, 0.72, 0.05)
  k.slab(wd.top, 0.72, 0.05)
  // cloth spread out, a pair of shears, a pincushion, a basket of thread
  const c = cloth[Math.floor(r(seed, 9) * cloth.length)]
  k.box(c, c, -W * 0.4, 0.77, -D * 0.3, W * 0.15, 0.785, D * 0.35)
  k.box(M.iron, null, W * 0.2, 0.77, -0.05, W * 0.32, 0.78, -0.02)
  k.cyl(cloth[0], null, W * 0.3, D * 0.2, 0.77, 0.81, 0.04, 0.03)
  k.cyl(willow, null, W * 0.35, -D * 0.25, 0.77, 0.86, 0.07, 0.09)
}

function prieDieu(k: Kit, wd: Wood) {
  // a prayer desk: a kneeler at the front, a slanted desk with the book of prayers on it
  const { W, D } = k
  k.box(wd.body, wd.top, -W / 2, 0, -D / 2, W / 2, 0.85, -D / 2 + 0.12)
  k.box(wd.top, wd.top, -W / 2 - 0.02, 0.85, -D / 2, W / 2 + 0.02, 0.9, -D / 2 + 0.3)
  k.box(wd.dark, cloth[0], -W / 2 + 0.03, 0, D / 2 - 0.22, W / 2 - 0.03, 0.15, D / 2 - 0.02) // kneeler
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.03) - 0.025, 0, -D / 2, su * (W / 2 - 0.03) + 0.025, 0.08, D / 2 - 0.02)
  k.box(books[0], paper, -0.14, 0.9, -D / 2 + 0.05, 0.14, 0.94, -D / 2 + 0.25)
  k.cyl(brass, null, W / 2 - 0.08, -D / 2 + 0.06, 0.9, 0.92, 0.04, 0.04)
  k.cyl(wax, null, W / 2 - 0.08, -D / 2 + 0.06, 0.92, 1.08, 0.015, 0.015, 6)
}

function workbench(k: Kit, wd: Wood, seed: number, kind: "bench" | "joiner" | "mend" = "bench") {
  const { W, D } = k
  k.legs(wd.dark, 0.82, 0.09, 0.05)
  for (const sv of [-1, 1]) k.box(wd.dark, null, -W / 2 + 0.1, 0.15, sv * (D / 2 - 0.1) - 0.03, W / 2 - 0.1, 0.22, sv * (D / 2 - 0.1) + 0.03)
  k.slab(wd.body, 0.18, 0.03, W - 0.2, D - 0.2) // a shelf below
  k.slab(wd.top, 0.82, 0.08)
  // a rack of tools on the back edge
  k.box(wd.dark, null, -W / 2 + 0.1, 0.9, -D / 2, W / 2 - 0.1, 0.94, -D / 2 + 0.06)
  for (let t = 0; t < 5; t++) k.box(t % 2 ? M.iron : wd.dark, null, -W / 2 + 0.2 + t * ((W - 0.4) / 4) - 0.015, 0.9, -D / 2 + 0.06, -W / 2 + 0.2 + t * ((W - 0.4) / 4) + 0.015, 1.12, -D / 2 + 0.08)
  if (kind === "joiner") {
    // a vice at the left end, a plank in it, shavings on the top
    k.box(wd.dark, null, -W / 2 - 0.06, 0.6, D / 2 - 0.3, -W / 2, 0.9, D / 2 - 0.05)
    k.box(M.iron, null, -W / 2 - 0.1, 0.78, D / 2 - 0.2, -W / 2 - 0.06, 0.82, D / 2 - 0.15)
    k.box(wd.top, null, -W / 2 + 0.1, 0.9, D / 2 - 0.25, W * 0.15, 0.95, D / 2 - 0.1)
    for (let t = 0; t < 4; t++) k.box(M.hay, null, W * 0.2 + r(seed, t) * W * 0.2, 0.9, -0.1 + r(seed, t + 9) * 0.2, W * 0.24 + r(seed, t) * W * 0.2, 0.91, -0.06 + r(seed, t + 9) * 0.2)
  } else if (kind === "mend") {
    // something being mended: a lantern with its glass out, a boot, small tools in a tray
    k.box(M.iron, glass, -W * 0.3, 0.9, -0.05, -W * 0.3 + 0.16, 1.1, 0.11)
    k.box(colorMat(0x3a2a24), null, 0, 0.9, 0, 0.26, 1.02, 0.1)
    k.box(wd.dark, M.iron, W * 0.2, 0.9, -0.1, W * 0.2 + 0.25, 0.94, 0.08)
  } else {
    k.box(M.iron, null, -0.1, 0.9, -0.05, 0.1, 0.94, 0.15)
    k.box(wd.top, null, W * 0.15, 0.9, 0.05, W * 0.35, 0.96, 0.25)
  }
}

function kitchen(k: Kit, wd: Wood, seed: number) {
  // the kitchen board: a stone sink with a jug of water, cupboards under it, a chopping board, a pot
  const { W, D } = k
  k.box(wd.body, null, -W / 2, 0, -D / 2, W / 2, 0.82, D / 2)
  for (let t = 0; t < 2; t++) {
    const u = -W / 2 + (t + 0.5) * (W / 2)
    k.box(wd.dark, null, u - W / 4 + 0.04, 0.08, D / 2, u + W / 4 - 0.04, 0.74, D / 2 + 0.015)
    k.box(M.iron, null, u - 0.02, 0.5, D / 2 + 0.015, u + 0.02, 0.56, D / 2 + 0.03)
  }
  k.box(wd.top, wd.top, -W / 2 - 0.02, 0.82, -D / 2, W / 2 + 0.02, 0.88, D / 2 + 0.03)
  k.box(M.stone, M.stoneDark, -W / 2 + 0.08, 0.86, -D / 2 + 0.08, -W / 2 + 0.55, 0.92, D / 2 - 0.08) // the sink
  k.cyl(clay, null, -W / 2 + 0.65, -D / 2 + 0.15, 0.88, 1.08, 0.07, 0.05)
  k.box(wd.top, null, 0, 0.88, -0.1, 0.35, 0.91, 0.15) // the chopping board
  k.box(colorMat(0xc87a3a), null, 0.08, 0.91, -0.02, 0.14, 0.95, 0.04)
  k.cyl(M.iron, M.dark, W / 2 - 0.2, 0, 0.88, 1.02, 0.12, 0.13, 8)
  if (r(seed, 4) > 0.5) k.box(linen, null, -W / 2 - 0.02, 0.55, D / 2 + 0.03, -W / 2 + 0.25, 0.82, D / 2 + 0.035) // a cloth over the edge
}

function alchemy(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  k.legs(wd.dark, 0.82, 0.07, 0.05)
  k.slab(wd.top, 0.82, 0.06)
  // a little brazier, a flask over it, a still's coil, jars of what is steeping, the mortar
  k.box(M.iron, null, -W / 2 + 0.15, 0.88, -0.12, -W / 2 + 0.4, 0.98, 0.12)
  k.box(colorMat(0xff8a3a), null, -W / 2 + 0.18, 0.98, -0.09, -W / 2 + 0.37, 0.99, 0.09)
  k.cyl(glass, null, -W / 2 + 0.27, 0, 0.99, 1.15, 0.08, 0.03)
  k.cyl(glass, null, -W / 2 + 0.27, 0, 1.15, 1.28, 0.02, 0.02, 6)
  k.box(brass, null, -W / 2 + 0.27, 1.26, -0.015, W * 0.05, 1.29, 0.015)
  k.cyl(brass, null, W * 0.05, 0, 0.88, 1.06, 0.08, 0.08)
  for (let t = 0; t < 4; t++) k.cyl(t % 2 ? glass : clay, null, W * 0.2 + t * 0.12, -D / 2 + 0.12, 0.88, 0.98 + r(seed, t) * 0.08, 0.045, 0.04, 6)
  k.cyl(M.stone, null, W / 2 - 0.15, D * 0.15, 0.88, 0.96, 0.07, 0.06)
}

function press(k: Kit, wd: Wood) {
  // a cider press: a slatted basket on a tray, a beam overhead and a great wooden screw
  const { W, D } = k
  k.box(wd.dark, wd.top, -W / 2, 0, -D / 2, W / 2, 0.45, D / 2)
  k.box(wd.top, null, -W / 2 + 0.04, 0.45, -D / 2 + 0.04, W / 2 - 0.04, 0.5, D / 2 - 0.04)
  for (let t = 0; t < 12; t++) {
    const a = (t / 12) * Math.PI * 2
    k.box(wd.body, null, Math.cos(a) * 0.32 - 0.03, 0.5, Math.sin(a) * 0.32 - 0.03, Math.cos(a) * 0.32 + 0.03, 0.95, Math.sin(a) * 0.32 + 0.03)
  }
  k.cyl(colorMat(0x8a6a3a), null, 0, 0, 0.5, 0.85, 0.3, 0.3, 10)
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.08) - 0.06, 0.45, -0.06, su * (W / 2 - 0.08) + 0.06, 1.7, 0.06)
  k.box(wd.dark, null, -W / 2 + 0.02, 1.55, -0.08, W / 2 - 0.02, 1.7, 0.08)
  k.cyl(wd.top, null, 0, 0, 0.95, 1.55, 0.06, 0.06)
  k.box(wd.top, null, -0.4, 1.05, -0.03, 0.4, 1.1, 0.03) // the bar to turn it
}

// ---------------------------------------------------------------- shelves, cases and counters

function frame(k: Kit, wd: Wood, h: number, boards: number[], back = true) {
  const { W, D } = k
  for (const su of [-1, 1]) k.box(wd.dark, wd.top, su * W / 2 - (su > 0 ? 0.05 : 0), 0, -D / 2, su * W / 2 + (su < 0 ? 0.05 : 0), h, D / 2)
  if (back) k.box(wd.body, null, -W / 2, 0, -D / 2, W / 2, h, -D / 2 + 0.03)
  for (const b of boards) k.box(wd.top, wd.top, -W / 2, b, -D / 2, W / 2, b + 0.035, D / 2)
  k.box(wd.dark, wd.top, -W / 2 - 0.03, h, -D / 2, W / 2 + 0.03, h + 0.05, D / 2 + 0.02)
}

/** A row of things along a board: what each is, given where it is and which one it is. */
function row(k: Kit, y: number, from: number, to: number, put: (u: number, i: number) => number) {
  let u = from
  for (let i = 0; u < to; i++) u += put(u, i)
}

function bookcase(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  const boards = [0.04, 0.45, 0.85, 1.25]
  frame(k, wd, 1.65, boards)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.06, W / 2 - 0.12, (u, j) => {
      const n = r(seed + i * 7, j)
      if (n > 0.9 && j > 0) return 0.12 // a gap
      const t = 0.04 + n * 0.04,
        hh = 0.26 + r(seed, i * 13 + j) * 0.1
      // now and then one lies on its side
      if (n < 0.06) k.box(books[j % books.length], books[j % books.length], u, b + 0.035, -D / 2 + 0.05, u + hh, b + 0.035 + t, D / 2 - 0.05)
      else k.box(books[(j + i) % books.length], paper, u, b + 0.035, -D / 2 + 0.05, u + t, b + 0.035 + hh, D / 2 - 0.04)
      return n < 0.06 ? hh + 0.01 : t + 0.005
    }),
  )
}

function pantry(k: Kit, wd: Wood, seed: number) {
  // jars and crocks of what was put by for the winter, a ham and a string of onions hung from the top
  const { W, D } = k
  const boards = [0.04, 0.5, 0.95, 1.4]
  frame(k, wd, 1.8, boards)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.1, W / 2 - 0.12, (u, j) => {
      const big = r(seed + i, j) > 0.6
      const rr = big ? 0.09 : 0.06
      k.cyl(big ? clay : (glaze[(i + j) % glaze.length] ?? clay), big ? M.dark : linen, u + rr, 0, b + 0.035, b + 0.035 + (big ? 0.3 : 0.2), rr, rr * 0.85, 7)
      return rr * 2 + 0.04
    }),
  )
  k.box(colorMat(0x8a4a3a), null, W / 2 - 0.3, 1.45, D / 2 - 0.06, W / 2 - 0.16, 1.75, D / 2)
}

function toolShelf(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  const boards = [0.04, 0.6, 1.15]
  frame(k, wd, 1.6, boards)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.08, W / 2 - 0.1, (u, j) => {
      const n = r(seed + i * 3, j)
      if (n < 0.3) k.box(wd.dark, M.iron, u, b + 0.035, -D / 2 + 0.06, u + 0.28, b + 0.12, D / 2 - 0.06) // a tool box
      else if (n < 0.6) k.cyl(M.iron, M.dark, u + 0.08, 0, b + 0.035, b + 0.2, 0.08, 0.08, 7) // a pot of nails
      else k.box(M.rope, null, u, b + 0.035, -0.08, u + 0.2, b + 0.13, 0.08) // a coil of cord
      return n < 0.3 ? 0.32 : 0.22
    }),
  )
}

function pigeonholes(k: Kit, wd: Wood, seed: number) {
  // a case of pigeonholes for papers: rolled and folded, tied with tape
  const { W, D } = k
  const h = 1.8
  frame(k, wd, h, [0.04, 0.4, 0.75, 1.1, 1.45])
  const cols = Math.max(3, Math.round(W / 0.3))
  for (let c = 1; c < cols; c++) {
    const u = -W / 2 + (c * W) / cols
    k.box(wd.dark, null, u - 0.015, 0.04, -D / 2, u + 0.015, h, D / 2)
  }
  for (let rr = 0; rr < 5; rr++)
    for (let c = 0; c < cols; c++) {
      if (r(seed + rr, c) < 0.2) continue
      const u = -W / 2 + ((c + 0.5) * W) / cols,
        b = [0.04, 0.4, 0.75, 1.1, 1.45][rr] + 0.035
      k.box(paper, paper, u - W / cols / 2 + 0.04, b, -D / 2 + 0.05, u + W / cols / 2 - 0.04, b + 0.08 + r(seed, rr * 9 + c) * 0.12, D / 2 - 0.04)
    }
}

function medicineCase(k: Kit, wd: Wood, seed: number) {
  // little drawers below with brass pulls, bottles in rows above
  const { W, D } = k
  const h = 1.9
  frame(k, wd, h, [0.04, 0.85, 1.25, 1.6])
  const cols = Math.max(3, Math.round(W / 0.25))
  for (let rr = 0; rr < 4; rr++)
    for (let c = 0; c < cols; c++) {
      const u0 = -W / 2 + 0.05 + (c * (W - 0.1)) / cols,
        u1 = u0 + (W - 0.1) / cols - 0.02
      const y0 = 0.08 + rr * 0.19
      k.box(wd.body, null, u0, y0, D / 2 - 0.02, u1, y0 + 0.17, D / 2)
      k.box(brass, null, (u0 + u1) / 2 - 0.02, y0 + 0.07, D / 2, (u0 + u1) / 2 + 0.02, y0 + 0.1, D / 2 + 0.02)
    }
  for (const b of [0.85, 1.25, 1.6])
    row(k, b, -W / 2 + 0.08, W / 2 - 0.1, (u, j) => {
      const g = [glass, glaze[0], glaze[3], clay][Math.floor(r(seed + b * 10, j) * 4)]
      k.cyl(g, M.dark, u + 0.04, 0, b + 0.035, b + 0.035 + 0.14 + r(seed, j) * 0.1, 0.04, 0.035, 6)
      return 0.1
    })
}

function crockery(k: Kit, wd: Wood, seed: number) {
  // a dresser of pots and bowls, the potter's own, plates stood up along the back
  const { W, D } = k
  const boards = [0.04, 0.55, 1.0, 1.4]
  frame(k, wd, 1.75, boards)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.08, W / 2 - 0.1, (u, j) => {
      const g = glaze[(i + j + Math.floor(r(seed, j) * 3)) % glaze.length]
      if (i >= 2) {
        k.box(g, g, u, b + 0.035, -D / 2 + 0.04, u + 0.03, b + 0.3, -D / 2 + 0.07) // a plate stood up
        k.cyl(g, null, u + 0.12, 0.05, b + 0.035, b + 0.11, 0.06, 0.09, 8) // a bowl
        return 0.25
      }
      k.cyl(g, M.dark, u + 0.1, 0, b + 0.035, b + 0.3 + r(seed, j + i) * 0.1, 0.07, 0.1, 8)
      return 0.24
    }),
  )
}

function bowShelf(k: Kit, wd: Wood) {
  // bows strung and unstrung stood in a row, arrows in a pot
  const { W, D } = k
  frame(k, wd, 1.7, [0.04, 1.2], true)
  for (let t = 0; t < Math.floor(W / 0.18); t++) {
    const u = -W / 2 + 0.15 + t * 0.18
    k.box(wd.dark, null, u - 0.015, 0.08, -D / 2 + 0.08, u + 0.015, 1.6, -D / 2 + 0.12)
    k.box(M.linen, null, u + 0.03, 0.12, -D / 2 + 0.08, u + 0.035, 1.55, -D / 2 + 0.1)
  }
  k.cyl(clay, null, W / 2 - 0.15, 0.05, 0.04, 0.35, 0.09, 0.09)
  for (let t = 0; t < 6; t++) k.box(wd.top, null, W / 2 - 0.2 + (t % 3) * 0.04, 0.35, 0.02 + Math.floor(t / 3) * 0.04, W / 2 - 0.19 + (t % 3) * 0.04, 0.75, 0.03 + Math.floor(t / 3) * 0.04)
}

function vitrine(k: Kit, wd: Wood, seed: number) {
  // a glass-fronted case with a lock, small precious things on blue cloth
  const { W, D } = k
  k.box(wd.body, wd.top, -W / 2, 0, -D / 2, W / 2, 0.75, D / 2)
  k.box(wd.dark, null, -W / 2, 0.75, -D / 2, -W / 2 + 0.05, 1.05, D / 2)
  k.box(wd.dark, null, W / 2 - 0.05, 0.75, -D / 2, W / 2, 1.05, D / 2)
  k.box(wd.dark, wd.top, -W / 2, 1.05, -D / 2, W / 2, 1.1, D / 2)
  k.box(cloth[1], null, -W / 2 + 0.05, 0.75, -D / 2 + 0.03, W / 2 - 0.05, 0.76, D / 2 - 0.03)
  for (let t = 0; t < 5; t++) k.cyl(t % 2 ? brass : glass, null, -W / 2 + 0.2 + t * ((W - 0.4) / 4), 0, 0.76, 0.8 + r(seed, t) * 0.05, 0.04, 0.04, 6)
  k.box(glass, null, -W / 2 + 0.05, 0.76, D / 2 - 0.02, W / 2 - 0.05, 1.05, D / 2) // the glass
  k.box(brass, null, -0.03, 0.55, D / 2, 0.03, 0.62, D / 2 + 0.02)
}

function counter(k: Kit, wd: Wood, seed: number, ledger = false) {
  const { W, D } = k
  k.box(wd.body, null, -W / 2, 0, -D / 2, W / 2, 0.6, D / 2)
  for (let t = 1; t < Math.round(W / 0.6); t++) k.box(wd.dark, null, -W / 2 + t * (W / Math.round(W / 0.6)) - 0.03, 0.05, D / 2, -W / 2 + t * (W / Math.round(W / 0.6)) + 0.03, 0.57, D / 2 + 0.015)
  if (wd.trim) k.box(wd.trim, null, -W / 2 + 0.1, 0.25, D / 2, W / 2 - 0.1, 0.35, D / 2 + 0.01)
  k.box(wd.top, wd.top, -W / 2 - 0.04, 0.6, -D / 2 - 0.02, W / 2 + 0.04, 0.66, D / 2 + 0.05)
  if (ledger) {
    k.box(books[Math.floor(r(seed, 1) * books.length)], paper, -0.2, 0.66, -0.12, 0.2, 0.69, 0.15)
    k.cyl(M.dark, null, 0.32, -0.05, 0.66, 0.71, 0.03, 0.025)
    k.box(wd.dark, brass, -W / 2 + 0.1, 0.66, -0.1, -W / 2 + 0.4, 0.72, 0.12) // the cash box
  }
}

function bigScales(k: Kit, wd: Wood) {
  // a great beam scale on a post, its pans on chains, a box of weights beside it
  const { W, D } = k
  k.box(wd.body, wd.top, -W / 2, 0, -D / 2, W / 2, 0.75, D / 2)
  k.box(wd.dark, null, -0.05, 0.75, -0.05, 0.05, 1.7, 0.05)
  k.box(M.iron, null, -W / 2 + 0.08, 1.65, -0.02, W / 2 - 0.08, 1.7, 0.02)
  for (const su of [-1, 1]) {
    const u = su * (W / 2 - 0.15)
    for (const dv of [-0.1, 0.1]) k.box(M.iron, null, u + dv * 0.3 - 0.005, 1.0, dv - 0.005, u + dv * 0.3 + 0.005, 1.66, dv + 0.005)
    k.cyl(brass, null, u, 0, 0.97, 1.0, 0.16, 0.16, 10)
  }
  for (let t = 0; t < 4; t++) k.cyl(brass, null, -0.08 + t * 0.06, D / 2 - 0.12, 0.75, 0.79 + t * 0.015, 0.025 + t * 0.005, 0.025 + t * 0.005, 6)
}

function wardrobeChest(k: Kit, wd: Wood, seed: number) {
  // a chest for clothes: a lid, iron straps and a lock; a painted one has a panel of flowers
  const { W, D } = k
  k.box(wd.dark, null, -W / 2 + 0.03, 0, -D / 2 + 0.03, W / 2 - 0.03, 0.08, D / 2 - 0.03)
  k.box(wd.body, null, -W / 2, 0.08, -D / 2, W / 2, 0.55, D / 2)
  k.box(wd.top, wd.top, -W / 2 - 0.02, 0.55, -D / 2 - 0.02, W / 2 + 0.02, 0.62, D / 2 + 0.02)
  if (wd.trim) {
    for (const su of [-1, 1]) k.box(wd.trim, null, su * W * 0.25 - W * 0.17, 0.18, D / 2, su * W * 0.25 + W * 0.17, 0.48, D / 2 + 0.005)
    for (const su of [-1, 1]) k.box(cloth[Math.floor(r(seed, 3 + su) * cloth.length)], null, su * W * 0.25 - 0.05, 0.28, D / 2 + 0.005, su * W * 0.25 + 0.05, 0.38, D / 2 + 0.01)
  } else for (const t of [-0.32, 0.32]) k.box(M.iron, M.iron, t * W - 0.025, 0.08, -D / 2 - 0.01, t * W + 0.025, 0.63, D / 2 + 0.01)
  k.box(M.iron, null, -0.05, 0.42, D / 2, 0.05, 0.54, D / 2 + 0.02)
  if (r(seed, 8) > 0.6) k.box(linen, linen, -W * 0.3, 0.62, -D * 0.3, W * 0.1, 0.66, D * 0.3) // a folded shirt left on it
}

function strongbox(k: Kit) {
  // iron all over, rivets in rows, a great lock
  const { W, D } = k
  k.box(M.iron, M.iron, -W / 2, 0, -D / 2, W / 2, 0.55, D / 2)
  k.box(M.dark, null, -W / 2 - 0.01, 0.4, -D / 2 - 0.01, W / 2 + 0.01, 0.42, D / 2 + 0.01)
  for (const t of [-0.3, 0, 0.3]) k.box(M.stoneDark, null, t * W - 0.03, 0, D / 2, t * W + 0.03, 0.55, D / 2 + 0.01)
  k.box(brass, null, -0.07, 0.2, D / 2 + 0.01, 0.07, 0.36, D / 2 + 0.03)
}

function lidBox(k: Kit, wd: Wood, seed: number, kind: "materials" | "flour" | "tinker" | "crate") {
  const { W, D } = k
  const h = kind === "flour" ? 0.75 : kind === "tinker" ? 0.4 : 0.55
  k.box(wd.body, null, -W / 2, 0, -D / 2, W / 2, h, D / 2)
  for (const t of [0.15, 0.85]) k.box(wd.dark, null, -W / 2 - 0.01, h * t - 0.025, -D / 2 - 0.01, W / 2 + 0.01, h * t + 0.025, D / 2 + 0.01)
  if (kind === "flour") {
    // a bin with a sloped lid, propped open, flour inside
    k.box(colorMat(0xe8e0d0), null, -W / 2 + 0.04, h - 0.1, -D / 2 + 0.04, W / 2 - 0.04, h - 0.02, D / 2 - 0.04)
    k.box(wd.top, wd.top, -W / 2, h, -D / 2 - 0.02, W / 2, h + 0.35, -D / 2 + 0.03)
    k.cyl(wd.dark, null, W / 2 - 0.15, 0, h - 0.02, h + 0.02, 0.06, 0.06) // a scoop
  } else if (kind === "materials") {
    // half open: what is in it shows (cut leather, ingots, twigs)
    k.box(wd.top, wd.top, -W / 2, h, -D / 2, W / 2, h + 0.04, 0)
    k.box(M.iron, null, -W * 0.3, h - 0.05, 0.05, -W * 0.05, h + 0.02, D / 2 - 0.06)
    k.box(colorMat(0x6a4632), null, 0, h - 0.05, 0.05, W * 0.35, h + 0.03, D / 2 - 0.05)
  } else if (kind === "tinker") {
    // a tinker's box, its tray lifted out: files, a soldering iron, little pots
    k.box(wd.top, wd.top, -W / 2, h, -D / 2, W / 2, h + 0.03, D / 2)
    k.box(wd.dark, null, -0.03, h + 0.03, -D / 2, 0.03, h + 0.2, D / 2)
    k.box(wd.dark, null, -0.15, h + 0.17, -0.02, 0.15, h + 0.2, 0.02) // the handle
    for (let t = 0; t < 3; t++) k.box(M.iron, null, W * 0.15 + t * 0.06, h + 0.03, -D * 0.3, W * 0.15 + t * 0.06 + 0.02, h + 0.05, D * 0.3)
  } else {
    k.box(wd.top, wd.top, -W / 2, h, -D / 2, W / 2, h + 0.03, D / 2)
    if (r(seed, 2) > 0.5) crateTop(k, h + 0.03)
  }
}

const crateTop = (k: Kit, y: number) => k.box(M.sack, M.sack, -0.15, y, -0.12, 0.15, y + 0.22, 0.12)

// ---------------------------------------------------------------- vessels

function cask(k: Kit, wd: Wood, seed: number, onCradle = false, tall = 0.95) {
  const rr = onCradle ? Math.min(k.D * 0.34, k.W * 0.3) : Math.min(k.W, k.D) / 2 - 0.04
  if (onCradle) {
    // a cask on its side on a cradle, with a tap and a cup under it
    for (const sv of [-1, 1]) k.box(wd.dark, null, -k.W / 2 + 0.05, 0, sv * rr * 0.6 - 0.04, k.W / 2 - 0.05, 0.12, sv * rr * 0.6 + 0.04)
    const L = k.W - 0.1
    // lying on its side: an eight-sided section, fuller in the middle than at the ends
    const cy = 0.12 + rr
    const section = (m: THREE.Material, u0: number, u1: number, R: number) => {
      k.box(m, null, u0, cy - R * 0.4, -R, u1, cy + R * 0.4, R)
      k.box(m, null, u0, cy - R, -R * 0.4, u1, cy + R, R * 0.4)
      k.box(m, null, u0, cy - R * 0.72, -R * 0.72, u1, cy + R * 0.72, R * 0.72)
    }
    const n = 5
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n - 0.5
      section(wd.body, -L / 2 + (i * L) / n, -L / 2 + ((i + 1) * L) / n, rr * (1 - t * t * 0.5))
    }
    for (const u of [-L / 2 + 0.06, L / 2 - 0.1]) section(M.iron, u, u + 0.04, rr * 0.93 + 0.012)
    k.box(brass, null, -L / 2 - 0.1, cy - 0.15, -0.02, -L / 2, cy - 0.11, 0.02) // the tap, in the head
    k.cyl(clay, null, -L / 2 - 0.08, 0, 0, 0.08, 0.04, 0.035, 6)
    return
  }
  const h = tall * (0.92 + r(seed, 1) * 0.12)
  k.cyl(wd.body, wd.top, 0, 0, 0, h * 0.5, rr * 0.88, rr, 10)
  k.cyl(wd.body, wd.top, 0, 0, h * 0.5, h, rr, rr * 0.88, 10)
  for (const t of [0.12, 0.5, 0.88]) k.cyl(M.iron, null, 0, 0, h * t - 0.025, h * t + 0.025, rr * (t === 0.5 ? 1 : 0.9) + 0.012, rr * (t === 0.5 ? 1 : 0.9) + 0.012, 10)
}

function tub(k: Kit, wd: Wood, seed: number, what: "fish" | "wash" | "lye" | "tan" | "water" | "glaze" | "tea" | "oil" | "wax" | "milk") {
  const rr = Math.min(k.W, k.D) / 2 - 0.03
  if (what === "water" || what === "glaze" || what === "tea" || what === "oil") {
    // an earthen jar: wide in the middle, narrow at the mouth, a wooden lid or a cloth tied over
    const h = what === "tea" ? 0.35 : what === "oil" ? 0.5 : 0.65
    const m = what === "glaze" ? glaze[Math.floor(r(seed, 1) * 4)] : clay
    k.cyl(m, null, 0, 0, 0, h * 0.55, rr * 0.7, rr, 10)
    k.cyl(m, null, 0, 0, h * 0.55, h, rr, rr * 0.55, 10)
    k.cyl(what === "tea" ? linen : wd.top, what === "tea" ? linen : wd.top, 0, 0, h, h + 0.03, rr * 0.6, rr * 0.6, 10)
    if (what === "water") k.cyl(wd.dark, null, rr * 0.3, 0, h + 0.03, h + 0.06, 0.06, 0.06) // a dipper
    return
  }
  if (what === "wax") {
    // the chandler's pot on a little stove, wax in it, candles dipped and hung to dry on a rod above
    k.box(M.stoneDark, M.stone, -rr, 0, -rr, rr, 0.45, rr)
    k.box(colorMat(0xff8a3a), null, -0.12, 0.08, rr, 0.12, 0.25, rr + 0.005)
    k.cyl(M.iron, wax, 0, 0, 0.45, 0.75, rr * 0.7, rr * 0.75, 10)
    k.box(wd.dark, null, -rr, 1.35, -0.02, rr, 1.39, 0.02)
    for (let t = 0; t < 6; t++) k.cyl(wax, null, -rr + 0.12 + t * ((rr * 2 - 0.24) / 5), 0, 1.0, 1.35, 0.015, 0.012, 5)
    return
  }
  const h = what === "tan" ? 0.8 : what === "fish" ? 0.45 : 0.55
  k.cyl(wd.body, null, 0, 0, 0, h, rr * 0.9, rr, 12)
  for (const t of [0.2, 0.8]) k.cyl(M.iron, null, 0, 0, h * t - 0.02, h * t + 0.02, rr + 0.01, rr + 0.01, 12)
  const liquid = what === "milk" ? milk : what === "fish" ? M.water : what === "wash" ? colorMat(0x9aa8b0) : what === "lye" ? colorMat(0x6a6058) : colorMat(0x5a3a28)
  k.cyl(liquid, liquid, 0, 0, h - 0.12, h - 0.06, rr - 0.03, rr - 0.03, 12)
  if (what === "wash") k.box(wd.top, null, rr * 0.2, h - 0.2, -0.15, rr * 0.3, h + 0.25, 0.15) // the washboard leaned in it
  if (what === "fish") for (let t = 0; t < 3; t++) k.box(colorMat(0x8a9aa8), null, -0.12 + t * 0.08, h - 0.07, -0.04, -0.06 + t * 0.08, h - 0.05, 0.12)
  if (what === "tan") k.box(colorMat(0x6a4632), null, -rr * 0.6, h - 0.06, -0.05, rr * 0.9, h + 0.02, 0.15) // a hide over the rim
  if (what === "lye") k.cyl(ash, null, rr * 1.1, rr * 0.4, 0, 0.12, 0.12, 0.08) // the ash it is made from
}

// ---------------------------------------------------------------- crafts

/** A spoked wheel standing across the frame at `u`: its rim in short pieces, spokes to the hub. */
function wheel(k: Kit, rim: THREE.Material, spoke: THREE.Material, u: number, cy: number, R: number, t = 0.03, n = 28) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const v = Math.cos(a) * R,
      y = cy + Math.sin(a) * R
    k.box(rim, null, u - t / 2, y - 0.025, v - 0.025, u + t / 2, y + 0.025, v + 0.025)
    if (i % 4 === 0) for (let q = 1; q < 6; q++) k.box(spoke, null, u - t / 4, cy + Math.sin(a) * R * (q / 6) - 0.01, Math.cos(a) * R * (q / 6) - 0.01, u + t / 4, cy + Math.sin(a) * R * (q / 6) + 0.01, Math.cos(a) * R * (q / 6) + 0.01)
  }
  k.cyl(spoke, null, u, 0, cy - 0.03, cy + 0.03, 0.04, 0.04, 6)
}

function loom(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  for (const su of [-1, 1])
    for (const sv of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.04) - 0.04, 0, sv * (D / 2 - 0.04) - 0.04, su * (W / 2 - 0.04) + 0.04, sv < 0 ? 1.55 : 0.9, sv * (D / 2 - 0.04) + 0.04)
  k.box(wd.dark, null, -W / 2, 1.5, -D / 2, W / 2, 1.56, -D / 2 + 0.08) // the top beam
  k.box(wd.dark, null, -W / 2, 0.85, D / 2 - 0.08, W / 2, 0.92, D / 2) // the breast beam
  // the warp running from the back beam to the front, the cloth woven so far wound on the front
  const c = cloth[Math.floor(r(seed, 1) * cloth.length)]
  k.box(linen, null, -W / 2 + 0.12, 0.9, -D / 2 + 0.1, W / 2 - 0.12, 0.92, D / 2 - 0.3)
  k.box(c, null, -W / 2 + 0.12, 0.9, D / 2 - 0.35, W / 2 - 0.12, 0.93, D / 2 - 0.09)
  k.cyl(c, null, 0, D / 2 - 0.05, 0.6, 0.85, 0.08, 0.08) // the roll (stands for the cloth beam)
  k.box(wd.top, null, -W / 2 + 0.06, 1.0, -0.05, W / 2 - 0.06, 1.35, 0.0) // the heddles
  k.box(wd.top, null, -W / 2 + 0.1, 0.4, D / 2 + 0.05, W / 2 - 0.1, 0.45, D / 2 + 0.35) // the bench
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.12) - 0.03, 0, D / 2 + 0.17, su * (W / 2 - 0.12) + 0.03, 0.4, D / 2 + 0.23)
}

function spinningWheel(k: Kit, wd: Wood) {
  const { W, D } = k
  // a slanted bench on three legs, the great wheel at one end, the flyer and a tuft of wool at the other
  for (const [u, v] of [
    [-W * 0.3, -D * 0.35],
    [-W * 0.3, D * 0.35],
    [W * 0.3, 0],
  ])
    k.box(wd.dark, null, u - 0.025, 0, v - 0.025, u + 0.025, 0.42, v + 0.025)
  k.box(wd.top, wd.top, -W * 0.35, 0.4, -D * 0.4, W * 0.35, 0.46, D * 0.4)
  const R = Math.min(0.32, D * 0.36),
    cy = 0.46 + R + 0.12
  for (const su of [-1, 1]) k.box(wd.dark, null, -W * 0.15 + su * 0.04 - 0.015, 0.46, -0.015, -W * 0.15 + su * 0.04 + 0.015, cy + 0.02, 0.015)
  wheel(k, wd.body, wd.dark, -W * 0.15, cy, R)
  k.box(wd.dark, null, W * 0.15, 0.46, -0.02, W * 0.2, 0.75, 0.02)
  k.cyl(M.wool, null, W * 0.25, 0, 0.72, 0.8, 0.05, 0.03)
  k.box(wd.dark, null, -W * 0.1, 0.02, D * 0.2, W * 0.1, 0.05, D * 0.35) // the treadle
}

function pottersWheel(k: Kit, wd: Wood, seed: number) {
  const { W, D } = k
  k.box(wd.top, wd.top, -W / 2 + 0.05, 0.4, D / 2 - 0.3, W / 2 - 0.05, 0.45, D / 2 - 0.05) // the seat
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.1) - 0.03, 0, D / 2 - 0.2, su * (W / 2 - 0.1) + 0.03, 0.4, D / 2 - 0.14)
  k.cyl(M.stoneDark, null, 0, -0.05, 0.05, 0.15, 0.35, 0.35, 12) // the kick wheel
  k.cyl(wd.dark, null, 0, -0.05, 0.15, 0.62, 0.03, 0.03)
  k.cyl(wd.body, wd.top, 0, -0.05, 0.62, 0.66, 0.18, 0.18, 12)
  k.cyl(clay, null, 0, -0.05, 0.66, 0.66 + 0.12 + r(seed, 1) * 0.1, 0.08, 0.06, 10) // a pot half thrown
  k.cyl(M.water, null, W / 2 - 0.12, -D / 2 + 0.14, 0, 0.18, 0.09, 0.1, 8)
}

function anvil(k: Kit) {
  // a smith's anvil on its stump
  k.cyl(M.woodDark, M.wood, 0, 0, 0, 0.5, 0.25, 0.27, 9)
  k.box(M.iron, M.iron, -0.12, 0.5, -0.1, 0.12, 0.62, 0.1)
  k.box(M.iron, M.iron, -0.28, 0.62, -0.09, 0.22, 0.76, 0.09)
  k.box(M.iron, M.iron, 0.22, 0.66, -0.05, 0.36, 0.74, 0.05) // the horn
}

function kiln(k: Kit) {
  const { W, D } = k
  k.box(M.stoneDark, M.stone, -W / 2, 0, -D / 2, W / 2, 1.1, D / 2, 2)
  k.cyl(M.stone, null, 0, -0.1, 1.1, 1.5, Math.min(W, D) * 0.4, Math.min(W, D) * 0.25, 10)
  k.box(M.dark, null, -0.25, 0.1, D / 2, 0.25, 0.55, D / 2 + 0.01)
  k.box(colorMat(0xff8a3a), null, -0.18, 0.1, D / 2 + 0.01, 0.18, 0.25, D / 2 + 0.015)
}

// ---------------------------------------------------------------- baskets, bundles and racks

function basketOf(k: Kit, seed: number, what: "veg" | "fruit" | "yarn" | "unfinished") {
  const rr = Math.min(k.W, k.D) / 2 - 0.04
  const h = what === "unfinished" ? 0.25 : 0.35
  k.cyl(willow, null, 0, 0, 0, h, rr * 0.8, rr, 9)
  if (what === "unfinished") {
    for (let t = 0; t < 12; t++) {
      const a = (t / 12) * Math.PI * 2
      k.box(willow, null, Math.cos(a) * rr - 0.008, h, Math.sin(a) * rr - 0.008, Math.cos(a) * rr * 1.1 + 0.008, h + 0.35, Math.sin(a) * rr * 1.1 + 0.008)
    }
    return
  }
  const colours =
    what === "veg" ? [colorMat(0xc87a3a), colorMat(0x6a8a4a), colorMat(0xd8c8a8)] : what === "fruit" ? [colorMat(0xa83a3a), colorMat(0x8aa83a), colorMat(0x6a3a6a)] : cloth.slice(0, 4)
  for (let t = 0; t < 7; t++) {
    const a = r(seed, t) * Math.PI * 2,
      d = r(seed, t + 7) * rr * 0.6
    const s = what === "yarn" ? 0.07 : 0.055
    k.cyl(colours[t % colours.length], colours[t % colours.length], Math.cos(a) * d, Math.sin(a) * d, h - 0.04, h + s, s, s * 0.7, 6)
  }
}

function sacks(k: Kit, seed: number, what: "wool" | "ash" | "flour" | "grain" | "charcoal") {
  if (what === "charcoal") {
    // straw bales of charcoal, lumps showing at the open tops, black dust on the floor
    const n = Math.max(1, Math.round(k.W / 0.34))
    for (let t = 0; t < n; t++) {
      const u = -k.W / 2 + (t + 0.5) * (k.W / n)
      const h = 0.5 + r(seed, t) * 0.12
      k.cyl(M.hay, M.hay, u, 0, 0, h, 0.15, 0.16, 7)
      for (const y of [0.15, h - 0.12]) k.cyl(M.rope, null, u, 0, y, y + 0.04, 0.165, 0.165, 7)
      for (let q = 0; q < 3; q++) k.box(charcoal, null, u - 0.08 + q * 0.05, h, -0.04 + (q % 2) * 0.05, u - 0.04 + q * 0.05, h + 0.05, 0.0 + (q % 2) * 0.05)
    }
    k.box(charcoal, null, -k.W / 2, 0, k.D / 2 - 0.12, k.W / 2 - 0.1, 0.005, k.D / 2)
    return
  }
  // flour and grain stacked two deep, a smaller layer laid across the top
  const n = Math.max(1, Math.round(k.W / 0.4))
  const layers = what === "flour" || what === "grain" ? 2 : 1
  for (let l = 0; l < layers; l++)
    for (let t = 0; t < n - l; t++) {
      const u = -k.W / 2 + (t + 0.5 + l * 0.5) * (k.W / n)
      const y = l * 0.42
      const h = 0.45 + r(seed, t + l * 7) * 0.15
      const m = what === "wool" ? M.wool : what === "flour" ? flourSack : M.sack
      k.cyl(m, m, u, 0, y, y + h * 0.75, 0.17, 0.19, 7)
      k.cyl(m, m, u, 0, y + h * 0.75, y + h, 0.19, 0.07, 7)
      k.cyl(M.rope, null, u, 0, y + h - 0.06, y + h - 0.02, 0.08, 0.08, 6)
      if (what === "ash") k.cyl(ash, null, u + 0.2, 0.05, 0, 0.03, 0.08, 0.04, 6)
      if (what === "grain" && l === 0 && t === 0) k.cyl(grainMat, null, u + 0.22, 0.08, 0, 0.04, 0.1, 0.05, 6) // spilt from a seam
    }
  if (what === "flour") k.box(flourDust, null, -k.W / 2, 0, -k.D / 2, k.W / 2, 0.004, k.D / 2 + 0.1)
}

function cheeseShelf(k: Kit, wd: Wood, seed: number) {
  // wheels of cheese turned on the boards to ripen, the youngest palest, a cloth over the top row
  const { W } = k
  const boards = [0.04, 0.45, 0.85, 1.25]
  frame(k, wd, 1.6, boards, false)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.08, W / 2 - 0.1, (u) => {
      const rr = 0.11 + r(seed + i, Math.round(u * 10)) * 0.03
      k.cyl(i === 3 ? linen : cheese[i % cheese.length], cheese[i % cheese.length], u + rr, 0, b + 0.035, b + 0.035 + 0.1, rr, rr, 10)
      return rr * 2 + 0.05
    }),
  )
}

function churn(k: Kit, wd: Wood) {
  // a tall staved churn, narrower at the top, the dasher standing up through its lid
  k.cyl(wd.body, null, 0, 0, 0, 0.75, 0.17, 0.13, 10)
  for (const y of [0.1, 0.4, 0.68]) k.cyl(M.iron, null, 0, 0, y, y + 0.03, 0.175 - y * 0.05, 0.175 - y * 0.05, 10)
  k.cyl(wd.top, wd.top, 0, 0, 0.75, 0.78, 0.14, 0.14, 10)
  k.box(wd.dark, null, -0.015, 0.78, -0.015, 0.015, 1.15, 0.015)
  k.box(wd.dark, null, -0.08, 1.12, -0.015, 0.08, 1.15, 0.015)
}

function bundles(k: Kit, seed: number, what: "willow" | "timber" | "logs") {
  const { W, D } = k
  if (what === "willow") {
    for (let t = 0; t < 3; t++) {
      const u = -W / 2 + 0.17 + t * ((W - 0.34) / 2)
      for (let s = 0; s < 6; s++) k.box(willow, null, u - 0.06 + s * 0.02, 0, -0.06 + (s % 3) * 0.04, u - 0.05 + s * 0.02, 1.2 + r(seed, s) * 0.2, -0.05 + (s % 3) * 0.04)
      k.cyl(M.rope, null, u, 0, 0.5, 0.55, 0.08, 0.08, 6)
    }
    return
  }
  const L = W - 0.05
  const layers = what === "timber" ? 4 : 3
  for (let l = 0; l < layers; l++) {
    const across = Math.floor((D - 0.05) / (what === "timber" ? 0.2 : 0.16))
    for (let t = 0; t < across - (what === "logs" ? l : 0); t++) {
      const v = -D / 2 + 0.05 + t * (what === "timber" ? 0.2 : 0.16) + (what === "logs" ? l * 0.08 : 0)
      const y = l * (what === "timber" ? 0.08 : 0.14)
      if (what === "timber") k.box(M.wood, M.wood, -L / 2 + r(seed, t + l) * 0.1, y, v, L / 2 - r(seed, t * 3 + l) * 0.1, y + 0.07, v + 0.18)
      else k.box(M.woodV, M.woodDark, -L / 2, y, v, L / 2, y + 0.14, v + 0.14)
    }
  }
}

function armorStand(k: Kit, wd: Wood, seed: number) {
  // a cross on a post with a mail shirt over it and a helm on top
  k.box(wd.dark, wd.dark, -0.2, 0, -0.15, 0.2, 0.06, 0.15)
  k.box(wd.dark, null, -0.03, 0.06, -0.03, 0.03, 1.55, 0.03)
  k.box(wd.dark, null, -0.25, 1.35, -0.03, 0.25, 1.4, 0.03)
  k.box(r(seed, 1) > 0.5 ? M.iron : colorMat(0x6a4632), null, -0.22, 0.75, -0.12, 0.22, 1.4, 0.12)
  k.cyl(M.iron, M.iron, 0, 0, 1.45, 1.65, 0.11, 0.09, 8)
}

function spearRack(k: Kit, wd: Wood, seed: number, old = false) {
  const { W } = k
  k.box(wd.dark, wd.top, -W / 2, 0, -0.12, W / 2, 0.12, 0.12)
  k.box(wd.dark, null, -W / 2, 1.0, -0.04, W / 2, 1.05, 0.04)
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.03) - 0.03, 0, -0.03, su * (W / 2 - 0.03) + 0.03, 1.05, 0.03)
  const n = Math.max(2, Math.floor(W / 0.14))
  for (let t = 0; t < n; t++) {
    const u = -W / 2 + 0.1 + t * ((W - 0.2) / (n - 1))
    const h = 1.7 + r(seed, t) * 0.2
    k.box(M.woodV, null, u - 0.015, 0.1, -0.015, u + 0.015, h, 0.015)
    k.box(old ? colorMat(0x6a4a3a) : M.iron, null, u - 0.025, h, -0.01, u + 0.025, h + 0.16, 0.01)
  }
}

function perch(k: Kit, wd: Wood) {
  const { W } = k
  for (const su of [-1, 1]) k.box(wd.dark, null, su * (W / 2 - 0.04) - 0.03, 0, -0.03, su * (W / 2 - 0.04) + 0.03, 0.9, 0.03)
  for (const y of [0.45, 0.85]) k.box(wd.body, null, -W / 2, y, -0.025, W / 2, y + 0.04, 0.025)
  k.box(M.hay, null, -W / 2, 0, -0.18, W / 2, 0.03, 0.18)
}

function beehive(k: Kit) {
  // a straw skep on a little stand
  k.box(M.woodDark, M.wood, -0.25, 0, -0.2, 0.25, 0.4, 0.2)
  for (let t = 0; t < 4; t++) k.cyl(M.thatch, null, 0, 0, 0.4 + t * 0.1, 0.5 + t * 0.1, 0.22 - t * 0.04, 0.2 - t * 0.05, 9)
  k.box(M.dark, null, -0.04, 0.4, 0.17, 0.04, 0.45, 0.2)
}

function hay(k: Kit) {
  const { W, D } = k
  k.box(M.hay, M.hay, -W / 2, 0, -D / 2, W / 2, 0.9, D / 2, 1)
  k.box(M.hay, M.hay, -W / 2 + 0.2, 0.9, -D / 2 + 0.2, W / 2 - 0.3, 1.3, D / 2 - 0.25, 1)
}

function handcart(k: Kit, wd: Wood, seed: number) {
  // a two-wheeled handcart, its shafts resting on the floor, a sack or two in it
  const { W, D } = k
  const R = 0.38
  const v0 = -D / 2 + 0.05,
    v1 = D / 2 - 0.75
  k.box(wd.top, wd.top, -W / 2 + 0.12, R + 0.02, v0, W / 2 - 0.12, R + 0.06, v1)
  for (const su of [-1, 1]) k.box(wd.body, wd.top, su * (W / 2 - 0.12) - 0.02, R + 0.06, v0, su * (W / 2 - 0.12) + 0.02, R + 0.38, v1)
  k.box(wd.body, wd.top, -W / 2 + 0.12, R + 0.06, v0, W / 2 - 0.12, R + 0.38, v0 + 0.04)
  for (const su of [-1, 1]) {
    // the shafts, sloping from the bed down to the floor at the front
    const u = su * (W / 2 - 0.2)
    for (let q = 0; q < 8; q++) {
      const v = v1 + (q / 8) * (D / 2 - v1),
        y = R + 0.02 - (q / 8) * (R - 0.04)
      k.box(wd.dark, null, u - 0.025, y - 0.03, v, u + 0.025, y + 0.02, v + (D / 2 - v1) / 8 + 0.01)
    }
    wheel(k, wd.dark, wd.dark, su * (W / 2 - 0.04), R + 0.02, R, 0.05, 24)
  }
  k.box(wd.dark, null, -W / 2 + 0.04, R - 0.01, (v0 + v1) / 2 - 0.03, W / 2 - 0.04, R + 0.05, (v0 + v1) / 2 + 0.03) // the axle
  if (r(seed, 1) > 0.3) sacks(new Kit(k.gb, { ...k.s, y: k.s.y + R + 0.06, ...shrink(k, 0.5, (v0 + v1) / 2) }), seed, "wool")
}

/** A smaller spot inside the piece, centred `v` back from its middle, `W` wide. */
function shrink(k: Kit, W: number, v: number): { x: number; z: number; w: number; d: number } {
  const [x, z] = k.at(0, v)
  const side = k.s.face === 1 || k.s.face === 3
  return { x, z, w: side ? 0.4 : W, d: side ? W : 0.4 }
}

// ---------------------------------------------------------------- what the shops and rooms came to need

function stool(k: Kit, wd: Wood) {
  // three splayed legs and a round seat
  const rr = Math.min(k.W, k.D) / 2 - 0.02
  for (let t = 0; t < 3; t++) {
    const a = (t / 3) * Math.PI * 2 + 0.3
    k.box(wd.dark, null, Math.cos(a) * rr * 0.7 - 0.025, 0, Math.sin(a) * rr * 0.7 - 0.025, Math.cos(a) * rr * 0.7 + 0.025, 0.44, Math.sin(a) * rr * 0.7 + 0.025)
  }
  k.cyl(wd.body, wd.top, 0, 0, 0.44, 0.48, rr, rr, 9)
}

function washstand(k: Kit, wd: Wood, seed: number) {
  // a stand with a basin let into its top, a jug in it, a towel on the rail and a cake of soap
  const { W, D } = k
  k.legs(wd.dark, 0.8, 0.045, 0.03)
  k.slab(wd.body, 0.2, 0.03, W - 0.08, D - 0.08)
  k.slab(wd.top, 0.8, 0.04)
  k.cyl(glaze[(seed + 2) % glaze.length], M.water, 0, 0.02, 0.8, 0.9, 0.12, 0.18, 10)
  k.cyl(glaze[(seed + 2) % glaze.length], null, 0.05, 0.02, 0.9, 1.06, 0.06, 0.04, 7)
  k.box(wd.dark, null, -W / 2 - 0.04, 0.6, -0.02, -W / 2, 0.64, D / 2 - 0.05)
  k.box(linen, null, -W / 2 - 0.05, 0.38, 0.02, -W / 2 - 0.035, 0.64, D / 2 - 0.1)
  k.box(wax, null, W / 2 - 0.12, 0.84, -D / 2 + 0.06, W / 2 - 0.05, 0.87, -D / 2 + 0.12)
  k.box(wd.top, wd.top, -W / 2, 0.84, -D / 2, W / 2, 1.0, -D / 2 + 0.03) // the splash board
}

function drawers(k: Kit, wd: Wood, seed: number, rows = 4) {
  const { W, D } = k
  const h = rows * 0.22 + 0.1
  k.box(wd.body, null, -W / 2, 0.06, -D / 2, W / 2, h, D / 2)
  k.box(wd.dark, null, -W / 2 + 0.03, 0, -D / 2 + 0.03, W / 2 - 0.03, 0.06, D / 2 - 0.03)
  k.box(wd.top, wd.top, -W / 2 - 0.02, h, -D / 2 - 0.02, W / 2 + 0.02, h + 0.04, D / 2 + 0.02)
  for (let i = 0; i < rows; i++) {
    const y = 0.1 + i * 0.22
    for (const half of W > 0.9 && i === rows - 1 ? [-1, 1] : [0]) {
      const u0 = half === 0 ? -W / 2 + 0.04 : half < 0 ? -W / 2 + 0.04 : 0.01,
        u1 = half === 0 ? W / 2 - 0.04 : half < 0 ? -0.01 : W / 2 - 0.04
      k.box(wd.trim ?? wd.dark, null, u0, y, D / 2, u1, y + 0.19, D / 2 + 0.015)
      k.box(brass, null, (u0 + u1) / 2 - 0.03, y + 0.08, D / 2 + 0.015, (u0 + u1) / 2 + 0.03, y + 0.11, D / 2 + 0.03)
    }
  }
  // what is set out on top: a candle, a little box, a folded cloth
  candleOn(k, -W / 2 + 0.15, 0, h + 0.04)
  k.box(wd.dark, brass, 0.0, h + 0.04, -0.08, 0.16, h + 0.12, 0.06)
  if (r(seed, 4) > 0.4) k.box(cloth[Math.floor(r(seed, 5) * cloth.length)], null, W / 2 - 0.3, h + 0.04, -0.1, W / 2 - 0.08, h + 0.07, 0.12)
}

function candleOn(k: Kit, u: number, v: number, y: number) {
  k.cyl(brass, null, u, v, y, y + 0.02, 0.045, 0.045, 6)
  k.cyl(wax, null, u, v, y + 0.02, y + 0.17, 0.015, 0.015, 5)
  k.box(colorMat(0xffc860), null, u - 0.007, y + 0.17, v - 0.007, u + 0.007, y + 0.2, v + 0.007)
}

function coatStand(k: Kit, wd: Wood, seed: number) {
  k.box(wd.dark, null, -0.18, 0, -0.03, 0.18, 0.05, 0.03)
  k.box(wd.dark, null, -0.03, 0, -0.18, 0.03, 0.05, 0.18)
  k.box(wd.body, null, -0.03, 0.05, -0.03, 0.03, 1.7, 0.03)
  for (let t = 0; t < 4; t++) {
    const a = (t / 4) * Math.PI * 2
    k.box(wd.dark, null, Math.cos(a) * 0.12 - 0.015, 1.55, Math.sin(a) * 0.12 - 0.015, Math.cos(a) * 0.12 + 0.015, 1.6, Math.sin(a) * 0.12 + 0.015)
  }
  // a coat, a hat, a scarf left on it
  const c = cloth[Math.floor(r(seed, 1) * cloth.length)]
  k.box(c, null, 0.03, 0.75, -0.12, 0.13, 1.55, 0.12)
  k.cyl(cloth[Math.floor(r(seed, 2) * cloth.length)], null, -0.1, 0, 1.6, 1.68, 0.1, 0.08, 7)
  if (r(seed, 3) > 0.4) k.box(cloth[0], null, -0.09, 1.0, -0.03, -0.05, 1.55, 0.03)
}

function birdcage(k: Kit, wd: Wood, seed: number) {
  // a finch in a cage on a stand by the window
  k.cyl(wd.dark, null, 0, 0, 0, 0.04, 0.16, 0.16, 8)
  k.box(wd.dark, null, -0.025, 0.04, -0.025, 0.025, 1.0, 0.025)
  k.cyl(brass, null, 0, 0, 1.0, 1.02, 0.17, 0.17, 10)
  for (let t = 0; t < 12; t++) {
    const a = (t / 12) * Math.PI * 2
    k.box(brass, null, Math.cos(a) * 0.16 - 0.006, 1.02, Math.sin(a) * 0.16 - 0.006, Math.cos(a) * 0.16 + 0.006, 1.35, Math.sin(a) * 0.16 + 0.006)
  }
  k.cyl(brass, null, 0, 0, 1.35, 1.45, 0.17, 0.03, 10)
  k.box(wd.top, null, -0.12, 1.12, -0.01, 0.12, 1.13, 0.01)
  k.box(r(seed, 1) > 0.5 ? colorMat(0xd8b040) : colorMat(0x8a6a4a), null, -0.03, 1.13, -0.025, 0.04, 1.2, 0.025)
}

function brazier(k: Kit) {
  // an iron pan of embers on three legs, for warming hands in a room without a fire
  for (let t = 0; t < 3; t++) {
    const a = (t / 3) * Math.PI * 2
    k.box(M.iron, null, Math.cos(a) * 0.2 - 0.02, 0, Math.sin(a) * 0.2 - 0.02, Math.cos(a) * 0.2 + 0.02, 0.4, Math.sin(a) * 0.2 + 0.02)
  }
  k.cyl(M.iron, null, 0, 0, 0.35, 0.5, 0.18, 0.26, 10)
  k.cyl(colorMat(0xff8a3a), colorMat(0xff8a3a), 0, 0, 0.44, 0.47, 0.22, 0.22, 10)
  for (let t = 0; t < 4; t++) k.box(M.dark, null, -0.12 + t * 0.07, 0.47, -0.05, -0.08 + t * 0.07, 0.5, 0.05)
}

function shavingHorse(k: Kit, wd: Wood) {
  // the bench a bow maker sits astride, a stave clamped under its head, a drawknife on it
  const { W } = k
  k.box(wd.body, wd.top, -W / 2, 0.45, -0.12, W / 2, 0.52, 0.12)
  for (const [u, v] of [
    [-W / 2 + 0.1, -0.12],
    [-W / 2 + 0.1, 0.12],
    [W / 2 - 0.1, 0],
  ])
    k.box(wd.dark, null, u - 0.03, 0, v - 0.03, u + 0.03, 0.45, v + 0.03)
  k.box(wd.top, null, 0.05, 0.52, -0.1, W / 2 - 0.1, 0.6, 0.1) // the ramp
  k.box(wd.dark, null, 0.1, 0.6, -0.04, 0.16, 0.95, 0.04) // the head
  k.box(M.woodV, null, -0.1, 0.6, -0.03, W / 2, 0.64, 0.03) // the stave
  k.box(M.iron, null, -0.2, 0.52, 0.06, 0.1, 0.54, 0.1)
}

function breadRack(k: Kit, wd: Wood, seed: number) {
  // two tiers of long baskets, loaves in them
  const { W, D } = k
  k.legs(wd.dark, 0.85, 0.04, 0.02)
  for (const y of [0.3, 0.75]) {
    k.box(willow, null, -W / 2 + 0.04, y, -D / 2 + 0.04, W / 2 - 0.04, y + 0.1, D / 2 - 0.04)
    for (let t = 0; t < Math.floor(W / 0.16); t++) k.cyl(colorMat(t % 3 ? 0x7a5236 : 0xc89a5a), null, -W / 2 + 0.12 + t * 0.16, (r(seed, t) - 0.5) * 0.1, y + 0.08, y + 0.16, 0.07, 0.05, 6)
  }
}

function tiltedShelf(k: Kit, wd: Wood, seed: number, what: "bottles" | "thread" | "leather" | "plates") {
  const { W, D } = k
  if (what === "plates") {
    // a dresser: cupboard doors below, plates stood along the rails above
    k.box(wd.body, wd.top, -W / 2, 0, -D / 2, W / 2, 0.85, D / 2)
    for (const s of [-1, 1]) {
      k.box(wd.trim ?? wd.dark, null, s * W / 4 - W / 4 + 0.04, 0.08, D / 2, s * W / 4 + W / 4 - 0.04, 0.78, D / 2 + 0.015)
      k.box(brass, null, s * 0.04 - 0.015, 0.45, D / 2 + 0.015, s * 0.04 + 0.015, 0.5, D / 2 + 0.03)
    }
    const top = k.D * 0.5
    for (const su of [-1, 1]) k.box(wd.dark, wd.top, su * W / 2 - (su > 0 ? 0.05 : 0), 0.85, -D / 2, su * W / 2 + (su < 0 ? 0.05 : 0), 1.85, -D / 2 + top)
    k.box(wd.body, null, -W / 2, 0.85, -D / 2, W / 2, 1.85, -D / 2 + 0.03)
    k.box(wd.top, wd.top, -W / 2 - 0.03, 1.85, -D / 2, W / 2 + 0.03, 1.9, -D / 2 + top + 0.02)
    for (const y of [1.2, 1.55]) {
      k.box(wd.top, wd.top, -W / 2, y, -D / 2, W / 2, y + 0.03, -D / 2 + top)
      let u = -W / 2 + 0.08
      for (let t = 0; u < W / 2 - 0.12; t++) {
        const g = glaze[(t + Math.floor(r(seed, t) * 4)) % glaze.length]
        k.box(g, g, u, y + 0.03, -D / 2 + 0.06, u + 0.025, y + 0.3, -D / 2 + 0.09)
        u += 0.12
      }
    }
    for (let t = 0; t < 4; t++) k.cyl(t % 2 ? clay : glaze[t % glaze.length], null, -W / 2 + 0.15 + t * ((W - 0.3) / 3), -D / 2 + 0.12, 0.88, 1.0 + r(seed, t + 7) * 0.1, 0.05, 0.07, 7)
    return
  }
  const boards = [0.04, 0.5, 0.95, 1.4]
  frame(k, wd, 1.8, boards)
  boards.forEach((b, i) =>
    row(k, b, -W / 2 + 0.08, W / 2 - 0.1, (u, j) => {
      if (what === "bottles") {
        const g = [glass, glaze[0], colorMat(0x3a5a3a), colorMat(0x6a2a2a)][Math.floor(r(seed + i, j) * 4)]
        k.cyl(g, null, u + 0.04, 0, b + 0.035, b + 0.25, 0.04, 0.04, 6)
        k.cyl(g, null, u + 0.04, 0, b + 0.25, b + 0.33, 0.015, 0.015, 5)
        return 0.1
      }
      if (what === "thread") {
        const c = cloth[Math.floor(r(seed + i, j) * cloth.length)]
        k.cyl(c, c, u + 0.05, 0, b + 0.035, b + 0.14, 0.045, 0.045, 6)
        return 0.11
      }
      // rolled hides, their ends showing
      k.cyl(colorMat([0x8a6a4a, 0x6a4632, 0x4a3226][j % 3]), null, u + 0.09, 0, b + 0.035, b + 0.2, 0.08, 0.08, 7)
      return 0.2
    }),
  )
}

/** What a shop keeps on its open shelves (interior.ts picks it by the shop). */
export type Stock = "bread" | "jars" | "sundries" | "bottles" | "stores"

const crust = [colorMat(0xb87a3a), colorMat(0x9a5e2a), colorMat(0xd0a060)]

/**
 * A long open shelf in bays, stocked the way a shop's shelf is in the afternoon: the boards near
 * the hand full, the top one half sold, a gap here and there where something went this morning.
 */
export function stockShelf(gb: GB, spot: Spot, wd: Wood, seed: number, stock: Stock) {
  const k = new Kit(gb, spot)
  const { W, D } = k
  const h = 1.75
  const boards = [0.04, 0.5, 0.95, 1.4]
  const bays = Math.max(1, Math.round(W / 1.2))
  const bw = W / bays
  for (let i = 0; i <= bays; i++) {
    const u = -W / 2 + i * bw
    k.box(wd.dark, wd.top, Math.max(-W / 2, u - 0.035), 0, -D / 2, Math.min(W / 2, u + 0.035), h, D / 2)
  }
  k.box(wd.body, null, -W / 2, 0, -D / 2, W / 2, h, -D / 2 + 0.03)
  for (const b of boards) k.box(wd.top, wd.top, -W / 2, b, -D / 2, W / 2, b + 0.035, D / 2)
  k.box(wd.dark, wd.top, -W / 2 - 0.03, h, -D / 2, W / 2 + 0.03, h + 0.05, D / 2 + 0.02)
  const v = Math.min(0.06, D / 2 - 0.12)
  boards.forEach((b, row) => {
    const y = b + 0.035
    for (let i = 0; i < bays; i++) {
      const full = r(seed + row * 31, i)
      if (full < (row === 3 ? 0.4 : 0.12)) continue
      const u0 = -W / 2 + i * bw + 0.08,
        u1 = u0 + (bw - 0.16) * (full < 0.5 ? 0.55 : 1)
      const kind = stock === "sundries" ? (["jars", "stores", "rope", "candles"] as const)[Math.floor(r(seed + row, i + 40) * 4)] : stock
      row_(k, y, u0, u1, v, kind, seed + row * 7 + i)
    }
  })
}

function row_(k: Kit, y: number, u0: number, u1: number, v: number, kind: Stock | "rope" | "candles", seed: number) {
  row(k, y, u0, u1, (u, j) => {
    const n = r(seed, j)
    if (kind === "bread") {
      if (n < 0.5) {
        const c = crust[j % 3]
        k.cyl(c, c, u + 0.09, v, y, y + 0.09, 0.09, 0.07, 8)
        return 0.2
      }
      k.box(crust[(j + 1) % 3], crust[2], u, y, v - 0.07, u + 0.26, y + 0.1, v + 0.07)
      return 0.3
    }
    if (kind === "jars") {
      const g = n < 0.4 ? clay : glaze[j % glaze.length]
      const rr = 0.05 + n * 0.04
      k.cyl(g, g, u + rr, v, y, y + 0.14 + n * 0.12, rr, rr * 0.75, 7)
      return rr * 2 + 0.04
    }
    if (kind === "bottles") {
      const g = [glass, glaze[0], colorMat(0x3a5a3a), colorMat(0x6a2a2a)][Math.floor(n * 4)]
      k.cyl(g, null, u + 0.04, v, y, y + 0.22, 0.04, 0.04, 6)
      k.cyl(g, null, u + 0.04, v, y + 0.22, y + 0.3, 0.015, 0.015, 5)
      return 0.1
    }
    if (kind === "rope") {
      k.cyl(M.rope, M.rope, u + 0.12, v, y, y + 0.08, 0.12, 0.12, 8)
      return 0.28
    }
    if (kind === "candles") {
      for (let t = 0; t < 5; t++) k.box(colorMat(0xe8dcb8), null, u + t * 0.035, y, v - 0.04, u + t * 0.035 + 0.025, y + 0.2, v - 0.015)
      return 0.24
    }
    // stores: a small crate or a tied sack
    if (n < 0.5) {
      k.box(M.sack, M.sack, u, y, v - 0.1, u + 0.22, y + 0.2, v + 0.1)
      return 0.27
    }
    k.box(M.woodV, M.wood, u, y, v - 0.11, u + 0.26, y + 0.2, v + 0.11)
    return 0.31
  })
}

// ---------------------------------------------------------------- the fire

/**
 * The hearth every home is built round: a stone stove with the fire's mouth at the front, a hood
 * and chimney up into the ceiling, a pot on its hook, the kettle, a shelf of things kept dry above
 * it and the day's firewood stacked beside. A fireplace is the same set into the wall.
 */
function hearth(k: Kit, wd: Wood, seed: number, set = false) {
  const { W, D } = k
  const fw = set ? W : W * 0.78
  const u0 = set ? 0 : -W / 2 + fw / 2
  k.box(M.stoneDark, M.stone, u0 - fw / 2, 0, -D / 2, u0 + fw / 2, 0.75, D / 2, 2)
  k.box(M.stone, M.stone, u0 - fw / 2 - 0.04, 0.75, -D / 2, u0 + fw / 2 + 0.04, 0.85, D / 2 + 0.06, 2) // the ledge
  // the hood narrowing up to the chimney
  k.box(M.plaster, null, u0 - fw / 2 + 0.05, 1.35, -D / 2, u0 + fw / 2 - 0.05, 1.7, D / 2 - 0.05)
  k.box(M.plaster, null, u0 - fw * 0.28, 1.7, -D / 2, u0 + fw * 0.28, 2.5, D / 2 - 0.25)
  k.box(M.woodDark, null, u0 - fw / 2, 1.3, D / 2 - 0.1, u0 + fw / 2, 1.38, D / 2 - 0.02) // the mantel beam
  // the fire's mouth, the embers and a log in it
  k.box(M.dark, null, u0 - fw * 0.3, 0.08, D / 2, u0 + fw * 0.3, 0.6, D / 2 + 0.01)
  k.box(colorMat(0xff8a3a), null, u0 - fw * 0.22, 0.08, D / 2 + 0.01, u0 + fw * 0.22, 0.2, D / 2 + 0.02)
  k.box(M.woodDark, null, u0 - fw * 0.2, 0.18, D / 2 + 0.005, u0 + fw * 0.15, 0.25, D / 2 + 0.025)
  // on the ledge: the kettle, a pot, a jar of salt
  k.cyl(M.iron, M.dark, u0 - fw * 0.25, D / 2 - 0.2, 0.85, 1.0, 0.1, 0.08, 8)
  k.box(M.iron, null, u0 - fw * 0.25 + 0.08, 0.93, D / 2 - 0.21, u0 - fw * 0.25 + 0.2, 0.95, D / 2 - 0.19)
  k.cyl(M.iron, M.dark, u0 + fw * 0.15, D / 2 - 0.25, 0.85, 1.05, 0.15, 0.16, 9)
  k.cyl(clay, null, u0 + fw * 0.38, D / 2 - 0.15, 0.85, 0.98, 0.05, 0.04, 6)
  // what is kept on the mantel to stay dry
  k.cyl(brass, null, u0 - fw * 0.35, D / 2 - 0.06, 1.38, 1.4, 0.04, 0.04, 6)
  k.cyl(wax, null, u0 - fw * 0.35, D / 2 - 0.06, 1.4, 1.55, 0.015, 0.015, 5)
  for (let t = 0; t < 3; t++) k.cyl(t % 2 ? clay : glaze[(seed + t) % glaze.length], null, u0 - fw * 0.1 + t * 0.14, D / 2 - 0.06, 1.38, 1.48 + r(seed, t) * 0.06, 0.04, 0.035, 6)
  if (!set) {
    // the day's firewood, stacked beside it
    const lu = W / 2 - (W - fw) / 2
    for (let l = 0; l < 4; l++) for (let t = 0; t < 3; t++) k.box(M.woodV, M.woodDark, lu - 0.1 + t * 0.07 - 0.035, l * 0.07, -D / 2 + 0.1, lu - 0.1 + t * 0.07 + 0.035, l * 0.07 + 0.065, D / 2 - 0.1)
  }
}

// ---------------------------------------------------------------- what each piece is drawn as

const B = (f: Builder) => f

/** The builder for each piece the plans name (and what the bigger rooms have besides). */
export const FURNISHINGS: Record<string, Builder> = {
  寝台: B((k, w, s) => bed(k, w, s)),
  "寝台（二人用）": B((k, w, s) => bed(k, w, s)),
  子どもの寝台: B((k, w, s) => bed(k, w, s, true)),
  揺りかご: cradle,
  椅子: chair,
  長椅子: settle,
  暖炉の前の揺り椅子: rocker,
  食卓: diningTable,
  大きな食卓: diningTable,
  長卓: diningTable,
  卓: roundTable,
  地図の卓: mapTable,
  書き物机: desk,
  縫い物の台: sewingTable,
  祈祷台: prieDieu,
  作業台: B((k, w, s) => workbench(k, w, s)),
  木工台: B((k, w, s) => workbench(k, w, s, "joiner")),
  修理台: B((k, w, s) => workbench(k, w, s, "mend")),
  調合台: alchemy,
  台所の台: kitchen,
  搾り台: press,
  本棚: bookcase,
  保存食の棚: pantry,
  道具棚: toolShelf,
  書類棚: pigeonholes,
  薬棚: medicineCase,
  器の棚: crockery,
  弓の並んだ棚: bowShelf,
  鍵付きの陳列棚: vitrine,
  売り台: B((k, w, s) => counter(k, w, s)),
  カウンター: B((k, w, s) => counter(k, w, s)),
  帳場: B((k, w, s) => counter(k, w, s, true)),
  大きな天秤: bigScales,
  衣装箱: wardrobeChest,
  金庫: strongbox,
  素材の箱: B((k, w, s) => lidBox(k, w, s, "materials")),
  粉箱: B((k, w, s) => lidBox(k, w, s, "flour")),
  鋳掛けの道具箱: B((k, w, s) => lidBox(k, w, s, "tinker")),
  木箱: B((k, w, s) => lidBox(k, w, s, "crate")),
  樽: B((k, w, s) => cask(k, w, s, false, 0.8)),
  酒樽: B((k, w, s) => cask(k, w, s, true)),
  仕込み樽: B((k, w, s) => cask(k, w, s, false, 1.1)),
  水甕: B((k, w, s) => tub(k, w, s, "water")),
  魚桶: B((k, w, s) => tub(k, w, s, "fish")),
  洗濯桶: B((k, w, s) => tub(k, w, s, "wash")),
  灰汁の桶: B((k, w, s) => tub(k, w, s, "lye")),
  なめし桶: B((k, w, s) => tub(k, w, s, "tan")),
  釉の甕: B((k, w, s) => tub(k, w, s, "glaze")),
  茶の壺: B((k, w, s) => tub(k, w, s, "tea")),
  油壺: B((k, w, s) => tub(k, w, s, "oil")),
  ろうの鍋: B((k, w, s) => tub(k, w, s, "wax")),
  機織り機: loom,
  糸車: spinningWheel,
  ろくろ: pottersWheel,
  金床: anvil,
  窯: kiln,
  野菜籠: B((k, _w, s) => basketOf(k, s, "veg")),
  果物籠: B((k, _w, s) => basketOf(k, s, "fruit")),
  毛糸の籠: B((k, _w, s) => basketOf(k, s, "yarn")),
  編みかけの籠: B((k, _w, s) => basketOf(k, s, "unfinished")),
  羊毛の袋: B((k, _w, s) => sacks(k, s, "wool")),
  粉袋の山: B((k, _w, s) => sacks(k, s, "flour")),
  麦の袋: B((k, _w, s) => sacks(k, s, "grain")),
  炭俵: B((k, _w, s) => sacks(k, s, "charcoal")),
  チーズの棚: cheeseShelf,
  撹乳桶: B((k, w) => churn(k, w)),
  乳の桶: B((k, w, s) => tub(k, w, s, "milk")),
  塩漬けの樽: B((k, w, s) => cask(k, w, s, false, 0.7)),
  灰の袋: B((k, _w, s) => sacks(k, s, "ash")),
  柳の束: B((k, _w, s) => bundles(k, s, "willow")),
  木材: B((k, _w, s) => bundles(k, s, "timber")),
  薪の山: B((k, _w, s) => bundles(k, s, "logs")),
  鎧掛け: armorStand,
  槍立て: B((k, w, s) => spearRack(k, w, s)),
  古い槍: B((k, w, s) => spearRack(k, w, s, true)),
  止まり木: perch,
  巣箱: B((k) => beehive(k)),
  干し草: B((k) => hay(k)),
  荷車: handcart,
  腰掛け: stool,
  洗面台: washstand,
  箪笥: B((k, w, s) => drawers(k, w, s)),
  長持: B((k, w, s) => wardrobeChest(k, w, s)),
  帽子掛け: coatStand,
  鳥かご: birdcage,
  火鉢: B((k) => brazier(k)),
  削り馬: shavingHorse,
  パン籠: breadRack,
  薪入れ: B((k, _w, s) => bundles(k, s, "logs")),
  薬草の籠: B((k, _w, s) => basketOf(k, s, "veg")),
  焼き入れの桶: B((k, w, s) => tub(k, w, s, "fish")),
  食器棚: B((k, w, s) => tiltedShelf(k, w, s, "plates")),
  酒の棚: B((k, w, s) => tiltedShelf(k, w, s, "bottles")),
  糸の棚: B((k, w, s) => tiltedShelf(k, w, s, "thread")),
  革の棚: B((k, w, s) => tiltedShelf(k, w, s, "leather")),
  炉: B((k, w, s) => hearth(k, w, s)),
  暖炉: B((k, w, s) => hearth(k, w, s, true)),
}

/** How high the top of a piece is, for setting things down on it (the traces of life, interior.ts). */
export function topOf(full: string): number | null {
  const name = full.replace(/（.+）$/, "")
  if (/^(食卓|大きな食卓|長卓|地図の卓)$/.test(name)) return 0.76
  if (name === "卓") return 0.74
  if (/^(書き物机|縫い物の台)$/.test(name)) return 0.77
  if (/^(作業台|木工台|修理台)$/.test(name)) return 0.9
  if (name === "台所の台") return 0.88
  if (name === "調合台") return 0.88
  if (/^(売り台|カウンター|帳場)$/.test(name)) return 0.66
  return null
}

/** Draws the named piece at the spot; false if there is no drawing for it. */
export function furnish(gb: GB, name: string, spot: Spot, w: Wood, seed: number): boolean {
  const f = FURNISHINGS[name] ?? FURNISHINGS[name.replace(/（.+）$/, "")]
  if (!f) return false
  f(new Kit(gb, spot), w, seed)
  return true
}

/** The piece on its own on flat ground, for the dev pages: at the size the plans give it (m), in the given wood. */
export function furnishingAt(name: string, size: { w: number; d: number }, woodId: WoodId, seed = 1) {
  return (root: THREE.Group, x: number, z: number) => {
    const gb = new GB()
    furnish(gb, name, { x, z, w: size.w, d: size.d, y: 0, face: 0 }, wood(woodId), seed)
    root.add(gb.build())
  }
}
