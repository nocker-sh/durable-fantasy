import type { SurfaceMaterial } from "./primitive-types"

export function createSolidSurfaceMaterial(ramp: string, offset = 0): SurfaceMaterial {
  return () => [ramp, offset]
}
