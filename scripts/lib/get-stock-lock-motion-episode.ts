import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { StockLockMotionPhase } from "#/scripts/lib/stock-lock-motion-phase"
import { getStockLockOperationGeometry } from "#/scripts/lib/get-stock-lock-operation-geometry"

/** Four concrete episodes share two proven trajectories; reverse traversal reverses both angle and body position. */
export function getStockLockMotionEpisode(plan: z.infer<typeof stockLockSchema>, index: number): readonly StockLockMotionPhase[] | Error {
  const event = plan.events[index]
  if (event?.kind !== "gate" || !event.motion) return new Error("Stock gate episode has no motion event")
  const gate = plan.gates.find((gate) => gate.id === event.gate)
  if (!gate) return new Error("Stock gate episode has no gate")
  const geometry = getStockLockOperationGeometry(plan, gate)
  if (geometry instanceof Error) return geometry
  const routes = geometry.routes,
    poses = geometry.push.poses.map((pose, position) => ({ angle_deg: pose.angle_deg, body_world_m: geometry.pushPoints[position] }))
  const pushApproach = { kind: "walk", pose: "closed", points: routes[0].points } satisfies StockLockMotionPhase,
    pushRetreat = { kind: "walk", pose: "open", points: routes[1].points } satisfies StockLockMotionPhase
  const pullApproach = { kind: "walk", pose: "open", points: routes[2].points } satisfies StockLockMotionPhase,
    pullRetreat = { kind: "walk", pose: "closed", points: routes[3].points } satisfies StockLockMotionPhase
  const episodes = {
    push_open: [pushApproach, { kind: "unlatch", event_index: index - 1, point: geometry.pushPoints[0] }, { kind: "push", event_index: index, poses }, pushRetreat],
    pull_close: [
      pullApproach,
      { kind: "pull", event_index: index, direction: "close", swing: geometry.swing, operation: geometry.pull, from: geometry.pullPoints[1], to: geometry.pullPoints[0] },
      { kind: "latch", event_index: index + 1, point: geometry.pullPoints[0] },
      pullRetreat,
    ],
    pull_open: [
      { ...pullRetreat, points: [...pullRetreat.points].reverse() },
      { kind: "unlatch", event_index: index - 1, point: geometry.pullPoints[0] },
      { kind: "pull", event_index: index, direction: "open", swing: geometry.swing, operation: geometry.pull, from: geometry.pullPoints[0], to: geometry.pullPoints[1] },
      { ...pullApproach, points: [...pullApproach.points].reverse() },
    ],
    back_out_close: [
      { ...pushRetreat, points: [...pushRetreat.points].reverse() },
      { kind: "push", event_index: index, poses: [...poses].reverse() },
      { kind: "latch", event_index: index + 1, point: geometry.pushPoints[0] },
      { ...pushApproach, points: [...pushApproach.points].reverse() },
    ],
  } satisfies Record<NonNullable<typeof event.motion>, readonly StockLockMotionPhase[]>

  return episodes[event.motion]
}
