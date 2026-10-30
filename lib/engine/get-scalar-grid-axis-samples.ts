import type { ScalarField } from "#/lib/engine/scalar-field"

/** Include clipped ends and every cell boundary; bilinear extrema on each cell occur at its corners. */
export function getScalarGridAxisSamples(field: ScalarField, from: number, to: number): number[] {
  if (!Number.isFinite(field.resolution) || field.resolution <= 0 || ![from, to].every(Number.isFinite) || from > to) throw new RangeError("Invalid field axis range")
  const low = field.gridCoordinate(from) / field.resolution
  const high = field.gridCoordinate(to) / field.resolution
  const first = Math.ceil(low * field.resolution)
  const count = Math.max(0, Math.floor(high * field.resolution) - first + 1)

  return [low, high, ...Array.from({ length: count }, (_, index) => (first + index) / field.resolution)]
}
