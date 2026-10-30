import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import { getStockLockBodyPoint } from "#/scripts/lib/get-stock-lock-body-point"
import { isStockLockWalkingCellFree } from "#/scripts/lib/is-stock-lock-walking-cell-free"

/** The arc stays within the first quadrant; analytic arc/rectangle distance checks every unsupported cell, not sampled poses. */
export function getStockLockArcFloorError(plan: z.infer<typeof stockLockSchema>, swing: DoorSwing, operation: DoorOperation): Error | null {
  const ends = [operation.start_deg, operation.end_deg].map((angle) =>
      getStockLockBodyPoint(swing, [operation.orbit_radius_m * Math.cos((angle * Math.PI) / 180), operation.orbit_radius_m * Math.sin((angle * Math.PI) / 180)]),
    ),
    cell = plan.layout.cell_m,
    radius = operation.body_radius_m
  const x0 = Math.floor((Math.min(...ends.map((point) => point[0])) - radius) / cell),
    y0 = Math.floor((Math.min(...ends.map((point) => point[1])) - radius) / cell)
  const x1 = Math.floor((Math.max(...ends.map((point) => point[0])) + radius) / cell),
    y1 = Math.floor((Math.max(...ends.map((point) => point[1])) + radius) / cell),
    width = x1 - x0 + 1,
    height = y1 - y0 + 1
  if (![x0, y0, x1, y1, width * height].every(Number.isSafeInteger) || width * height > 65536) return new Error("Stock gate arc exceeds floor traversal budget")
  for (const index of Array.from({ length: width * height }).keys()) {
    const x = x0 + (index % width),
      y = y0 + Math.floor(index / width)
    if (isStockLockWalkingCellFree({ plan, cell: [x, y] })) continue
    if (operatorRectDistance(swing, operation, [x * cell, y * cell, cell, cell]) < radius - 1e-9) return new Error("Stock gate arc crosses unsupported floor")
  }

  return null
}
