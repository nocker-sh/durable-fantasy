type Props = Readonly<{ from: readonly [number, number]; to: readonly [number, number]; centres: ReadonlyArray<readonly [number, number]>; radius: number }>

/** Clip the entire segment against every opening; midpoint tests miss rails that reach across an opening boundary. */
export function getSegmentOutsideCircles(props: Props): ReadonlyArray<readonly [number, number]> | Error {
  const dx = props.to[0] - props.from[0],
    dy = props.to[1] - props.from[1],
    squared = dx * dx + dy * dy,
    cuts: [number, number][] = []
  if (
    ![...props.from, ...props.to, props.radius, squared, props.radius ** 2].every(Number.isFinite) ||
    squared <= 0 ||
    props.radius <= 0 ||
    props.centres.some((point) => !point.every(Number.isFinite))
  )
    return new Error("Invalid segment openings")
  for (const centre of props.centres) {
    const x = centre[0] - props.from[0],
      y = centre[1] - props.from[1],
      along = (x * dx + y * dy) / squared,
      perpendicular = (x * dy - y * dx) ** 2 / squared
    if (![along, perpendicular].every(Number.isFinite)) return new Error("Unbounded segment opening")
    if (perpendicular >= props.radius ** 2) continue
    const half = Math.sqrt((props.radius ** 2 - perpendicular) / squared),
      start = Math.max(0, along - half),
      end = Math.min(1, along + half)
    if (start < end) cuts.push([start, end])
  }
  cuts.sort((a, b) => a[0] - b[0])
  const cursor = { at: 0 },
    sections: [number, number][] = []
  for (const cut of cuts) {
    if (cut[0] > cursor.at) sections.push([cursor.at, cut[0]])
    cursor.at = Math.max(cursor.at, cut[1])
  }
  if (cursor.at < 1) sections.push([cursor.at, 1])

  return sections
}
