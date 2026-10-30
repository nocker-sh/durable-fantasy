import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"

/** A board on two brackets, standing out from the wall, things set along it. */
type Props = {
  k: Kit
  wd: Wood
  W: number
  things: (u: number, i: number) => number
}

export function wallShelf(props: Props) {
  props.k.box({ side: props.wd.top, top: props.wd.top, u0: -props.W / 2, y0: 0, v0: 0, u1: props.W / 2, y1: 0.035, v1: 0.2 })
  for (const su of [-1, 1]) props.k.box({ side: props.wd.dark, top: null, u0: su * (props.W / 2 - 0.08) - 0.02, y0: -0.15, v0: 0, u1: su * (props.W / 2 - 0.08) + 0.02, y1: 0, v1: 0.16 })
  const u = { value: -props.W / 2 + 0.06 }
  for (const i = { value: 0 }; u.value < props.W / 2 - 0.08; i.value++) u.value += props.things(u.value, i.value)
}
