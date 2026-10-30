import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { DoorSwing } from "#/scripts/lib/door-swing"
import { auditDoorOperation } from "#/scripts/lib/audit-door-operation"
import { operatorRectDistance } from "#/scripts/lib/operator-rect-distance"
import type { DoorOperation } from "#/scripts/lib/door-operation"
import { getStockLockBodyObstacles } from "#/scripts/lib/get-stock-lock-body-obstacles"
import { getStockLockArcFloorError } from "#/scripts/lib/get-stock-lock-arc-floor-error"
type Props = Readonly<{ plan: z.infer<typeof stockLockSchema>; gate: "outer" | "inner"; swing: DoorSwing; operation: DoorOperation }>

/** The full body remains outside the entire fitted leaf sweep and within handle reach, on supported floor clear of static parts. */
export function getStockLockPullError(props: Props): Error | null {
  const operation = props.operation,
    errors = auditDoorOperation({ swing: props.swing, operation: operation, rows: [], scale: props.plan.layout.cell_m })
  if (errors.length > 0) return new Error(errors.join("; "))
  const floorError = getStockLockArcFloorError(props.plan, props.swing, operation)
  if (floorError) return floorError
  const obstacles = getStockLockBodyObstacles(props.plan, props.gate, "moving")
  if (obstacles instanceof Error) return obstacles
  for (const obstacle of obstacles) {
    const rect = obstacle.bounds
    if (operatorRectDistance(props.swing, operation, [rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1]]) < operation.body_radius_m - 1e-9)
      return new Error(`Stock gate arc intersects ${obstacle.name}`)
  }

  return null
}
