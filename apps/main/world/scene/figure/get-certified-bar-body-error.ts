import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { segmentSegmentDistance3D } from "#/lib/engine/segment-segment-distance-3d"
import type { buildBody } from "#/world/scene/figure/body"
import type { Skel } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = { body: ReturnType<typeof buildBody>; skeleton: Skel; bodyScale: number; bar: RoundGripBar }

/** Whole-bar palm/wrist certificates cover forearms and cuffs; upper-arm envelopes and every other body part still need separation. */
export function getCertifiedBarBodyError(props: Props): Error | null {
  if (!Number.isFinite(props.bodyScale) || props.bodyScale <= 0) return new Error("Invalid certified bar body scale")
  const surface = limbSd([[...props.bar.from], [...props.bar.to]], [props.bar.radius, props.bar.radius])
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const invalid = getRoundBarContactError({ skeleton: props.skeleton, hand, bar: props.bar })
    if (invalid) return invalid
    const joints = props.skeleton.p,
      upper = nativeArmSurfaces({ scale: props.bodyScale, shoulder: joints[`upperarm_${hand}`], elbow: joints[`lowerarm_${hand}`], wrist: joints[`hand_${hand}`] }).arm.capsuleBounds()[0]
    if (!upper || segmentSegmentDistance3D({ firstStart: props.bar.from, firstEnd: props.bar.to, secondStart: upper.a, secondEnd: upper.b }) < props.bar.radius + upper.r)
      return new Error("Certified grip upper-arm clearance remains unresolved")
  }
  for (const primitive of props.body.prims) {
    if (props.body.armParts.l.includes(primitive) || props.body.armParts.r.includes(primitive)) continue
    if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 })) return new Error("Certified grip body clearance remains unresolved", { cause: { primitive: primitive.id } })
  }

  return null
}
