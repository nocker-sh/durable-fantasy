import type { V2 } from "#/world/scene/construction/registry"

const STREET_THINGS = ["ash-heap", "crate-stack", "ash-heap", "covered-goods", "stool", "ash-heap", "cat", "basket-stack", "water-butt", "kindling", "bench", "hand-cart", "ash-heap", "wood-stack"]
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"

import { currentLayout } from "#/world/scene/current-layout"
import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import { THINGS } from "#/world/scene/props/catalog"
import { HOUSES } from "#/world/town/houses"
import { clear } from "#/world/scene/helpers/dressing/clear"
import { placed } from "#/world/scene/dressing"

export function dressStreets(gb: GB, map: string) {
  const town = HOUSES.filter((h) => h.map === map)
  if (!town.length) return
  const n = { value: 0 }
  for (const road of currentLayout().roads) {
    const narrow = road.w < 0.7
    for (const k = { value: 2 }; k.value < road.pts.length - 2; k.value += narrow ? 3 : 6) {
      const xState = road.pts[k.value],
        x = xState[0],
        z = xState[1],
        nxState = road.pts[k.value + 1],
        nx = nxState[0],
        nz = nxState[1]
      const len = Math.hypot(nx - x, nz - z) || 1
      const side = (k.value + n.value) % 2 ? 1 : -1
      const id = STREET_THINGS[(k.value * 7 + n.value * 3) % STREET_THINGS.length]
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
      thing.build({ builder: gb, x: p[0], z: p[1], seed: k.value + n.value, along: Math.abs(nx - x) > Math.abs(nz - z) })
      placed.push(`street:${id}`)
      n.value++
    }
  }
}
