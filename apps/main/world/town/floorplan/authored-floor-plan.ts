import { stairGeometry } from "#/world/town/floorplan/stair-geometry"
import { assertAuthoredFloorLevels } from "#/world/town/floorplan/assert-authored-floor-levels"
import { assertAuthoredPlanDimensions } from "#/world/town/floorplan/assert-authored-plan-dimensions"
import { assertAuthoredFloorCoverage } from "#/world/town/floorplan/assert-authored-floor-coverage"
import { getAuthoredEntrance } from "#/world/town/floorplan/get-authored-entrance"
import { getAuthoredRoomProjection } from "#/world/town/floorplan/get-authored-room-projection"
import { getAuthoredWallDividers } from "#/world/town/floorplan/get-authored-wall-dividers"
import { getAuthoredFloorPlanProperties } from "#/world/town/floorplan/get-authored-floor-plan-properties"
import type { FloorPlan } from "#/world/town/floorplan/types"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"

/** Project authored cells once into metres; rendering and collision consume the same result. */
export function authoredFloorPlan(source: AuthoredPlan): FloorPlan {
  assertAuthoredPlanDimensions(source)
  const entrance = getAuthoredEntrance(source)
  assertAuthoredFloorLevels(source.floorLevels, source.floors)
  const projected = getAuthoredRoomProjection(source)
  assertAuthoredFloorCoverage({ source, entrance, projected })
  const dividers = getAuthoredWallDividers({ source, floors: projected.floors })
  for (const section of source.stairSections) stairGeometry(section)
  return {
    ...getAuthoredFloorPlanProperties({ source, entrance: entrance.opening }),
    rooms: [...projected.rooms],
    pieces: [...projected.pieces],
    dividers: [...dividers],
    unplaced: [],
    unrepresentedRooms: [],
  }
}
