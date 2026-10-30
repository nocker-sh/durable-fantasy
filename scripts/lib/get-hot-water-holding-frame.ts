import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { leanNativeUpperBody } from "#/world/scene/figure/lean-native-upper-body"
import { getPouringPotHeldPose } from "#/world/town/get-pouring-pot-held-pose"
import { seatHeading } from "#/world/town/seat-heading"
import { getHotWaterPosedFrame } from "#/scripts/lib/get-hot-water-posed-frame"
import type { HotWaterAnimationContext as Props } from "#/scripts/lib/hot-water-frame-types"

/** 台の外の静止保持にも、握り・身体・器と家具・床の全検査を適用する。 */
export function getHotWaterHoldingFrame(props: Props) {
  const review = props.definition.plan.serving.pose_review
  const hold = review.holding_review
  const skeleton = leanNativeUpperBody({ skeleton: skelFor(props.look, props.animation, props.frame), angle: (hold.lean_degrees * Math.PI) / 180 })
  if (skeleton instanceof Error) return skeleton
  const pose = getPouringPotHeldPose({ profile: props.definition.profile, heading: seatHeading(review.lip_facing) - Math.PI / 2, tilt: 0, gripAt: hold.grip_m })
  if (pose instanceof Error) return pose
  return getHotWaterPosedFrame({ ...props, body: hold.body_m, skeleton, pose })
}
