import { buildBody } from "#/world/scene/figure/body"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = Readonly<{ look: Look; skeleton: Skel; rootY: number }>

/** A conservative whole-body bound must stay above the floor; grounding one shoe cannot excuse another part penetrating it. */
export function getNativeBodyFloorError(props: Props): Error | null {
  if (!Number.isFinite(props.rootY)) return new Error("Invalid native floor transform")
  const body = buildBody(props.look, props.skeleton, null)

  for (const primitive of body.prims) {
    const bottom = primitiveBounds(primitive).min[1] + props.rootY
    if (!Number.isFinite(bottom) || bottom < -1e-9) return new Error("Native body floor clearance remains unresolved", { cause: { primitive: primitive.id } })
  }

  return null
}
