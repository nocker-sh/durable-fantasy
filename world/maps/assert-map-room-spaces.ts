import { getMapSpaceFrame } from "#/world/maps/get-map-space-frame"
import type { MapSpace } from "#/world/maps/map-space-types"
import type { Rect } from "#/world/town/floorplan/types"

/** Check actual room strips inside one floor's unrotated metric frame, allowing boundary contact only. */
export function assertMapRoomSpaces(space: MapSpace): void {
  getMapSpaceFrame(space)
  if (space.rooms === undefined) return
  const ids = new Set<string>(),
    occupied: { id: string; rect: Readonly<Rect> }[] = []
  for (const room of space.rooms) {
    if (!room.id || ids.has(room.id) || !room.footprint.length) throw new Error(`Invalid map room space: ${room.id}`)
    ids.add(room.id)
    for (const rect of room.footprint) {
      if (
        ![rect.x0, rect.z0, rect.x1, rect.z1].every(Number.isFinite) ||
        rect.x0 < 0 ||
        rect.z0 < 0 ||
        rect.x1 > space.frame.width ||
        rect.z1 > space.frame.depth ||
        rect.x1 <= rect.x0 ||
        rect.z1 <= rect.z0
      )
        throw new Error(`Map room footprint is outside its frame: ${room.id}`)
      for (const previous of occupied)
        if (rect.x0 < previous.rect.x1 && previous.rect.x0 < rect.x1 && rect.z0 < previous.rect.z1 && previous.rect.z0 < rect.z1)
          throw new Error(`Map room footprints overlap: ${previous.id} / ${room.id}`)
      occupied.push({ id: room.id, rect })
    }
  }
}
