type Props = { previous: number; start: number; end: number; next: number; time: number }

/** One coordinate of a Catmull–Rom segment, with its two neighboring control points. */
export function catmullCoordinate(props: Props): number {
  const a = props.previous,
    b = props.start,
    c = props.end,
    d = props.next
  const t = props.time,
    t2 = t * t,
    t3 = t2 * t
  return 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
}
