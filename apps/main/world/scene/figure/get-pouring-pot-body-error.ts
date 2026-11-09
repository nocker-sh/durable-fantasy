import { getPouringPotBodyFields } from "#/world/scene/figure/get-pouring-pot-body-fields"
import { canSeparateFieldsFromPrimitive } from "#/lib/graphics/ray/can-separate-fields-from-primitive"
import { getPouringPotNativeParts } from "#/world/scene/figure/get-pouring-pot-native-parts"
import { getPouringPotBarBodyError } from "#/world/scene/figure/get-pouring-pot-bar-body-error"
import { buildBody } from "#/world/scene/figure/body"
import { createBodyContext } from "#/world/scene/figure/context"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import type { getPouringPotGripPose } from "#/world/scene/figure/get-pouring-pot-grip-pose"
type Props = Parameters<typeof getPouringPotGripPose>[0] & { posed: Exclude<ReturnType<typeof getPouringPotGripPose>, Error> }

/** The complete body/lip envelope and every carrying-bar capsule must clear the native figure apart from certified palm contact. */
export function getPouringPotBodyError(props: Props): Error | null {
  const parts = getPouringPotNativeParts({ ...props, rootY: props.posed.rootY })
  if (parts instanceof Error) return parts
  const body = buildBody(props.look, props.posed.skeleton, null),
    bodyScale = createBodyContext(props.look, props.posed.skeleton, null).S
  const uncertain = body.prims.filter((primitive) => !canSeparatePrimitiveFromCuboid({ primitive, box: parts.body }))
  if (uncertain.length) {
    const fields = getPouringPotBodyFields({ ...props, rootY: props.posed.rootY })
    if (fields instanceof Error) return fields
    for (const primitive of uncertain)
      if (!canSeparateFieldsFromPrimitive({ fields, primitive })) return new Error("Pouring pot body/lip clearance remains unresolved", { cause: { primitive: primitive.id } })
  }
  for (const bar of parts.bars) {
    const invalid = getPouringPotBarBodyError({ body, skeleton: props.posed.skeleton, bodyScale, bar })
    if (invalid) return invalid
  }

  return null
}
