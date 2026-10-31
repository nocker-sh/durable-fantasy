type Props = Readonly<{ rows: readonly string[]; door: readonly number[]; span: number }>
type Opening = { cell: [number, number]; offset: [number, number]; outward: [number, number] }

/** A boundary opening must occupy one continuous run of doorway cells. */
export function getGridBoundaryOpening(props: Props): Opening | undefined {
  const x = props.door[0]
  const z = props.door[1]
  const isHorizontal = z === 0 || z === props.rows.length - 1
  if (!props.rows.length || ![x, z, props.span].every(Number.isSafeInteger) || x < 0 || z < 0 || props.span < 1) return undefined
  if (!isHorizontal && x !== 0 && x !== props.rows[0].length - 1) return undefined
  const cells = isHorizontal
    ? props.rows[z]?.slice(x, x + props.span)
    : props.rows
        .slice(z, z + props.span)
        .map((row) => row[x] ?? "")
        .join("")
  if (!cells || cells.length !== props.span || [...cells].some((cell) => cell !== "D")) return undefined
  const isEast = x === props.rows[0].length - 1
  const isSouth = z === props.rows.length - 1
  return {
    cell: [x, z],
    offset: [isHorizontal ? props.span / 2 : isEast ? 1 : 0, isHorizontal ? (isSouth ? 1 : 0) : props.span / 2],
    outward: [isHorizontal ? 0 : isEast ? 1 : -1, isHorizontal ? (isSouth ? 1 : -1) : 0],
  }
}
