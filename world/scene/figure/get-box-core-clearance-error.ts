import { buildBody } from "#/world/scene/figure/body"
import { primitiveBounds } from "../../../lib/graphics/ray/primitive-bounds"
import { quarterTurnRect } from "../../../lib/engine/quarter-turn-rect"
import { cuboidTranslationHits } from "../../../lib/engine/cuboid-translation-hits"
import { type Point3 } from "../../../lib/engine/cuboid-motion-types"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
type Props = { look: Look; skeleton: Skel; rootY: number; turn: 0 | 1 | 2 | 3; body: readonly [number, number]; parts: ReadonlyArray<StorageBoxPart>; height: number }
/** Conservative native bounds keep the held box outside the core; both arms and contact remain separate checks. */
export function getBoxCoreClearanceError(props: Props): Error | null {
  const body = buildBody(props.look, props.skeleton, null),
    arms = new Set([...body.armParts.l, ...body.armParts.r])
  const zero: Point3 = [0, 0, 0]
  for (const primitive of body.prims) {
    if (arms.has(primitive)) continue
    const bounds = primitiveBounds(primitive)
    const horizontal = quarterTurnRect({ bounds: { x0: bounds.min[0], z0: bounds.min[2], x1: bounds.max[0], z1: bounds.max[2] }, turn: props.turn, origin: [props.body[0], props.body[1]] })
    const core = { ...horizontal, bottom: bounds.min[1] + props.rootY, top: bounds.max[1] + props.rootY }
    for (const part of props.parts) {
      const box = { x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0 + props.height, top: part.y1 + props.height }
      if (cuboidTranslationHits({ relative: core, from: zero, to: zero, obstacle: box, tolerance: 1e-9 })) return new Error("Native carrier core clearance is unresolved", { cause: { core, box } })
    }
  }
  return null
}
