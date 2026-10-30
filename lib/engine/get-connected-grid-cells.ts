type Props = Readonly<{ width: number; height: number; start: readonly [number, number]; isFree: (x: number, y: number) => boolean }>

/** Four-neighbour connectivity from the exact starting cell; blocked endpoints are never snapped to nearby floor. */
export function getConnectedGridCells(props: Props): ReadonlySet<string> {
  const visited = new Set<string>(),
    queue: (readonly [number, number])[] = [props.start]
  if (![props.width, props.height].every((value) => Number.isSafeInteger(value) && value > 0)) return visited
  for (const cell of queue) {
    const x = cell[0],
      y = cell[1],
      key = `${x},${y}`
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= props.width || y >= props.height || visited.has(key) || !props.isFree(x, y)) continue
    visited.add(key)
    queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1])
  }

  return visited
}
