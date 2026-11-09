/** Convert a screen direction into the nearest of eight ground-grid directions. */
export function walkDirection(direction: [number, number], yaw: number): [number, number] {
  const x = direction[0]
  const y = direction[1]
  const s = Math.sin(yaw),
    c = Math.cos(yaw)
  const wx = c * x - s * y,
    wz = -s * x - c * y
  const len = Math.hypot(wx, wz) || 1
  return [Math.abs(wx / len) > 0.38 ? Math.sign(wx) : 0, Math.abs(wz / len) > 0.38 ? Math.sign(wz) : 0]
}
