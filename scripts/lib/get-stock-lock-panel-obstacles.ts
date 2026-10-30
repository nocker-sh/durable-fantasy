import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
type Rect = readonly [number, number, number, number]

/** Boundary cells reserve the fence/support line; the waiting floor remains occupied even while a gate is being swung. */
export function getStockLockPanelObstacles(plan: z.infer<typeof stockLockSchema>) {
  const obstacles: { name: string; rect: Rect }[] = [],
    cell = plan.layout.cell_m,
    zone = plan.zones[0].rect
  for (const entry of plan.layout.rows.entries())
    for (const x of Array.from({ length: entry[1].length }).keys())
      if (entry[1][x] === "#") obstacles.push({ name: "boundary", rect: [x * cell, entry[0] * cell, (x + 1) * cell, (entry[0] + 1) * cell] })
  obstacles.push({ name: "waiting floor", rect: [zone[0] * cell, zone[1] * cell, (zone[0] + zone[2]) * cell, (zone[1] + zone[3]) * cell] })

  return obstacles
}
