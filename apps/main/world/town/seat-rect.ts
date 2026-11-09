import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import type { SeatFacing } from "#/world/town/seat-orientation"

type Props = {
  facing: SeatFacing
  x0: number
  z0: number
  x1: number
  z1: number
  x?: number
  z?: number
}

/** Local chairs face north; rotate their actual sections about the seat centre. */
export function seatRect(props: Props) {
  const x = props.x === undefined ? 0 : props.x
  const z = props.z === undefined ? 0 : props.z

  return quarterTurnRect({
    bounds: { x0: props.x0, z0: props.z0, x1: props.x1, z1: props.z1 },
    turn: props.facing === "n" ? 0 : props.facing === "e" ? 1 : props.facing === "s" ? 2 : 3,
    origin: [x, z],
  })
}
