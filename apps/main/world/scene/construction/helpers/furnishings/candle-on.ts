import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { brass, wax } from "#/world/scene/construction/furnishings"
import { Kit } from "#/world/scene/construction/kit"

type Props = {
  k: Kit
  u: number
  v: number
  y: number
}

export function candleOn(props: Props) {
  props.k.cyl({ side: brass, top: null, u: props.u, v: props.v, y0: props.y, y1: props.y + 0.02, r0: 0.045, r1: 0.045, seg: 6 })
  props.k.cyl({ side: wax, top: null, u: props.u, v: props.v, y0: props.y + 0.02, y1: props.y + 0.17, r0: 0.015, r1: 0.015, seg: 5 })
  props.k.box({ side: colorMat(0xffc860), top: null, u0: props.u - 0.007, y0: props.y + 0.17, v0: props.v - 0.007, u1: props.u + 0.007, y1: props.y + 0.2, v1: props.v + 0.007 })
}
