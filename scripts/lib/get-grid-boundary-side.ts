type Props = Readonly<{ point: readonly number[]; outward: readonly number[]; width: number; depth: number }>
type Side = "n" | "s" | "w" | "e"

/** Grid coordinates identify boundary cells, whose last indices are one less than the grid dimensions. */
export function getGridBoundarySide(props: Props): Side | null {
  const x = props.point[0],
    z = props.point[1]
  if (![x, z, props.width, props.depth].every(Number.isSafeInteger) || x < 0 || z < 0 || x >= props.width || z >= props.depth) return null
  if (z === 0 && props.outward[0] === 0 && props.outward[1] === -1) return "n"
  if (z === props.depth - 1 && props.outward[0] === 0 && props.outward[1] === 1) return "s"
  if (x === 0 && props.outward[0] === -1 && props.outward[1] === 0) return "w"
  if (x === props.width - 1 && props.outward[0] === 1 && props.outward[1] === 0) return "e"
  return null
}
