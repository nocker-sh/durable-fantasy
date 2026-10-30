import { MinPriorityQueue } from "#/lib/engine/min-priority-queue"

export type V2 = [number, number]

/** A* on a square grid. Occupancy is read live so callers can update obstacles. */
export class GridPathfinder {
  constructor(
    private readonly blocked: Uint8Array,
    private readonly size: number,
    private readonly resolution = 1,
  ) {}
  private free(i: number, j: number) {
    return i >= 0 && j >= 0 && i < this.size && j < this.size && !this.blocked[j * this.size + i]
  }

  private nearestFree(i: number, j: number): [number, number] | null {
    if (this.free(i, j)) return [i, j]
    for (let r = 1; r < 8; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) if (Math.max(Math.abs(di), Math.abs(dj)) === r && this.free(i + di, j + dj)) return [i + di, j + dj]
    return null
  }

  /** A* on the walk grid; returns world-space waypoints, string-pulled unless `grid` asks for every cell center. */
  find(from: V2, to: V2, grid = false): V2[] | null {
    const s = this.nearestFree(Math.floor(from[0] * this.resolution), Math.floor(from[1] * this.resolution))
    const g = this.nearestFree(Math.floor(to[0] * this.resolution), Math.floor(to[1] * this.resolution))
    if (!s || !g) return null
    const S = s[1] * this.size + s[0],
      G = g[1] * this.size + g[0]
    const cost = new Float32Array(this.size * this.size).fill(Infinity)
    const prev = new Int32Array(this.size * this.size).fill(-1)
    const closed = new Uint8Array(this.size * this.size)
    const queue = new MinPriorityQueue<number>()
    const h = (k: number) => {
      const dx = Math.abs((k % this.size) - g[0]),
        dy = Math.abs(((k / this.size) | 0) - g[1])
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
      const i = k % this.size,
        j = (k / this.size) | 0
      for (let dj = -1; dj <= 1; dj++)
        for (let di = -1; di <= 1; di++) {
          if (!di && !dj) continue
          const ni = i + di,
            nj = j + dj
          if (!this.free(ni, nj)) continue
          if (di && dj && (!this.free(i + di, j) || !this.free(i, j + dj))) continue
          const nk = nj * this.size + ni,
            c = cost[k] + (di && dj ? 1.414 : 1)
          if (c < cost[nk]) {
            cost[nk] = c
            prev[nk] = k
            queue.push(c + h(nk), nk)
          }
        }
    }
    if (prev[G] < 0 && G !== S) return null
    const cells: number[] = []
    for (let k = G; k !== -1; k = prev[k]) {
      cells.push(k)
      if (k === S) break
    }
    cells.reverse()
    const pts: V2[] = cells.map((k) => [((k % this.size) + 0.5) / this.resolution, (((k / this.size) | 0) + 0.5) / this.resolution])
    if (grid) return pts
    pts[pts.length - 1] = this.free(Math.floor(to[0] * this.resolution), Math.floor(to[1] * this.resolution)) ? [to[0], to[1]] : pts[pts.length - 1]
    // string pulling
    const out: V2[] = [pts[0]]
    let a = 0
    while (a < pts.length - 1) {
      let b = pts.length - 1
      while (b > a + 1 && !this.los(pts[a], pts[b])) b--
      out.push(pts[b])
      a = b
    }
    return out
  }

  private los(a: V2, b: V2): boolean {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * this.resolution * 3)
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        x = a[0] + (b[0] - a[0]) * t,
        z = a[1] + (b[1] - a[1]) * t
      for (const entry of [
        [0.2, 0.2],
        [-0.2, 0.2],
        [0.2, -0.2],
        [-0.2, -0.2],
      ]) {
        const ox = entry[0]
        const oz = entry[1]
        if (!this.free(Math.floor((x + ox) * this.resolution), Math.floor((z + oz) * this.resolution))) return false
      }
    }
    return true
  }
}
