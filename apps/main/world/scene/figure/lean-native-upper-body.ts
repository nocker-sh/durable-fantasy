import { qmul } from "#/lib/engine/qmul"
import { qrot } from "#/lib/engine/qrot"
import { addVector3 as add } from "#/lib/engine/add-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import type { Q } from "#/lib/engine/quaternion-types"
import type { Bone, Skel } from "#/world/scene/rig"
type Props = { skeleton: Skel; angle: number }

/** Bend the upper chain rigidly about the unchanged pelvis; feet stay planted and hand constraints must be solved afterwards. */
export function leanNativeUpperBody(props: Props): Skel | Error {
  if (!Number.isFinite(props.angle) || props.angle < 0 || props.angle >= Math.PI / 2) return new Error("Invalid native upper-body lean")
  if (props.angle === 0) return props.skeleton
  if (Object.keys(props.skeleton.handGrips ?? {}).length) return new Error("Native lean must precede hand contact constraints")
  const bones: readonly Bone[] = ["spine_01", "spine_02", "spine_03", "neck_01", "head", "clavicle_l", "upperarm_l", "lowerarm_l", "hand_l", "clavicle_r", "upperarm_r", "lowerarm_r", "hand_r"]
  const rotation: Q = [Math.sin(props.angle / 2), 0, 0, Math.cos(props.angle / 2)],
    p = { ...props.skeleton.p },
    q = { ...props.skeleton.q },
    pelvis = props.skeleton.p.pelvis
  for (const bone of bones) {
    p[bone] = add(pelvis, qrot(rotation, sub(props.skeleton.p[bone], pelvis)))
    q[bone] = qmul(rotation, props.skeleton.q[bone])
  }

  return { ...props.skeleton, p, q }
}
