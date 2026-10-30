import type { StockLockMotionPhase } from "#/scripts/lib/stock-lock-motion-phase"

/** Hand actions and observations hold the body in place; moving phases expose their exact shared endpoints. */
export function getStockLockPhaseEndpoints(phase: StockLockMotionPhase): Readonly<{ from: readonly [number, number]; to: readonly [number, number] }> {
  if (phase.kind === "walk") return { from: phase.points[0], to: phase.points[phase.points.length - 1] }
  if (phase.kind === "push") return { from: phase.poses[0].body_world_m, to: phase.poses[phase.poses.length - 1].body_world_m }
  if (phase.kind === "pull") return { from: phase.from, to: phase.to }

  return { from: phase.point, to: phase.point }
}
