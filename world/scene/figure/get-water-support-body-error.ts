import { getNativeBody } from "#/world/scene/figure/get-native-body"
import type { NativeBodyFrame } from "#/world/scene/figure/native-body-frame-types"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import type { WaterSupportPart } from "#/world/town/get-water-vessel-support-parts"
import type { Skel } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
type Props = { look: Look; skeleton: Skel; body: readonly [number, number]; rootY: number; heading: number; parts: readonly WaterSupportPart[]; native?: NativeBodyFrame }

/** Every native body part, including both shoes, must clear the actual support's top, back and arms. */
export function getWaterSupportBodyError(props: Props): Error | null {
  const body = getNativeBody(props)
  if (body instanceof Error) return body
  for (const part of props.parts) {
    const box = toHeadingLocalCuboid({
      box: { x0: part.min[0], x1: part.max[0], bottom: part.min[1], top: part.max[1], z0: part.min[2], z1: part.max[2] },
      root: [props.body[0], props.rootY, props.body[1]],
      heading: props.heading,
    })
    if (box instanceof Error) return box
    for (const primitive of body.prims)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box })) return new Error(`Water shelf ${part.part} clearance from the body remains unresolved`, { cause: { primitive: primitive.id } })
  }

  return null
}
