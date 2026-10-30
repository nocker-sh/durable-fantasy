// Which ground plan each map is laid out on (layout.ts): read by the scene and by the
// workers that paint the ground, so both see the same map. Data only: nothing here draws.
import { VILLAGE, type Layout } from "./layout"
import { CRAFT, FIELD_LAYOUTS, GATE, INDOOR, MARKET } from "./ground-layouts"
import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "../town/house-types"

type V2 = [number, number]

const STREETS: Record<string, Layout> = { phanthiet: VILLAGE, "phanthiet-market": MARKET, "phanthiet-craft": CRAFT, "phanthiet-gate": GATE }

/** The nearest point on any of the roads to `p`. */
function nearestOnRoads(layout: Layout, p: V2): V2 {
  let best: V2 = p,
    bd = Infinity
  for (const r of layout.roads)
    for (let i = 0; i < r.pts.length - 1; i++) {
      const aState = [r.pts[i], r.pts[i + 1]],
        a = aState[0],
        b = aState[1]
      const dxState = [b[0] - a[0], b[1] - a[1]],
        dx = dxState[0],
        dz = dxState[1]
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)))
      const q: V2 = [a[0] + dx * t, a[1] + dz * t]
      const d = Math.hypot(q[0] - p[0], q[1] - p[1])
      if (d < bd) [bd, best] = [d, q]
    }
  return best
}

/** The ground trodden from a house's door out to the road: straight out of the door, then the short way. */
function doorTrail(layout: Layout, h: HouseDef): V2[] {
  const u = h.door.u
  const doorState: [V2, V2] =
      h.door.side === "s"
        ? [
            [h.x0 + u, h.z1 + 0.3],
            [0, 1],
          ]
        : h.door.side === "n"
          ? [
              [h.x1 - u, h.z0 - 0.3],
              [0, -1],
            ]
          : h.door.side === "e"
            ? [
                [h.x1 + 0.3, h.z1 - u],
                [1, 0],
              ]
            : [
                [h.x0 - 0.3, h.z0 + u],
                [-1, 0],
              ],
    door = doorState[0],
    out = doorState[1]
  const step: V2 = [door[0] + out[0] * 0.9, door[1] + out[1] * 0.9]
  return [door, step, nearestOnRoads(layout, step)]
}

/** The town's plans with the trodden ways to every lived-in door added (they are drawn only). */
const trodden = new Map<string, Layout>()

export function layoutOf(map: string): Layout {
  const street = STREETS[map]
  if (street) {
    let t = trodden.get(map)
    if (!t) {
      const doors = HOUSES.filter((h) => h.map === map && h.kind !== "vacant").map((h) => doorTrail(street, h))
      trodden.set(map, (t = { ...street, trails: [...(street.trails ?? []), ...doors] }))
    }
    return t
  }
  return FIELD_LAYOUTS[map] ?? (map.includes("-in-") ? INDOOR : VILLAGE)
}
