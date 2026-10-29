// Where the buildings of a street map stand, checked against its ground plan (layout.ts): each house
// clear of the others by an alley one can walk, off the roads and the square, out of the river,
// the yards and the fields, its door opening onto free ground (town.md「町の並び」).
import type { HouseDef } from "../town/house-types.ts"
import type { Layout, Rect, V2 } from "./layout.ts"

/** The narrowest way between two houses (tiles): one walk cell clear of both walls, with the eaves. */
export const ALLEY = 1.0
/** How far a wall keeps from the edge of a road (tiles). */
const ROAD_GAP = 0.3

const segDist = (p: V2, a: V2, b: V2) => {
  const [dx, dz] = [b[0] - a[0], b[1] - a[1]]
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)))
  return Math.hypot(a[0] + dx * t - p[0], a[1] + dz * t - p[1])
}
const lineDist = (p: V2, pts: readonly V2[]) => {
  let d = Infinity
  for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(p, pts[i], pts[i + 1]))
  return d
}
/** Points round a rect's edge, every quarter tile. */
function rim(r: Rect): V2[] {
  const out: V2[] = []
  const nx = Math.max(1, Math.ceil((r.x1 - r.x0) / 0.25)),
    nz = Math.max(1, Math.ceil((r.z1 - r.z0) / 0.25))
  for (let i = 0; i <= nx; i++) out.push([r.x0 + ((r.x1 - r.x0) * i) / nx, r.z0], [r.x0 + ((r.x1 - r.x0) * i) / nx, r.z1])
  for (let j = 0; j <= nz; j++) out.push([r.x0, r.z0 + ((r.z1 - r.z0) * j) / nz], [r.x1, r.z0 + ((r.z1 - r.z0) * j) / nz])
  return out
}
const off = (r: Rect) => r.x0 < -50
const overlaps = (a: Rect, b: Rect, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.z0 < b.z1 + m && b.z0 < a.z1 + m
const inside = (p: V2, r: Rect) => p[0] > r.x0 && p[0] < r.x1 && p[1] > r.z0 && p[1] < r.z1

/** Where one steps out of a house's door, half a tile out. */
export function doorStep(h: HouseDef): V2 {
  const u = h.door.u
  return h.door.side === "s" ? [h.x0 + u, h.z1 + 0.5] : h.door.side === "n" ? [h.x1 - u, h.z0 - 0.5] : h.door.side === "e" ? [h.x1 + 0.5, h.z1 - u] : [h.x0 - 0.5, h.z0 + u]
}

/** What is wrong with where the houses of one map stand: empty when nothing is. */
export function sitingProblems(layout: Layout, houses: readonly HouseDef[], size = 48): string[] {
  const out: string[] = []
  const yards: [string, Rect][] = [
    ["terrace", layout.terrace],
    ["lavoir", layout.lavoir],
    ["bridge", layout.bridge],
    ["pigpen", layout.pigpen],
    ["pasture", layout.pasture],
    ["graveyard", layout.graveyard],
    ...layout.fields.map((f, i): [string, Rect] => [`field ${i}`, f]),
    ...layout.gardens.map((g, i): [string, Rect] => [`garden ${i}`, g]),
    ...layout.dirtPatches.map(([x0, z0, x1, z1], i): [string, Rect] => [`yard ${i}`, { x0, z0, x1, z1 }]),
  ]
  for (const [i, h] of houses.entries()) {
    const edge = rim(h)
    if (h.x0 < 1 || h.z0 < 1 || h.x1 > size - 1 || h.z1 > size - 1) out.push(`${h.id}: off the map`)
    for (const g of houses.slice(i + 1)) if (overlaps(h, g, ALLEY - 1e-6)) out.push(`${h.id}: within an alley of ${g.id}`)
    const step = doorStep(h)
    // a lane that ends at the door may come right up to the wall
    const toDoor = (pts: readonly V2[]) => [pts[0], pts[pts.length - 1]].some((e) => Math.hypot(e[0] - step[0], e[1] - step[1]) < 1.5)
    for (const [k, r] of layout.roads.entries()) if (!toDoor(r.pts) && edge.some((p) => lineDist(p, r.pts) < r.w + ROAD_GAP)) out.push(`${h.id}: on road ${k}`)
    if (!off({ x0: layout.plaza[0], z0: layout.plaza[1], x1: 0, z1: 0 }) && edge.some((p) => Math.hypot(p[0] - layout.plaza[0], p[1] - layout.plaza[1]) < layout.plazaR + 0.2)) out.push(`${h.id}: on the square`)
    if (layout.river[0][0] > -50 && edge.some((p) => lineDist(p, layout.river) < layout.riverHW + 1)) out.push(`${h.id}: in the river`)
    // a house's own yard may come up to its wall; nothing goes under it
    for (const [name, r] of yards) if (!off(r) && overlaps(h, r, name.startsWith("yard") ? -0.05 : 0.3)) out.push(`${h.id}: on the ${name}`)
    if (houses.some((g) => inside(step, g)) || yards.some(([name, r]) => !name.startsWith("yard") && !off(r) && inside(step, r))) out.push(`${h.id}: door opens onto something`)
  }
  return out
}
