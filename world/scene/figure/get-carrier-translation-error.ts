import { buildBody } from "#/world/scene/figure/body"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import { type Point3 } from "#/lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = {
  look: Look
  skeleton: Skel
  rootY: number
  turn: 0 | 1 | 2 | 3
  body: readonly [number, number]
  destination: readonly [number, number]
  section: { bounds: { x0: number; z0: number; x1: number; z1: number }; ceiling: number; obstacles: ReadonlyArray<Cuboid> }
}
/** Sweep the entire fixed native pose continuously; endpoints alone cannot prove the passage, and this does not model stepping or balance. */
export function getCarrierTranslationError(props: Props): Error | null {
  const zero: Point3 = [0, 0, 0],
    delta: Point3 = [props.destination[0] - props.body[0], 0, props.destination[1] - props.body[1]],
    section = props.section,
    epsilon = 1e-9
  if (
    ![...props.body, ...props.destination, props.rootY, section.ceiling, ...Object.values(section.bounds)].every(Number.isFinite) ||
    section.ceiling <= 0 ||
    section.bounds.x0 >= section.bounds.x1 ||
    section.bounds.z0 >= section.bounds.z1
  )
    return new Error("Invalid carrier room section")
  if (section.obstacles.some((obstacle) => !Object.values(obstacle).every(Number.isFinite) || obstacle.x0 >= obstacle.x1 || obstacle.z0 >= obstacle.z1 || obstacle.bottom >= obstacle.top))
    return new Error("Invalid carrier room obstacle")

  for (const primitive of buildBody(props.look, props.skeleton, null).prims) {
    const bounds = primitiveBounds(primitive)
    const horizontal = quarterTurnRect({ bounds: { x0: bounds.min[0], z0: bounds.min[2], x1: bounds.max[0], z1: bounds.max[2] }, turn: props.turn, origin: [props.body[0], props.body[1]] })
    const carrier = { ...horizontal, bottom: bounds.min[1] + props.rootY, top: bounds.max[1] + props.rootY }
    for (const offset of [zero, delta])
      if (
        carrier.x0 + offset[0] < section.bounds.x0 - epsilon ||
        carrier.x1 + offset[0] > section.bounds.x1 + epsilon ||
        carrier.z0 + offset[2] < section.bounds.z0 - epsilon ||
        carrier.z1 + offset[2] > section.bounds.z1 + epsilon ||
        carrier.bottom < -epsilon ||
        carrier.top > section.ceiling + epsilon
      )
        return new Error("Native carrier leaves its room section")
    const obstacle = section.obstacles.find((obstacle) => cuboidTranslationHits({ relative: carrier, from: zero, to: delta, obstacle: obstacle, tolerance: epsilon }))
    if (obstacle) return new Error("Native carrier room clearance is unresolved", { cause: { carrier, obstacle } })
  }
  return null
}
