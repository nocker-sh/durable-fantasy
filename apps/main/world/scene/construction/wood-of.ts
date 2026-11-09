import { hash2 } from "#/lib/engine/hash2"
import type { WoodId } from "#/world/scene/construction/furnishings"

/** What a household's furniture is made of, by how well off it is; the seed picks between the woods of a kind. */
export function woodOf(living: "慎ましい" | "ふつう" | "ゆとりがある" | undefined, seed: number): WoodId {
  const t = hash2(seed, 7, 61)
  if (living === "慎ましい") return "pine"
  if (living === "ゆとりがある") return t < 0.45 ? "walnut" : t < 0.7 ? "blackOak" : "oak"
  return t < 0.6 ? "oak" : t < 0.85 ? "birch" : "pine"
}
