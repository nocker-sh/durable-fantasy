import { getHotWaterPotSpaceError } from "#/scripts/lib/get-hot-water-pot-space-error"
import { getPouringPotBodyError } from "#/world/scene/figure/get-pouring-pot-body-error"
import { getPouringPotGripPose } from "#/world/scene/figure/get-pouring-pot-grip-pose"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import { getHotWaterReachSpaceError } from "#/scripts/lib/get-hot-water-reach-space-error"
import type { HotWaterPoseContext as Props } from "#/scripts/lib/hot-water-frame-types"

/** Static and trial motion frames share all reach, contact, vessel, table and self-clearance checks. */
export function getHotWaterPosedFrame(props: Props) {
  const source = props.definition.plan.serving.pose_review.reach_review,
    native = { ...props, profile: props.definition.profile, heading: Math.PI, gripOffset: source.grip_offset_m, poles: source.poles },
    posed = getPouringPotGripPose(native)
  if (posed instanceof Error) return posed
  const invalid =
    getPouringPotBodyError({ ...native, posed }) ??
    getHotWaterReachSpaceError({ ...props, posed, spaceIndex: props.definition.plan.serving.space_index }) ??
    getHotWaterPotSpaceError({ ...props, posed })
  if (invalid) return invalid
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const self = getForearmSelfClearanceError({ look: props.look, skeleton: posed.skeleton, hand, margin: 0 })
    if (self) return self
  }

  return { body: props.body, pose: props.pose, posed, skeleton: props.skeleton }
}
