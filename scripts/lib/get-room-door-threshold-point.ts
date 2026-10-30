type Props = Readonly<{ door: readonly [number, number]; width: number; cellM: number; rows: number }>

/** Start the circle at the doorway's inner wall face; adjacent rooms retain their shared wall between the two faces. */
export function getRoomDoorThresholdPoint(props: Props): readonly [number, number] {
  const door = props.door,
    alongX = (door[0] + props.width / 2) * props.cellM,
    alongY = (door[1] + props.width / 2) * props.cellM
  if (door[1] === 0) return [alongX, props.cellM]
  if (door[1] === props.rows - 1) return [alongX, door[1] * props.cellM]
  if (door[0] === 0) return [props.cellM, alongY]

  return [door[0] * props.cellM, alongY]
}
