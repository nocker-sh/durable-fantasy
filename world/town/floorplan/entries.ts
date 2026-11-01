import { enterable } from "#/world/town/enterable"
import { floorsOf } from "#/world/town/floors-of"
import type { HouseDef } from "#/world/town/house-types"
import { COUNTERS } from "#/world/town/floorplan/furniture"
import { bedPlaces } from "#/world/town/floorplan/bed-places"

type Entry = { name: string; up: boolean; room?: string }

/**
 * The furniture a plan names, one entry per piece, each tagged for upstairs if it lives there; a bed names the room
 * it sleeps in, and so does a clothes chest (one for every room anyone sleeps in).
 */
export function entries(h: HouseDef): Entry[] {
  const out: Entry[] = []
  const twoFloors = floorsOf(h) > 1
  // books stay down by the desk where the ground floor has a study
  const study = h.plan.rooms.some((r) => r.floor === 0 && /書斎/.test(r.name))
  const beds = bedPlaces(h)
  const bed = { value: 0 }
  for (const f of h.plan.furniture) {
    if (f.endsWith("（外）")) continue
    const up = f.endsWith("（2階）")
    const m = /^(.+?)(?:×(\d+))?(?:（2階）)?$/.exec(f)!
    const storeUp =
      twoFloors &&
      ((/酒樽|仕込み樽/.test(m[1]) && h.plan.rooms.some((r) => r.floor === 1 && /蔵|貯蔵/.test(r.name))) || (/書類棚/.test(m[1]) && h.plan.rooms.some((r) => r.floor === 1 && /記録/.test(r.name))))
    for (const _piece of Array.from({ length: Number(m[2] ?? 1) })) {
      // a bed stands in its sleeper's room, on whichever floor that room is
      if (/寝台/.test(m[1])) {
        const place = beds[bed.value++]
        out.push({ name: m[1], up: (place?.floor ?? 0) > 0, room: place?.room })
        continue
      }
      out.push({ name: m[1], up: up || storeUp || (twoFloors && (/衣装箱/.test(m[1]) || (/本棚/.test(m[1]) && !study))) })
    }
  }
  // every shop serves across a counter (a sales board where the plan names none)
  if (h.shop && enterable(h) && !out.some((e) => COUNTERS.test(e.name))) out.push({ name: "売り台", up: false })
  // every room anyone sleeps in keeps a chest for their clothes beside the beds: the plan's own chests first, then
  // one more for each room still without
  const chests = out.filter((e) => e.name === "衣装箱" || e.name === "箪笥")
  h.plan.rooms
    .filter((r) => (r.beds ?? 0) > 0)
    .forEach((r, k) => {
      const own = chests[k]
      const chest: Entry = own ?? { name: "衣装箱", up: false }
      if (!own) out.push(chest)
      chest.room = r.name
      chest.up = r.floor > 0
    })
  return out
}
