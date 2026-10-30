import type { Point3 } from "./cuboid-motion-types"
type Props = { firstStart: Point3; firstEnd: Point3; secondStart: Point3; secondEnd: Point3 }
/** Closest points of two closed segments, including degenerate and parallel segments. */
export function segmentSegmentDistance3D(props: Props): number {
  const a = props.firstStart,
    b = props.firstEnd,
    c = props.secondStart,
    d = props.secondEnd
  const u = b.map((v, i) => v - a[i]),
    v = d.map((x, i) => x - c[i]),
    w = a.map((x, i) => x - c[i]),
    dot = (x: readonly number[], y: readonly number[]) => x.reduce((s, n, i) => s + n * y[i], 0),
    uu = dot(u, u),
    vv = dot(v, v),
    uv = dot(u, v),
    uw = dot(u, w),
    vw = dot(v, w),
    clamp = (n: number) => Math.max(0, Math.min(1, n)),
    distance = (s: number, t: number) => Math.hypot(...w.map((x, i) => x + s * u[i] - t * v[i]))
  const boundaryDistance = Math.min(
    distance(0, vv ? clamp(vw / vv) : 0),
    distance(1, vv ? clamp((vw + uv) / vv) : 0),
    distance(uu ? clamp(-uw / uu) : 0, 0),
    distance(uu ? clamp((uv - uw) / uu) : 0, 1),
  )
  // |u×v|² avoids cancellation in uu*vv - uv² for nearly parallel segments.
  const cross = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]],
    determinant = dot(cross, cross)
  if (determinant > 0) {
    const cw = w.map((n) => -n),
      crossWith = (x: readonly number[], y: readonly number[]) => [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]],
      s = dot(crossWith(cw, v), cross) / determinant,
      t = dot(crossWith(cw, u), cross) / determinant
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) return Math.min(boundaryDistance, distance(s, t))
  }
  return boundaryDistance
}
