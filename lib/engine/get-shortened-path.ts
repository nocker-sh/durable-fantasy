type Props<T> = Readonly<{ points: readonly T[]; isVisible: (from: T, to: T) => boolean }>

/** Greedily keep the farthest visible waypoint; adjacent steps remain when no shortcut is clear. Visibility need not be monotone. */
export function getShortenedPath<T>(props: Props<T>): T[] {
  if (props.points.length === 0) return []

  const candidates = props.points.map((_, index) => props.points.length - 1 - index)
  const retained = [0]
  while (retained[retained.length - 1] < props.points.length - 1) {
    const current = retained[retained.length - 1]
    const next = candidates.find((index) => index === current + 1 || (index > current + 1 && props.isVisible(props.points[current], props.points[index]))) ?? current + 1
    retained.push(next)
  }
  return retained.map((index) => props.points[index])
}
