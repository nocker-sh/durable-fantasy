import { leanNativeUpperBody } from "#/world/scene/figure/lean-native-upper-body"
import { getHotWaterReachFrame } from "#/scripts/lib/get-hot-water-reach-frame"
import { getHotWaterPosedFrame } from "#/scripts/lib/get-hot-water-posed-frame"
import { getPouringPotTiltPose } from "#/world/town/get-pouring-pot-tilt-pose"
import { seatHeading } from "#/world/town/seat-heading"
type Props = Parameters<typeof getHotWaterReachFrame>[0] & { tilt: number }

/** Return an actual checked trial frame or its collision; an unresolved candidate never becomes an accepted animation. */
export function getHotWaterTiltCandidateFrame(props: Props) {
  const final = getHotWaterReachFrame(props)
  if (final instanceof Error) return final
  const review = props.definition.plan.serving.pose_review,
    table = props.review.layout.table.work_surface
  if (!table) return new Error("Tilt candidate has no measured table")
  const clearancePlane = table.height_m + Math.max(...props.review.layout.boxes.map((box) => box.size[1])) + review.lip_above_rim_m
  const pose = getPouringPotTiltPose({
    profile: props.definition.profile,
    finalPose: final.pose,
    heading: seatHeading(review.lip_facing) - Math.PI / 2,
    tilt: props.tilt,
    finalTilt: (review.tilt_degrees * Math.PI) / 180,
    backset: review.tilt_candidate.grip_backset_m,
    clearancePlane,
  })
  if (pose instanceof Error) return pose

  const posture = review.tilt_candidate.upper_body,
    releaseSpan = review.tilt_degrees - posture.release_after_degrees
  if (!Number.isFinite(releaseSpan) || releaseSpan <= 0) return new Error("Invalid native lean release interval")
  const remaining = Math.min(1, Math.max(0, (review.tilt_degrees - (props.tilt * 180) / Math.PI) / releaseSpan)),
    skeleton = leanNativeUpperBody({ skeleton: final.skeleton, angle: ((posture.start_lean_degrees * Math.PI) / 180) * remaining })
  if (skeleton instanceof Error) return skeleton

  return getHotWaterPosedFrame({ ...props, body: final.body, skeleton, pose })
}
