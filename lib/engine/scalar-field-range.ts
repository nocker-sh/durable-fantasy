import type { ScalarField } from "./scalar-field"
/** Exact extrema of the bilinear field over an axis-aligned rectangle, including clipped cell edges. */
export function scalarFieldRange(field: ScalarField, bounds: readonly [number, number, number, number]): { min: number; max: number } {
  if (
    !Number.isSafeInteger(field.size) ||
    field.size < 2 ||
    field.data.length < field.size ** 2 ||
    !Number.isFinite(field.resolution) ||
    field.resolution <= 0 ||
    bounds.some((value) => !Number.isFinite(value)) ||
    bounds[0] > bounds[2] ||
    bounds[1] > bounds[3]
  )
    throw new RangeError("Invalid scalar field range")
  const axis = (start: number, end: number): number[] => {
    const low = field.gridCoordinate(start) / field.resolution,
      high = field.gridCoordinate(end) / field.resolution
    const values = [low, high]
    for (let i = Math.ceil(low * field.resolution); i <= Math.floor(high * field.resolution); i++) values.push(i / field.resolution)
    return values
  }
  const xs = axis(bounds[0], bounds[2]),
    zs = axis(bounds[1], bounds[3])
  let min = Infinity,
    max = -Infinity
  for (const x of xs)
    for (const z of zs) {
      const value = field.sample(x, z)
      if (!Number.isFinite(value)) throw new RangeError("Non-finite scalar field value")
      min = Math.min(min, value)
      max = Math.max(max, value)
    }
  return { min, max }
}
