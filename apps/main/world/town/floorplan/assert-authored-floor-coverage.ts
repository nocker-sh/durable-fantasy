import { getIntegerRange } from "#/lib/engine/get-integer-range"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { AuthoredRoomProjection } from "#/world/town/floorplan/authored-projection-types"
import type { getAuthoredEntrance } from "#/world/town/floorplan/get-authored-entrance"

type Props = Readonly<{ source: AuthoredPlan; entrance: ReturnType<typeof getAuthoredEntrance>; projected: AuthoredRoomProjection }>

/** Require complete floor coverage before checking the ground-floor doorway against its declared opening. */
export function assertAuthoredFloorCoverage(props: Props): void {
  if (props.projected.coveredCount !== props.source.width * props.source.depth * props.source.floors) throw new Error("Authored plan leaves uncovered floor cells")
  for (const step of getIntegerRange(props.entrance.start, props.entrance.end)) {
    const x = props.entrance.horizontal ? step : props.entrance.edge
    const z = props.entrance.horizontal ? props.entrance.edge : step
    if (props.projected.floors.get(0)?.get(z)?.cells.get(x)?.tile !== "D") throw new Error("Authored entrance disagrees with doorway cells")
  }
}
