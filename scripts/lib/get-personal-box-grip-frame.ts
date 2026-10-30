import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxGripPose } from "#/scripts/lib/get-personal-box-grip-pose"
import { storageLidState } from "#/world/town/storage-lid-state"
type Props = Parameters<typeof getPersonalBoxLidReview>[0] & { state: number }

/** Endpoints retain their source geometry and use the same contact solve as intermediate poses. */
export function getPersonalBoxGripFrame(props: Props) {
  const review = getPersonalBoxLidReview(props)
  if (review instanceof Error) return review
  if (!Number.isInteger(props.state) || props.state < 0 || props.state >= review.offsets.length) return new Error("Invalid personal box native frame")

  return getPersonalBoxGripPose({ slot: props.slot, parts: storageLidState(review, props.state) })
}
