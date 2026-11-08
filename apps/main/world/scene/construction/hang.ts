import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"
import { pick } from "#/world/scene/construction/helpers/belongings/pick"
import { ON_WALLS, BY_USE } from "#/world/scene/construction/belonging-builders"

/** A wall piece of the plan, or a thing every room of its use has; the kit stands on the wall at the hook. */
type Props = {
  k: Kit
  wd: Wood
  what: { piece?: string; use?: string }
  seed: number
}

export function hang(props: Props): boolean {
  const f = props.what.piece ? ON_WALLS[props.what.piece] : props.what.use ? pick(BY_USE[props.what.use] ?? BY_USE["食事"], props.seed, 1) : undefined
  if (!f) return false
  f(props.k, props.wd, props.seed)
  return true
}
