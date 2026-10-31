import { getIntegerRange } from "#/lib/engine/get-integer-range"
import type { getDoorSwingSource } from "#/scripts/lib/get-door-swing-source"
import type { Leaf } from "#/scripts/lib/door-swing"

/** Keep every cell of a recessed passage clear before moving its hinge to the inner face. */
export function getDoorSwingFrame(source: NonNullable<ReturnType<typeof getDoorSwingSource>>, leaf: Leaf) {
  const x = source.x,
    y = source.y,
    scale = source.scale,
    horizontal = source.horizontal
  const inward = horizontal ? [0, y === 0 ? 1 : -1] : [x === 0 ? 1 : -1, 0],
    closed = horizontal ? [1, 0] : [0, 1]
  const initial = horizontal ? [x * scale, (y === 0 ? 1 : y) * scale] : [(x === 0 ? 1 : x) * scale, y * scale],
    inset = leaf.frame_inset_m ?? 0,
    aperture = source.width * scale - 2 * inset,
    radius = (aperture - (leaf.paired ? (leaf.meeting_gap_m ?? 0) : 0)) / (leaf.paired ? 2 : 1)
  const depth = leaf.wall_depth_cells ?? 1
  if (radius <= 0 || !Number.isSafeInteger(depth) || depth < 1 || depth >= (horizontal ? source.rows.length : source.rows[0].length)) return undefined
  const columns = getIntegerRange(0, source.width)
  for (const step of getIntegerRange(0, depth)) {
    for (const column of columns) {
      const cx = x + closed[0] * column + inward[0] * step,
        cy = y + closed[1] * column + inward[1] * step
      if (![".", "D"].includes(source.rows[cy]?.[cx])) return undefined
    }
  }
  const recessed = initial.map((value, axis) => value + inward[axis] * (depth - 1) * scale)
  const insetHinge = recessed.map((value, axis) => value + closed[axis] * inset)
  const hinge = leaf.hinge === "end" ? insetHinge.map((value, axis) => value + closed[axis] * aperture) : insetHinge
  return { hinge, radius, inward, closed: leaf.hinge === "end" ? closed.map((value) => value * -1) : closed }
}
