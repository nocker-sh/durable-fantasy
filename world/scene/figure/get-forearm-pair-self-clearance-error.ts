import { getForearmPairSurfaces } from "#/world/scene/figure/get-forearm-pair-surfaces"
import { buildBody } from "#/world/scene/figure/body"
import { canSeparateSurfaceFromPrimitive } from "#/lib/graphics/ray/can-separate-surface-from-primitive"
import { getLimbPrimitiveShape } from "#/lib/graphics/ray/get-limb-primitive-shape"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = { look: Look; skeleton: Skel; margins: Readonly<Record<"l" | "r", number>> }

/** Uncut skin encloses both moving palm holes; relative motion adds both arm bounds before any self-clearance certificate. */
export function getForearmPairSelfClearanceError(props: Props): Error | null {
  if (![props.margins.l, props.margins.r].every((value) => Number.isFinite(value) && value >= 0)) return new Error("Invalid forearm-pair motion margins")
  if (props.look.shield) return new Error("Moving shield needs a separate self-clearance certificate")
  const skeleton = { ...props.skeleton, handGrips: undefined }
  const body = buildBody(props.look, skeleton, null),
    raw = getForearmPairSurfaces({ ...props, skeleton }),
    arms = new Set([...body.armParts.l, ...body.armParts.r])
  const opposite = { l: raw.r, r: raw.l },
    relative = props.margins.l + props.margins.r
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const other = opposite[hand]
    for (const surface of [raw[hand].forearm(), raw[hand].uncutCuff]) {
      for (const primitive of body.prims)
        if (!arms.has(primitive) && !canSeparateSurfaceFromPrimitive({ surface, primitive, margin: props.margins[hand] })) return new Error("Native forearm self-clearance remains unresolved")
      for (const target of [other.arm, other.uncutCuff])
        if (!canSeparateSurfaceFromPrimitive({ surface, primitive: getLimbPrimitiveShape(target), margin: relative })) return new Error("Native forearms or cuffs do not remain separate")
    }
  }

  return null
}
