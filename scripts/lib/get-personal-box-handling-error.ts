import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxGripFrame } from "#/scripts/lib/get-personal-box-grip-frame"
import { getPersonalBoxGripClearanceError } from "#/scripts/lib/get-personal-box-grip-clearance-error"
import { getPersonalBoxVerticalReviewError } from "#/scripts/lib/get-personal-box-vertical-review-error"
import { getPersonalBoxLateralReviewError } from "#/scripts/lib/get-personal-box-lateral-review-error"
type Props = Parameters<typeof getPersonalBoxLidReview>[0]

/** A declared static contact proposal checks every real lid endpoint; undeclared motion, load and daily adoption stay unresolved. */
export function getPersonalBoxHandlingError(props: Props): Error | null {
  const review = getPersonalBoxLidReview(props)
  if (review instanceof Error) return review
  if (!props.slot.packing?.opening?.reach_review?.grip_review) return null
  for (const state of review.offsets.keys()) {
    const frame = getPersonalBoxGripFrame({ ...props, state })
    if (frame instanceof Error) return frame
    const error = getPersonalBoxGripClearanceError({ ...props, frame })
    if (error) return error
  }

  return getPersonalBoxVerticalReviewError(props) ?? getPersonalBoxLateralReviewError(props)
}
