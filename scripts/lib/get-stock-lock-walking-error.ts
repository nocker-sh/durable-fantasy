import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockWalkingPathError } from "#/scripts/lib/get-stock-lock-walking-path-error"

/** Both canonical paths meet the same body-sized waiting place, and finish entirely outside on their declared side. */
export function getStockLockWalkingError(plan: z.infer<typeof stockLockSchema>): Error | null {
  const walking = plan.walking,
    hub = walking.hub_m,
    radius = walking.body_radius_m,
    zone = plan.zones[0].rect,
    cell = plan.layout.cell_m,
    outside = walking.outside_side.rect_m
  if (Math.abs(outside[0] + outside[2]) > 1e-9 || ![outside[0] + outside[2], outside[1] + outside[3]].every(Number.isFinite) || new Set(walking.paths.map((path) => path.gate)).size !== 2)
    return new Error("Stock lock walking has no attached outside floor or unique paths")
  if (hub[0] - radius < zone[0] * cell - 1e-9 || hub[1] - radius < zone[1] * cell - 1e-9 || hub[0] + radius > (zone[0] + zone[2]) * cell + 1e-9 || hub[1] + radius > (zone[1] + zone[3]) * cell + 1e-9)
    return new Error("Stock lock walking body does not fit its hub")
  for (const path of walking.paths) {
    const first = path.points_m[0],
      last = path.points_m[path.points_m.length - 1],
      meeting = { point: first }
    if (path.gate === "outer") meeting.point = last
    if (meeting.point[0] !== hub[0] || meeting.point[1] !== hub[1]) return new Error("Stock lock walking does not meet its shared hub")
    if (path.gate === "outer" && first[0] + radius > 1e-9) return new Error("Outer walking path does not start wholly outside")
    if (path.gate === "inner" && last[0] - radius < plan.layout.rows[0].length * cell - 1e-9) return new Error("Inner walking path does not finish wholly in pasture")
    const error = getStockLockWalkingPathError(plan, path)
    if (error) return error
  }

  return null
}
