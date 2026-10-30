import { getPersonalBoxLidReview } from "#/scripts/lib/get-personal-box-lid-review"
import { getPersonalBoxGripPose } from "#/scripts/lib/get-personal-box-grip-pose"
import { getPersonalBoxGripClearanceError } from "#/scripts/lib/get-personal-box-grip-clearance-error"
import { getStorageLidMotionState } from "#/world/town/get-storage-lid-motion-state"
import { storageLidState } from "#/world/town/storage-lid-state"
import { getNativePlantedContactError } from "#/world/scene/figure/get-native-planted-contact-error"
type Props = Parameters<typeof getPersonalBoxLidReview>[0] & { segment: number; progress: number }

/** Candidate intermediate poses keep real palm contact and planted support; a missing lateral gait is rejected, never replaced by sliding. */
export function getPersonalBoxMotionFrame(props: Props) {
  const review = getPersonalBoxLidReview(props),
    knee = props.slot.packing?.opening?.reach_review?.knee
  if (review instanceof Error) return review
  if (!knee) return new Error("Personal box motion has no planted support proposal")
  const motion = getStorageLidMotionState({ plan: review, segment: props.segment, progress: props.progress })
  if (motion instanceof Error) return motion
  const from = getPersonalBoxGripPose({ slot: props.slot, parts: storageLidState(review, props.segment) }),
    frame = getPersonalBoxGripPose({ slot: props.slot, parts: motion.parts })
  if (from instanceof Error) return from
  if (frame instanceof Error) return frame
  const support = getNativePlantedContactError({
    look: frame.look,
    heading: Math.PI / 2,
    knee,
    from: { skeleton: from.posed.skeleton, rootY: from.posed.rootY, body: from.body },
    to: { skeleton: frame.posed.skeleton, rootY: frame.posed.rootY, body: frame.body },
  })
  if (support) return support
  const clearance = getPersonalBoxGripClearanceError({ ...props, frame })
  if (clearance) return clearance

  return frame
}
