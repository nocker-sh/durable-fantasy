import type { SideStepPlan } from "#/world/town/get-side-step-plan"
type Props = { plan: SideStepPlan; progress: number }
/** Every endpoint closes a full cycle; preserve exact path endpoints rather than interpolating past them. Timing remains a caller-owned constraint. */
export function getSideStepState(props: Props): { body: readonly [number, number]; cycle: number; phase: number; stride: number; direction: SideStepPlan["direction"] } | Error {
  const plan = props.plan
  if (!Number.isFinite(props.progress) || props.progress < 0 || props.progress > 1 || !Number.isSafeInteger(plan.cycles) || plan.cycles < 1 || !Number.isFinite(plan.stride) || plan.stride <= 0)
    return new Error("Invalid side-step progress")
  const scaled = props.progress * plan.cycles,
    cycle = Math.min(plan.cycles - 1, Math.floor(scaled)),
    phase = props.progress === 1 ? 1 : scaled - cycle
  const body: readonly [number, number] = [plan.from[0] + (plan.to[0] - plan.from[0]) * props.progress, plan.from[1] + (plan.to[1] - plan.from[1]) * props.progress]
  if (props.progress === 0) return { body: [...plan.from], cycle, phase: 0, stride: plan.stride, direction: plan.direction }
  if (props.progress === 1) return { body: [...plan.to], cycle, phase: 1, stride: plan.stride, direction: plan.direction }
  return { body, cycle, phase, stride: plan.stride, direction: plan.direction }
}
