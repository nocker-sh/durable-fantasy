import type { Rect } from "#/world/town/floorplan/types"
import { CELL_M, ELBOW_M, WALL_GAP_M } from "#/world/town/floorplan/geometry"
export function walkCells(W: number, D: number, blockers: readonly Rect[]) {
  const nx = Math.floor(W / CELL_M),
    nz = Math.floor(D / CELL_M)
  const free = new Uint8Array(nx * nz)
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const x = (i + 0.5) * CELL_M,
        z = (j + 0.5) * CELL_M
      if (x < WALL_GAP_M || z < WALL_GAP_M || x > W - WALL_GAP_M || z > D - WALL_GAP_M) continue
      if (blockers.some((b) => x > b.x0 - ELBOW_M && x < b.x1 + ELBOW_M && z > b.z0 - ELBOW_M && z < b.z1 + ELBOW_M)) continue
      free[j * nx + i] = 1
    }
  // a partition is thinner than a step: nobody steps through it between two cells that both lie clear of it
  const thin = blockers.filter((b) => Math.min(b.x1 - b.x0, b.z1 - b.z0) < CELL_M / 4)
  const crosses = (i: number, j: number, ii: number, jj: number) =>
    thin.some((b) => {
      const across = b.x1 - b.x0 >= b.z1 - b.z0
      if (across !== (j !== jj)) return false
      const line = across ? (b.z0 + b.z1) / 2 : (b.x0 + b.x1) / 2
      const a = ((across ? j : i) + 0.5) * CELL_M,
        c = ((across ? jj : ii) + 0.5) * CELL_M
      const at = ((across ? i : j) + 0.5) * CELL_M
      const runs = across ? at > b.x0 - ELBOW_M && at < b.x1 + ELBOW_M : at > b.z0 - ELBOW_M && at < b.z1 + ELBOW_M
      return runs && Math.min(a, c) < line && line < Math.max(a, c)
    })
  const cellOf = (x: number, z: number): [number, number] => [Math.min(nx - 1, Math.max(0, Math.floor(x / CELL_M))), Math.min(nz - 1, Math.max(0, Math.floor(z / CELL_M)))]
  /** The cells one can walk to from (x, z): the start cell counts even if something stands on it. */
  const flood = (from: [number, number]) => {
    const [si, sj] = cellOf(from[0], from[1])
    const seen = new Uint8Array(nx * nz)
    const queue = [sj * nx + si]
    seen[queue[0]] = 1
    for (let q = 0; q < queue.length; q++) {
      const k = queue[q],
        i = k % nx,
        j = Math.floor(k / nx)
      for (const [di, dj] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const ii = i + di,
          jj = j + dj,
          n = jj * nx + ii
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || seen[n] || !free[n] || crosses(i, j, ii, jj)) continue
        seen[n] = 1
        queue.push(n)
      }
    }
    return seen
  }
  /** Is some cell in `seen` within reach of the rect (a step from its edge)? */
  const reaches = (seen: Uint8Array, to: Rect, within = CELL_M) => {
    for (let k = 0; k < seen.length; k++) {
      if (!seen[k]) continue
      const x = ((k % nx) + 0.5) * CELL_M,
        z = (Math.floor(k / nx) + 0.5) * CELL_M
      if (x > to.x0 - within && x < to.x1 + within && z > to.z0 - within && z < to.z1 + within) return true
    }
    return false
  }
  return { nx, nz, free, flood, reaches }
}
