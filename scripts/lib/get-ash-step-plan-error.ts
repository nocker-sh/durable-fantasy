import { getCarryStepDirection } from "#/world/town/get-carry-step-direction"
import type { AshReceiving } from "#/scripts/lib/ash-receiving-schema"
type Props = { receiving: AshReceiving; turn: 0 | 1 | 2 | 3 }
/** Playback must match travel; sidestepping cannot silently borrow either temporal direction of the forward clip. */
export function getAshStepPlanError(props: Props): Error | null {
  const transport = props.receiving.transport_candidate,
    steps = transport.gait_review.step_plan
  if (steps.length !== transport.body_path_m.length - 1) return new Error("Carry step plan does not cover its corridor")
  for (const index of steps.keys()) {
    const direction = getCarryStepDirection({ from: transport.body_path_m[index], to: transport.body_path_m[index + 1], turn: props.turn })
    if (direction instanceof Error) return direction
    if (steps[index].direction !== direction) return new Error(`Carry step ${index} disagrees with its movement direction`)
    const step = steps[index]
    if (step.animation === null) continue
    if (step.animation === "side_step") {
      if ((direction === "side_left" || direction === "side_right") && transport.gait_review.side_step !== null) continue
      return new Error(`Carry step ${index} lacks a valid authored side-step`)
    }
    if ((direction === "forward" && step.playback === "forward") || (direction === "backward" && step.playback === "reverse")) continue
    return new Error(`Carry step ${index} cannot use a ${step.playback} gait`)
  }
  return null
}
