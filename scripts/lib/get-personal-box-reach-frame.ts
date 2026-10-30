import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { storageLidState } from "#/world/town/storage-lid-state"
import { getPersonalBoxReachPose } from "#/scripts/lib/get-personal-box-reach-pose"
type Props = Parameters<typeof getPersonalBoxLidReview>[0] & { state: number }

/** Resolve a declared endpoint before sharing the owner-specific reach solve with motion candidates. */
export function getPersonalBoxReachFrame(props: Props) {
  const review = getPersonalBoxLidReview(props)
  if (review instanceof Error) return new Error("Personal box has no matching native reach review")
  if (!Number.isInteger(props.state) || props.state < 0 || props.state >= review.offsets.length) return new Error("Invalid personal box native frame")

  return getPersonalBoxReachPose({ slot: props.slot, parts: storageLidState(review, props.state) })
}
