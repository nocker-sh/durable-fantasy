import { getPersonalBoxNativeBridge } from "#/scripts/lib/get-personal-box-native-bridge"
import { getBimanualBarGripPose } from "#/world/scene/figure/get-bimanual-bar-grip-pose"
import type { getPersonalBoxReachPose } from "#/scripts/lib/get-personal-box-reach-pose"
type Props = Parameters<typeof getPersonalBoxReachPose>[0] & { frame: Exclude<ReturnType<typeof getPersonalBoxReachPose>, Error> }

/** Static and stepping legs share the same complete bridge certificate and native palm solver. */
export function getPersonalBoxGripFromReach(props: Props) {
  const source = props.slot.packing?.opening?.reach_review?.grip_review
  if (!source) return new Error("Personal box has no native palm contact proposal")
  const bar = getPersonalBoxNativeBridge({ frame: props.frame, parts: props.parts })
  if (bar instanceof Error) return bar
  const grip = getBimanualBarGripPose({ look: props.frame.look, skeleton: props.frame.posed.skeleton, grips: props.frame.posed.grips, bar, poles: source.elbow_poles })
  if (grip instanceof Error) return grip

  return { ...props.frame, posed: { ...props.frame.posed, ...grip }, bar, parts: props.parts }
}
