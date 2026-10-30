import type { Look } from "#/world/scene/figure/look"

/** Hats stay off until hair and face shapes are settled; armour and helmets remain. */
export function wearable(look: Look): Look {
  return look.hat !== "helm" && look.hat !== "greathelm" ? { ...look, hat: undefined } : look
}
