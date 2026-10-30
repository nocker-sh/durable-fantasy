import { canRestGarmentOnSeat } from "#/world/scene/can-rest-garment-on-seat"
import { buildBody } from "#/world/scene/figure/body"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import type { getSeatedChairFrameError } from "#/world/scene/get-seated-chair-frame-error"
type Props = Parameters<typeof getSeatedChairFrameError>[0]

/** Review the actual tunic and coat tails, not an exemption for their expected contact or the body's load support. */
export function getSeatedGarmentSeatError(props: Props): Error | null {
  const seats = props.chair.filter((part) => part.part === "seat"),
    body = buildBody(props.look, props.skeleton, null)
  if (seats.length !== 1 || body.tunicParts.length === 0) return new Error("Unavailable reviewed garment or seat")
  const seat = seats[0]
  const box = toHeadingLocalCuboid({ box: { x0: seat.x0, x1: seat.x1, bottom: seat.y0, top: seat.y1, z0: seat.z0, z1: seat.z1 }, root: props.root, heading: props.heading })
  if (box instanceof Error) return box
  if (body.trouserParts.length !== 2 || !body.trouserParts.every((part) => canRestGarmentOnSeat(part, box))) return new Error("Seated trouser support at the seat remains unresolved")
  for (const group of [
    { name: "tunic", parts: body.tunicParts },
    { name: "coat tails", parts: body.coatTailParts },
  ]) {
    for (const primitive of group.parts)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box })) return new Error(`Seated ${group.name} clearance from the seat remains unresolved`, { cause: { box, primitive: primitive.id } })
  }

  return null
}
