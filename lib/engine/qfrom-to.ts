import type { Q, V3 } from "./quaternion-types"
/** Shortest rotation between nonzero directions; opposite directions use a deterministic perpendicular axis. */
export function qfromTo(from: V3, to: V3): Q {
  const f = Math.hypot(...from),
    t = Math.hypot(...to)
  if (![...from, ...to, f, t].every(Number.isFinite) || f === 0 || t === 0) throw new Error("Invalid rotation direction")
  const a = from.map((v) => v / f),
    b = to.map((v) => v / t)
  const cross: V3 = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    sine = Math.hypot(...cross),
    cosine = Math.max(
      -1,
      Math.min(
        1,
        a.reduce((s, v, i) => s + v * b[i], 0),
      ),
    )
  if (sine < 1e-15) {
    if (cosine >= 0) return [0, 0, 0, 1]
    const least = a.reduce((index, v, i) => (Math.abs(v) < Math.abs(a[index]) ? i : index), 0),
      axis: V3 = [0, 0, 0]
    axis[least] = 1
    const c: V3 = [a[1] * axis[2] - a[2] * axis[1], a[2] * axis[0] - a[0] * axis[2], a[0] * axis[1] - a[1] * axis[0]],
      n = Math.hypot(...c)
    return [c[0] / n, c[1] / n, c[2] / n, 0]
  }
  const half = Math.atan2(sine, cosine) / 2,
    factor = Math.sin(half) / sine
  return [cross[0] * factor, cross[1] * factor, cross[2] * factor, Math.cos(half)]
}
