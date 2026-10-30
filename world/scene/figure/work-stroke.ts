import type { ToolGripProfile } from "#/world/town/working-tool"
import { twoBoneSegmentReach } from "../../../lib/engine/two-bone-segment-reach"
import type { Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
import type { Look } from "./look"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { nativeWorkPose } from "#/world/scene/figure/native-work-pose"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
/** Fixed support, whole-segment arm reach and endpoint poses only; intermediate arm clearance remains unresolved. */
export function nativeWorkStrokeEndpoints(inputProps: { look: Look; candidate: WorkPoseCandidate; grips: readonly [V3, V3]; axis: V3; profile?: ToolGripProfile }) {
  const look = inputProps.look
  const candidate = inputProps.candidate
  const grips = inputProps.grips
  const axis = inputProps.axis
  const profile = inputProps.profile

  const endpoints = grips.map((grip) => nativeWorkPose({ look: look, pose: candidate, target: grip, gripAxis: axis, profile: profile })),
    shoulder = endpoints[0].skeleton.p[`upperarm_${candidate.hand}`],
    lengths = armGripLengths(endpoints[0].skeleton, candidate.hand)
  if (!twoBoneSegmentReach({ root: shoulder, from: endpoints[0].solution.grip, to: endpoints[1].solution.grip, upper: lengths.upper, lower: lengths.forearm + lengths.palm }))
    throw new Error("Native working stroke crosses an unreachable arm range")
  return endpoints
}
