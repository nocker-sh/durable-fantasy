import { places } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import { HOUSES } from "#/world/town/houses"
import type { HouseDef } from "#/world/town/house-types"
import { OUT } from "#/world/scene/dressing"
import { doorPoint } from "#/world/scene/helpers/dressing/door-point"
import { standing } from "#/world/scene/helpers/dressing/standing"

/** Free ground for a footprint of half-size `r`, and not on the way out of the door. */
export function clear(h: HouseDef, p: V2, r: number): boolean {
  // the path from every door on the map straight out for two tiles stays open (not only this house's)
  for (const o of HOUSES) {
    if (o.map !== h.map) continue
    const door = doorPoint(o),
      dxState = OUT[o.door.side],
      dx = dxState[0],
      dz = dxState[1]
    for (const k = { value: 0 }; k.value <= 4; k.value++) if (Math.hypot(p[0] - (door[0] + dx * k.value * 0.5), p[1] - (door[1] + dz * k.value * 0.5)) < r * 0.6 + 0.55) return false
  }
  // and where people stand and work stays free
  for (const q of Object.values(places)) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < r + 1.4) return false
  for (const q of standing(h.map)) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < r + 0.9) return false
  // nothing stands in a road: the way stays two cells wide at the least
  if (roadD(p[0], p[1]) < r + 0.35) return false
  // the walk grid is in half tiles, so test a little inside the footprint
  const q = r * 0.6
  for (const entry of [
    [0, 0],
    [q, q],
    [-q, q],
    [q, -q],
    [-q, -q],
  ]) {
    const ox = entry[0]
    const oz = entry[1]
    if (!isFree(p[0] + ox, p[1] + oz)) return false
  }
  return true
}
