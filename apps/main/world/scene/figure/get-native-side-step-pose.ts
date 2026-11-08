import { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { getNativeGroundedFootPose } from "#/world/scene/figure/get-native-grounded-foot-pose"
import type { Look } from "#/world/scene/figure/look"
type Props = Parameters<typeof getSideStepOffsets>[0] & { look: Look; pelvisDrop: number }
/** A level-ground stepping candidate with fixed upper body; contact targets do not certify balance or load support. */
export function getNativeSideStepPose(props: Props) {
  const offsets = getSideStepOffsets(props)
  if (offsets instanceof Error) return offsets

  return getNativeGroundedFootPose({ ...props, skeleton: skelFor(props.look, "idle", 0), offsets })
}
