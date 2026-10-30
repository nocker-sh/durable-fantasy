import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockOperationGeometry } from "#/scripts/lib/get-stock-lock-operation-geometry"
import { getStockLockMotionRouteError } from "#/scripts/lib/get-stock-lock-motion-route-error"
import { getStockLockPullError } from "#/scripts/lib/get-stock-lock-pull-error"
import { auditDoorPushMotion } from "#/scripts/lib/audit-door-push-motion"
import { getStockLockEpisodeOrderError } from "#/scripts/lib/get-stock-lock-episode-order-error"
import { getStockLockVisitPhases } from "#/scripts/lib/get-stock-lock-visit-phases"

/** Every source open/close event must use a reviewed operation; the four episodes are the push and pull routes or their reversals. */
export function getStockLockOperationsError(plan: z.infer<typeof stockLockSchema>): Error | null {
  if (new Set(plan.operations.gate_paths.map((path) => path.gate)).size !== 2 || plan.operations.pull_arc.start_deg >= plan.operations.pull_arc.end_deg)
    return new Error("Stock lock operation paths or arc are incomplete")
  const orderError = getStockLockEpisodeOrderError(plan.events)
  if (orderError) return orderError
  if (plan.events.some((event) => event.kind === "stock_move" || (event.kind === "gate" && (event.stock_crossings?.length ?? 0) > 0)))
    return new Error("Stock gate operation review does not certify shared animal motion")
  for (const gate of plan.gates) {
    const operation = getStockLockOperationGeometry(plan, gate)
    if (operation instanceof Error) return operation
    const pushErrors = auditDoorPushMotion(operation.swing, operation.push)
    if (pushErrors.length > 0) return new Error(`Stock gate ${gate.id}: ${pushErrors.join("; ")}`)
    const pushFloor = getStockLockMotionRouteError({ plan, gate: gate.id, pose: "moving", points: operation.pushPoints })
    if (pushFloor) return pushFloor
    const pullError = getStockLockPullError({ plan, gate: gate.id, swing: operation.swing, operation: operation.pull })
    if (pullError) return pullError
    for (const route of operation.routes) {
      const error = getStockLockMotionRouteError({ plan, gate: gate.id, pose: route.pose, points: route.points })
      if (error) return new Error(`${gate.id} ${route.name}: ${error.message}`)
    }
  }

  const phases = getStockLockVisitPhases(plan)
  if (phases instanceof Error) return phases

  return null
}
