type Props = { from: number; to: number; cellSize: number }
/** Each axis advances only as far as the endpoint cell, including negative boundary starts. */
export function getGridRayAxis(props: Props) {
  const cell = Math.floor(props.from / props.cellSize),
    end = Math.floor(props.to / props.cellSize),
    delta = props.to - props.from
  const step = Math.sign(delta),
    nextBoundary = (cell + Math.max(step, 0)) * props.cellSize
  return { cell, end, step, next: delta === 0 ? Infinity : (nextBoundary - props.from) / delta, interval: delta === 0 ? Infinity : props.cellSize / Math.abs(delta) }
}
