import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

import { COUNTER_H } from "#/world/scene/interior"
import { counterGoods } from "#/world/scene/helpers/interior/counter-goods"

type Props = {
  root: THREE.Group
  f: Furniture
  y0: number
  shop: string | undefined
  seed: number
}

export function counter(props: Props) {
  const gb = new GB()
  const xSource = props.f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  gb.box({ side: M.woodV, top: M.woodDark, x0: x - w / 2, y0: props.y0, z0: z - d / 2, x1: x + w / 2, y1: props.y0 + COUNTER_H - 0.06, z1: z + d / 2, repeat: 2 })
  gb.box({
    side: M.woodDark,
    top: M.wood,
    x0: x - w / 2 - 0.05,
    y0: props.y0 + COUNTER_H - 0.06,
    z0: z - d / 2 - 0.05,
    x1: x + w / 2 + 0.05,
    y1: props.y0 + COUNTER_H,
    z1: z + d / 2 + 0.05,
    repeat: 2,
  })
  props.root.add(gb.build())
  counterGoods({ root: props.root, f: props.f, y0: props.y0, shop: props.shop, seed: props.seed })
}
