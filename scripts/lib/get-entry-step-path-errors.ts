import type { EntryStepGeometry } from "#/scripts/lib/entry-step-geometry-types"
export function getEntryStepPathErrors(points: readonly (readonly number[])[], geometry: EntryStepGeometry, metres: number): string[] {
  const errors: string[] = []
  const progress = { previous: -Infinity }
  for (const point of points) {
    const dx = point[0] - geometry.upperPoint[0]
    const dz = point[1] - geometry.upperPoint[1]
    const distance = dx * geometry.outward[0] + dz * geometry.outward[1]
    if (Math.abs(dx * geometry.outward[1] - dz * geometry.outward[0]) > 1e-6 || distance < progress.previous - 1e-6 || distance < -1e-6 || distance * metres > geometry.length + 1e-6)
      errors.push("Entry stair approach leaves or reverses its stair centre line")
    progress.previous = distance
  }
  return errors
}
