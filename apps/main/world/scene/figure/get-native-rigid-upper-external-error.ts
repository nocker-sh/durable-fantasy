import { buildBody } from "#/world/scene/figure/body"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { getCertifiedSingleBarBodyError } from "#/world/scene/figure/get-certified-single-bar-body-error"
import { createBodyContext } from "#/world/scene/figure/context"
import type { Skel } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { RoundGripBar } from "#/world/scene/figure/round-grip-bar-types"
type Props = Readonly<{ look: Look; reference: Skel; rootY: number; ceiling: number; boxes: readonly Cuboid[]; hand: "l" | "r"; bar: RoundGripBar }>

/** Actual non-leg parts keep one local shape only after the whole-cycle rigid-garment certificate; all swept obstacles and every post still block them. */
export function getNativeRigidUpperExternalError(props: Props): Error | null {
  if (![props.rootY, props.ceiling].every(Number.isFinite) || props.ceiling <= 0) return new Error("Invalid rigid upper room")
  const body = buildBody(props.look, props.reference, null),
    legs = new Set([...body.legParts.l, ...body.legParts.r]),
    upper = body.prims.filter((primitive) => !legs.has(primitive))
  if (!upper.length) return new Error("Missing actual upper-body parts")
  const contact = getCertifiedSingleBarBodyError({ body, skeleton: props.reference, bodyScale: createBodyContext(props.look, props.reference, null).S, hand: props.hand, bar: props.bar })
  if (contact) return contact

  for (const primitive of upper) {
    const bounds = primitiveBounds(primitive)
    if (bounds.min[1] + props.rootY < -1e-9 || bounds.max[1] + props.rootY > props.ceiling) return new Error("Rigid upper body leaves its floor or ceiling")
    if (props.boxes.some((box) => !canSeparatePrimitiveFromCuboid({ primitive, box })))
      return new Error("Rigid upper interval clearance from a solid remains unresolved", { cause: { primitive: primitive.id } })
  }

  return null
}
