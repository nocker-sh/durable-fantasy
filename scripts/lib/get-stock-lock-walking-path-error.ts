import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockBodyObstacles } from "#/scripts/lib/get-stock-lock-body-obstacles"
import { isStockLockWalkingCellFree } from "#/scripts/lib/is-stock-lock-walking-cell-free"
import { getCirclePolylineClearance } from "#/lib/engine/get-circle-polyline-clearance"
type Plan = z.infer<typeof stockLockSchema>

/** Certify the complete capsule of each segment, including corners and obstacles between otherwise clear endpoints. */
export function getStockLockWalkingPathError(plan: Plan, path: Plan["walking"]["paths"][number]): Error | null {
  const obstacles = getStockLockBodyObstacles(plan, path.gate, "open"),
    radius = plan.walking.body_radius_m
  if (obstacles instanceof Error) return obstacles
  if (path.points_m.some((point, index) => index > 0 && point[0] === path.points_m[index - 1][0] && point[1] === path.points_m[index - 1][1])) return new Error("Stock lock walking repeats a point")
  const clearance = getCirclePolylineClearance({
    points: path.points_m,
    radius,
    cellSize: plan.layout.cell_m,
    isCellFree: (cell) => isStockLockWalkingCellFree({ plan, cell }),
    obstacles: obstacles.map((obstacle) => obstacle.bounds),
  })
  if (clearance instanceof Error || clearance === null) return clearance

  return new Error(`Stock lock walking intersects ${obstacles[clearance.obstacle].name}`)
}
