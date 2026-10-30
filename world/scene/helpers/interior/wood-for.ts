import { hash2 } from "#/lib/engine/hash2"
import type { Interior } from "#/world/town/interiors"
import { HOUSEHOLDS } from "#/world/town/houses"
import { paintOf } from "#/world/scene/construction/paint-of"
import { woodOf } from "#/world/scene/construction/wood-of"
import type { WoodId } from "#/world/scene/construction/furnishings"

/** The wood of the household's furniture; a painted chest, bench or cradle where the house paints them. */
export function woodFor(it: Interior): (name: string) => WoodId {
  const living = it.house.household ? HOUSEHOLDS.find((h) => h.id === it.house.household)?.living : it.house.kind === "public" ? "ゆとりがある" : undefined
  const base = woodOf(living, it.house.seed)
  const paints = living !== "慎ましい" && hash2(it.house.seed, 5, 73) > 0.55
  return (name) => (paints && /^(衣装箱|長椅子|揺りかご)$/.test(name) ? paintOf(it.house.seed) : base)
}
