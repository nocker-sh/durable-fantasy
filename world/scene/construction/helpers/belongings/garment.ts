import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"
import { M } from "#/world/scene/construction/materials"

// ---------------------------------------------------------------- the pieces of a thing

/** A garment hung by its shoulders from a peg: a coat long, an apron short. */
type Props = {
  k: Kit
  c: THREE.Material
  len: number
  u?: number
  wide?: number
}

export function garment(props: Props) {
  const u = props.u === undefined ? 0 : props.u
  const wide = props.wide === undefined ? 0.34 : props.wide

  props.k.box({ side: M.woodDark, top: null, u0: u - 0.02, y0: -0.05, v0: -0.02, u1: u + 0.02, y1: 0.0, v1: 0.08 }) // the peg
  props.k.box({ side: props.c, top: null, u0: u - wide / 2, y0: -props.len, v0: 0.0, u1: u + wide / 2, y1: -0.04, v1: 0.05 })
  props.k.box({ side: props.c, top: null, u0: u - wide / 2 - 0.04, y0: -props.len * 0.55, v0: 0.0, u1: u - wide / 2, y1: -0.06, v1: 0.04 }) // sleeves
  props.k.box({ side: props.c, top: null, u0: u + wide / 2, y0: -props.len * 0.55, v0: 0.0, u1: u + wide / 2 + 0.04, y1: -0.06, v1: 0.04 })
}
