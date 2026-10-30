type Props = Readonly<{ door: readonly [number, number]; width: number; cellM: number; rows: number; columns: number; frameInset: number; wallDepth: number }>

/** Side jambs occupy the recessed opening too; checking only its centre width misses angled corner cuts. */
export function getDoorFrameBoxes(props: Props): ReadonlyArray<readonly [number, number, number, number]> | Error {
  if (
    ![...props.door, props.width, props.cellM, props.rows, props.columns, props.frameInset, props.wallDepth, props.rows * props.cellM, props.columns * props.cellM, props.width * props.cellM].every(
      Number.isFinite,
    ) ||
    props.cellM <= 0 ||
    props.frameInset < 0 ||
    props.frameInset * 2 >= props.width * props.cellM ||
    !Number.isSafeInteger(props.wallDepth) ||
    props.wallDepth < 1
  )
    return new Error("Invalid door frame geometry")
  const door = props.door,
    horizontal = door[1] === 0 || door[1] === props.rows - 1
  if (
    ![props.rows, props.columns, props.width].every((value) => Number.isSafeInteger(value) && value > 0) ||
    !door.every((value) => Number.isSafeInteger(value) && value >= 0) ||
    door[0] >= props.columns ||
    door[1] >= props.rows ||
    (horizontal
      ? door[0] + props.width > props.columns || props.wallDepth >= props.rows
      : door[1] + props.width > props.rows || props.wallDepth >= props.columns || (door[0] !== 0 && door[0] !== props.columns - 1))
  )
    return new Error("Invalid door frame boundary")
  if (props.frameInset === 0) return []
  const cell = props.cellM,
    inset = props.frameInset,
    depth = props.wallDepth
  if (horizontal) {
    const left = door[0] * cell,
      right = (door[0] + props.width) * cell,
      near = door[1] === 0 ? 0 : (door[1] - depth + 1) * cell,
      far = door[1] === 0 ? depth * cell : (door[1] + 1) * cell
    return [
      [left, near, left + inset, far],
      [right - inset, near, right, far],
    ]
  }
  const top = door[1] * cell,
    bottom = (door[1] + props.width) * cell,
    near = door[0] === 0 ? 0 : (door[0] - depth + 1) * cell,
    far = door[0] === 0 ? depth * cell : (door[0] + 1) * cell

  return [
    [near, top, far, top + inset],
    [near, bottom - inset, far, bottom],
  ]
}
