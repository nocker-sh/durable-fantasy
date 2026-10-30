import { getPersonalBoxMotionFrame } from "#/scripts/lib/get-personal-box-motion-frame"
import { getPersonalBoxContinuousReview } from "#/scripts/lib/get-personal-box-continuous-review"
import type { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
type Props = Parameters<typeof getPersonalBoxLidReview>[0]

/** Complete external-clearance intervals supplement finite posture samples; lateral gait, self-clearance and load remain separate. */
export function getPersonalBoxVerticalReviewError(props: Props): Error | null {
  const source = props.slot.packing?.opening?.reach_review?.grip_review?.motion_review
  if (!source) return null
  if (!Number.isSafeInteger(source.samples_per_phase) || source.samples_per_phase < 2 || source.samples_per_phase > 128) return new Error("Invalid vertical lid sample count")
  for (const segment of [0, 2]) {
    const continuous = getPersonalBoxContinuousReview({ ...props, segment })
    if (continuous instanceof Error) return continuous
    for (const index of Array.from({ length: source.samples_per_phase + 1 }).keys()) {
      const frame = getPersonalBoxMotionFrame({ ...props, segment, progress: index / source.samples_per_phase })
      if (frame instanceof Error) return frame
    }
  }

  return null
}
