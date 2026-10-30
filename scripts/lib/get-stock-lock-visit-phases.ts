import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import type { StockLockMotionPhase } from "#/scripts/lib/stock-lock-motion-phase"
import { getStockLockEpisodeOrderError } from "#/scripts/lib/get-stock-lock-episode-order-error"
import { getStockLockMotionEpisode } from "#/scripts/lib/get-stock-lock-motion-episode"
import { getStockLockPhaseEndpoints } from "#/scripts/lib/get-stock-lock-phase-endpoints"

/** Compile every logical event exactly once, with no body teleport between the matched hand actions, movements and inspections. */
export function getStockLockVisitPhases(plan: z.infer<typeof stockLockSchema>): readonly StockLockMotionPhase[] | Error {
  const orderError = getStockLockEpisodeOrderError(plan.events),
    outer = plan.walking.paths.find((path) => path.gate === "outer")
  if (orderError) return orderError
  if (!outer) return new Error("Stock lock visit has no outside anchor")
  const cursor = { point: outer.points_m[0] },
    phases: StockLockMotionPhase[] = []
  for (const entry of plan.events.entries()) {
    const event = entry[1]
    if (event.kind === "gate" && (event.action === "unlatch" || event.action === "latch")) continue
    if (event.kind !== "gate") {
      phases.push({ kind: "observation", event_index: entry[0], point: cursor.point })
      continue
    }
    const episode = getStockLockMotionEpisode(plan, entry[0])
    if (episode instanceof Error) return episode
    for (const phase of episode) {
      const endpoints = getStockLockPhaseEndpoints(phase)
      if (endpoints.from.some((value, axis) => Math.abs(value - cursor.point[axis]) > 1e-9)) return new Error("Stock lock visit has a discontinuous body position")
      phases.push(phase)
      cursor.point = [endpoints.to[0], endpoints.to[1]]
    }
  }
  if (cursor.point.some((value, axis) => Math.abs(value - outer.points_m[0][axis]) > 1e-9)) return new Error("Stock lock visit does not return to its outside anchor")

  return phases
}
