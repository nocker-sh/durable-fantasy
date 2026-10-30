import type { SurfaceMaterial } from "#/lib/graphics/ray/primitive-types"

export function createSolidSurfaceMaterial(ramp: string, offset = 0): SurfaceMaterial {
  return () => [ramp, offset]
}
