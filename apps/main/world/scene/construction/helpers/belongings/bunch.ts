import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"
import { M } from "#/world/scene/construction/materials"
import { r } from "#/world/scene/construction/helpers/belongings/r"

/** A bundle tied at the top and hung head down: herbs, onions on a string, candle wicks. */
type Props = {
  k: Kit
  m: THREE.Material
  u: number
  len?: number
  n?: number
  seed?: number
}

export function bunch(props: Props) {
  const len = props.len === undefined ? 0.32 : props.len
  const n = props.n === undefined ? 5 : props.n
  const seed = props.seed === undefined ? 0 : props.seed

  props.k.box({ side: M.rope, top: null, u0: props.u - 0.01, y0: -0.08, v0: 0.02, u1: props.u + 0.01, y1: 0.0, v1: 0.04 })
  for (const i = { value: 0 }; i.value < n; i.value++) {
    const du = (i.value - (n - 1) / 2) * 0.03
    const l = len * (0.7 + r(seed, i.value) * 0.3)
    props.k.box({ side: props.m, top: null, u0: props.u + du - 0.012, y0: -0.08 - l, v0: 0.01 + (i.value % 2) * 0.02, u1: props.u + du + 0.012, y1: -0.08, v1: 0.035 + (i.value % 2) * 0.02 })
  }
}
