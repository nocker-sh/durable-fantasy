import { getCertifiedBarBodyError } from "#/world/scene/figure/get-certified-bar-body-error"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { PALM_GRIP_OFFSET } from "#/world/scene/figure/arm-grip"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { segmentSegmentDistance3D } from "#/lib/engine/segment-segment-distance-3d"
type Props = Parameters<typeof getCertifiedBarBodyError>[0] & { elbowMargins: Readonly<Record<"l" | "r", number>>; barMargin: number }

/** A certified fixed plane keeps the whole bar before each wrist for all times; upper arms and the remaining static body retain motion margins. */
export function getPlanarBarIntervalError(props: Props): Error | null {
  if (![props.elbowMargins.l, props.elbowMargins.r, props.barMargin].every((value) => Number.isFinite(value) && value >= 0)) return new Error("Invalid planar bar interval margin")
  const staticError = getCertifiedBarBodyError(props)
  if (staticError) return staticError
  const surface = limbSd([[...props.bar.from], [...props.bar.to]], [props.bar.radius, props.bar.radius]),
    joints = props.skeleton.p
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const raw = nativeArmSurfaces({ scale: props.bodyScale, shoulder: joints[`upperarm_${hand}`], elbow: joints[`lowerarm_${hand}`], wrist: joints[`hand_${hand}`] }),
      core = raw.palm.radius - Math.abs(PALM_GRIP_OFFSET - raw.palm.fromWrist),
      upper = raw.arm.capsuleBounds()[0]
    if (Math.SQRT2 * props.bar.radius + 1e-10 >= core || props.bar.radius + 1e-10 >= PALM_GRIP_OFFSET) return new Error("Moving bridge leaves no certified palm and cuff clearance")
    if (
      !upper ||
      segmentSegmentDistance3D({ firstStart: props.bar.from, firstEnd: props.bar.to, secondStart: upper.a, secondEnd: upper.b }) <=
        props.bar.radius + upper.r + props.elbowMargins[hand] + props.barMargin
    )
      return new Error("Moving bridge upper-arm clearance remains unresolved")
  }
  for (const primitive of props.body.prims) {
    if (props.body.armParts.l.includes(primitive) || props.body.armParts.r.includes(primitive)) continue
    if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin: props.barMargin })) return new Error("Moving bridge body clearance remains unresolved")
  }

  return null
}
