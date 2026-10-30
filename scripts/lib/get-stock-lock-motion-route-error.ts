import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockBodyObstacles } from "#/scripts/lib/get-stock-lock-body-obstacles"
import { isStockLockWalkingCellFree } from "#/scripts/lib/is-stock-lock-walking-cell-free"
import { getCirclePolylineClearance } from "#/lib/engine/get-circle-polyline-clearance"
type Props = Readonly<{ plan: z.infer<typeof stockLockSchema>; gate: "outer" | "inner"; pose: "open" | "closed" | "moving"; points: ReadonlyArray<readonly [number, number]> }>

/** Linear approach/retreat and push-body intervals keep every static obstacle; only the separately certified moving panel is omitted. */
export function getStockLockMotionRouteError(props: Props): Error | null {
  const obstacles = getStockLockBodyObstacles(props.plan, props.gate, props.pose)
  if (obstacles instanceof Error) return obstacles
  const clearance = getCirclePolylineClearance({
    points: props.points,
    radius: props.plan.walking.body_radius_m,
    cellSize: props.plan.layout.cell_m,
    isCellFree: (cell) => isStockLockWalkingCellFree({ plan: props.plan, cell }),
    obstacles: obstacles.map((obstacle) => obstacle.bounds),
  })
  if (clearance instanceof Error || clearance === null) return clearance

  return new Error(`Stock gate motion intersects ${obstacles[clearance.obstacle].name}`)
}
