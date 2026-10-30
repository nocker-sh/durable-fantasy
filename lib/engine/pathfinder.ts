import { getNearbyFreeGridCell } from "#/lib/engine/get-nearby-free-grid-cell"
import { GridPathSearch } from "#/lib/engine/grid-path-search"
import { getShortenedPath } from "#/lib/engine/get-shortened-path"

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

  #isFree(i: number, j: number) {
    const props = this.#props
    return i >= 0 && j >= 0 && i < props.size && j < props.size && !props.blocked[j * props.size + i]
  }

  /** A* on the walk grid; returns world-space waypoints, string-pulled unless `grid` asks for every cell center. */
  find(from: V2, to: V2, grid = false): V2[] | null {
    const props = this.#props
    const startCell = getNearbyFreeGridCell({ cell: [Math.floor(from[0] * props.resolution), Math.floor(from[1] * props.resolution)], isFree: (x, y) => this.#isFree(x, y) })
    const goalCell = getNearbyFreeGridCell({ cell: [Math.floor(to[0] * props.resolution), Math.floor(to[1] * props.resolution)], isFree: (x, y) => this.#isFree(x, y) })
    if (!startCell || !goalCell) return null
    const start = startCell[1] * props.size + startCell[0]
    const goal = goalCell[1] * props.size + goalCell[0]
    const search = new GridPathSearch({ size: props.size, resolution: props.resolution, start, goal, blocked: props.blocked })
    const points = search.find()
    if (!points) return null
    if (grid) return points
    points[points.length - 1] = this.#isFree(Math.floor(to[0] * props.resolution), Math.floor(to[1] * props.resolution)) ? [to[0], to[1]] : points[points.length - 1]
    return getShortenedPath({ points: points, isVisible: (from, to) => this.#hasLineOfSight(from, to) })
  }

  #hasLineOfSight(a: V2, b: V2): boolean {
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
        if (!this.#isFree(Math.floor((x + ox) * props.resolution), Math.floor((z + oz) * props.resolution))) return false
      }
    }
    return true
  }
}
