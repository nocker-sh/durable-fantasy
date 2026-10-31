import { assertMapRoomSeparation } from "#/world/maps/assert-map-room-separation"
import { assertMapSpaceContainment } from "#/world/maps/assert-map-space-containment"
import type { MapSpaceRegistry } from "#/world/maps/map-space-types"

/** Known frames must lead through registered, uniquely keyed parents to an explicit spatial root. */
export function assertMapSpaceRegistry(maps: MapSpaceRegistry): void {
  const checked = new Set<string>()
  for (const id of Object.keys(maps)) {
    const chain = new Set<string>()
    for (const cursor = { id }; !checked.has(cursor.id);) {
      const map = Object.hasOwn(maps, cursor.id) ? maps[cursor.id] : undefined
      if (!map || map.id !== cursor.id) throw new Error(`Map space parent is missing or miskeyed: ${cursor.id}`)
      if (chain.has(cursor.id)) throw new Error(`Map space parent cycle: ${cursor.id}`)
      chain.add(cursor.id)
      if (!map.space) break
      cursor.id = map.space.parentMap
    }
    for (const member of chain) checked.add(member)
  }
  assertMapRoomSeparation(maps)
  assertMapSpaceContainment(maps)
}
