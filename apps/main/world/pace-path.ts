import { cellDistance } from "#/world/maps/cell-distance"
import { CELLS_PER_SECOND, MOVE_BANK_MS, MOVE_LEAD_MS } from "#/world/protocol"
import type { Cell } from "#/world/protocol"

type Props = Readonly<{
  /** the start of the path being replaced */
  from: Cell
  /** the earliest time (ms) `from` can be reached */
  paced: number
  /** the start of the new path */
  to: Cell
  /** when the room received the new path */
  now: number
}>

/**
 * The earliest time the new path's start can be reached at walking speed, counted on from the old
 * start; null when that is more than MOVE_LEAD_MS after receipt. It falls at most MOVE_BANK_MS behind
 * receipt: moves held back by a short network stall arrive together and still fit, while longer
 * standing is not saved up for a burst (game-system.md §2).
 */
export function pacePath(props: Props): number | null {
  const due = props.paced + (cellDistance(props.from, props.to) / CELLS_PER_SECOND) * 1000
  if (due > props.now + MOVE_LEAD_MS) return null

  return Math.max(due, props.now - MOVE_BANK_MS)
}
