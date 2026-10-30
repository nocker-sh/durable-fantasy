import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockGateGeometry } from "#/scripts/lib/get-stock-lock-gate-geometry"
import { getStockLockPanelObstacles } from "#/scripts/lib/get-stock-lock-panel-obstacles"
import { swingHitsRect } from "#/scripts/lib/swing-hits-rect"

/** Retain both frames and the peer's closed fitted leaf throughout the full quarter-turn, not merely at its endpoints. */
export function getStockLockPanelError(plan: z.infer<typeof stockLockSchema>): Error | null {
  const gates = plan.gates.map((gate) => getStockLockGateGeometry(plan, gate)),
    obstacles = getStockLockPanelObstacles(plan),
    pasture = plan.pasture_side.rect_m,
    cell = plan.layout.cell_m
  if (pasture[0] !== plan.layout.rows[0].length * cell || ![pasture[0] + pasture[2], pasture[1] + pasture[3]].every(Number.isFinite))
    return new Error("Stock gate pasture reservation is detached or unbounded")
  for (const gate of gates) if (gate instanceof Error) return gate
  for (const gate of gates) {
    if (gate instanceof Error) return gate
    const occupied = [
      ...obstacles,
      ...gates.flatMap((peer) => {
        if (peer instanceof Error) return []
        const frames = peer.frames.map((rect) => ({ name: "frame", rect }))
        if (peer.id !== gate.id) frames.push({ name: "closed peer", rect: peer.closed })
        return frames
      }),
    ]
    for (const obstacle of occupied)
      if (swingHitsRect(gate.swing, [obstacle.rect[0], obstacle.rect[1], obstacle.rect[2] - obstacle.rect[0], obstacle.rect[3] - obstacle.rect[1]]))
        return new Error(`Stock gate ${gate.id} sweep hits ${obstacle.name}`)
    const area: readonly [number, number, number, number] = [cell, cell, (plan.layout.rows[0].length - 1) * cell, (plan.layout.rows.length - 1) * cell]
    const reservation = { bounds: area }
    if (gate.id === "inner") reservation.bounds = [pasture[0], pasture[1], pasture[0] + pasture[2], pasture[1] + pasture[3]]
    if (gate.bounds[0] < reservation.bounds[0] || gate.bounds[1] < reservation.bounds[1] || gate.bounds[2] > reservation.bounds[2] || gate.bounds[3] > reservation.bounds[3])
      return new Error(`Stock gate ${gate.id} sweep leaves its reserved floor`)
  }

  return null
}
