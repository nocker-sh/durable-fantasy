import type { Wood } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

// ---------------------------------------------------------------- shelves, cases and counters

type Props = {
  k: Kit
  wd: Wood
  h: number
  boards: number[]
  back?: boolean
}

export function frame(props: Props) {
  const back = props.back === undefined ? true : props.back

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  for (const su of [-1, 1])
    props.k.box({ side: props.wd.dark, top: props.wd.top, u0: (su * W) / 2 - (su > 0 ? 0.05 : 0), y0: 0, v0: -D / 2, u1: (su * W) / 2 + (su < 0 ? 0.05 : 0), y1: props.h, v1: D / 2 })
  if (back) props.k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: props.h, v1: -D / 2 + 0.03 })
  for (const b of props.boards) props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: b, v0: -D / 2, u1: W / 2, y1: b + 0.035, v1: D / 2 })
  props.k.box({ side: props.wd.dark, top: props.wd.top, u0: -W / 2 - 0.03, y0: props.h, v0: -D / 2, u1: W / 2 + 0.03, y1: props.h + 0.05, v1: D / 2 + 0.02 })
}
