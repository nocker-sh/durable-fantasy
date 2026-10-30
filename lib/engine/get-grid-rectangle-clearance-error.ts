type Props = { rect: readonly [number, number, number, number]; cellSize: number; isCellFree: (cell: readonly [number, number]) => boolean }

/** Check every cell touched with positive area, including obstacles between free rectangle corners. */
export function getGridRectangleClearanceError(props: Props): Error | null {
  const rect = props.rect
  if (![...rect, props.cellSize].every(Number.isFinite) || props.cellSize <= 0 || rect[0] >= rect[2] || rect[1] >= rect[3]) return new Error("Invalid grid rectangle")
  const x0 = Math.floor(rect[0] / props.cellSize),
    z0 = Math.floor(rect[1] / props.cellSize),
    x1 = Math.ceil(rect[2] / props.cellSize),
    z1 = Math.ceil(rect[3] / props.cellSize)
  const width = x1 - x0,
    depth = z1 - z0
  if (![x0, z0, x1, z1, width * depth].every(Number.isSafeInteger) || width * depth > 65536) return new Error("Grid rectangle exceeds traversal budget")
  for (const index of Array.from({ length: width * depth }).keys())
    if (!props.isCellFree([x0 + (index % width), z0 + Math.floor(index / width)])) return new Error("Rectangle overlaps a blocked grid cell")

  return null
}
