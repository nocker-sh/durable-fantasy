import { getNearbyFreeGridCell } from "#/lib/engine/get-nearby-free-grid-cell"
import { getGridWaypoints } from "#/lib/engine/get-grid-waypoints"
import { getShortenedPath } from "#/lib/engine/get-shortened-path"
import { MinPriorityQueue } from "#/lib/engine/min-priority-queue"

export type V2 = [number, number]

type Props = Readonly<{
  blocked: Uint8Array
  size: number
  resolution: number
  /** World-space corner offset for shortcut sampling; occupancy must already account for body clearance. */
  clearance: number
}>

/** A* on a square grid. Occupancy is read live so callers can update obstacles. */
export class GridPathfinder {
  readonly #props: Props
  readonly #offsets: ReadonlyArray<readonly [number, number]>

  constructor(props: Props) {
    if (
      !Number.isSafeInteger(props.size) ||
      props.size <= 0 ||
      props.blocked.length < props.size ** 2 ||
      !Number.isFinite(props.resolution) ||
      props.resolution <= 0 ||
      !Number.isFinite(props.clearance) ||
      props.clearance < 0
    )
      throw new RangeError("Invalid pathfinder grid")

    this.#props = Object.freeze({ ...props })
    const margin = props.clearance
    this.#offsets = [
      [margin, margin],
      [-margin, margin],
      [margin, -margin],
      [-margin, -margin],
    ]
    Object.freeze(this)
  }

  private free(i: number, j: number) {
    const props = this.#props
    return i >= 0 && j >= 0 && i < props.size && j < props.size && !props.blocked[j * props.size + i]
  }

  /** A* on the walk grid; returns world-space waypoints, string-pulled unless `grid` asks for every cell center. */
  find(from: V2, to: V2, grid = false): V2[] | null {
    const props = this.#props
    const s = getNearbyFreeGridCell({ cell: [Math.floor(from[0] * props.resolution), Math.floor(from[1] * props.resolution)], isFree: (x, y) => this.free(x, y) })
    const g = getNearbyFreeGridCell({ cell: [Math.floor(to[0] * props.resolution), Math.floor(to[1] * props.resolution)], isFree: (x, y) => this.free(x, y) })
    if (!s || !g) return null
    const S = s[1] * props.size + s[0],
      G = g[1] * props.size + g[0]
    const cost = new Float32Array(props.size * props.size).fill(Infinity)
    const prev = new Int32Array(props.size * props.size).fill(-1)
    const closed = new Uint8Array(props.size * props.size)
    const queue = new MinPriorityQueue<number>()
    const h = (k: number) => {
      const dx = Math.abs((k % props.size) - g[0]),
        dy = Math.abs(((k / props.size) | 0) - g[1])
      return Math.max(dx, dy) + 0.414 * Math.min(dx, dy)
    }
    cost[S] = 0
    queue.push(h(S), S)
    let iter = 0
    while (queue.size && iter++ < 40000) {
      const k = queue.pop()
      if (k === null) break
      if (closed[k]) continue
      closed[k] = 1
      if (k === G) break
      const i = k % props.size,
        j = (k / props.size) | 0
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue
          const ni = i + di,
            nj = j + dj
          if (!this.free(ni, nj)) continue
          if (di && dj && (!this.free(i + di, j) || !this.free(i, j + dj))) continue
          const nk = nj * props.size + ni,
            c = cost[k] + (di && dj ? 1.414 : 1)
          if (c < cost[nk]) {
            cost[nk] = c
            prev[nk] = k
            queue.push(c + h(nk), nk)
          }
        }
    }
    const pts = getGridWaypoints({ previous: prev, start: S, goal: G, size: props.size, resolution: props.resolution })
    if (!pts) return null
    if (grid) return pts
    pts[pts.length - 1] = this.free(Math.floor(to[0] * props.resolution), Math.floor(to[1] * props.resolution)) ? [to[0], to[1]] : pts[pts.length - 1]
    return getShortenedPath({ points: pts, isVisible: (from, to) => this.los(from, to) })
  }

  private los(a: V2, b: V2): boolean {
    const props = this.#props
    const offsets = this.#offsets
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * props.resolution * 3)
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        x = a[0] + (b[0] - a[0]) * t,
        z = a[1] + (b[1] - a[1]) * t
      for (const entry of offsets) {
        const ox = entry[0]
        const oz = entry[1]
        if (!this.free(Math.floor((x + ox) * props.resolution), Math.floor((z + oz) * props.resolution))) return false
      }
    }
    return true
  }
}
