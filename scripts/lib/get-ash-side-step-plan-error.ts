import { getSideStepPlan } from "#/world/town/get-side-step-plan"
import { getSideStepTiming } from "#/world/town/get-side-step-timing"
import { getAshSideStepError } from "#/scripts/lib/get-ash-side-step-error"
type Props = Omit<Parameters<typeof getAshSideStepError>[0], "direction" | "stride"> & { index: number; turn: 0 | 1 | 2 | 3 }
/** Validate each actual interval and its timing rather than assuming the nominal step length fits every corridor. */
export function getAshSideStepPlanError(props: Props): Error | null {
  const path = props.receiving.transport_candidate.body_path_m,
    limits = props.dimensions.timing
  if (!Number.isSafeInteger(props.index) || props.index < 0 || props.index + 1 >= path.length) return new Error("Side-step interval is missing")
  const plan = getSideStepPlan({ from: path[props.index], to: path[props.index + 1], turn: props.turn, maxStride: props.dimensions.stride_m })
  if (plan instanceof Error) return plan
  const timing = getSideStepTiming({ plan, minCycleMs: limits.min_cycle_s * 1000, maxSpeed: limits.max_speed_m_s, maxAcceleration: limits.max_acceleration_m_s2 })
  if (timing instanceof Error) return timing
  return getAshSideStepError({ ...props, direction: plan.direction, stride: plan.stride })
}
