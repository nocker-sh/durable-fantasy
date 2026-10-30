import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Wood, Spot } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { FURNISHINGS } from "#/world/scene/construction/furnishing-builders"

/** Draws the named piece at the spot; false if there is no drawing for it. */
type Props = {
  gb: GB
  name: string
  spot: Spot
  w: Wood
  seed: number
}

export function furnish(props: Props): boolean {
  const f = FURNISHINGS[props.name] ?? FURNISHINGS[props.name.replace(/（.+）$/, "")]
  if (!f) return false
  f(new Kit(props.gb, props.spot), props.w, props.seed)
  return true
}
