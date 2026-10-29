// What stands round each house: firewood against a wall, a bucket by the door,
// the tools of the household's trade (town.md「軒先と路地」). It is all worked out from
// the household table (world/town/houses.ts), never placed by hand, so a fisher's house has nets
// and a weaver's a spare cart wheel, a well-off house flower pots and a modest one a small woodpile.
// Nothing goes in front of a door or on the way to it.
import * as THREE from "three"
import { GB, colorMat, mat } from "./gfx"
import { M, barrel, bucket, crate, sack, woodpile, addSprite, fence, places, type V2 } from "./build"
import { basket, hanging, heap, GPPU } from "./goods"
import { PixBuf, Rng } from "./pix"
import { leafTex } from "./textures"
import { blockCircle, blockRect, currentLayout, groundH, isFree, roadD } from "./world"
import { THINGS, thingsFor } from "./things"
import { HOUSEHOLDS, HOUSES, type HouseDef } from "../town/houses.ts"
import { ROUTINES } from "../town/routines.ts"
import { RESIDENTS } from "../town/residents.ts"

type Side = "n" | "s" | "e" | "w"
const OUT: Record<Side, V2> = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }

/** The point just outside the door. */
function doorPoint(h: HouseDef): V2 {
  const u = h.door.u
  return h.door.side === "s" ? [h.x0 + u, h.z1 + 0.5] : h.door.side === "n" ? [h.x1 - u, h.z0 - 0.5] : h.door.side === "e" ? [h.x1 + 0.5, h.z1 - u] : [h.x0 - 0.5, h.z0 + u]
}

/** Spots along the outside of one wall, `off` tiles out, keeping clear of the door. */
function along(h: HouseDef, side: Side, off: number, step = 0.55): V2[] {
  const out: V2[] = []
  const door = doorPoint(h)
  const [x0, x1, z0, z1] = [h.x0, h.x1, h.z0, h.z1]
  const run = side === "n" || side === "s" ? [x0 + 0.35, x1 - 0.35] : [z0 + 0.35, z1 - 0.35]
  for (let t = run[0]; t <= run[1]; t += step) {
    const p: V2 = side === "s" ? [t, z1 + off] : side === "n" ? [t, z0 - off] : side === "e" ? [x1 + off, t] : [x0 - off, t]
    if (Math.hypot(p[0] - door[0], p[1] - door[1]) < 1.4) continue
    out.push(p)
  }
  return out
}

/** Every spot on `map` where someone stands at some hour, in tiles: their work spot and the tiles and cells of their day. */
const standingOn = new Map<string, V2[]>()
function standing(map: string): V2[] {
  const known = standingOn.get(map)
  if (known) return known
  const out: V2[] = []
  for (const r of RESIDENTS) if ((r.map ?? "phanthiet") === map && typeof r.at !== "string") out.push([r.at[0], r.at[1]])
  for (const day of Object.values(ROUTINES))
    for (const s of day) {
      if (typeof s.where !== "object" || s.where.map !== map) continue
      if ("tile" in s.where) out.push([s.where.tile[0], s.where.tile[1]])
      else if ("cell" in s.where) out.push([(s.where.cell[0] + 0.5) / 2, (s.where.cell[1] + 0.5) / 2])
    }
  standingOn.set(map, out)
  return out
}

/** Free ground for a footprint of half-size `r`, and not on the way out of the door. */
function clear(h: HouseDef, p: V2, r: number): boolean {
  // the path from every door on the map straight out for two tiles stays open (not only this house's)
  for (const o of HOUSES) {
    if (o.map !== h.map) continue
    const door = doorPoint(o),
      [dx, dz] = OUT[o.door.side]
    for (let k = 0; k <= 4; k++) if (Math.hypot(p[0] - (door[0] + dx * k * 0.5), p[1] - (door[1] + dz * k * 0.5)) < r * 0.6 + 0.55) return false
  }
  // and where people stand and work stays free
  for (const q of Object.values(places)) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < r + 1.4) return false
  for (const q of standing(h.map)) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < r + 0.9) return false
  // nothing stands in a road: the way stays two cells wide at the least
  if (roadD(p[0], p[1]) < r + 0.35) return false
  // the walk grid is in half tiles, so test a little inside the footprint
  const q = r * 0.6
  for (const [ox, oz] of [
    [0, 0],
    [q, q],
    [-q, q],
    [q, -q],
    [-q, -q],
  ])
    if (!isFree(p[0] + ox, p[1] + oz)) return false
  return true
}

function firstClear(h: HouseDef, spots: V2[], r: number): V2 | null {
  for (const p of spots) if (clear(h, p, r)) return p
  return null
}

const SIDES_BY_DOOR: Record<Side, Side[]> = { s: ["e", "w", "n", "s"], n: ["w", "e", "s", "n"], e: ["n", "s", "w", "e"], w: ["s", "n", "e", "w"] }

// ---------------------------------------------------------------- small things
const potMat = colorMat(0x9a5a3a)
const soil = colorMat(0x3a2a24)
const net = mat(leafTex("cGray", 51), { side: THREE.DoubleSide })
const hide = colorMat(0x8a6a4a)
const wool = colorMat(0xd8d0c0)

export function flowerPot(gb: GB, root: THREE.Group, x: number, z: number, seed: number) {
  const y = groundH(x, z)
  gb.cyl(potMat, soil, x, z, y, y + 0.22, 0.1, 0.14, 7, 1)
  const g = new THREE.Group()
  g.position.set(x, 0, z + 0.02)
  root.add(g)
  addSprite(g, basket("herb", seed, 16, 14), 0, y + 0.2, 0)
  blockCircle(x, z, 0.16)
}

export function netFrame(gb: GB, x: number, z: number, alongX: boolean) {
  // a net spread to dry on two poles
  const y = groundH(x, z)
  const [ax, az, bx, bz] = alongX ? [x - 0.8, z, x + 0.8, z] : [x, z - 0.8, x, z + 0.8]
  for (const [px, pz] of [
    [ax, az],
    [bx, bz],
  ])
    gb.box(M.woodDark, null, px - 0.04, y, pz - 0.04, px + 0.04, y + 1.5, pz + 0.04, 2)
  if (alongX) gb.box(net, null, ax, y + 0.4, z - 0.01, bx, y + 1.45, z + 0.01, 1)
  else gb.box(net, null, x - 0.01, y + 0.4, az, x + 0.01, y + 1.45, bz, 1)
  blockRect(Math.min(ax, bx) - 0.1, Math.min(az, bz) - 0.1, Math.max(ax, bx) + 0.1, Math.max(az, bz) + 0.1)
}

export function hideFrame(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.box(M.woodDark, null, x - 0.5, y, z - 0.04, x - 0.44, y + 1.3, z + 0.04, 2)
  gb.box(M.woodDark, null, x + 0.44, y, z - 0.04, x + 0.5, y + 1.3, z + 0.04, 2)
  gb.box(M.woodDark, null, x - 0.5, y + 1.24, z - 0.04, x + 0.5, y + 1.3, z + 0.04, 2)
  gb.box(hide, null, x - 0.4, y + 0.35, z - 0.015, x + 0.4, y + 1.2, z + 0.015, 1)
  blockRect(x - 0.55, z - 0.2, x + 0.55, z + 0.2)
}

export function wheel(gb: GB, x: number, z: number) {
  // a spare cart wheel leant against the wall
  const y = groundH(x, z)
  gb.cyl(M.woodDark, M.wood, x, z, y + 0.02, y + 0.1, 0.42, 0.42, 10, 1)
  blockCircle(x, z, 0.3)
}

export function choppingBlock(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.cyl(M.woodV, M.wood, x, z, y - 0.05, y + 0.42, 0.24, 0.26, 8, 1)
  gb.box(M.iron, null, x - 0.02, y + 0.42, z - 0.12, x + 0.02, y + 0.52, z + 0.08, 1)
  gb.box(M.woodDark, null, x - 0.02, y + 0.5, z + 0.04, x + 0.02, y + 0.85, z + 0.08, 1)
  blockCircle(x, z, 0.3)
}

export function spearRack(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  gb.box(M.woodDark, null, x - 0.5, y + 0.9, z - 0.04, x + 0.5, y + 0.98, z + 0.04, 2)
  for (let k = 0; k < 4; k++) {
    const sx = x - 0.36 + k * 0.24
    gb.box(M.woodDark, null, sx - 0.02, y, z - 0.02, sx + 0.02, y + 1.7, z + 0.02, 1)
    gb.box(M.iron, null, sx - 0.03, y + 1.7, z - 0.03, sx + 0.03, y + 1.9, z + 0.03, 1)
  }
  blockRect(x - 0.55, z - 0.2, x + 0.55, z + 0.2)
}

export function planks(gb: GB, x: number, z: number, alongX: boolean) {
  const y = groundH(x, z)
  for (let k = 0; k < 5; k++) {
    const yy = y + 0.04 + k * 0.07
    if (alongX) gb.box(M.wood, M.wood, x - 0.9, yy, z - 0.22, x + 0.9, yy + 0.06, z + 0.22, 2)
    else gb.box(M.wood, M.wood, x - 0.22, yy, z - 0.9, x + 0.22, yy + 0.06, z + 0.9, 2)
  }
  if (alongX) blockRect(x - 0.95, z - 0.3, x + 0.95, z + 0.3)
  else blockRect(x - 0.3, z - 0.95, x + 0.3, z + 0.95)
}

export function woolSacks(gb: GB, x: number, z: number) {
  const y = groundH(x, z)
  for (const [dx, dz] of [
    [-0.2, 0],
    [0.2, 0.05],
    [0, 0.25],
  ])
    gb.cyl(wool, wool, x + dx, z + dz, y, y + 0.4, 0.2, 0.17, 7, 1)
  blockCircle(x, z, 0.4)
}

export function rentSign(root: THREE.Group, x: number, z: number) {
  const c = document.createElement("canvas")
  c.width = 64
  c.height = 32
  const g = c.getContext("2d")!
  g.fillStyle = "#c8b090"
  g.fillRect(0, 0, 64, 32)
  g.fillStyle = "#2a1e1a"
  g.font = 'bold 18px "DotGothic16", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText("貸家", 32, 17)
  const tex = new THREE.CanvasTexture(c)
  tex.magFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  const y = groundH(x, z)
  const gb = new GB()
  gb.box(M.woodDark, null, x - 0.03, y, z - 0.03, x + 0.03, y + 0.9, z + 0.03, 1)
  root.add(gb.build())
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }))
  m.position.set(x, y + 0.85, z + 0.04)
  root.add(m)
  blockCircle(x, z, 0.15)
}

// ---------------------------------------------------------------- the way to the door and the kitchen bed

const stepMat = colorMat(0x8a8478),
  stepDark = colorMat(0x6e6a62)
const bedEarth = colorMat(0x4a3428)

/**
 * Flat stones from the door to the nearest road, worn in by the household's comings and goings.
 * It heads straight out of the door for a step, then each stone goes where the road is nearest,
 * round anything standing. Nothing is laid if the road is not reached within a few tiles.
 */
function doorPath(gb: GB, h: HouseDef) {
  const door = doorPoint(h)
  if (roadD(door[0], door[1]) < 0.4) return
  const [ox, oz] = OUT[h.door.side]
  const stones: V2[] = []
  let p: V2 = [door[0] + ox * 0.1, door[1] + oz * 0.1],
    dir: V2 = [ox, oz]
  for (let k = 0; k < 16; k++) {
    stones.push(p)
    if (roadD(p[0], p[1]) < 0) break
    if (k >= 1) {
      // of the ways ahead (never back towards the house), the one that comes nearest the road
      let best: V2 | null = null,
        bestD = Infinity
      for (let a = -2; a <= 2; a++) {
        const ang = Math.atan2(dir[1], dir[0]) + (a * Math.PI) / 8
        const d: V2 = [Math.cos(ang), Math.sin(ang)]
        const q: V2 = [p[0] + d[0] * 0.42, p[1] + d[1] * 0.42]
        if (!isFree(q[0], q[1]) && roadD(q[0], q[1]) >= 0) continue
        const rd = roadD(q[0], q[1]) + Math.abs(a) * 0.02
        if (rd < bestD) {
          bestD = rd
          best = d
        }
      }
      if (!best) return
      dir = best
    }
    p = [p[0] + dir[0] * 0.42, p[1] + dir[1] * 0.42]
  }
  if (roadD(stones[stones.length - 1][0], stones[stones.length - 1][1]) >= 0) return
  const r = new Rng(h.seed * 13 + 5)
  for (const [x, z] of stones.slice(0, -1)) {
    const w = 0.13 + r.next() * 0.05,
      d = 0.1 + r.next() * 0.04
    const jx = (r.next() - 0.5) * 0.08,
      jz = (r.next() - 0.5) * 0.08
    const y = groundH(x + jx, z + jz)
    gb.box(r.next() < 0.3 ? stepDark : stepMat, stepMat, x + jx - w, y - 0.02, z + jz - d, x + jx + w, y + 0.035, z + jz + d, 1)
  }
  placed.push(`${h.id}:door-path`)
}

const BACK: Record<Side, Side> = { n: "s", s: "n", e: "w", w: "e" }

/**
 * A low fence round the ground behind the house, with a gap to go in by: where the household keeps
 * its vegetables, its wood and its odds and ends. As deep as the ground allows, down to a tile and a
 * half; none if the fence would cross a road, a door's way, someone's spot or another house.
 */
function backYard(root: THREE.Group, h: HouseDef): boolean {
  const back = BACK[h.door.side]
  const [ox, oz] = OUT[back]
  // the back wall's two corners, a little in from the eaves
  const [a, b]: [V2, V2] =
    back === "n" ? [[h.x0 + 0.2, h.z0], [h.x1 - 0.2, h.z0]] : back === "s" ? [[h.x0 + 0.2, h.z1], [h.x1 - 0.2, h.z1]] : back === "e" ? [[h.x1, h.z0 + 0.2], [h.x1, h.z1 - 0.2]] : [[h.x0, h.z0 + 0.2], [h.x0, h.z1 - 0.2]]
  const spots = [...Object.values(places), ...standing(h.map)]
  const doors = HOUSES.filter((o) => o.map === h.map && o !== h).map(doorPoint)
  for (const depth of [2.6, 2.2, 1.8, 1.5]) {
    const pts: V2[] = [
      [a[0] + ox * 0.15, a[1] + oz * 0.15],
      [a[0] + ox * depth, a[1] + oz * depth],
      [b[0] + ox * depth, b[1] + oz * depth],
      [b[0] + ox * 0.15, b[1] + oz * 0.15],
    ]
    // the fence line itself: clear ground, off the roads and the ways to doors
    let ok = true
    for (let i = 0; i < pts.length - 1 && ok; i++) {
      const [p, q] = [pts[i], pts[i + 1]]
      const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.25)
      for (let k = 0; k <= n && ok; k++) {
        const at: V2 = [p[0] + ((q[0] - p[0]) * k) / n, p[1] + ((q[1] - p[1]) * k) / n]
        // the ends that meet the wall stand on the house's own eaves ground
        if ((at[0] - a[0]) * ox + (at[1] - a[1]) * oz < 0.6) continue
        ok = clear(h, at, 0.15)
      }
    }
    if (!ok) continue
    // and inside it nobody's spot and no other door
    const [x0, x1] = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))],
      [z0, z1] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))]
    const inside = (p: V2) => p[0] > x0 - 0.6 && p[0] < x1 + 0.6 && p[1] > z0 - 0.6 && p[1] < z1 + 0.6
    if (spots.some(inside) || doors.some(inside)) continue
    // the way in: a gap in the middle of the far side
    const gate: V2 = [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2]
    fence(root, pts, [gate], 0.55)
    placed.push(`${h.id}:back-yard`)
    return true
  }
  return false
}

/** What each household grows in its bed by the house, the seed picking among the hardy ones. */
const BED_CROPS = ["cabbage", "turnip", "onion", "carrot"] as const

/** A raised bed of earth in a plank frame, with a few rows of greens: the household's own vegetables. */
function kitchenBed(gb: GB, root: THREE.Group, x: number, z: number, alongX: boolean, seed: number) {
  const [hw, hd] = alongX ? [0.7, 0.38] : [0.38, 0.7]
  const y = groundH(x, z)
  const top = y + 0.14
  gb.box(bedEarth, bedEarth, x - hw, y - 0.05, z - hd, x + hw, top, z + hd, 1)
  // the plank frame round it
  for (const [ax, az, bx, bz] of [
    [x - hw - 0.04, z - hd - 0.04, x + hw + 0.04, z - hd],
    [x - hw - 0.04, z + hd, x + hw + 0.04, z + hd + 0.04],
    [x - hw - 0.04, z - hd, x - hw, z + hd],
    [x + hw, z - hd, x + hw + 0.04, z + hd],
  ])
    gb.box(M.wood, M.woodDark, ax, y - 0.05, az, bx, top + 0.03, bz, 1)
  const kind = BED_CROPS[seed % BED_CROPS.length]
  const r = new Rng(seed)
  const looks = [0, 1, 2].map((i) => {
    const b = new PixBuf(18, 16)
    b.blit(heap(kind, 18, 14, seed + i), 0, 2)
    return b
  })
  // two rows along the bed, a gap here and there where something was pulled
  for (const row of [-0.5, 0.5])
    for (let t = -0.55; t <= 0.56; t += 0.37) {
      if (r.next() < 0.2) continue
      const [px, pz] = alongX ? [x + t, z + row * hd] : [x + row * hw, z + t]
      addSprite(root, looks[r.int(3)], px, top - 0.02, pz, 48)
    }
  blockRect(x - hw - 0.05, z - hd - 0.05, x + hw + 0.05, z + hd + 0.05)
}

// ---------------------------------------------------------------- per house

function dress(root: THREE.Group, gb: GB, h: HouseDef) {
  const r = new Rng(h.seed * 31 + 7)
  const hh = HOUSEHOLDS.find((x) => x.id === h.household)
  const sides = SIDES_BY_DOOR[h.door.side]
  const door = doorPoint(h)
  const put = (rad: number, tryAt: (side: Side) => V2[], draw: (p: V2, side: Side) => void, from = 0) => {
    for (const side of sides.slice(from)) {
      const p = firstClear(h, tryAt(side), rad)
      if (p) {
        draw(p, side)
        placed.push(h.id)
        return true
      }
    }
    return false
  }

  if (h.kind === "vacant") {
    const p = firstClear(
      h,
      [
        [door[0] + 0.9, door[1]],
        [door[0] - 0.9, door[1]],
        [door[0], door[1] + 0.9],
      ],
      0.2,
    )
    if (p) rentSign(root, p[0], p[1])
    for (const id of thingsFor(undefined, undefined, true)) placeThing(root, gb, h, id, sides[1], r)
    return
  }
  if (!hh || !h.plan.hearth) return

  backYard(root, h)
  // fuel for the hearth: more wood for a bigger, better-off house
  const len = hh.living === "ゆとりがある" ? 1.6 : hh.living === "ふつう" ? 1.2 : 0.9
  put(
    0.6,
    (s) => along(h, s, 0.95, 0.4),
    (p, s) => woodpile(gb, p[0], p[1], len, hh.living === "慎ましい" ? 2 : 3, s === "n" || s === "s"),
  )
  // a bucket by the door: water from the well
  const bx = door[0] + (h.door.side === "n" || h.door.side === "s" ? 0.75 : 0) + OUT[h.door.side][0] * -0.1
  const bz = door[1] + (h.door.side === "e" || h.door.side === "w" ? 0.75 : 0) + OUT[h.door.side][1] * -0.1
  if (isFree(bx, bz)) bucket(gb, bx, bz)
  // flowers in pots by the door where there is time and money for them
  if (hh.living === "ゆとりがある" || hh.id === "elder" || hh.id === "priest") {
    for (const k of [-1, 1]) {
      const [ox, oz] = h.door.side === "n" || h.door.side === "s" ? [k * 1.0, 0] : [0, k * 1.0]
      const px = door[0] + ox,
        pz = door[1] + oz
      if (isFree(px, pz) && clear(h, [px, pz], 0.1)) flowerPot(gb, root, px, pz, h.seed + k)
    }
  }
  // the trade
  const t = hh.id
  if (t === "fisher")
    put(
      0.9,
      (s) => along(h, s, 1.1, 0.5),
      (p, s) => netFrame(gb, p[0], p[1], s === "n" || s === "s"),
      1,
    )
  if (t === "carter")
    put(
      0.45,
      (s) => along(h, s, 0.6),
      (p) => wheel(gb, p[0], p[1]),
      1,
    )
  if (t === "woodcutter")
    put(
      0.35,
      (s) => along(h, s, 0.9),
      (p) => choppingBlock(gb, p[0], p[1]),
      1,
    )
  if (t === "shepherd")
    put(
      0.45,
      (s) => along(h, s, 0.75),
      (p) => woolSacks(gb, p[0], p[1]),
      1,
    )
  if (t === "leather")
    put(
      0.6,
      (s) => along(h, s, 0.8),
      (p) => hideFrame(gb, p[0], p[1]),
      1,
    )
  if (t === "woodworker")
    put(
      0.95,
      (s) => along(h, s, 0.8, 0.4),
      (p, s) => planks(gb, p[0], p[1], s === "n" || s === "s"),
      1,
    )
  if (t === "guards")
    put(
      0.6,
      (s) => along(h, s, 0.7),
      (p) => spearRack(gb, p[0], p[1]),
      0,
    )
  if (t === "tavern" || t === "inn")
    put(
      0.5,
      (s) => along(h, s, 0.75),
      (p) => {
        barrel(gb, p[0], p[1])
        barrel(gb, p[0] + 0.45, p[1] + 0.2, 0.6, 0.25)
      },
      1,
    )
  if (t === "buyer" || t === "warehouse" || t === "general")
    put(
      0.5,
      (s) => along(h, s, 0.75),
      (p) => {
        crate(gb, p[0], p[1], 0.5)
        crate(gb, p[0], p[1], 0.38, groundH(p[0], p[1]) + 0.4)
        sack(gb, p[0] + 0.45, p[1])
      },
      1,
    )
  if (t === "bakers")
    put(
      0.4,
      (s) => along(h, s, 0.7),
      (p) => {
        sack(gb, p[0], p[1])
        sack(gb, p[0] + 0.3, p[1] + 0.15)
      },
      1,
    )
  if (t === "apothecary")
    put(
      0.4,
      (s) => along(h, s, 0.45),
      (p) => {
        // herbs hung under the eaves to dry
        const g = new THREE.Group()
        g.position.set(p[0], 0, p[1])
        root.add(g)
        for (let k = 0; k < 3; k++) addSprite(g, hanging("herb", h.seed + k), (k - 1) * 0.35, groundH(p[0], p[1]) + 1.9 - 34 / GPPU, 0)
      },
      0,
    )
  // a bed of vegetables at the back or the side, for any household with the ground for it
  const bed = (from: number) =>
    put(
      0.85,
      (s) => along(h, s, 1.15, 0.5),
      (p, s) => {
        kitchenBed(gb, root, p[0], p[1], s === "n" || s === "s", h.seed)
        placed.push(`${h.id}:kitchen-bed`)
      },
      from,
    )
  if (!bed(2)) bed(0)
  // the small things of everyday life along the walls: ash brooms, lidded water, kindling, a stool, a cat
  for (const [k, id] of thingsFor(hh.id, hh.living, false).entries()) placeThing(root, gb, h, id, sides[(k + 1) % 4], r)
  if (t === "farm" && h.kind === "home")
    put(
      0.4,
      (s) => along(h, s, 0.7),
      (p) => {
        sack(gb, p[0], p[1])
        flowerPot(gb, root, p[0] + 0.4, p[1], h.seed)
      },
      1,
    )
  // last, so the stones go round whatever now stands by the house
  doorPath(gb, h)
  void r
}

/** Boards by shop doors: 営業中 while someone minds the counter, 準備中 otherwise (index.ts turns them). */
export const shopBoards: { shop: string; open: THREE.Object3D; shut: THREE.Object3D }[] = []

function boardTex(text: string, ink: string, ground: string) {
  const c = document.createElement("canvas")
  c.width = 96
  c.height = 44
  const g = c.getContext("2d")!
  g.fillStyle = "#4a3428"
  g.fillRect(0, 0, 96, 44)
  g.fillStyle = ground
  g.fillRect(3, 3, 90, 38)
  g.fillStyle = ink
  g.font = 'bold 26px "DotGothic16", sans-serif'
  g.textAlign = "center"
  g.textBaseline = "middle"
  g.fillText(text, 48, 23)
  const t = new THREE.CanvasTexture(c)
  t.magFilter = THREE.NearestFilter
  t.colorSpace = THREE.SRGBColorSpace
  return t
}
const OPEN_MAT = () => new THREE.MeshLambertMaterial({ map: boardTex("営業中", "#1e1410", "#d8c088"), side: THREE.DoubleSide })
const SHUT_MAT = () => new THREE.MeshLambertMaterial({ map: boardTex("準備中", "#d8d0c0", "#3a3034"), side: THREE.DoubleSide })

/** A little board hung by the door of a shop. */
function shopBoard(root: THREE.Group, h: HouseDef) {
  if (!h.shop) return
  const [x, z] = doorPoint(h)
  const [ox, oz] = OUT[h.door.side]
  // beside the door, against the wall, facing out
  const side: V2 = h.door.side === "n" || h.door.side === "s" ? [0.85, 0] : [0, 0.85]
  const bx = x + side[0] - ox * 0.35,
    bz = z + side[1] - oz * 0.35
  const y = groundH(bx, bz) + 1.0
  const rot = Math.atan2(ox, oz)
  const make = (m: THREE.Material) => {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.3), m)
    b.position.set(bx, y, bz)
    b.rotation.y = rot
    root.add(b)
    return b
  }
  const open = make(OPEN_MAT()),
    shut = make(SHUT_MAT())
  shut.visible = false
  shopBoards.push({ shop: h.shop, open, shut })
}

/** Set one of the small things (things.ts) by a house's wall: hung on it, leant on it, or stood a step out. */
function placeThing(root: THREE.Group, gb: GB, h: HouseDef, id: string, side: Side, r: Rng) {
  const thing = THINGS[id]
  if (!thing) return
  const off = thing.wall === "hang" ? 0.12 : thing.wall === "stand" ? 0.22 : 0.45 + thing.r
  const spots = along(h, side, off, 0.45)
  // start somewhere along the wall, not always at its corner
  const from = Math.floor(r.next() * Math.max(1, spots.length))
  const order = [...spots.slice(from), ...spots.slice(0, from)]
  // a thing hung on the wall takes no ground; one lying flat only needs its spot clear; the rest a clear circle
  // and nothing that takes ground goes where it would narrow a way: the ground on its open side, away from the wall, stays free
  const [ox, oz] = OUT[side]
  const roomy = (q: V2) =>
    [-1, -0.5, 0, 0.5, 1].every((a) => {
      const reach = thing.r + 0.9
      const dx = ox * Math.cos(a) - oz * Math.sin(a),
        dz = oz * Math.cos(a) + ox * Math.sin(a)
      return isFree(q[0] + dx * reach, q[1] + dz * reach)
    })
  const p = thing.wall === "hang" ? order[0] : thing.r === 0 ? order.find((q) => clear(h, q, 0.15)) : order.find((q) => clear(h, q, Math.max(thing.r, 0.12)) && roomy(q))
  if (!p) return
  thing.build(gb, p[0], p[1], h.seed + id.length, side === "n" || side === "s")
  placed.push(`${h.id}:${id}`)
  void root
}

/** What was placed, house by house (for /dev and tests). */
export const placed: string[] = []

/** Things along the town's streets and alleys: swept ash, crates and barrels left out, a stool, a cat. */
const STREET_THINGS = ["ash-heap", "crate-stack", "ash-heap", "covered-goods", "stool", "ash-heap", "cat", "basket-stack", "water-butt", "kindling", "bench", "hand-cart", "ash-heap", "wood-stack"]
function dressStreets(gb: GB, map: string) {
  const town = HOUSES.filter((h) => h.map === map)
  if (!town.length) return
  let n = 0
  for (const road of currentLayout().roads) {
    const narrow = road.w < 0.7
    for (let k = 2; k < road.pts.length - 2; k += narrow ? 3 : 6) {
      const [x, z] = road.pts[k],
        [nx, nz] = road.pts[k + 1]
      const len = Math.hypot(nx - x, nz - z) || 1
      const side = (k + n) % 2 ? 1 : -1
      const id = STREET_THINGS[(k * 7 + n * 3) % STREET_THINGS.length]
      const thing = THINGS[id]
      const off = road.w + 0.45 + thing.r
      const p: V2 = [x - ((nz - z) / len) * off * side, z + ((nx - x) / len) * off * side]
      // the same rules as by the houses: clear of every door's way, of where people stand, and roomy all round
      const host = town.reduce((a, b) => (Math.hypot((a.x0 + a.x1) / 2 - p[0], (a.z0 + a.z1) / 2 - p[1]) < Math.hypot((b.x0 + b.x1) / 2 - p[0], (b.z0 + b.z1) / 2 - p[1]) ? a : b))
      if (!clear(host, p, Math.max(thing.r, 0.15))) continue
      const ring = (a: number) => {
        const ang = (a / 8) * Math.PI * 2,
          d = thing.r + 0.7,
          q: V2 = [p[0] + Math.cos(ang) * d, p[1] + Math.sin(ang) * d]
        return isFree(q[0], q[1]) || roadD(q[0], q[1]) < 0
      }
      if (thing.r > 0 && ![0, 1, 2, 3, 4, 5, 6, 7].every(ring)) continue
      thing.build(gb, p[0], p[1], k + n, Math.abs(nx - x) > Math.abs(nz - z))
      placed.push(`street:${id}`)
      n++
    }
  }
}

/** Dress every house on a map. Call after everything else is placed, so it fits round them. */
export function dressHouses(root: THREE.Group, map: string) {
  const gb = new GB()
  placed.length = 0
  shopBoards.length = 0
  for (const h of HOUSES)
    if (h.map === map) {
      dress(root, gb, h)
      shopBoard(root, h)
    }
  dressStreets(gb, map)
  ;(globalThis as { __dressed?: string[] }).__dressed = [...placed]
  root.add(gb.build())
}
