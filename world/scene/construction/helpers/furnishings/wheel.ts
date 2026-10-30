import type * as THREE from "three"
import { Kit } from "#/world/scene/construction/kit"

// ---------------------------------------------------------------- crafts

/** A spoked wheel standing across the frame at `u`: its rim in short pieces, spokes to the hub. */
type Props = {
  k: Kit
  rim: THREE.Material
  spoke: THREE.Material
  u: number
  cy: number
  R: number
  t?: number
  n?: number
}

export function wheel(props: Props) {
  const t = props.t === undefined ? 0.03 : props.t
  const n = props.n === undefined ? 28 : props.n

  for (const i = { value: 0 }; i.value < n; i.value++) {
    const a = (i.value / n) * Math.PI * 2
    const v = Math.cos(a) * props.R,
      y = props.cy + Math.sin(a) * props.R
    props.k.box({ side: props.rim, top: null, u0: props.u - t / 2, y0: y - 0.025, v0: v - 0.025, u1: props.u + t / 2, y1: y + 0.025, v1: v + 0.025 })
    if (i.value % 4 === 0)
      for (const q = { value: 1 }; q.value < 6; q.value++)
        props.k.box({
          side: props.spoke,
          top: null,
          u0: props.u - t / 4,
          y0: props.cy + Math.sin(a) * props.R * (q.value / 6) - 0.01,
          v0: Math.cos(a) * props.R * (q.value / 6) - 0.01,
          u1: props.u + t / 4,
          y1: props.cy + Math.sin(a) * props.R * (q.value / 6) + 0.01,
          v1: Math.cos(a) * props.R * (q.value / 6) + 0.01,
        })
  }
  props.k.cyl({ side: props.spoke, top: null, u: props.u, v: 0, y0: props.cy - 0.03, y1: props.cy + 0.03, r0: 0.04, r1: 0.04, seg: 6 })
}
