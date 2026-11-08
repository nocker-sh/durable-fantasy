import { buildBody } from "#/world/scene/figure/body"
import { canRestGarmentOnSeat } from "#/world/scene/can-rest-garment-on-seat"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { getSeatedChairFrameError } from "#/world/scene/get-seated-chair-frame-error"
type Props = Parameters<typeof getSeatedChairFrameError>[0]

/** Every rendered skirt layer and both trousers must avoid the board's interior; empty or mismatched outfits fail closed. */
export function getSeatedSkirtSeatError(props: Props): Error | null {
  const seats = props.chair.filter((part) => part.part === "seat"),
    body = buildBody(props.look, props.skeleton, null)
  const layers = 1 + Number(Boolean(props.look.overskirt && !props.look.robe)) + Number(Boolean(props.look.frill && !props.look.robe))
  if (seats.length !== 1 || body.skirtParts.length !== layers || body.trouserParts.length !== 2) return new Error("Unavailable reviewed skirt layers or seat")
  const seat = seats[0],
    box = toHeadingLocalCuboid({ box: { x0: seat.x0, x1: seat.x1, bottom: seat.y0, top: seat.y1, z0: seat.z0, z1: seat.z1 }, root: props.root, heading: props.heading })
  if (box instanceof Error) return box
  if (![...body.skirtParts, ...body.trouserParts].every((part) => canRestGarmentOnSeat(part, box))) return new Error("Seated skirt or trouser clearance at the seat remains unresolved")

  return null
}
