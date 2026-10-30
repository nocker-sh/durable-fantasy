import { getEllipticalFrustumField } from "#/lib/graphics/ray/get-elliptical-frustum-field"
import { getUnionFieldPrimitive } from "#/lib/graphics/ray/get-union-field-primitive"
import { createSolidSurfaceMaterial } from "#/lib/graphics/ray/create-solid-surface-material"
import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"

/** Use the existing ceramic palette and the exact hollow wall and handle parts, without a second drawing profile. */
export function getWaterVesselPrimitive(part: WaterVesselPart): Omit<Primitive, "id"> | Error {
  const material = createSolidSurfaceMaterial("redsand")
  if (part.kind === "capsule") return { kind: "cap", a: [...part.from], b: [...part.to], r: part.radius, r2: 0, m: material }
  if (part.kind === "cone") return { kind: "cone", a: [...part.from], b: [...part.to], r: part.radiusFrom, r2: part.radiusTo, m: material }
  const field = getEllipticalFrustumField({
    from: [part.centre[0], part.bottom, part.centre[1]],
    to: [part.centre[0], part.top, part.centre[1]],
    acrossHint: [1, 0, 0],
    radiusFrom: part.radius,
    radiusTo: part.radius,
    compression: 1,
    shellThickness: (part.radius - part.innerRadius) / 2,
  })
  if (field instanceof Error) return field
  const shape = getUnionFieldPrimitive([field])
  if (shape instanceof Error) return shape

  return { ...shape, m: material }
}
