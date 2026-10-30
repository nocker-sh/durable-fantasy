import type { Placed, Rect, Divider } from "./types"
import { overlap } from "#/world/town/floorplan/overlap"
import { rect } from "#/world/town/floorplan/rect"
import { inside } from "#/world/town/floorplan/inside"

/** One floor being filled: what is there already, and the room each thing may go in. */
class Floor {
  pieces: Placed[] = []
  /** places kept clear: the doorway, the foot of the stair, the space in front of things */
  clear: Rect[] = []
  readonly floor: number
  readonly W: number
  readonly D: number
  readonly dividers: Divider[]
  constructor(inputProps2: { floor: number; width: number; depth: number; dividers: Divider[] }) {
    const floor = inputProps2.floor
    const W = inputProps2.width
    const D = inputProps2.depth
    const dividers = inputProps2.dividers
    this.floor = floor
    this.W = W
    this.D = D
    this.dividers = dividers
  }

  /** where one comes in, and the places that must stay reachable from there (a stair's foot, a way through, the fire) */
  from: [number, number] | null = null
  targets: Rect[] = []

  free(r: Rect, front: Rect | null) {
    if (r.x0 < -1e-6 || r.z0 < -1e-6 || r.x1 > this.W + 1e-6 || r.z1 > this.D + 1e-6) return false
    for (const p of this.pieces) if (p.solid && (overlap(r, p, 0.02) || (front && overlap(front, p)))) return false
    for (const c of this.clear) if (overlap(r, c)) return false
    for (const d of this.dividers) if (d.floor === this.floor && overlap(r, d, -0.005)) return false
    return this.reachable(r)
  }

  /** With `extra` standing too, can one still walk from the door to every target? (20 cm cells, 18 cm of elbow room) */
  reachable(extra: Rect | null = null): boolean {
    if (!this.from || !this.targets.length) return true
    const C = 0.2,
      nx = Math.ceil(this.W / C),
      nz = Math.ceil(this.D / C),
      m = 0.18
    const blockers: Rect[] = [...this.pieces.filter((p) => p.solid), ...this.dividers.filter((d) => d.floor === this.floor), ...(extra ? [extra] : [])]
    const free = (i: number, j: number) => {
      const x = (i + 0.5) * C,
        z = (j + 0.5) * C
      if (x < m || z < m || x > this.W - m || z > this.D - m) return false
      const me = { x0: x - m, z0: z - m, x1: x + m, z1: z + m }
      return !blockers.some((b) => overlap(me, b))
    }
    const si = Math.min(nx - 1, Math.floor(this.from[0] / C)),
      sj = Math.min(nz - 1, Math.floor(this.from[1] / C))
    const seen = new Uint8Array(nx * nz),
      queue = [sj * nx + si]
    seen[queue[0]] = 1
    const left = new Set(this.targets)
    while (queue.length && left.size) {
      const k = queue.shift()!,
        i = k % nx,
        j = Math.floor(k / nx)
      const x = (i + 0.5) * C,
        z = (j + 0.5) * C
      for (const t of left) if (x > t.x0 - 0.5 && x < t.x1 + 0.5 && z > t.z0 - 0.5 && z < t.z1 + 0.5) left.delete(t)
      for (const entry of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const di = entry[0]
        const dj = entry[1]

        const ii = i + di,
          jj = j + dj,
          q = jj * nx + ii
        if (ii < 0 || jj < 0 || ii >= nx || jj >= nz || seen[q] || !free(ii, jj)) continue
        seen[q] = 1
        queue.push(q)
      }
    }
    return left.size === 0
  }

  add(p: Placed, front: Rect | null) {
    this.pieces.push(p)
    if (front) this.clear.push(front)
  }

  /**
   * Set a piece against one of the room's walls (or a partition), its long side along it, with its
   * clear space in front; the walls are tried in `sides` order, positions from `from` outward.
   */
  againstWall(inputProps: { name: string; w: number; d: number; front: number; room: Rect; sides: ("n" | "e" | "s" | "w")[]; from?: number }): Placed | null {
    const name = inputProps.name
    const w = inputProps.w
    const d = inputProps.d
    const front = inputProps.front
    const room = inputProps.room
    const sides = inputProps.sides
    const from = inputProps.from === undefined ? 0.5 : inputProps.from

    for (const side of sides) {
      const along = side === "n" || side === "s"
      const pwState = along ? [w, d] : [d, w],
        pw = pwState[0],
        pd = pwState[1]
      const len = along ? room.x1 - room.x0 : room.z1 - room.z0
      const span = along ? pw : pd
      if (span > len + 1e-6) continue
      // offsets along the wall every 10 cm, and the far end exactly, nearest `from` first
      const room0 = len - span
      const offs = [...Array.from({ length: Math.floor(room0 / 0.1) + 1 }, (_, k) => k * 0.1), room0]
      const order = offs.sort((a, b) => Math.abs(a / Math.max(1e-6, room0) - from) - Math.abs(b / Math.max(1e-6, room0) - from))
      for (const off of order) {
        const a = (along ? room.x0 : room.z0) + span / 2 + off
        const x = along ? a : side === "w" ? room.x0 + pw / 2 : room.x1 - pw / 2
        const z = along ? (side === "n" ? room.z0 + pd / 2 : room.z1 - pd / 2) : a
        const r = rect({ x: x, z: z, w: pw, d: pd })
        const f: Rect =
          side === "n"
            ? { x0: r.x0, z0: r.z1, x1: r.x1, z1: r.z1 + front }
            : side === "s"
              ? { x0: r.x0, z0: r.z0 - front, x1: r.x1, z1: r.z0 }
              : side === "w"
                ? { x0: r.x1, z0: r.z0, x1: r.x1 + front, z1: r.z1 }
                : { x0: r.x0 - front, z0: r.z0, x1: r.x0, z1: r.z1 }
        if (!inside(r, room) || !this.free(r, f)) continue
        const p: Placed = { name, floor: this.floor, ...r, solid: true, wall: true }
        this.add(p, f)
        return p
      }
    }
    return null
  }

  /** Set a piece standing free in the room, as near `at` as it will go, with clear space all round. */
  near(inputProps: { name: string; w: number; d: number; front: number; room: Rect; at: [number, number]; solid?: boolean }): Placed | null {
    const name = inputProps.name
    const w = inputProps.w
    const d = inputProps.d
    const front = inputProps.front
    const room = inputProps.room
    const at = inputProps.at
    const solid = inputProps.solid === undefined ? true : inputProps.solid

    const cands: [number, number, number][] = []
    for (let x = room.x0 + w / 2; x <= room.x1 - w / 2 + 1e-6; x += 0.1) for (let z = room.z0 + d / 2; z <= room.z1 - d / 2 + 1e-6; z += 0.1) cands.push([x, z, Math.hypot(x - at[0], z - at[1])])
    cands.sort((a, b) => a[2] - b[2])
    for (const entry2 of cands) {
      const x = entry2[0]
      const z = entry2[1]
      for (const entry3 of [
        [w, d],
        [d, w],
      ]) {
        const pw = entry3[0]
        const pd = entry3[1]

        const r = rect({ x: x, z: z, w: pw, d: pd })
        const m = Math.min(front, 0.3)
        const f: Rect = { x0: r.x0 - m, z0: r.z0 - m, x1: r.x1 + m, z1: r.z1 + m }
        if (!inside(r, room)) continue
        if (solid ? !this.free(r, f) : this.clear.some((c) => overlap(r, c))) continue
        const p: Placed = { name, floor: this.floor, ...r, solid, wall: false }
        // a free-standing piece keeps its walkway only where it faces the room, not against another piece's clear space
        this.add(p, solid ? { x0: r.x0 - Math.min(front, 0.6), z0: r.z1, x1: r.x1 + Math.min(front, 0.6), z1: r.z1 + Math.min(front, 0.6) } : null)
        return p
      }
    }
    return null
  }
}

export { Floor }
