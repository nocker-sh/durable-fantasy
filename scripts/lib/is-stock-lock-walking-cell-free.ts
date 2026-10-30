import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
type Props = Readonly<{ plan: z.infer<typeof stockLockSchema>; cell: readonly [number, number] }>

/** The hub is walkable floor; beyond the enclosure, only whole cells supported by the finite reservations are free. */
export function isStockLockWalkingCellFree(props: Props): boolean {
  const plan = props.plan,
    cell = props.cell,
    symbol = plan.layout.rows[cell[1]]?.[cell[0]],
    scale = plan.layout.cell_m
  if (symbol !== undefined) return [".", "D", "S"].includes(symbol)
  const x = cell[0] * scale,
    y = cell[1] * scale

  return [plan.walking.outside_side.rect_m, plan.pasture_side.rect_m].some(
    (rect) => x >= rect[0] - 1e-9 && y >= rect[1] - 1e-9 && x + scale <= rect[0] + rect[2] + 1e-9 && y + scale <= rect[1] + rect[3] + 1e-9,
  )
}
