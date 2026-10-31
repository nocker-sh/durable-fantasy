import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapDefinition } from "#/world/maps/types"

type Registry = Readonly<Record<string, Pick<MapDefinition, "id" | "space">>>

/** Known frames must lead through real, uniquely keyed parents to an unplaced root. */
export function assertMapSpaceRegistry(maps: Registry): void {
  const checked = new Set<string>()
  for (const id of Object.keys(maps)) {
    const chain = new Set<string>()
    for (const cursor = { id }; !checked.has(cursor.id);) {
      const map = Object.hasOwn(maps, cursor.id) ? maps[cursor.id] : undefined
      if (!map || map.id !== cursor.id) throw new Error(`Map space parent is missing or miskeyed: ${cursor.id}`)
      if (chain.has(cursor.id)) throw new Error(`Map space parent cycle: ${cursor.id}`)
      chain.add(cursor.id)
      if (!map.space) break
      try {
        getMapSpaceFrame(map.space)
      } catch (error) {
        if (error instanceof RangeError) throw new Error(`Map space frame is invalid: ${cursor.id}`, { cause: error })
        throw error
      }
      cursor.id = map.space.parentMap
    }
    for (const member of chain) checked.add(member)
  }
}
