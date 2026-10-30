import type { EntryStepGeometry } from "#/scripts/lib/entry-step-geometry-types"
import type { ScalarField } from "#/lib/engine/scalar-field"
import { scalarFieldRange } from "#/lib/engine/scalar-field-range"
export function getEntryStepTerrainErrors(geometry: EntryStepGeometry, terrain: ScalarField, metres: number): string[] {
  const limit = (terrain.size - 1.001) / terrain.resolution
  if (geometry.bounds[0] < 0 || geometry.bounds[1] < 0 || geometry.bounds[2] > limit || geometry.bounds[3] > limit) return ["Entry stair footprint exceeds sampled terrain"]
  if (geometry.surfaces.some((surface) => scalarFieldRange(terrain, surface.rect).max * metres > surface.height + 1e-9)) return ["Entry stair tread or landing intersects terrain"]
  return []
}
