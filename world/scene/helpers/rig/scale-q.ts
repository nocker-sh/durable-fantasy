import type { Q } from "#/world/scene/rig"

export const scaleQ = (q: Q, k: number): Q => {
  const s = Math.hypot(q[0], q[1], q[2])
  if (s < 1e-6) return q
  const a = 2 * Math.atan2(s, q[3]) * k,
    f = Math.sin(a / 2) / s
  return [q[0] * f, q[1] * f, q[2] * f, Math.cos(a / 2)]
}
