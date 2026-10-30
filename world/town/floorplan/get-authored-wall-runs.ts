type Props = Readonly<{ width: number; walls: ReadonlySet<number> }>

/** Join only adjacent interior wall columns in one row; a doorway or missing cell always breaks a run. */
export function getAuthoredWallRuns(props: Props): ReadonlyArray<Readonly<{ start: number; end: number }>> {
  const runs: { start: number; end: number }[] = []
  const columns = Array.from(props.walls)
    .filter((column) => column > 0 && column < props.width - 1)
    .sort((first, second) => first - second)
  for (const column of columns) {
    const previous = runs.at(-1)
    if (previous?.end === column) previous.end = column + 1
    else runs.push({ start: column, end: column + 1 })
  }
  return runs
}
