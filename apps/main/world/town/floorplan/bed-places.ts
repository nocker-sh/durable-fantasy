import type { HouseDef } from "#/world/town/house-types"
import type { BedPlace } from "#/world/town/floorplan/types"

/**
 * Every bed the plan names, in the room of the one who sleeps in it: the declared rooms take beds in plan
 * order until each of their sleepers has one (a double sleeps two). A bed no room asked for stays with the
 * first room anyone sleeps in.
 */
export function bedPlaces(h: HouseDef): BedPlace[] {
  const beds: string[] = []
  for (const entry of h.plan.furniture) {
    if (entry.endsWith("（外）")) continue
    const m = /^(.+?)(?:×(\d+))?(?:（2階）)?$/.exec(entry)
    if (!m || !/寝台/.test(m[1])) continue
    for (let k = 0; k < Number(m[2] ?? 1); k++) beds.push(m[1])
  }
  const out: BedPlace[] = []
  const next = { value: 0 }
  for (const room of h.plan.rooms)
    for (let slept = 0; slept < (room.beds ?? 0) && next.value < beds.length; next.value++) {
      const name = beds[next.value]
      out.push({ name, room: room.name, floor: room.floor })
      slept += /二人用/.test(name) ? 2 : 1
    }
  const first = h.plan.rooms.find((room) => (room.beds ?? 0) > 0)
  for (; next.value < beds.length; next.value++) out.push({ name: beds[next.value], room: first?.name ?? "", floor: first?.floor ?? 0 })
  return out
}
