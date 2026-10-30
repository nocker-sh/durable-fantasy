import { getTwoBonePlaneSpeedBound } from "#/lib/engine/get-two-bone-plane-speed-bound"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { createBodyContext } from "#/world/scene/figure/context"
import { getNativeArmMotionBound } from "#/world/scene/figure/get-native-arm-motion-bound"
import type { getArmGripMotionBound } from "#/world/scene/figure/get-arm-grip-motion-bound"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = Parameters<typeof getArmGripMotionBound>[0] & { normal: Point3 }

/** Apply the plane-constrained elbow bound before enclosing the same wrist, sleeve and uncut palm surfaces. */
export function getPlanarArmGripMotionBound(props: Props) {
  const lengths = armGripLengths(props.skeleton, props.hand),
    scale = createBodyContext(props.look, props.skeleton, null).S
  const elbow = getTwoBonePlaneSpeedBound({
    root: props.skeleton.p[`upperarm_${props.hand}`],
    from: props.from,
    to: props.to,
    upper: lengths.upper,
    lower: lengths.forearm + lengths.palm,
    pole: props.pole,
    normal: props.normal,
  })
  if (elbow instanceof Error) return elbow

  return getNativeArmMotionBound({ lengths, scale, elbow, grip: Math.hypot(...props.to.map((value, axis) => value - props.from[axis])) })
}
