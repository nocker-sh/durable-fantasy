import type { getParkedCartDepartureContext } from "#/scripts/lib/get-parked-cart-departure-context"
type Props = Readonly<{ context: Exclude<ReturnType<typeof getParkedCartDepartureContext>, Error>; cell: readonly [number, number] }>

/** Only the moving cart's own bay is vacated; outside floor exists solely inside the unassigned apron reservation. */
export function isCartDepartureCellFree(props: Props): boolean {
  const context = props.context,
    cell = props.cell,
    row = context.grid.rows[cell[1]],
    symbol = row?.[cell[0]],
    scale = context.grid.cell_m
  if (symbol !== undefined) return symbol === "." || symbol === "D" || symbol === context.cart.symbol
  const apron = context.plan.exterior_apron.rect_m,
    x = cell[0] * scale,
    y = cell[1] * scale

  return x >= apron[0] && y >= apron[1] && x + scale <= apron[0] + apron[2] && y + scale <= apron[1] + apron[3]
}
