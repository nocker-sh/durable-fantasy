import * as THREE from "three"
import { GB, mat, toTex } from "../gfx"
import { type PixBuf, Rng } from "../pix"
import { roofTex, thatchTex, wallTex, gableTex, signTex } from "../textures"
import { HOUSES, enterable, floorsOf, type HouseDef } from "../../town/houses.ts"
import { houseStyle, type HouseStyle } from "../../town/style.ts"
import { groundH, blockRect, roadD, isFree } from "../world"
import { houseGlows, glowMats, type V2, chimneys, occluder, places, animateObject } from "./registry.ts"
import { M } from "./materials.ts"
import { woodpile, barrel } from "./furniture.ts"

/** The house whose walls are being drawn, so their window glows are filed under it. */
let glowOwner: string | null = null

// ---------------------------------------------------------------- helpers
function baseOf(x0: number, z0: number, x1: number, z1: number) {
  const hs = [groundH(x0, z0), groundH(x1, z0), groundH(x0, z1), groundH(x1, z1), groundH((x0 + x1) / 2, (z0 + z1) / 2)]
  return { lo: Math.min(...hs), hi: Math.max(...hs) }
}

function glowify(m: THREE.MeshLambertMaterial, glow: PixBuf | null) {
  if (!glow) return m
  m.emissiveMap = toTex(glow, false)
  m.emissive = new THREE.Color(0xffffff)
  m.emissiveIntensity = 0
  if (glowOwner) houseGlows.push({ house: glowOwner, mat: m })
  else glowMats.push(m)
  return m
}

function wallMat(w: number, h: number, seed: number, opts: Partial<Parameters<typeof wallTex>[0]> = {}) {
  const [b, g] = wallTex({ w, h, floors: 1, timber: true, seed, flowers: true, ...opts })
  return glowify(new THREE.MeshLambertMaterial({ map: toTex(b, false) }), g)
}

// ---------------------------------------------------------------- houses
export interface HouseOpts {
  x0: number
  z0: number
  x1: number
  z1: number
  floors: number
  axis: "x" | "z"
  roof: "roof" | "roof2" | "slate" | "thatch"
  door: { side: "n" | "s" | "e" | "w"; u: number }
  seed: number
  timber?: boolean
  chimney?: boolean
  sign?: string
  name?: string
  ramp?: string
  /** a home you cannot go into: drawn solid, never faded to show what is inside */
  private?: boolean
  /** how it looks, from who lives there (town/style.ts) */
  style?: HouseStyle
  opening?: "n" | "s" | "e" | "w"
}

/** Every house on a map, as the household table describes it (world/town/houses.ts). */
/** The houses on the current map with an oriel (for the record of what stands where). */
export const oriels: string[] = []

export function buildHouses(root: THREE.Group, map: string) {
  oriels.length = 0
  leanTos.length = 0
  for (const h of HOUSES) {
    if (h.map !== map) continue
    house(root, { ...h, floors: floorsOf(h), chimney: h.plan.hearth, name: h.id, private: !enterable(h), style: houseStyle(h) })
  }
  // the lean-tos go up once every house stands, so each can keep clear of all the others
  for (const h of HOUSES) if (h.map === map && h.kind !== "vacant" && h.seed % 2 === 0) leanTo(root, h, map)
}

type Side = "n" | "s" | "e" | "w"

/** Which way a side of a house faces, and which way is right along it, seen from outside. */
const SIDE: Record<Side, { n: V2; t: V2 }> = {
  s: { n: [0, 1], t: [1, 0] },
  n: { n: [0, -1], t: [-1, 0] },
  e: { n: [1, 0], t: [0, -1] },
  w: { n: [-1, 0], t: [0, 1] },
}

/** The middle of a side of a house at the ground, and its length. */
function sideOf(h: { x0: number; z0: number; x1: number; z1: number }, side: Side): { c: V2; len: number } {
  if (side === "s") return { c: [(h.x0 + h.x1) / 2, h.z1], len: h.x1 - h.x0 }
  if (side === "n") return { c: [(h.x0 + h.x1) / 2, h.z0], len: h.x1 - h.x0 }
  if (side === "e") return { c: [h.x1, (h.z0 + h.z1) / 2], len: h.z1 - h.z0 }
  return { c: [h.x0, (h.z0 + h.z1) / 2], len: h.z1 - h.z0 }
}

const doorAt = (h: HouseDef): V2 => {
  const u = h.door.u
  return h.door.side === "s" ? [h.x0 + u, h.z1] : h.door.side === "n" ? [h.x1 - u, h.z0] : h.door.side === "e" ? [h.x1, h.z1 - u] : [h.x0, h.z0 + u]
}

/**
 * A lean-to against a side wall: a low roof on two posts over the household's firewood or barrels,
 * where the ground beside the wall is free, off the road and away from every door on the map.
 */
function leanTo(root: THREE.Group, h: HouseDef, map: string) {
  const opposite = { n: "s", s: "n", e: "w", w: "e" } as const
  const ends: Side[] = h.door.side === "n" || h.door.side === "s" ? ["e", "w"] : ["n", "s"]
  const doors = HOUSES.filter((o) => o.map === map).map(doorAt)
  for (const side of [...(h.seed % 4 === 0 ? ends : ends.reverse()), opposite[h.door.side]]) {
    const { c, len } = sideOf(h, side),
      { n, t } = SIDE[side]
    const L = Math.min(2.4, len * 0.62),
      D = 0.95
    const at = (u: number, o: number): V2 => [c[0] + t[0] * u + n[0] * o, c[1] + t[1] * u + n[1] * o]
    // the ground it would take, a little beyond its posts
    let ok = true
    for (let u = -L / 2 - 0.2; u <= L / 2 + 0.2 && ok; u += 0.25)
      for (let o = 0.15; o <= D + 0.35 && ok; o += 0.2) {
        const [px, pz] = at(u, o)
        if (!isFree(px, pz) || roadD(px, pz) < 0.6 || doors.some((d) => Math.hypot(d[0] - px, d[1] - pz) < 1.6)) ok = false
      }
    if (!ok) continue
    const gb = new GB()
    const { hi } = baseOf(h.x0, h.z0, h.x1, h.z1)
    const yWall = hi + 0.18 + 1.25,
      yEdge = hi + 0.18 + 0.82
    const rm = roofMat(h.roof === "thatch" ? "roof" : h.roof, h.seed + 1)
    const a = at(-L / 2 - 0.1, 0),
      b = at(L / 2 + 0.1, 0),
      cc = at(L / 2 + 0.1, D + 0.12),
      d = at(-L / 2 - 0.1, D + 0.12)
    gb.quad(rm, [a[0], yWall, a[1]], [b[0], yWall, b[1]], [cc[0], yEdge, cc[1]], [d[0], yEdge, d[1]], 2, 2)
    // the plate along the wall, and the posts at the front
    const p0 = at(-L / 2 - 0.1, 0.02),
      p1 = at(L / 2 + 0.1, 0.1)
    gb.box(M.woodDark, M.woodDark, Math.min(p0[0], p1[0]), yWall - 0.1, Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), yWall, Math.max(p0[1], p1[1]), 2)
    for (const u of [-L / 2 + 0.05, L / 2 - 0.05]) {
      const [px, pz] = at(u, D)
      const gy = groundH(px, pz)
      gb.box(M.woodDark, M.wood, px - 0.05, gy, pz - 0.05, px + 0.05, yEdge, pz + 0.05, 2)
    }
    // under it: split wood stacked against the wall, or a pair of barrels
    const mid = at(0, 0.35)
    if (h.seed % 3 !== 0) woodpile(gb, mid[0], mid[1], L * 0.8, 4, t[0] !== 0)
    else
      for (const u of [-L / 4, L / 4]) {
        const p = at(u, 0.4)
        barrel(gb, p[0], p[1], 0.62, 0.24)
      }
    root.add(gb.build())
    const q0 = at(-L / 2 - 0.1, 0),
      q1 = at(L / 2 + 0.1, D + 0.12)
    blockRect(Math.min(q0[0], q1[0]), Math.min(q0[1], q1[1]), Math.max(q0[0], q1[0]), Math.max(q0[1], q1[1]))
    leanTos.push(`${h.id}:${side}`)
    return
  }
}

/** The lean-tos built on the current map, "house:side" (for the record of what stands where). */
export const leanTos: string[] = []

export function house(root: THREE.Group, o: HouseOpts) {
  glowOwner = o.name ?? null
  try {
    return houseInner(root, o)
  } finally {
    glowOwner = null
  }
}

/** min and max corners of two points, for gb.box */
const bboxOf = (a: [number, number, number], b: [number, number, number]): [number, number, number, number, number, number] => [
  Math.min(a[0], b[0]),
  Math.min(a[1], b[1]),
  Math.min(a[2], b[2]),
  Math.max(a[0], b[0]),
  Math.max(a[1], b[1]),
  Math.max(a[2], b[2]),
]

/** A roof's tiles in its colour: a few drawings of each, so neighbours' roofs are not the same picture. */
const roofCache = new Map<string, THREE.MeshLambertMaterial>()

function roofMat(ramp: HouseStyle["roofRamp"], seed: number) {
  const key = `${ramp}:${seed % 3}`
  let m = roofCache.get(key)
  if (!m) {
    m = mat(ramp === "thatch" ? thatchTex(4 + (seed % 3) * 17) : roofTex(ramp, ramp.startsWith("slate") ? 0.58 : 0.6, 3 + (seed % 3) * 13), { side: THREE.DoubleSide })
    roofCache.set(key, m)
  }
  return m
}

function houseInner(root: THREE.Group, o: HouseOpts) {
  const gb = new GB()
  const { x0, z0, x1, z1 } = o
  const { lo, hi } = baseOf(x0, z0, x1, z1)
  const y0 = hi + 0.18
  const FH = 1.5
  // plinth
  gb.box(M.stoneDark, M.stone, x0 - 0.06, lo - 0.6, z0 - 0.06, x1 + 0.06, y0, z1 + 0.06, 4)
  let y = y0
  const doorWorld: V2 = [0, 0]
  const st: HouseStyle = o.style ?? {
    roofShape: "gable",
    wall: (o.timber ?? true) ? "timber" : "plaster",
    roofRamp: o.roof,
    windows: "leaded",
    shutter: "cGreen",
    door: o.sign ? "arched" : "plank",
    chimneys: o.chimney === false ? 0 : 1,
    jetty: o.floors > 1,
  }
  for (let f = 0; f < o.floors; f++) {
    // a timber house's upper floor overhangs the lower; other walls rise straight
    const ins = st.jetty && f === 0 ? 0.14 : 0
    const a = x0 + ins,
      b = x1 - ins,
      c = z0 + ins,
      d = z1 - ins
    const faces: [string, number][] = [
      ["s", b - a],
      ["n", b - a],
      ["e", d - c],
      ["w", d - c],
    ]
    const mats: Record<string, THREE.Material> = {}
    faces.forEach(([side, w], k) => {
      const door = f === 0 && o.door.side === side ? o.door.u - ins : undefined
      mats[side] = wallMat(w, FH, o.seed * 10 + f * 4 + k, {
        door,
        timber: st.wall === "timber",
        ramp: o.ramp,
        opening: f === 0 && o.opening === side,
        windows: true,
        material: st.wall === "timber" ? "plaster" : st.wall,
        windowKind: st.windows,
        doorKind: st.door,
        shutter: st.shutter,
      })
    })
    const Y = y + FH
    gb.quad(mats.s, [a, y, d], [b, y, d], [b, Y, d], [a, Y, d])
    gb.quad(mats.n, [b, y, c], [a, y, c], [a, Y, c], [b, Y, c])
    gb.quad(mats.e, [b, y, d], [b, y, c], [b, Y, c], [b, Y, d])
    gb.quad(mats.w, [a, y, c], [a, y, d], [a, Y, d], [a, Y, c])
    if (ins > 0) gb.box(M.woodDark, M.woodDark, x0, Y - 0.08, z0, x1, Y + 0.02, z1, 2) // jetty beam
    y = Y
  }
  // an oriel: on most houses of two floors a little bay of windows stands out from the upper
  // floor on the front, away from the door, on brackets of its own and under a roof of its own
  if (o.floors > 1 && o.seed % 3 !== 1) {
    const side = o.door.side,
      { c, len } = sideOf(o, side),
      { n, t } = SIDE[side]
    const along = o.door.u < len / 2 ? len * 0.24 : -len * 0.24 // from the middle, on the other half from the door
    if (len > 3) {
      const W = 1.1,
        D = 0.36,
        yb = y0 + FH + 0.12,
        yt = y0 + 2 * FH - 0.12
      const at = (u: number, out: number): V2 => [c[0] + t[0] * (along + u) + n[0] * out, c[1] + t[1] * (along + u) + n[1] * out]
      const box = (side: THREE.Material, top: THREE.Material, u0: number, o0: number, ya: number, u1: number, o1: number, yb2: number) => {
        const p = at(u0, o0),
          q2 = at(u1, o1)
        gb.box(side, top, Math.min(p[0], q2[0]), ya, Math.min(p[1], q2[1]), Math.max(p[0], q2[0]), yb2, Math.max(p[1], q2[1]), 2)
      }
      box(st.wall === "timber" ? M.plaster : M.wood, M.woodDark, -W / 2, 0, yb, W / 2, D, yt)
      const front = wallMat(W, FH, o.seed * 10 + 9, {
        timber: st.wall === "timber",
        ramp: o.ramp,
        windows: true,
        material: st.wall === "timber" ? "plaster" : st.wall,
        windowKind: st.windows,
        shutter: st.shutter,
      })
      const f0 = at(-W / 2, D + 0.01),
        f1 = at(W / 2, D + 0.01)
      gb.quad(front, [f0[0], yb, f0[1]], [f1[0], yb, f1[1]], [f1[0], yt, f1[1]], [f0[0], yt, f0[1]])
      // its roof, and the brackets under it
      box(M.woodDark, roofMat(st.roofRamp, o.seed), -W / 2 - 0.08, 0, yt, W / 2 + 0.08, D + 0.1, yt + 0.09)
      for (const u of [-W / 2 + 0.12, W / 2 - 0.12]) box(M.woodDark, M.woodDark, u - 0.05, 0, yb - 0.32, u + 0.05, D * 0.85, yb)
      oriels.push(o.name ?? "")
    }
  }
  // door step + record door point
  const du = o.door.u
  if (o.door.side === "s") {
    doorWorld[0] = x0 + du
    doorWorld[1] = z1 + 0.55
  }
  if (o.door.side === "n") {
    doorWorld[0] = x1 - du
    doorWorld[1] = z0 - 0.55
  }
  if (o.door.side === "e") {
    doorWorld[0] = x1 + 0.55
    doorWorld[1] = z1 - du
  }
  if (o.door.side === "w") {
    doorWorld[0] = x0 - 0.55
    doorWorld[1] = z0 + du
  }
  // two stone steps up to the door, set against the plinth: the upper one at the floor's height,
  // the lower one half way down to the ground
  {
    const side = o.door.side
    const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
      nz = side === "s" ? 1 : side === "n" ? -1 : 0
    const face = side === "s" ? z1 + 0.06 : side === "n" ? z0 - 0.06 : side === "e" ? x1 + 0.06 : x0 - 0.06
    const along = side === "s" || side === "n" ? doorWorld[0] : doorWorld[1]
    const gy = groundH(doorWorld[0], doorWorld[1])
    const step = (out0: number, out1: number, top: number, half: number) => {
      const a0 = face + (nx || nz) * out0,
        a1 = face + (nx || nz) * out1
      const [p0, p1] = [Math.min(a0, a1), Math.max(a0, a1)]
      if (nz) gb.box(M.stone, M.stoneDark, along - half, gy - 0.3, p0, along + half, top, p1, 4)
      else gb.box(M.stone, M.stoneDark, p0, gy - 0.3, along - half, p1, top, along + half, 4)
    }
    step(0, 0.32, y0 - 0.01, 0.5)
    if (y0 - gy > 0.12) step(0.32, 0.6, gy + (y0 - gy) * 0.5, 0.56)
  }

  // roof: its shape and colour are the house's own (town/style.ts)
  const span = o.axis === "x" ? z1 - z0 : x1 - x0
  const len = o.axis === "x" ? x1 - x0 : z1 - z0
  const rh = span * 0.5 * (o.roof === "thatch" ? 1.15 : 0.95) * (st.roofShape === "shed" ? 1.1 : 1)
  const ov = 0.32
  const sl = rh / (span / 2)
  const yE = y - ov * sl,
    yR = y + rh
  const rm = roofMat(st.roofRamp, o.seed)
  const gm = new THREE.MeshLambertMaterial({ map: toTex(gableTex(span, rh, st.wall === "timber", o.seed, o.ramp), false) })
  // work in the roof's own frame: u along the ridge, w across it; map back to x, z
  const P = (u: number, yy: number, w: number): [number, number, number] => (o.axis === "x" ? [x0 + u, yy, z0 + w] : [x0 + w, yy, z0 + u])
  // faces are wound to face outward in x/z; with the axis along z, u and w swap, which mirrors them
  const q = (a: [number, number, number], b: [number, number, number], c: [number, number, number], d: [number, number, number], m: THREE.Material = rm) =>
    o.axis === "x" ? gb.quad(m, a, b, c, d, 4, 4) : gb.quad(m, b, a, d, c, 4, 4)
  const t = (a: [number, number, number], b: [number, number, number], c: [number, number, number], m: THREE.Material) =>
    o.axis === "x" ? gb.tri(m, a, b, c, [0, 0], [1, 0], [0.5, 1]) : gb.tri(m, b, a, c, [0, 0], [1, 0], [0.5, 1])
  const L0 = -ov,
    L1 = len + ov,
    W0 = -ov,
    W1 = span + ov,
    mid = span / 2
  if (st.roofShape === "shed") {
    // one slope, from the high wall at the back (w = 0) down over the front
    const yHi = y + rh,
      yLo = y - ov * (rh / span)
    q(P(L0, yLo, W1), P(L1, yLo, W1), P(L1, yHi + ov * (rh / span), W0), P(L0, yHi + ov * (rh / span), W0))
    // the side walls rise to meet it
    t(P(len, y, span), P(len, y, 0), P(len, yHi, 0), gm)
    t(P(0, y, 0), P(0, y, span), P(0, yHi, 0), gm)
    gb.box(M.woodDark, M.woodDark, ...bboxOf(P(L0, yHi + ov * (rh / span) - 0.06, W0 - 0.04), P(L1, yHi + ov * (rh / span) + 0.06, W0 + 0.1)), 2)
  } else if (st.roofShape === "hip") {
    // four slopes: the ridge stops short of each end by half the span
    const r0 = Math.min(mid, len / 2 - 0.05),
      r1 = Math.max(len - mid, len / 2 + 0.05)
    q(P(L0, yE, W1), P(L1, yE, W1), P(r1, yR, mid), P(r0, yR, mid))
    q(P(L1, yE, W0), P(L0, yE, W0), P(r0, yR, mid), P(r1, yR, mid))
    t(P(L1, yE, W1), P(L1, yE, W0), P(r1, yR, mid), rm)
    t(P(L0, yE, W0), P(L0, yE, W1), P(r0, yR, mid), rm)
    gb.box(M.woodDark, M.woodDark, ...bboxOf(P(r0, yR - 0.06, mid - 0.07), P(r1, yR + 0.08, mid + 0.07)), 2)
  } else {
    q(P(L0, yE, W1), P(L1, yE, W1), P(L1, yR, mid), P(L0, yR, mid))
    q(P(L1, yE, W0), P(L0, yE, W0), P(L0, yR, mid), P(L1, yR, mid))
    t(P(len, y, span), P(len, y, 0), P(len, yR, mid), gm)
    t(P(0, y, 0), P(0, y, span), P(0, yR, mid), gm)
    // bargeboards along the gable ends, and the ridge
    for (const uu of [L0, L1]) {
      q(P(uu, yE - 0.1, W1), P(uu, yE - 0.1, mid), P(uu, yR + 0.02, mid), P(uu, yE + 0.04, W1), M.woodDark)
      q(P(uu, yE - 0.1, mid), P(uu, yE - 0.1, W0), P(uu, yE + 0.04, W0), P(uu, yR + 0.02, mid), M.woodDark)
    }
    gb.box(M.woodDark, M.woodDark, ...bboxOf(P(L0 - 0.02, yR - 0.06, mid - 0.07), P(L1 + 0.02, yR + 0.08, mid + 0.07)), 2)
  }
  // chimneys: where the hearth is, and a second over a work fire
  const r = new Rng(o.seed)
  for (let k = 0; k < st.chimneys; k++) {
    const uu = len * (k === 0 ? 0.2 + r.next() * 0.25 : 0.65 + r.next() * 0.2)
    const ww = st.roofShape === "shed" ? span * 0.3 : mid + (r.next() < 0.5 ? -1 : 1) * span * 0.22
    const [cxx, , czz] = P(uu, 0, ww)
    const top = (st.roofShape === "shed" ? y + rh : yR) + 0.55 + k * 0.15
    const stoneish = k === 1 ? M.stoneDark : M.stone
    gb.box(stoneish, M.stoneDark, cxx - 0.22, y, czz - 0.22, cxx + 0.22, top, czz + 0.22, 4)
    gb.box(M.stoneDark, M.stoneDark, cxx - 0.27, top - 0.05, czz - 0.27, cxx + 0.27, top + 0.05, czz + 0.27, 4)
    chimneys.push(new THREE.Vector3(cxx, top + 0.1, czz))
  }
  const hg = gb.build()
  root.add(hg)
  occluder(hg, 0.22, !!o.private)
  if (o.sign) hangSign(root, o, doorWorld, y0)
  blockRect(x0 - 0.1, z0 - 0.1, x1 + 0.1, z1 + 0.1)
  if (o.name) places[o.name] = doorWorld
  return { doorWorld, y0, top: y }
}

function hangSign(root: THREE.Group, o: HouseOpts, door: V2, y0: number) {
  const gb = new GB()
  const side = o.door.side
  const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
    nz = side === "s" ? 1 : side === "n" ? -1 : 0
  const tx = -nz,
    tz = nx // along wall
  const wx = door[0] - nx * 0.55 + tx * 0.75,
    wz = door[1] - nz * 0.55 + tz * 0.75
  const yb = y0 + 1.75
  gb.box(M.iron, M.iron, Math.min(wx, wx + nx * 0.7) - 0.02, yb, Math.min(wz, wz + nz * 0.7) - 0.02, Math.max(wx, wx + nx * 0.7) + 0.02, yb + 0.04, Math.max(wz, wz + nz * 0.7) + 0.02, 2)
  root.add(gb.build())
  const sm = new THREE.MeshLambertMaterial({ map: toTex(signTex(o.sign!), false), side: THREE.DoubleSide })
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), sm)
  p.position.set(wx + nx * 0.45, yb - 0.26, wz + nz * 0.45)
  p.rotation.y = Math.atan2(nx, nz) + Math.PI / 2
  p.castShadow = true
  root.add(p)
  animateObject(p, (t) => {
    p.rotation.z = Math.sin(t * 1.3 + wx) * 0.06
  })
}

export { glowify }
