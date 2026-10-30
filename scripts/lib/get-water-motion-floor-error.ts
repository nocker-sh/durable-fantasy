import { getHorizontalBounds } from "#/lib/graphics/ray/get-horizontal-bounds"
import { appendPrimitives } from "#/lib/graphics/ray/append-primitives"
import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import { buildBody } from "#/world/scene/figure/body"
import type { getWaterMotionSupportError } from "#/world/scene/figure/get-water-motion-support-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Parameters<typeof getWaterMotionSupportError>[0] & { room: SettingDocument; symbol: string }

/** Enclose the moving body and jar before testing every overlapping cell, retaining all non-target obstacles. */
export function getWaterMotionFloorError(props: Props): Error | null {
  const grid = props.room.grid,
    body = buildBody(props.look, { ...props.posed.skeleton, handGrips: undefined }, null)
  if (!grid) return new Error("Moving water vessel has no floor grid")
  const primitives = appendPrimitives(body.prims, props.posed.primitives)
  if (primitives instanceof Error) return primitives
  const bounds = getHorizontalBounds({ primitives, position: props.body, heading: props.heading, scale: 1 })
  if (bounds instanceof Error) return bounds
  const margin = Math.max(props.margins.l, props.margins.r, props.vesselMargin),
    rect = [bounds[0] - margin, bounds[1] - margin, bounds[2] + margin, bounds[3] + margin] satisfies [number, number, number, number]

  return getGridRectangleClearanceError({
    rect,
    cellSize: grid.cell_m,
    isCellFree: (cell) => {
      const symbol = grid.rows[cell[1]]?.[cell[0]]
      return symbol === "." || symbol === "D" || symbol === props.symbol
    },
  })
}
