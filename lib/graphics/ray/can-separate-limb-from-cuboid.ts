import { segmentCuboidDistance } from "../../engine/segment-cuboid-distance"
import { certifyFieldSeparation } from "../../engine/field-separation"
import { getExpandedCuboid } from "../../engine/get-expanded-cuboid"
import type { Cuboid } from "../../engine/cuboid-subtraction"
import type { limbSd } from "#/lib/graphics/ray/limb-sd"
type Props = { surface: ReturnType<typeof limbSd>; box: Cuboid; margin: number }

/** Inflate the obstacle by the complete surface displacement, retaining the uncut limb's real field for refinement. */
export function canSeparateLimbFromCuboid(props: Props): boolean {
  const expanded = getExpandedCuboid(props.box, props.margin),
    capsules = props.surface.capsuleBounds()
  if (
    expanded instanceof Error ||
    !capsules.length ||
    !props.surface.bounds.min.every(Number.isFinite) ||
    !props.surface.bounds.max.every(Number.isFinite) ||
    props.surface.bounds.min.some((value, axis) => value > props.surface.bounds.max[axis]) ||
    capsules.some((capsule) => ![...capsule.a, ...capsule.b, capsule.r].every(Number.isFinite) || capsule.r <= 0)
  )
    return false
  if (capsules.every((capsule) => segmentCuboidDistance(expanded, capsule.a, capsule.b) >= capsule.r)) return true

  return certifyFieldSeparation(
    { ...props.surface.bounds, value: props.surface.sd, lipschitz: 1 },
    { min: [expanded.x0, expanded.bottom, expanded.z0], max: [expanded.x1, expanded.top, expanded.z1], value: () => 0, lipschitz: 1 },
  )
}
