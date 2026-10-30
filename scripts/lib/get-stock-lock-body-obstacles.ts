import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockGateGeometry } from "#/scripts/lib/get-stock-lock-gate-geometry"
import { doorPanelRect } from "#/scripts/lib/door-panel-rect"
type Rect = readonly [number, number, number, number]

/** Keep both frames and the peer's closed leaf; a moving active leaf must be checked by the continuous operation verifier. */
export function getStockLockBodyObstacles(plan: z.infer<typeof stockLockSchema>, active: "outer" | "inner", pose: "open" | "closed" | "moving") {
  const obstacles: { name: string; bounds: Rect }[] = []
  for (const gate of plan.gates) {
    const geometry = getStockLockGateGeometry(plan, gate)
    if (geometry instanceof Error) return geometry
    for (const bounds of geometry.frames) obstacles.push({ name: `${gate.id} frame`, bounds })
    if (gate.id === active && pose === "moving") continue
    const panel: { bounds: Rect; name: string } = { bounds: geometry.closed, name: `${gate.id} closed panel` }
    if (gate.id === active && pose === "open") {
      const rect = doorPanelRect(geometry.swing, true)
      panel.bounds = [rect[0], rect[1], rect[0] + rect[2], rect[1] + rect[3]]
      panel.name = `${gate.id} open panel`
    }
    obstacles.push(panel)
  }

  return obstacles
}
