import { FLEE_MS, FLEE_RATE } from "#/world/core/monster-motion-rules"
import type { Run } from "#/world/core/wild/types"

/**
 * How far ahead (ms of its own route) a fleeing creature is at `now`: it runs FLEE_RATE times as fast for FLEE_MS after a blow,
 * and what it gained stays, so its position only ever moves on and never jumps back.
 */
export function getRunShift(run: Run | undefined, now: number): number {
  if (!run) return 0
  return run.base + (FLEE_RATE - 1) * Math.min(Math.max(0, now - run.start), FLEE_MS)
}
