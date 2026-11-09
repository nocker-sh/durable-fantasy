import { interiorRows } from "#/world/town/interior-rows"
import type { Interior } from "#/world/town/interiors"
import type { InteriorStairRoom } from "#/world/town/interior-stair-types"

/** Map identity and a building's floor must each resolve unambiguously before joining stairs. */
export function getInteriorStairRegistry(interiors: readonly Interior[]) {
  const rooms = new Map<string, InteriorStairRoom>()
  const floors = new Map<string, Map<number, InteriorStairRoom>>()
  for (const interior of interiors) {
    if (rooms.has(interior.id)) throw new Error(`Duplicate indoor map: ${interior.id}`)
    const building = floors.get(interior.house.id) ?? new Map<number, InteriorStairRoom>()
    if (building.has(interior.floor)) throw new Error(`Duplicate interior floor: ${interior.house.id}/${interior.floor}`)
    const room = { interior, rows: interiorRows(interior) }
    rooms.set(interior.id, room)
    building.set(interior.floor, room)
    floors.set(interior.house.id, building)
  }
  return { rooms, floors }
}
