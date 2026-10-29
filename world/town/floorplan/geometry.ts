import type { Rect } from "./types.ts"

const WALL = 0.25

const DIV = 0.12

/** room to stand in front of the door inside: the door's cell and the two walk cells in from it, where one arrives (interiors.ts) */
const DOORWAY = { w: 1.1, d: 2.0 }

const STAIR = { w: 0.9, d: 2.6, front: 0.8 }

/**
 * The game's own walk grid, in plan metres: a cell is half a tile (0.7 m), counted from the inside
 * of the walls. A cell can be stood in when its middle is this far from every solid thing and from
 * the walls (interiors.ts draws the room's grid with the same numbers).
 */
const CELL_M = 0.7
const ELBOW_M = 0.14
const WALL_GAP_M = 0.28

/** Which cells of a floor W × D (m) can be stood in, with these things standing. */
function walkCells(W: number, D: number, blockers: readonly Rect[]) {
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
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || seen[n] || !free[n]) continue
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

const overlap = (a: Rect, b: Rect, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.z0 < b.z1 + m && b.z0 < a.z1 + m

const inside = (a: Rect, r: Rect) => a.x0 >= r.x0 - 1e-6 && a.x1 <= r.x1 + 1e-6 && a.z0 >= r.z0 - 1e-6 && a.z1 <= r.z1 + 1e-6

const rect = (x: number, z: number, w: number, d: number): Rect => ({ x0: x - w / 2, z0: z - d / 2, x1: x + w / 2, z1: z + d / 2 })

const centre = (r: Rect): [number, number] => [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2]

export { WALL, DIV, DOORWAY, STAIR, CELL_M, ELBOW_M, WALL_GAP_M, overlap, inside, rect, centre, walkCells }
