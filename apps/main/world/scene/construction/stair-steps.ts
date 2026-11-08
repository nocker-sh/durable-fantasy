type StairSpec = { x0: number; x1: number; z0: number; z1: number; y0: number; y1: number; steps: number }
export type StairStep = { x0: number; x1: number; z0: number; z1: number; bottom: number; top: number }
/** Both ascending and descending flights stand on a base below their lowest tread. */
export function stairSteps(spec: StairSpec): StairStep[] {
  const x0Source = spec,
    x0 = x0Source.x0,
    x1 = x0Source.x1,
    z0 = x0Source.z0,
    z1 = x0Source.z1,
    y0 = x0Source.y0,
    y1 = x0Source.y1,
    steps = x0Source.steps
  if (![x0, x1, z0, z1, y0, y1].every(Number.isFinite) || x1 <= x0 || z0 === z1 || !Number.isSafeInteger(steps) || steps <= 0) throw new RangeError("Invalid stair dimensions")
  const direction = Math.sign(z1 - z0),
    bottom = Math.min(y0, y1) - 0.4
  return Array.from({ length: steps }, (_, i) => {
    const a = z0 + ((z1 - z0) * i) / steps,
      b = z0 + ((z1 - z0) * (i + 1)) / steps
    return { x0, x1, z0: Math.min(a, b) - (direction > 0 ? 0 : 0.02), z1: Math.max(a, b) + 0.02, bottom, top: y0 + ((y1 - y0) * (i + 1)) / steps }
  })
}
