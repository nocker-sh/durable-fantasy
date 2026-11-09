import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = { look: Look; skeleton: Skel }

/** Both sides use the renderer's native radii, with palm openings and cuff clipping removed for a conservative motion enclosure. */
export function getForearmPairSurfaces(props: Props) {
  const joints = props.skeleton.p,
    scale = createBodyContext(props.look, props.skeleton, null).S
  const l = nativeArmSurfaces({ scale: scale, shoulder: joints.upperarm_l, elbow: joints.lowerarm_l, wrist: joints.hand_l }),
    r = nativeArmSurfaces({ scale: scale, shoulder: joints.upperarm_r, elbow: joints.lowerarm_r, wrist: joints.hand_r })

  return { l, r }
}
