import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"

type Props = {
  k: Kit
  u: number
  v: number
  m: THREE.Material
  tall?: boolean
  pairs?: number
}

export function shoes(props: Props) {
  const tall = props.tall === undefined ? false : props.tall
  const pairs = props.pairs === undefined ? 1 : props.pairs

  for (const p = { value: 0 }; p.value < pairs; p.value++)
    for (const s of [-1, 1]) {
      const cu = props.u + p.value * 0.28 + s * 0.06
      props.k.box({ side: props.m, top: null, u0: cu - 0.04, y0: 0, v0: props.v - 0.1, u1: cu + 0.04, y1: 0.06, v1: props.v + 0.1 })
      if (tall) props.k.box({ side: props.m, top: null, u0: cu - 0.04, y0: 0.06, v0: props.v - 0.1, u1: cu + 0.04, y1: 0.3, v1: props.v - 0.02 })
    }
}
