import type { Look } from "#/world/scene/figure/look"

/** The native trouser profile already includes its fabric at the widest supporting thigh. */
export function seatedSupportDepth(look: Look): number {
  const scale = look.age === "child" ? 0.74 : 1

  return 0.064 * scale
}
