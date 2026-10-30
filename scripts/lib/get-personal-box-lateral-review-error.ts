import { getPersonalBoxLateralFrame } from "#/scripts/lib/get-personal-box-lateral-frame"
import { getPersonalBoxLateralSupportError } from "#/scripts/lib/get-personal-box-lateral-support-error"
import { getPersonalBoxGripClearanceError } from "#/scripts/lib/get-personal-box-grip-clearance-error"
import type { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
type Props = Parameters<typeof getPersonalBoxLidReview>[0]

/** Declared finite samples require actual planted shoes, palms, self and furniture clearance; no continuous or balance claim follows. */
export function getPersonalBoxLateralReviewError(props: Props): Error | null {
  const motion = props.slot.packing?.opening?.reach_review?.grip_review?.motion_review,
    source = motion?.lateral_review
  if (!source) return null
  if (
    !motion ||
    !Number.isSafeInteger(motion.samples_per_phase) ||
    motion.samples_per_phase < 2 ||
    motion.samples_per_phase > 128 ||
    !Number.isSafeInteger(source.cycles) ||
    source.cycles < 1 ||
    source.cycles > 16
  )
    return new Error("Invalid personal box lateral sampling")

  for (const cycle of Array.from({ length: source.cycles }).keys())
    for (const sample of Array.from({ length: motion.samples_per_phase + 1 }).keys()) {
      const phase = sample / motion.samples_per_phase,
        frame = getPersonalBoxLateralFrame({ ...props, cycle, phase })
      if (frame instanceof Error) return frame
      const support = getPersonalBoxLateralSupportError({ ...props, cycle, phase, frame })
      if (support) return support
      const clearance = getPersonalBoxGripClearanceError({ ...props, frame })
      if (clearance) return clearance
    }

  return null
}
