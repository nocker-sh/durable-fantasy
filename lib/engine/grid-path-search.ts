import { getGridWaypoints } from "#/lib/engine/get-grid-waypoints"
import { MinPriorityQueue } from "#/lib/engine/min-priority-queue"

type Props = Readonly<{ size: number; resolution: number; start: number; goal: number; blocked: Uint8Array }>
type SearchState = Readonly<{ cost: Float32Array; previous: Int32Array; closed: Uint8Array; queue: MinPriorityQueue<number> }> & { iterations: number }

const NEIGHBOR_STEPS = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
]

/** Search a validated square grid without sharing frontier state between calls; ties retain row-first neighbor order. */
export class GridPathSearch {
  readonly #props: Props
  readonly #goal: readonly [number, number]

  constructor(props: Props) {
    this.#props = Object.freeze({ ...props })
    this.#goal = [props.goal % props.size, (props.goal / props.size) | 0]
    Object.freeze(this)
  }

  find(): [number, number][] | null {
    const props = this.#props
    const search = this.#createSearch()
    search.cost[props.start] = 0
    search.queue.push(this.#estimateRemainingCost(props.start), props.start)
    while (search.queue.size && search.iterations++ < 40000) {
      const cell = search.queue.pop()
      if (cell === null) break
      if (search.closed[cell]) continue
      search.closed[cell] = 1
      if (cell === props.goal) break
      this.#expand(search, cell)
    }
    return getGridWaypoints({ previous: search.previous, start: props.start, goal: props.goal, size: props.size, resolution: props.resolution })
  }

  #createSearch(): SearchState {
    const cells = this.#props.size ** 2
    return {
      cost: new Float32Array(cells).fill(Infinity),
      previous: new Int32Array(cells).fill(-1),
      closed: new Uint8Array(cells),
      queue: new MinPriorityQueue<number>(),
      iterations: 0,
    }
  }

  #isFree(x: number, y: number): boolean {
    const props = this.#props
    return x >= 0 && y >= 0 && x < props.size && y < props.size && !props.blocked[y * props.size + x]
  }

  #estimateRemainingCost(cell: number): number {
    const props = this.#props
    const dx = Math.abs((cell % props.size) - this.#goal[0])
    const dy = Math.abs(((cell / props.size) | 0) - this.#goal[1])
    return Math.max(dx, dy) + 0.414 * Math.min(dx, dy)
  }

  #expand(search: SearchState, cell: number): void {
    const props = this.#props
    const x = cell % props.size
    const y = (cell / props.size) | 0
    for (const step of NEIGHBOR_STEPS) {
      const nextX = x + step.x
      const nextY = y + step.y
      if (!this.#isFree(nextX, nextY)) continue
      if (step.x && step.y && (!this.#isFree(x + step.x, y) || !this.#isFree(x, y + step.y))) continue
      const next = nextY * props.size + nextX
      const cost = search.cost[cell] + (step.x && step.y ? 1.414 : 1)
      if (!(cost < search.cost[next])) continue
      search.cost[next] = cost
      search.previous[next] = cell
      search.queue.push(cost + this.#estimateRemainingCost(next), next)
    }
  }
}
