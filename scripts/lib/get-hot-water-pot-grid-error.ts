import { getPouringPotWorldBounds } from "#/world/scene/figure/get-pouring-pot-world-bounds"
import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import type { HotWaterPoseContext } from "#/scripts/lib/hot-water-frame-types"

type Props = Pick<HotWaterPoseContext, "room" | "definition" | "review" | "pose">

/** 台のセルだけは別の立体検査へ渡し、ほかの占有と範囲外は許さない。 */
export function getHotWaterPotGridError(props: Props): Error | null {
  const grid = props.room.grid
  if (!grid) return new Error("Pouring pot room occupancy has no measured grid")
  const bounds = getPouringPotWorldBounds({ profile: props.definition.profile, pose: props.pose })
  if (bounds instanceof Error) return bounds
  const table = props.review.layout.table
  const invalid = getGridRectangleClearanceError({ rect: bounds, cellSize: grid.cell_m, isCellFree: (cell) => [".", "D", table.symbol].includes(grid.rows[cell[1]]?.[cell[0]] ?? "") })
  if (invalid) return new Error("Pouring pot overlaps room occupancy", { cause: invalid })
  return null
}
