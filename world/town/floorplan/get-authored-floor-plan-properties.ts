import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { FloorPlan } from "#/world/town/floorplan/types"

type Props = Readonly<{ source: AuthoredPlan; entrance: NonNullable<FloorPlan["entrance"]> }>
type Properties = Omit<FloorPlan, "rooms" | "pieces" | "dividers" | "unplaced" | "unrepresentedRooms">

/** Keep structural metadata and its original field order independent of room and partition collection. */
export function getAuthoredFloorPlanProperties(props: Props): Properties {
  const source = props.source
  return {
    id: source.id,
    authored: true,
    windows: source.windows,
    lamps: source.lamps,
    flues: source.flues,
    cellSize: source.cellM,
    doorWidth: source.entryWidth * source.cellM,
    doorHeight: source.entryHeight,
    stairSections: source.stairSections,
    floorLevels: source.floorLevels,
    W: source.width * source.cellM,
    D: source.depth * source.cellM,
    floors: source.floors,
    entrance: props.entrance,
    door: (source.entry[0] + 0.5) * source.cellM,
  }
}
