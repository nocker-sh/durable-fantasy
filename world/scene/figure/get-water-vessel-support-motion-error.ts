import { getWaterVesselNativeParts } from "#/world/scene/figure/get-water-vessel-native-parts"
import { getWaterVesselPrimitive } from "#/world/scene/figure/get-water-vessel-primitive"
import { primitiveBounds } from "../../../lib/graphics/ray/primitive-bounds"
import { cuboidTranslationHits } from "../../../lib/engine/cuboid-translation-hits"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import type { getWaterMotionSupportError } from "#/world/scene/figure/get-water-motion-support-error"
import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
import type { Point3 } from "../../../lib/engine/cuboid-motion-types"
type Props = Pick<Parameters<typeof getWaterMotionSupportError>[0], "body" | "heading" | "parts"> & { vessel: readonly WaterVesselPart[]; from: Point3; to: Point3; rootY: number }

/** Exact box translation permits the initial supporting face contact, but refuses penetration at any intermediate time. */
export function getWaterVesselSupportMotionError(props: Props): Error | null {
  if (![...props.from, ...props.to].every(Number.isFinite)) return new Error("Invalid water support translation")
  const native = getWaterVesselNativeParts({ parts: props.vessel, position: props.from, scale: 1, rootY: props.rootY }),
    delta: Point3 = [props.to[0] - props.from[0], props.to[1] - props.from[1], props.to[2] - props.from[2]]
  if (native instanceof Error) return native
  for (const part of native) {
    const primitive = getWaterVesselPrimitive(part)
    if (primitive instanceof Error) return primitive
    const bounds = primitiveBounds(primitive),
      moving = { x0: bounds.min[0], x1: bounds.max[0], bottom: bounds.min[1], top: bounds.max[1], z0: bounds.min[2], z1: bounds.max[2] }
    for (const support of props.parts) {
      const obstacle = toHeadingLocalCuboid({
        box: { x0: support.min[0], x1: support.max[0], bottom: support.min[1], top: support.max[1], z0: support.min[2], z1: support.max[2] },
        root: [props.body[0], props.rootY, props.body[1]],
        heading: props.heading,
      })
      if (obstacle instanceof Error) return obstacle
      if (cuboidTranslationHits({ relative: moving, from: [0, 0, 0], to: delta, obstacle: obstacle })) return new Error("Moving water vessel enters its support")
    }
  }

  return null
}
