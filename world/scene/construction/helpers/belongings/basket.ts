import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"
import { willow } from "#/world/scene/construction/belongings"
import { r } from "#/world/scene/construction/helpers/belongings/r"

type Props = {
  k: Kit
  u: number
  v: number
  seed: number
  fill?: THREE.Material
}

export function basket(props: Props) {
  props.k.cyl({ side: willow, top: null, u: props.u, v: props.v, y0: 0, y1: 0.16, r0: 0.12, r1: 0.15, seg: 8 })
  props.k.box({ side: willow, top: null, u0: props.u - 0.13, y0: 0.16, v0: props.v - 0.01, u1: props.u + 0.13, y1: 0.3, v1: props.v + 0.01 }) // the handle, stood up
  if (props.fill)
    for (const i = { value: 0 }; i.value < 5; i.value++)
      props.k.cyl({
        side: props.fill,
        top: props.fill,
        u: props.u + (r(props.seed, i.value) - 0.5) * 0.14,
        v: props.v + (r(props.seed, i.value + 5) - 0.5) * 0.14,
        y0: 0.12,
        y1: 0.18,
        r0: 0.04,
        r1: 0.03,
        seg: 5,
      })
}
