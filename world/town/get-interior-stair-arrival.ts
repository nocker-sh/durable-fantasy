import { cellDistance } from "#/world/maps/cell-distance"
import type { Cell } from "#/world/town/interiors"
import type { InteriorStairEndpoint, InteriorStairRoom } from "#/world/town/interior-stair-types"

type Props = Readonly<{ room: InteriorStairRoom; start: Cell; endpoints: readonly InteriorStairEndpoint[] }>
const directions: readonly Cell[] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

/** Preserve breadth-first walking order and the four-step limit, clear of every return trigger. */
export function getInteriorStairArrival(props: Props): Cell {
  const interior = props.room.interior
  const triggers = [...props.endpoints.filter((endpoint) => endpoint.map === interior.id).map((endpoint) => endpoint.at), ...(interior.floor === 0 ? [interior.door] : [])]
  const queue = [{ at: props.start, steps: 0 }],
    seen = new Set([props.start.join(",")])
  for (const current of queue) {
    if (triggers.every((trigger) => cellDistance(current.at, trigger) > 1)) return current.at
    if (current.steps >= 4) continue
    for (const direction of directions) {
      const next: Cell = [current.at[0] + direction[0], current.at[1] + direction[1]],
        key = next.join(",")
      if (!seen.has(key) && props.room.rows[next[1]]?.[next[0]] === ".") {
        seen.add(key)
        queue.push({ at: next, steps: current.steps + 1 })
      }
    }
  }
  throw new Error(`Stair landing has no safe arrival: ${interior.id}`)
}
