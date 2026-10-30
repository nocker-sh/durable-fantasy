import { BONE_ORDER } from "#/world/scene/rig"
import type { Skel } from "#/world/scene/rig"
type Props = { skeleton: Skel; drop: number }
/** Lower the whole native pose before solving planted feet, retaining every joint offset, rotation and rest length. */
export function lowerNativePose(props: Props): Skel | Error {
  if (!Number.isFinite(props.drop) || props.drop < 0) return new Error("Invalid native pelvis drop")
  if (props.drop === 0) return props.skeleton
  const p = { ...props.skeleton.p }
  for (const bone of BONE_ORDER) p[bone] = [p[bone][0], p[bone][1] - props.drop, p[bone][2]]
  return { ...props.skeleton, p }
}
