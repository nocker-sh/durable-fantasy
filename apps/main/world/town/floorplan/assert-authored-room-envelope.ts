import { gableRoofHeight } from "#/lib/engine/gable-roof-height"
import { getBuildingEnvelopeRoof } from "#/world/town/get-building-envelope-roof"
import { getAuthoredRoomSpace } from "#/world/town/floorplan/get-authored-room-space"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import type { SpatialFrame } from "#/lib/engine/spatial-frame"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** A gable underside is concave, so all four strip corners bound a flat room ceiling, including strips crossing the ridge. */
export function assertAuthoredRoomEnvelope(source: AuthoredPlan, frame: SpatialFrame): void {
  if (!source.exterior) return
  const roof = getBuildingEnvelopeRoof(source.exterior)
  assertAuthoredFloorLevels(source.floorLevels, source.floors)
  for (const room of source.rooms) {
    const level = source.floorLevels.find((level) => level.floor === room.floor)
    if (!level || level.elevation < 0) throw new Error(`Authored room exceeds exterior envelope: ${room.id}`)
    const floor = frame.toWorld([0, level.elevation, 0])[1],
      ceiling = frame.toWorld([0, level.ceiling, 0])[1]
    if (ceiling <= floor) throw new Error(`Authored room exceeds exterior envelope: ${room.id}`)
    for (const strip of getAuthoredRoomSpace(room, source).footprint) {
      const corners = [
        [strip.x0, strip.z0],
        [strip.x0, strip.z1],
        [strip.x1, strip.z0],
        [strip.x1, strip.z1],
      ]
      for (const corner of corners) {
        const point = frame.toWorld([corner[0], level.ceiling, corner[1]]),
          height = gableRoofHeight(roof, point[0], point[2])
        if (!Number.isFinite(height) || point[1] - height > 1e-6) throw new Error(`Authored room exceeds exterior envelope: ${room.id}`)
      }
    }
  }
}
