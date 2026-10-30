import { buildBody } from "#/world/scene/figure/body"
import { toHeadingLocalCuboid } from "#/world/scene/to-heading-local-cuboid"
import { canSeparatePrimitiveFromCuboid } from "#/lib/graphics/ray/can-separate-primitive-from-cuboid"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
type Props = { look: Look; skeleton: Skel; body: readonly [number, number]; rootY: number; heading: number; ceiling: number; obstacles: readonly Cuboid[] }

/** Every rendered body part must clear fixed furniture; reaching a separate moving object grants no arm or cuff exemption. */
export function getNativeFixedCuboidClearanceError(props: Props): Error | null {
  if (![...props.body, props.rootY, props.heading, props.ceiling].every(Number.isFinite) || props.ceiling <= 0) return new Error("Invalid native fixed-obstacle transform")
  const body = buildBody(props.look, props.skeleton, null)
  if (body.prims.some((primitive) => primitiveBounds(primitive).max[1] + props.rootY > props.ceiling)) return new Error("Native body leaves its checked ceiling")
  for (const index of props.obstacles.keys()) {
    const local = toHeadingLocalCuboid({ box: props.obstacles[index], root: [props.body[0], props.rootY, props.body[1]], heading: props.heading })
    if (local instanceof Error) return local
    for (const primitive of body.prims)
      if (!canSeparatePrimitiveFromCuboid({ primitive, box: local }))
        return new Error("Native body clearance from fixed furniture remains unresolved", { cause: { obstacle: index, primitive: primitive.id } })
  }

  return null
}
