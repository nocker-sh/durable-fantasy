import { getAshStepPlanError } from "#/scripts/lib/get-ash-step-plan-error"
import { workPoseTurn } from "#/world/scene/figure/work-pose-turn"
import { getAshCarryPhasesError } from "#/scripts/lib/get-ash-carry-phases-error"
import { getAshSideStepPlanError } from "#/scripts/lib/get-ash-side-step-plan-error"
type Props = Parameters<typeof getAshCarryPhasesError>[0]
/** Combine direction and geometry checks while every gait remains a candidate rather than an adopted routine. */
export function getAshGaitError(props: Props): Error | null {
  const turn = workPoseTurn(props.receiving.grip_candidate.facing)
  const stepError = getAshStepPlanError({ receiving: props.receiving, turn })
  if (stepError) return stepError
  const carryError = getAshCarryPhasesError(props)
  if (carryError) return carryError
  const transport = props.receiving.transport_candidate,
    review = transport.gait_review
  for (const index of review.step_plan.keys()) {
    const step = review.step_plan[index]
    if (step.animation !== "side_step") continue
    if (!review.side_step || (step.direction !== "side_left" && step.direction !== "side_right")) return new Error("Side-step gait needs authored dimensions and direction")
    const error = getAshSideStepPlanError({ ...props, dimensions: review.side_step, index, turn })
    if (error) return error
  }
  return null
}
