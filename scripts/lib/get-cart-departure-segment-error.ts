import { rectangleTranslationBounds } from "../../lib/engine/rectangle-translation-bounds"
import { rectangleTranslationHits } from "../../lib/engine/rectangle-translation-hits"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { getGridRectangleClearanceError } from "#/lib/engine/get-grid-rectangle-clearance-error"
import { getSweptGridClearanceError } from "#/lib/engine/get-swept-grid-clearance-error"
import { isCartDepartureCellFree } from "#/scripts/lib/is-cart-departure-cell-free"
import type { getParkedCartDepartureContext } from "#/scripts/lib/get-parked-cart-departure-context"
type Props = Readonly<{ context: Exclude<ReturnType<typeof getParkedCartDepartureContext>, Error>; from: readonly [number, number]; to: readonly [number, number] }>

/** Certify every position of a straight reverse move, including the trailing operator and open fitted doors. */
export function getCartDepartureSegmentError(props: Props): Error | null {
  const context = props.context,
    from = props.from,
    to = props.to,
    radius = context.plan.body_radius_m
  if (from[0] !== to[0] || to[1] <= from[1]) return new Error("Cart departure must reverse south without sideways motion")
  const isCellFree = (cell: readonly [number, number]) => isCartDepartureCellFree({ context, cell })
  const cartError = getGridRectangleClearanceError({ rect: rectangleTranslationBounds(context.relative, from, to), cellSize: context.grid.cell_m, isCellFree })
  if (cartError) return cartError
  const operatorFrom: readonly [number, number] = [from[0], from[1] - context.operatorOffset],
    operatorTo: readonly [number, number] = [to[0], to[1] - context.operatorOffset]
  const operatorError = getSweptGridClearanceError({ from: operatorFrom, to: operatorTo, radius, cellSize: context.grid.cell_m, isCellFree })
  if (operatorError) return operatorError
  for (const obstacle of context.obstacles) {
    if (rectangleTranslationHits({ relative: context.relative, from: from, to: to, obstacle: obstacle, tolerance: 1e-9, boundary: "open" })) return new Error("Cart departure hits fitted doorway")
    if (segmentRectDistance(obstacle, operatorFrom, operatorTo) < radius - 1e-9) return new Error("Cart operator hits fitted doorway")
  }

  return null
}
