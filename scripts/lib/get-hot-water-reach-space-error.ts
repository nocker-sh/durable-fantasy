import { getHotWaterStationSolids } from "./get-hot-water-station-solids"
import { buildBody } from "#/world/scene/figure/body"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { getHorizontalBounds } from "#/lib/graphics/ray/get-horizontal-bounds"
import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { getHotWaterPouringReview } from "#/scripts/lib/get-hot-water-pouring-review"
import type { getPouringPotReachPose } from "#/world/scene/figure/get-pouring-pot-reach-pose"
import type { Look } from "#/world/scene/figure/look"
type Props = {
  room: SettingDocument
  review: Exclude<ReturnType<typeof getHotWaterPouringReview>, Error>
  look: Look
  posed: Exclude<ReturnType<typeof getPouringPotReachPose>, Error>
  body: readonly [number, number]
  spaceIndex: number
}

/** Let arms pass above the table only after checking its actual top and every leg; all other occupied grid cells stay blocked. */
export function getHotWaterReachSpaceError(props: Props): Error | null {
  const grid = props.room.grid,
    table = props.review.layout.table,
    space = table.use_space?.[props.spaceIndex]?.rect
  if (
    !grid ||
    !space ||
    props.body[0] < space[0] * grid.cell_m ||
    props.body[0] >= (space[0] + space[2]) * grid.cell_m ||
    props.body[1] < space[1] * grid.cell_m ||
    props.body[1] >= (space[1] + space[3]) * grid.cell_m
  )
    return new Error("Pouring body leaves its assigned table operating space")
  const body = buildBody(props.look, props.posed.skeleton, null)
  const solids = getHotWaterStationSolids(props)
  if (solids instanceof Error) return solids
  for (const solid of solids) {
    const local = toHeadingLocalCuboid({ box: solid, root: [props.body[0], props.posed.rootY, props.body[1]], heading: Math.PI })
    if (local instanceof Error) return local
    for (const primitive of body.prims)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box: local }))
        return new Error("Pouring body clearance from the table or cups remains unresolved", { cause: { primitive: primitive.id, solid } })
  }
  const bounds = getHorizontalBounds({ primitives: body.prims, position: props.body, heading: Math.PI, scale: 1 })
  if (bounds instanceof Error) return bounds

  return getGridRectangleClearanceError({ rect: bounds, cellSize: grid.cell_m, isCellFree: (cell) => [".", "D", table.symbol].includes(grid.rows[cell[1]]?.[cell[0]] ?? "") })
}
