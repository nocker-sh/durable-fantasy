import { getNativeBody } from "#/world/scene/figure/get-native-body"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
import { getWaterGripBarError } from "#/world/scene/figure/get-water-grip-bar-error"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
type Props = { native?: NativeBodyFrame; look: Look; skeleton: Skel; parts: readonly WaterVesselPart[] }

/** Only the certified grip bar may contact its own hand; all other bars must clear every actual body part. */
export function getWaterHandleBodyError(props: Props): Error | null {
  const body = getNativeBody(props)
  if (body instanceof Error) return body
  for (const part of props.parts) {
    if (part.kind !== "capsule") continue
    const contact = part.section === "grip" ? getWaterGripBarError({ skeleton: props.skeleton, bar: part }) : null
    if (contact) return contact
    const surface = limbSd([[...part.from], [...part.to]], [part.radius, part.radius])
    for (const primitive of body.prims) {
      if (part.section === "grip" && body.armParts[part.side].includes(primitive)) continue
      if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin: 0 }))
        return new Error(`Water ${part.side} ${part.section} handle clearance remains unresolved`, { cause: { primitive: primitive.id } })
    }
  }

  return null
}
