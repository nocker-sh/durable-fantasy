import { advanceGridRay } from "./advance-grid-ray"
import { getGridRayAxis } from "./get-grid-ray-axis"
type Props = Readonly<{ from: readonly [number, number]; to: readonly [number, number]; cellSize: number }>
/** Supercover traversal includes both side cells at corners; it never relies on point samples along the segment. */
export function getGridSegmentCoverage(props: Props): ReadonlyArray<readonly [number, number]> | Error {
  if (![...props.from, ...props.to, props.cellSize].every(Number.isFinite) || props.cellSize <= 0) return new Error("Invalid grid segment")
  const x = getGridRayAxis({ from: props.from[0], to: props.to[0], cellSize: props.cellSize }),
    z = getGridRayAxis({ from: props.from[1], to: props.to[1], cellSize: props.cellSize })
  if (![x.cell, x.end, z.cell, z.end].every(Number.isSafeInteger) || Math.abs(x.end - x.cell) + Math.abs(z.end - z.cell) > 65536) return new Error("Grid segment exceeds traversal budget")
  const cells: [number, number][] = [[x.cell, z.cell]],
    cursor = { x, z }
  while (cursor.x.cell !== cursor.x.end || cursor.z.cell !== cursor.z.end) {
    const next = advanceGridRay(cursor)
    cells.push(...next.cells)
    cursor.x = next.x
    cursor.z = next.z
  }
  return cells
}
