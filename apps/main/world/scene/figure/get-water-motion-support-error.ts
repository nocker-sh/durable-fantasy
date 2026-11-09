import { buildBody } from "#/world/scene/figure/body"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { createBodyContext } from "#/world/scene/figure/context"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import type { getWaterMotionBodyError } from "#/world/scene/figure/get-water-motion-body-error"
import type { WaterSupportPart } from "#/world/town/get-water-vessel-support-parts"
type Props = Parameters<typeof getWaterMotionBodyError>[0] & { body: readonly [number, number]; heading: number; parts: readonly WaterSupportPart[] }

/** Bound moving raw arms against the fixed shelf; every other native part remains fixed for this certificate. */
export function getWaterMotionSupportError(props: Props): Error | null {
  const skeleton = props.posed.skeleton,
    body = buildBody(props.look, skeleton, null),
    scale = createBodyContext(props.look, skeleton, null).S
  for (const part of props.parts) {
    const box = toHeadingLocalCuboid({
      box: { x0: part.min[0], x1: part.max[0], bottom: part.min[1], top: part.max[1], z0: part.min[2], z1: part.max[2] },
      root: [props.body[0], props.posed.rootY, props.body[1]],
      heading: props.heading,
    })
    if (box instanceof Error) return box
    for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
      const shape = nativeArmSurfaces({ scale: scale, shoulder: skeleton.p[`upperarm_${hand}`], elbow: skeleton.p[`lowerarm_${hand}`], wrist: skeleton.p[`hand_${hand}`] })
      if (![...shape.arm.capsuleBounds(), ...shape.uncutCuff.capsuleBounds()].every((capsule) => segmentCuboidDistance(box, capsule.a, capsule.b) >= capsule.r + props.margins[hand]))
        return new Error("Moving water arm shelf clearance remains unresolved")
    }
    for (const primitive of body.prims) {
      if (body.armParts.l.includes(primitive) || body.armParts.r.includes(primitive)) continue
      if (!canSeparatePrimitiveFromCuboid({ primitive, box })) return new Error("Fixed water carrier shelf clearance remains unresolved")
    }
  }

  return null
}
