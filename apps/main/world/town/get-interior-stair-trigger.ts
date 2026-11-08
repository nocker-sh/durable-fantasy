import { getInteriorStairTriggerScore } from "#/world/town/get-interior-stair-trigger-score"
import type { Cell } from "#/world/town/interiors"
import type { Rect } from "#/world/town/floorplan/types"
import type { InteriorStairRoom } from "#/world/town/interior-stair-types"

type Props = Readonly<{ room: InteriorStairRoom; landing: Rect; flight: Rect }>

/** Search only existing walk-grid cells, never an unbounded range inferred from geometry. */
export function getInteriorStairTrigger(props: Props): Cell {
  const candidates: Cell[] = []
  for (const row of props.room.rows.entries()) {
    for (const cell of row[1].split("").entries()) {
      if (cell[1] !== ".") continue
      const x = (cell[0] + 0.5) / 2,
        z = (row[0] + 0.5) / 2
      if (x > props.landing.x0 && x < props.landing.x1 && z > props.landing.z0 && z < props.landing.z1) candidates.push([cell[0], row[0]])
    }
  }
  candidates.sort((a, b) => getInteriorStairTriggerScore(a, props.landing, props.flight) - getInteriorStairTriggerScore(b, props.landing, props.flight) || a[1] - b[1] || a[0] - b[0])
  if (!candidates[0]) throw new Error(`Stair landing has no walkable trigger: ${props.room.interior.id}`)
  return candidates[0]
}
