import { Kit } from "#/world/scene/construction/kit"
import { clay, glaze } from "#/world/scene/construction/belongings"
import { r } from "#/world/scene/construction/helpers/belongings/r"
import { pick } from "#/world/scene/construction/helpers/belongings/pick"

/** A pot, a jug, a bowl: the round things on shelves and tables. */
type Props = {
  k: Kit
  u: number
  v: number
  y: number
  seed: number
  n: number
}

export function vessel(props: Props) {
  const kind = r(props.seed, props.n)
  const m = kind < 0.3 ? clay : pick(glaze, props.seed, props.n + 1)
  if (kind < 0.45) props.k.cyl({ side: m, top: null, u: props.u + 0.06, v: props.v, y0: props.y, y1: props.y + 0.14 + r(props.seed, props.n + 2) * 0.06, r0: 0.05, r1: 0.035, seg: 7 }) // a jug
  else if (kind < 0.75) props.k.cyl({ side: m, top: null, u: props.u + 0.07, v: props.v, y0: props.y, y1: props.y + 0.06, r0: 0.05, r1: 0.075, seg: 8 }) // a bowl
  else props.k.box({ side: m, top: m, u0: props.u, y0: props.y, v0: props.v - 0.07, u1: props.u + 0.02, y1: props.y + 0.16, v1: props.v + 0.07 }) // a plate stood up
}
