type Props = Readonly<{ cell: readonly [number, number]; isFree: (x: number, y: number) => boolean }>

const OFFSETS: ReadonlyArray<Readonly<{ x: number; y: number }>> = Array.from({ length: 7 }, (_, index) => index + 1).flatMap((radius) =>
  Array.from({ length: radius * 2 + 1 }, (_, row) => row - radius).flatMap((y) =>
    Array.from({ length: radius * 2 + 1 }, (_, column) => ({ x: column - radius, y })).filter((offset) => Math.max(Math.abs(offset.x), Math.abs(offset.y)) === radius),
  ),
)

/** Preserve the bounded Chebyshev-ring search: each ring is scanned by row, not by Euclidean distance. */
export function getNearbyFreeGridCell(props: Props): [number, number] | null {
  const originX = props.cell[0]
  const originY = props.cell[1]
  if (props.isFree(originX, originY)) return [originX, originY]

  for (const offset of OFFSETS) {
    const x = originX + offset.x
    const y = originY + offset.y
    if (props.isFree(x, y)) return [x, y]
  }
  return null
}
