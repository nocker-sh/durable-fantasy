import { getAuthoredBuildingSource } from "#/scripts/lib/get-authored-building-source"
import { compileAuthoredRooms } from "#/scripts/lib/compile-authored-rooms"
import { compileAuthoredStairSections } from "#/scripts/lib/compile-authored-stair-sections"
import { entryOpeningHeight } from "#/scripts/lib/entry-opening-height"
import { compileActivitySpots } from "#/scripts/lib/activity-spots"
import { compileRoomDetails } from "#/scripts/lib/room-details"
import { compileRoomFixtures } from "#/scripts/lib/room-fixtures"
import { compileFlues } from "#/scripts/lib/flue-sections"
import { authoredFloorPlan } from "#/world/town/floorplan/authored-floor-plan"
import { compileEnvelope } from "#/scripts/lib/compile-envelope"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"

/** Compile one building from its setting documents; runtime adoption is explicit in HOUSES. */
export function compileAuthoredPlan(building: SettingDocument, documents: readonly SettingDocument[]): AuthoredPlan {
  const source = getAuthoredBuildingSource(building, documents)
  const compiled = compileAuthoredRooms({ building, documents: source.byId, layout: source.layout })
  const entrance = compiled.entrance
  const plan: AuthoredPlan = {
    id: building.id.replace(/^building-/, ""),
    cellM: source.layout.cell_m,
    width: source.layout.width,
    depth: source.layout.depth,
    floors: source.layout.floors.length,
    entry: entrance.at,
    entrySide: entrance.side,
    entryWidth: entrance.width,
    entryHeight: entryOpeningHeight(building),
    rooms: compiled.rooms,
    activitySpots: compileActivitySpots(building, documents),
    details: compileRoomDetails(building, documents),
    ...compileRoomFixtures(building, documents),
    flues: compileFlues(building, source.byId),
    stairSections: [],
    floorLevels: source.floorLevels,
  }
  const assembled: AuthoredPlan = { ...plan, stairSections: compileAuthoredStairSections(building, plan, source.byId) }
  authoredFloorPlan(assembled)
  return { ...assembled, exterior: compileEnvelope(building, source.byId, assembled) }
}
