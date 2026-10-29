import type { Placed, Rect, Divider } from "./types.ts"
import { overlap, rect, inside, walkCells } from "./geometry.ts"

/** One floor being filled: what is there already, and the room each thing may go in. */
class Floor {
  pieces: Placed[] = []
  /** places kept clear: the doorway, the foot of the stair, the space in front of things */
  clear: Rect[] = []
  constructor(
    readonly floor: number,
    readonly W: number,
    readonly D: number,
    readonly dividers: Divider[],
  ) {}

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

  /** With `extra` standing too, can one still walk from the door to every target, on the game's own grid (geometry.ts walkCells)? */
  reachable(extra: Rect | null = null): boolean {
    if (!this.from || !this.targets.length) return true
    const blockers: Rect[] = [...this.pieces.filter((p) => p.solid), ...this.dividers.filter((d) => d.floor === this.floor), ...(extra ? [extra] : [])]
    const g = walkCells(this.W, this.D, blockers)
    const seen = g.flood(this.from)
    return this.targets.every((t) => g.reaches(seen, t))
  }

  add(p: Placed, front: Rect | null) {
    this.pieces.push(p)
    if (front) this.clear.push(front)
  }

  /**
   * Set a piece against one of the room's walls (or a partition), its long side along it, with its
   * clear space in front; the walls are tried in `sides` order, positions from `from` outward.
   */
  againstWall(name: string, w: number, d: number, front: number, room: Rect, sides: ("n" | "e" | "s" | "w")[], from = 0.5): Placed | null {
    for (const side of sides) {
      const along = side === "n" || side === "s"
      const [pw, pd] = along ? [w, d] : [d, w]
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
        const r = rect(x, z, pw, pd)
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
  near(name: string, w: number, d: number, front: number, room: Rect, at: [number, number], solid = true): Placed | null {
    const cands: [number, number, number][] = []
    for (let x = room.x0 + w / 2; x <= room.x1 - w / 2 + 1e-6; x += 0.1) for (let z = room.z0 + d / 2; z <= room.z1 - d / 2 + 1e-6; z += 0.1) cands.push([x, z, Math.hypot(x - at[0], z - at[1])])
    cands.sort((a, b) => a[2] - b[2])
    for (const [x, z] of cands)
      for (const [pw, pd] of [
        [w, d],
        [d, w],
      ]) {
        const r = rect(x, z, pw, pd)
        const m = Math.min(front, 0.3)
        const f: Rect = { x0: r.x0 - m, z0: r.z0 - m, x1: r.x1 + m, z1: r.z1 + m }
        if (!inside(r, room)) continue
        if (solid ? !this.free(r, f) : this.clear.some((c) => overlap(r, c))) continue
        const p: Placed = { name, floor: this.floor, ...r, solid, wall: false }
        // a free-standing piece keeps its walkway only where it faces the room, not against another piece's clear space
        this.add(p, solid ? { x0: r.x0 - Math.min(front, 0.6), z0: r.z1, x1: r.x1 + Math.min(front, 0.6), z1: r.z1 + Math.min(front, 0.6) } : null)
        return p
      }
    return null
  }
}

export { Floor }
