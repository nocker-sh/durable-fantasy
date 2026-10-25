type V3 = [number, number, number]
export type Q = [number, number, number, number]
export const qrot = (q: Q, v: V3): V3 => {
  const [x, y, z, w] = q
  const tx = 2 * (y * v[2] - z * v[1]),
    ty = 2 * (z * v[0] - x * v[2]),
    tz = 2 * (x * v[1] - y * v[0])
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx]
}
