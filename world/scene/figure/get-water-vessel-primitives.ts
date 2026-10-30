import { getWaterVesselPrimitive } from "#/world/scene/figure/get-water-vessel-primitive"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"

/** Use one primitive list for the held-object image and its floor footprint. */
export function getWaterVesselPrimitives(parts: readonly WaterVesselPart[]): readonly Omit<Primitive, "id">[] | Error {
  const primitives: Omit<Primitive, "id">[] = []
  for (const part of parts) {
    const primitive = getWaterVesselPrimitive(part)
    if (primitive instanceof Error) return primitive
    primitives.push(primitive)
  }

  return primitives
}
