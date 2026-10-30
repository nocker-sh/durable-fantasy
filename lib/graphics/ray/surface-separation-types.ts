import type { PrimitiveBounds } from "#/lib/graphics/ray/primitive-bounds-types"
import type { PrimitiveShape } from "#/lib/graphics/ray/primitive-types"
import type { limbSd } from "#/lib/graphics/ray/limb-sd"

export type SurfaceSeparationInput = Readonly<{ surface: ReturnType<typeof limbSd>; primitive: PrimitiveShape; margin: number }>
export type SurfaceSeparationContext = SurfaceSeparationInput &
  Readonly<{ bounds: PrimitiveBounds; boxes: ReadonlyArray<PrimitiveBounds>; capsules: Readonly<ReturnType<SurfaceSeparationInput["surface"]["capsuleBounds"]>> }>
