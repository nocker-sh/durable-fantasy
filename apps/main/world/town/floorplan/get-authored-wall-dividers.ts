import { getIntegerRange } from "#/lib/engine/get-integer-range"
import { getAuthoredWallRuns } from "#/world/town/floorplan/get-authored-wall-runs"
import { getAuthoredGridExtent } from "#/world/town/floorplan/get-authored-grid-extent"
import type { AuthoredPlan } from "#/world/town/floorplan/authored-types"
import type { AuthoredProjectedFloors } from "#/world/town/floorplan/authored-projection-types"
import type { Divider } from "#/world/town/floorplan/types"

type Props = Readonly<{ source: AuthoredPlan; floors: AuthoredProjectedFloors }>

/** Build partitions by floor, row and column while leaving exterior walls to the building shell. */
export function getAuthoredWallDividers(props: Props): readonly Divider[] {
  const dividers: Divider[] = []
  for (const floor of getIntegerRange(0, props.source.floors))
    for (const row of getIntegerRange(1, props.source.depth - 1)) {
      const walls = props.floors.get(floor)?.get(row)?.walls
      if (!walls) continue
      for (const run of getAuthoredWallRuns({ width: props.source.width, walls }))
        dividers.push({ floor, kind: "壁", ...getAuthoredGridExtent({ cellM: props.source.cellM, x: run.start, z: row, width: run.end - run.start, depth: 1 }) })
    }
  return dividers
}
