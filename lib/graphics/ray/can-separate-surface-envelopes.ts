import { getPrimitiveCapsuleBounds } from "#/lib/graphics/ray/get-primitive-capsule-bounds"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { segmentSegmentDistance3D } from "#/lib/engine/segment-segment-distance-3d"
import type { SurfaceSeparationContext as Props } from "#/lib/graphics/ray/surface-separation-types"

/** 妥当な余地について、囲いだけで詳細な表面同士の分離を証明する。 */
export function canSeparateSurfaceEnvelopes(props: Props): boolean {
  if (
    props.capsules.every((capsule) =>
      props.boxes.every(
        (box) => segmentCuboidDistance({ x0: box.min[0], x1: box.max[0], bottom: box.min[1], top: box.max[1], z0: box.min[2], z1: box.max[2] }, capsule.a, capsule.b) >= capsule.r + props.margin,
      ),
    )
  )
    return true

  const fixedCapsules = getPrimitiveCapsuleBounds(props.primitive)
  return props.capsules.every((capsule) =>
    fixedCapsules.every((fixed) => segmentSegmentDistance3D({ firstStart: capsule.a, firstEnd: capsule.b, secondStart: fixed.a, secondEnd: fixed.b }) >= capsule.r + fixed.r + props.margin),
  )
}
