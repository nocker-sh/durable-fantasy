import { getRestToRestProfile } from "#/lib/engine/get-rest-to-rest-profile"
import { getSideStepState } from "#/world/town/get-side-step-state"
import type { TimedSideStepPlan } from "#/world/town/get-side-step-timing"
type Props = { timing: TimedSideStepPlan; elapsedMs: number }
/** Body progress and foot phase share one clock; before and after the segment both feet remain collected at rest. */
export function getTimedSideStepState(props: Props) {
  const timing = props.timing
  if (!Number.isFinite(props.elapsedMs) || !Number.isFinite(timing.durationMs) || timing.durationMs <= 0 || !Number.isFinite(timing.distance) || timing.distance <= 0)
    return new Error("Invalid timed side-step state")
  const profile = getRestToRestProfile(Math.max(0, Math.min(1, props.elapsedMs / timing.durationMs)))
  if (profile instanceof Error) return profile
  const state = getSideStepState({ plan: timing.plan, progress: profile.position })
  if (state instanceof Error) return state
  const seconds = timing.durationMs / 1000,
    speed = (profile.velocity * timing.distance) / seconds,
    acceleration = (profile.acceleration * timing.distance) / (seconds * seconds)
  if (![speed, acceleration].every(Number.isFinite)) return new Error("Invalid timed side-step derivatives")
  return { ...state, speed, acceleration }
}
