import { buildBody } from "#/world/scene/figure/body"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { ChairSection } from "#/world/town/get-chair-sections"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
type Props = { look: Look; skeleton: Skel; root: Point3; heading: number; chair: readonly ChairSection[] }

/** Chair back and four legs only; seat support, clothing at the board and foot-rest contact require separate proofs. */
export function getSeatedChairFrameError(props: Props): Error | null {
  const frame = props.chair.filter((section) => section.part === "back" || section.part === "leg")
  if (frame.filter((section) => section.part === "leg").length !== 4 || frame.filter((section) => section.part === "back").length > 1) return new Error("Invalid seated chair frame")
  const body = buildBody(props.look, props.skeleton, null)
  for (const section of frame) {
    const box = toHeadingLocalCuboid({ box: { x0: section.x0, x1: section.x1, bottom: section.y0, top: section.y1, z0: section.z0, z1: section.z1 }, root: props.root, heading: props.heading })
    if (box instanceof Error) return box
    for (const primitive of body.prims)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box }))
        return new Error("Native seated body clearance from the chair frame remains unresolved", { cause: { part: section.part, primitive: primitive.id, box } })
  }

  return null
}
