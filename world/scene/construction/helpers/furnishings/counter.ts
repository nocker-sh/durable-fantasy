import { M } from "#/world/scene/construction/materials"
import type { Wood } from "#/world/scene/construction/furnishings"
import { paper, books, brass } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

type Props = {
  k: Kit
  wd: Wood
  seed: number
  ledger?: boolean
}

export function counter(props: Props) {
  const ledger = props.ledger === undefined ? false : props.ledger

  const WSource = props.k,
    W = WSource.W,
    D = WSource.D
  props.k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: 0.6, v1: D / 2 })
  for (const t = { value: 1 }; t.value < Math.round(W / 0.6); t.value++)
    props.k.box({
      side: props.wd.dark,
      top: null,
      u0: -W / 2 + t.value * (W / Math.round(W / 0.6)) - 0.03,
      y0: 0.05,
      v0: D / 2,
      u1: -W / 2 + t.value * (W / Math.round(W / 0.6)) + 0.03,
      y1: 0.57,
      v1: D / 2 + 0.015,
    })
  if (props.wd.trim) props.k.box({ side: props.wd.trim, top: null, u0: -W / 2 + 0.1, y0: 0.25, v0: D / 2, u1: W / 2 - 0.1, y1: 0.35, v1: D / 2 + 0.01 })
  props.k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2 - 0.04, y0: 0.6, v0: -D / 2 - 0.02, u1: W / 2 + 0.04, y1: 0.66, v1: D / 2 + 0.05 })
  if (ledger) {
    props.k.box({ side: books[Math.floor(r(props.seed, 1) * books.length)], top: paper, u0: -0.2, y0: 0.66, v0: -0.12, u1: 0.2, y1: 0.69, v1: 0.15 })
    props.k.cyl({ side: M.dark, top: null, u: 0.32, v: -0.05, y0: 0.66, y1: 0.71, r0: 0.03, r1: 0.025 })
    props.k.box({ side: props.wd.dark, top: brass, u0: -W / 2 + 0.1, y0: 0.66, v0: -0.1, u1: -W / 2 + 0.4, y1: 0.72, v1: 0.12 }) // the cash box
  }
}
