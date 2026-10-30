import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { limbSd } from "#/lib/graphics/ray/limb-sd"
import { getWaterVesselPrimitive } from "#/world/scene/figure/get-water-vessel-primitive"
import type { buildBody } from "#/world/scene/figure/body"
import type { getWaterMotionBodyError } from "#/world/scene/figure/get-water-motion-body-error"
type Props = Parameters<typeof getWaterMotionBodyError>[0] & { body: ReturnType<typeof buildBody> }

/** Only grip bars use the separate contact certificate; every other component clears the complete uncut body. */
export function getWaterMotionVesselBodyError(props: Props): Error | null {
  const arms = { l: new Set(props.body.armParts.l), r: new Set(props.body.armParts.r) }
  for (const part of props.posed.parts) {
    const shape = getWaterVesselPrimitive(part)
    if (shape instanceof Error) return shape
    const bounds = primitiveBounds(shape),
      surface = part.kind === "capsule" ? limbSd([[...part.from], [...part.to]], [part.radius, part.radius]) : null
    for (const primitive of props.body.prims) {
      if (part.kind === "capsule" && part.section === "grip" && arms[part.side].has(primitive)) continue
      const armMargin = Math.max(arms.l.has(primitive) ? props.margins.l : 0, arms.r.has(primitive) ? props.margins.r : 0),
        margin = props.vesselMargin + armMargin
      if (part.kind === "capsule" && surface) {
        if (!canSeparateSurfaceFromPrimitive({ surface, primitive, margin })) return new Error(`Moving water ${part.section} handle clearance remains unresolved`)
        continue
      }
      const box = { x0: bounds.min[0] - margin, x1: bounds.max[0] + margin, bottom: bounds.min[1] - margin, top: bounds.max[1] + margin, z0: bounds.min[2] - margin, z1: bounds.max[2] + margin }
      if (!canSeparatePrimitiveFromCuboid({ primitive, box })) return new Error("Moving water jar body clearance remains unresolved")
    }
  }

  return null
}
