import type { Q, V3 } from "#/lib/engine/quaternion-types"
export const qrot = (q: Readonly<Q>, v: Readonly<V3>): V3 => {
  const xState = q,
    x = xState[0],
    y = xState[1],
    z = xState[2],
    w = xState[3]
  const tx = 2 * (y * v[2] - z * v[1]),
    ty = 2 * (z * v[0] - x * v[2]),
    tz = 2 * (x * v[1] - y * v[0])
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx]
}
