import { AISLE } from "#/world/town/fit"
import type { Piece } from "#/world/town/fit"

/**
 * Lay pieces in rows across a floor, along the walls and back to back: rows face each other in
 * pairs across one walkway, as wide as the larger of their clear spaces and never under AISLE.
 * Long pieces turn to fit. Returns the depth used.
 */
export function rowsDepth(pieces: Piece[], width: number): number {
  const items = pieces.map((p) => (p.w > width ? { ...p, w: p.d, d: p.w } : p)).sort((a, b) => b.d - a.d)
  const rows: { d: number; front: number }[] = []
  const widthUsed = { value: 0 }
  for (const p of items) {
    if (p.w > width) return Infinity
    if (!rows.length || widthUsed.value + p.w > width) {
      rows.push({ d: 0, front: 0 })
      widthUsed.value = 0
    }
    const r = rows[rows.length - 1]
    widthUsed.value += p.w
    r.d = Math.max(r.d, p.d)
    r.front = Math.max(r.front, p.front)
  }
  const depth = { value: 0 }
  for (const i of rows.keys()) {
    if (i % 2) continue
    const a = rows[i],
      b = rows[i + 1]
    depth.value += a.d + (b ? b.d : 0) + Math.max(AISLE, a.front, b?.front ?? 0)
  }
  return depth.value
}
