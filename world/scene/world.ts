import { ScalarField } from "../../lib/engine/scalar-field.ts"
// Map layout, height field and walkability. Units: 1 = one tile. x = east, z = south.
import { fbm, vnoise } from "./pix"

export const N = 48
export const FR = 8 // field samples per tile
const GN = N * FR + 1

import { riverX0, smooth, VILLAGE, type Layout } from "../maps/layout.ts"

export { catmull, smooth, OFF, OFF_LINE, OFF_POINT, VILLAGE, type Layout, type Road, type V2 } from "../maps/layout.ts"

import { Polyline } from "../../lib/engine/polyline.ts"
const segDist = Polyline.distance

import { lerp } from "../../lib/engine/math.ts"

export const WATER_Y = -0.95
export function riverX(z: number): number {
  return riverX0(z, layout.river)
}
let layout = VILLAGE

export const inRect = (x: number, z: number, r: { x0: number; z0: number; x1: number; z1: number }, pad = 0) => x >= r.x0 - pad && x < r.x1 + pad && z >= r.z0 - pad && z < r.z1 + pad

// ------------------------------------------------------------------ fields
export const F = {
  h: new Float32Array(GN * GN),
  river: new Float32Array(GN * GN),
  road: new Float32Array(GN * GN), // signed: distance minus half width, min over roads
  trail: new Float32Array(GN * GN),
  roadKind: new Uint8Array(GN * GN),
}

function baseH(x: number, z: number): number {
  const [cx, cz, rx, rz] = layout.town
  const town = 1 - smooth(0, 1, Math.max(0, Math.hypot((x - cx) / rx, (z - cz) / rz) - 0.6) * 3)
  const amp = lerp(layout.relief[1], layout.relief[0], town)
  return (fbm(x, z, 0.075, layout.seed) - 0.5) * amp + 0.1
}

let PLAZA_H = baseH(layout.plaza[0], layout.plaza[1])

function computeH(x: number, z: number, dr: number): number {
  let h = baseH(x, z)
  // plaza flattened
  const dp = Math.hypot(x - layout.plaza[0], z - layout.plaza[1])
  h = lerp(PLAZA_H, h, smooth(layout.plazaR, layout.plazaR + 3, dp))
  // terrace
  const T = layout.terrace
  if (inRect(x, z, T)) h = T.h + (h - 0.1) * 0.25
  // stairs ramp under the step meshes
  const S = layout.stairs
  if (x >= S.x0 && x < S.x1 && z >= S.z0 && z <= S.z1) {
    const t = (z - S.z0) / (S.z1 - S.z0)
    h = lerp(T.h, baseH(x, S.z1 + 0.1), t)
  }
  // river: embankments inside town, natural banks outside
  const [e0, e1] = layout.embanked
  const townRiver = smooth(e0, e0 + 4, z) * (1 - smooth(e1 - 4, e1, z))
  const slope = lerp(2.2, 0.06, townRiver)
  const bed = -1.55 + Math.min(1, (dr / layout.riverHW) ** 2) * 0.35
  if (dr < layout.riverHW) h = bed
  else if (dr < layout.riverHW + slope) {
    const t = smooth(0, 1, (dr - layout.riverHW) / slope)
    h = lerp(-1.2, h, t)
  }
  // lavoir ledge and its stairs
  const L = layout.lavoir
  if (inRect(x, z, L) && dr >= layout.riverHW - 0.02) h = L.h
  const LS = layout.lavStairs
  if (inRect(x, z, LS)) {
    const t = (z - LS.z0) / (LS.z1 - LS.z0)
    h = lerp(L.h, baseH(x, LS.z1 + 0.1), t)
  }
  if (layout.shape) {
    // roads stay walkable: the landform eases off near them
    const rd = Math.max(0, segRoad(x, z))
    h = lerp(h, layout.shape(x, z, h, roadD(x, z)), smooth(0.4, 2.2, rd))
  }
  return h
}

function segRoad(x: number, z: number): number {
  let best = 1e9
  for (const r of layout.roads) best = Math.min(best, segDist(x, z, r.pts) - r.w)
  return best
}

function computeFields() {
  PLAZA_H = baseH(layout.plaza[0], layout.plaza[1])
  for (let j = 0; j < GN; j++)
    for (let i = 0; i < GN; i++) {
      const x = i / FR,
        z = j / FR,
        k = j * GN + i
      const dr = segDist(x, z, layout.river)
      F.river[k] = dr
      let best = 1e9,
        kind = 0
      // no road is laid with a rule: it wanders a little off its line, swells and narrows as feet and
      // wheels have worn it, and its edge is ragged where the verge pushes in
      const sd = layout.seed
      const wx = (vnoise(x, z, 0.14, sd + 401) - 0.5) * 0.9,
        wz = (vnoise(x, z, 0.14, sd + 402) - 0.5) * 0.9
      const swell = 1 + (fbm(x, z, 0.2, sd + 403) - 0.5) * 0.5
      const ragged = (vnoise(x, z, 1.7, sd + 404) - 0.5) * 0.16
      layout.roads.forEach((r) => {
        const d = segDist(x + wx, z + wz, r.pts) - r.w * swell + ragged
        if (d < best) {
          best = d
          kind = r.kind === "cobble" ? 1 : r.kind === "dirt" ? 2 : 3
        }
      })
      F.road[k] = best
      let tr = 1e9
      for (const t of layout.trails ?? []) tr = Math.min(tr, segDist(x, z, t))
      F.trail[k] = tr
      F.roadKind[k] = kind
      F.h[k] = computeH(x, z, dr)
    }
}
computeFields()

/** Make `l` the current map's ground: every painter and builder reads it from now on. */
/** The layout in use, for painters that need its own hooks. */
export const currentLayout = () => layout

export function setLayout(l: Layout) {
  if (l === layout) return
  layout = l
  const known = FIELD_CACHE.get(l)
  if (known) {
    F.h.set(known.h)
    F.river.set(known.river)
    F.road.set(known.road)
    F.roadKind.set(known.roadKind)
    F.trail.set(known.trail ?? new Float32Array(F.trail.length).fill(1e9))
    PLAZA_H = known.plazaH
  } else {
    computeFields()
    FIELD_CACHE.set(l, fieldsNow())
  }
  blocked.fill(0)
  blockedBy.clear()
}

/** The height, river and road fields of a ground plan, worked out once (here or in a worker) and kept. */
export interface Fields {
  h: Float32Array
  river: Float32Array
  road: Float32Array
  roadKind: Uint8Array
  trail?: Float32Array
  plazaH: number
}
const FIELD_CACHE = new Map<Layout, Fields>()
/** A copy of the fields of the plan in use. */
export function fieldsNow(): Fields {
  return { h: F.h.slice(), river: F.river.slice(), road: F.road.slice(), roadKind: F.roadKind.slice(), trail: F.trail.slice(), plazaH: PLAZA_H }
}
/** Fields worked out elsewhere (a worker, or kept from an earlier visit), for when the plan is next used. */
export function primeFields(l: Layout, f: Fields) {
  if (!FIELD_CACHE.has(l)) FIELD_CACHE.set(l, f)
}
export const hasFields = (l: Layout) => FIELD_CACHE.has(l)

const heightField = new ScalarField(F.h, GN, FR)
const riverField = new ScalarField(F.river, GN, FR)
const roadField = new ScalarField(F.road, GN, FR)
const trailField = new ScalarField(F.trail, GN, FR)
export const groundH = (x: number, z: number) => heightField.sample(x, z)
export const riverD = (x: number, z: number) => riverField.sample(x, z)
export const roadD = (x: number, z: number) => roadField.sample(x, z)
/** How far a footpath is (tiles); far away where there are none. */
export const trailD = (x: number, z: number) => trailField.sample(x, z)
export function roadKind(x: number, z: number): number {
  const i = Math.round(Math.min(GN - 1, Math.max(0, x * FR))),
    j = Math.round(Math.min(GN - 1, Math.max(0, z * FR)))
  return F.roadKind[j * GN + i]
}
export const GRID_N = GN

export function bridgeDeckH(x: number): number {
  const B = layout.bridge
  const ha = groundH(B.x0 - 0.2, 22),
    hb = groundH(B.x1 + 0.2, 22)
  const t = (x - B.x0) / (B.x1 - B.x0)
  return lerp(ha, hb, t) + Math.sin(Math.PI * Math.min(1, Math.max(0, t))) * 0.35 + 0.04
}

/** Height a character stands at. */
export function walkH(x: number, z: number): number {
  if (inRect(x, z, layout.bridge)) return Math.max(groundH(x, z), bridgeDeckH(x))
  return groundH(x, z)
}

// ------------------------------------------------------------------ walk grid
export const WR = 2 // cells per tile
export const WN = N * WR
export const blocked = new Uint8Array(WN * WN)

/** In dev builds, which builder blocked each cell (for finding what stands in a road). */
export const blockedBy = new Map<number, string>()
if (import.meta.env?.DEV && typeof window !== "undefined") (window as unknown as { __blockedBy: typeof blockedBy }).__blockedBy = blockedBy
function who(): string {
  if (!import.meta.env?.DEV) return ""
  const frames = (new Error().stack ?? "")
    .split("\n")
    .slice(3, 6)
    .map((l) => /at (\S+)/.exec(l)?.[1] ?? "?")
  return frames.join(" < ")
}
export function blockRect(x0: number, z0: number, x1: number, z1: number) {
  const by = who()
  for (let j = Math.floor(z0 * WR); j < Math.ceil(z1 * WR); j++)
    for (let i = Math.floor(x0 * WR); i < Math.ceil(x1 * WR); i++)
      if (i >= 0 && j >= 0 && i < WN && j < WN) {
        blocked[j * WN + i] = 1
        if (by) blockedBy.set(j * WN + i, by)
      }
}
export function blockCircle(x: number, z: number, r: number) {
  const by = who()
  for (let j = Math.floor((z - r) * WR); j <= Math.ceil((z + r) * WR); j++)
    for (let i = Math.floor((x - r) * WR); i <= Math.ceil((x + r) * WR); i++) {
      const cx = (i + 0.5) / WR,
        cz = (j + 0.5) / WR
      if (Math.hypot(cx - x, cz - z) < r && i >= 0 && j >= 0 && i < WN && j < WN) {
        blocked[j * WN + i] = 1
        if (by) blockedBy.set(j * WN + i, by)
      }
    }
}

export function initWalk() {
  const d = 0.5 / WR
  for (let j = 0; j < WN; j++)
    for (let i = 0; i < WN; i++) {
      const x = (i + 0.5) / WR,
        z = (j + 0.5) / WR
      let b = 0
      if (x < 1 || z < 1 || x > N - 1 || z > N - 1) b = 1
      const onBridge = inRect(x, z, layout.bridge, -0.1)
      const onStairs = inRect(x, z, layout.stairs, 0) || inRect(x, z, layout.lavStairs)
      if (!onBridge) {
        const h = groundH(x, z)
        if (h < WATER_Y + 0.12) b = 1
        if (!onStairs) {
          const hs = [groundH(x + d, z), groundH(x - d, z), groundH(x, z + d), groundH(x, z - d)]
          for (const q of hs) if (Math.abs(q - h) > 0.22) b = 1
        }
      }
      if (inRect(x, z, layout.bridge) && (z < layout.bridge.z0 + 0.3 || z > layout.bridge.z1 - 0.3)) b = 1 // parapets
      blocked[j * WN + i] = b
    }
}

export function isFree(x: number, z: number): boolean {
  const i = Math.floor(x * WR),
    j = Math.floor(z * WR)
  if (i < 0 || j < 0 || i >= WN || j >= WN) return false
  return !blocked[j * WN + i]
}
