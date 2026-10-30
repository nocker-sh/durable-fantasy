import { getRoundBarContactError } from "#/world/scene/figure/get-round-bar-contact-error"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { segmentSegmentDistance3D } from "#/lib/engine/segment-segment-distance-3d"
import type { buildBody } from "#/world/scene/figure/body"
import type { Skel } from "#/world/scene/rig"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = Readonly<{ body: ReturnType<typeof buildBody>; skeleton: Skel; bodyScale: number; bar: RoundGripBar; hand: "l" | "r" }>

/** Only one certified forearm and cuff may contact the bar; its upper arm, the opposite arm and every other part still need clearance. */
export function getCertifiedSingleBarBodyError(props: Props): Error | null {
  if (!Number.isFinite(props.bodyScale) || props.bodyScale <= 0) return new Error("Invalid single-bar body scale")
  const contact = getRoundBarContactError(props)
  if (contact) return contact
  const p = props.skeleton.p,
    upper = nativeArmSurfaces({ scale: props.bodyScale, shoulder: p[`upperarm_${props.hand}`], elbow: p[`lowerarm_${props.hand}`], wrist: p[`hand_${props.hand}`] }).arm.capsuleBounds()[0]
  if (!upper || segmentSegmentDistance3D({ firstStart: props.bar.from, firstEnd: props.bar.to, secondStart: upper.a, secondEnd: upper.b }) < props.bar.radius + upper.r)
    return new Error("Single grip upper-arm clearance remains unresolved")
  const surface = limbSd([[...props.bar.from], [...props.bar.to]], [props.bar.radius, props.bar.radius]),
    allowed = new Set(props.body.armParts[props.hand])

  for (const primitive of props.body.prims)
    if (!allowed.has(primitive) && !canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 }))
      return new Error("Single grip body clearance remains unresolved", { cause: { primitive: primitive.id } })

  return null
}
