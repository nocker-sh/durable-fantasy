import { getNativeBody } from "#/world/scene/figure/get-native-body"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { getWaterVesselPrimitive } from "#/world/scene/figure/get-water-vessel-primitive"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
type Props = { native?: NativeBodyFrame; look: Look; skeleton: Skel; parts: readonly WaterVesselPart[] }

/** The full external jar envelope must clear arms as well as the torso, clothes and head. */
export function getWaterJarBodyError(props: Props): Error | null {
  const body = getNativeBody(props)
  if (body instanceof Error) return body
  for (const part of props.parts) {
    if (part.kind === "capsule") continue
    const shape = getWaterVesselPrimitive(part)
    if (shape instanceof Error) return shape
    const bounds = primitiveBounds(shape),
      box = { x0: bounds.min[0], x1: bounds.max[0], bottom: bounds.min[1], top: bounds.max[1], z0: bounds.min[2], z1: bounds.max[2] }
    for (const primitive of body.prims)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box })) return new Error("Water jar clearance from the native body remains unresolved", { cause: { part: part.part, primitive: primitive.id } })
  }

  return null
}
