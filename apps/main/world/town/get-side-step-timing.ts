import { REST_TO_REST_MAX_SPEED, REST_TO_REST_MAX_ACCELERATION } from "#/lib/engine/get-rest-to-rest-profile"
import type { SideStepPlan } from "#/world/town/get-side-step-plan"
type Props = { plan: SideStepPlan; minCycleMs: number; maxSpeed: number; maxAcceleration: number }
export type TimedSideStepPlan = Readonly<{ plan: SideStepPlan; durationMs: number; distance: number }>
/** Stretch the same complete cycles to satisfy the authored cadence, speed and acceleration limits. */
export function getSideStepTiming(props: Props): TimedSideStepPlan | Error {
  if (![props.minCycleMs, props.maxSpeed, props.maxAcceleration].every((value) => Number.isFinite(value) && value > 0) || !Number.isSafeInteger(props.plan.cycles) || props.plan.cycles < 1)
    return new Error("Invalid side-step timing limits")
  const distance = Math.hypot(props.plan.to[0] - props.plan.from[0], props.plan.to[1] - props.plan.from[1])
  const seconds = Math.max(
    (REST_TO_REST_MAX_SPEED * props.plan.cycles * props.minCycleMs) / 1000,
    (REST_TO_REST_MAX_SPEED * distance) / props.maxSpeed,
    Math.sqrt((REST_TO_REST_MAX_ACCELERATION * distance) / props.maxAcceleration),
  )
  const durationMs = seconds * 1000
  if (!Number.isFinite(durationMs) || durationMs <= 0 || durationMs > Number.MAX_SAFE_INTEGER || !Number.isFinite(distance) || distance <= 0)
    return new Error("Side-step timing exceeds its duration budget")
  return { plan: props.plan, durationMs, distance }
}
