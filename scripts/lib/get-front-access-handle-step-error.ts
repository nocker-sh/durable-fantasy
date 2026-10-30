import { getFrontAccessHandleStepCycleError } from "#/scripts/lib/get-front-access-handle-step-cycle-error"
import { getFrontAccessHandleStepFrame } from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleStepReachReview } from "#/scripts/lib/get-front-access-handle-step-reach-review"
import { getFrontAccessHandleLegClearanceReview } from "#/scripts/lib/get-front-access-handle-leg-clearance-review"
import { getFrontAccessHandleUpperClearanceReview } from "#/scripts/lib/get-front-access-handle-upper-clearance-review"
import { getFrontAccessHandleForearmSelfReview } from "#/scripts/lib/get-front-access-handle-forearm-self-review"
type Props = Omit<Parameters<typeof getFrontAccessHandleStepFrame>[0], "leaf" | "cycle" | "phase">

/** Finite samples require planted support, lifted shoes, whole-bar contact and full-body clearance; interval and load proofs remain separate. */
export function getFrontAccessHandleStepError(props: Props): Error | null {
  const source = props.slot.packing?.front_access?.handle_review?.step_review
  if (!source) return null
  if (![source.cycles, source.samples_per_cycle].every(Number.isSafeInteger) || source.cycles < 1 || source.cycles > 16 || source.samples_per_cycle < 2 || source.samples_per_cycle > 128)
    return new Error("Invalid raised-handle step sampling")
  if (source.reach_review) {
    const reach = getFrontAccessHandleStepReachReview(props)
    if (reach instanceof Error) return reach
  }
  if (source.leg_clearance_review) {
    const legs = getFrontAccessHandleLegClearanceReview(props)
    if (legs instanceof Error) return legs
  }
  if (source.upper_clearance_review) {
    const upper = getFrontAccessHandleUpperClearanceReview(props)
    if (upper instanceof Error) return upper
  }
  if (source.forearm_self_review) {
    const forearm = getFrontAccessHandleForearmSelfReview(props)
    if (forearm instanceof Error) return forearm
  }

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
    for (const cycle of Array.from({ length: source.cycles }).keys()) {
      const error = getFrontAccessHandleStepCycleError({ ...props, leaf, cycle, samples: source.samples_per_cycle })
      if (error) return error
    }

  return null
}
