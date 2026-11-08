import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"
import { M } from "#/world/scene/construction/materials"

/** A string of round things (onions, garlic) hung down the wall. */
type Props = {
  k: Kit
  m: THREE.Material
  u: number
  n?: number
}

export function string(props: Props) {
  const n = props.n === undefined ? 6 : props.n

  props.k.box({ side: M.rope, top: null, u0: props.u - 0.008, y0: -0.05 - n * 0.07, v0: 0.03, u1: props.u + 0.008, y1: 0, v1: 0.045 })
  for (const i = { value: 0 }; i.value < n; i.value++)
    props.k.box({
      side: props.m,
      top: null,
      u0: props.u - 0.045 + (i.value % 2) * 0.02,
      y0: -0.09 - i.value * 0.07,
      v0: 0.0,
      u1: props.u + 0.035 + (i.value % 2) * 0.02,
      y1: -0.03 - i.value * 0.07,
      v1: 0.08,
    })
}
