import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import type { Wood, Spot, Stock } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"
import { r } from "#/world/scene/construction/helpers/furnishings/r"

import { shelfRow } from "#/world/scene/construction/helpers/furnishings/shelf-row"

/**
 * A long open shelf in bays, stocked the way a shop's shelf is in the afternoon: the boards near
 * the hand full, the top one half sold, a gap here and there where something went this morning.
 */
type Props = {
  gb: GB
  spot: Spot
  wd: Wood
  seed: number
  stock: Stock
}

export function stockShelf(props: Props) {
  const k = new Kit(props.gb, props.spot)
  const WSource = k,
    W = WSource.W,
    D = WSource.D
  const h = 1.75
  const boards = [0.04, 0.5, 0.95, 1.4]
  const bays = Math.max(1, Math.round(W / 1.2))
  const bw = W / bays
  for (const i = { value: 0 }; i.value <= bays; i.value++) {
    const u = -W / 2 + i.value * bw
    k.box({ side: props.wd.dark, top: props.wd.top, u0: Math.max(-W / 2, u - 0.035), y0: 0, v0: -D / 2, u1: Math.min(W / 2, u + 0.035), y1: h, v1: D / 2 })
  }
  k.box({ side: props.wd.body, top: null, u0: -W / 2, y0: 0, v0: -D / 2, u1: W / 2, y1: h, v1: -D / 2 + 0.03 })
  for (const b of boards) k.box({ side: props.wd.top, top: props.wd.top, u0: -W / 2, y0: b, v0: -D / 2, u1: W / 2, y1: b + 0.035, v1: D / 2 })
  k.box({ side: props.wd.dark, top: props.wd.top, u0: -W / 2 - 0.03, y0: h, v0: -D / 2, u1: W / 2 + 0.03, y1: h + 0.05, v1: D / 2 + 0.02 })
  const v = Math.min(0.06, D / 2 - 0.12)
  boards.forEach((b, row) => {
    const y = b + 0.035
    for (const i = { value: 0 }; i.value < bays; i.value++) {
      const full = r(props.seed + row * 31, i.value)
      if (full < (row === 3 ? 0.4 : 0.12)) continue
      const u0 = -W / 2 + i.value * bw + 0.08,
        u1 = u0 + (bw - 0.16) * (full < 0.5 ? 0.55 : 1)
      const kind = props.stock === "sundries" ? (["jars", "stores", "rope", "candles"] as const)[Math.floor(r(props.seed + row, i.value + 40) * 4)] : props.stock
      shelfRow({ k: k, y: y, u0: u0, u1: u1, v: v, kind: kind, seed: props.seed + row * 7 + i.value })
    }
  })
}
