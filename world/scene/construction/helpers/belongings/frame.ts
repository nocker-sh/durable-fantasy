import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"

type Props = {
  k: Kit
  W: number
  H: number
  inside: THREE.Material
  wd: Wood
}

export function frame(props: Props) {
  props.k.box({ side: props.wd.dark, top: null, u0: -props.W / 2, y0: -props.H, v0: 0, u1: props.W / 2, y1: 0, v1: 0.03 })
  props.k.box({ side: props.inside, top: null, u0: -props.W / 2 + 0.04, y0: -props.H + 0.04, v0: 0.03, u1: props.W / 2 - 0.04, y1: -0.04, v1: 0.035 })
}
