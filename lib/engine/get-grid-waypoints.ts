type Props = Readonly<{ previous: Int32Array; start: number; goal: number; size: number; resolution: number }>

/** Reconstruct only a chain that reaches its start; broken or cyclic predecessor chains cannot become a partial route. */
export function getGridWaypoints(props: Props): [number, number][] | null {
  const count = props.size * props.size
  if (
    !Number.isSafeInteger(props.size) ||
    props.size <= 0 ||
    props.previous.length !== count ||
    !Number.isFinite(props.resolution) ||
    props.resolution <= 0 ||
    ![props.start, props.goal].every((cell) => Number.isSafeInteger(cell) && cell >= 0 && cell < count)
  )
    throw new RangeError("Invalid grid route dimensions")

  const cells = [props.goal]
  while (cells[cells.length - 1] !== props.start) {
    const previous = props.previous[cells[cells.length - 1]]
    if (previous < 0 || previous >= count || cells.length >= count) return null

    cells.push(previous)
  }
  return cells.reverse().map((cell): [number, number] => [((cell % props.size) + 0.5) / props.resolution, (((cell / props.size) | 0) + 0.5) / props.resolution])
}
