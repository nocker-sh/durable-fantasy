import { getExpandedCuboid } from "#/lib/engine/get-expanded-cuboid"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import type { buildBody } from "#/world/scene/figure/body"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { body: ReturnType<typeof buildBody>; boxes: readonly Cuboid[]; margin: number }

/** The head, hair, torso, clothes and legs stay static while moving boards sweep past; moving arms require their separate enclosure. */
export function getMovingBoxesNonArmError(props: Props): Error | null {
  for (const box of props.boxes) {
    const expanded = getExpandedCuboid(box, props.margin)
    if (expanded instanceof Error) return expanded
    for (const primitive of props.body.prims) {
      if (props.body.armParts.l.includes(primitive) || props.body.armParts.r.includes(primitive)) continue
      if (!canSeparatePrimitiveFromCuboid({ primitive, box: expanded })) return new Error("Moving board interval body clearance remains unresolved")
    }
  }

  return null
}
