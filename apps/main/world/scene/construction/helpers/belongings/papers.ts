import { Kit } from "#/world/scene/construction/kit"
import { paper, ink } from "#/world/scene/construction/belongings"
import { r } from "#/world/scene/construction/helpers/belongings/r"

type Props = {
  k: Kit
  u: number
  v: number
  y: number
  seed: number
  n?: number
}

export function papers(props: Props) {
  const n = props.n === undefined ? 3 : props.n

  for (const i = { value: 0 }; i.value < n; i.value++) {
    const du = (r(props.seed, i.value) - 0.5) * 0.08,
      dv = (r(props.seed, i.value + 9) - 0.5) * 0.08
    props.k.box({
      side: paper,
      top: paper,
      u0: props.u + du - 0.1,
      y0: props.y + i.value * 0.004,
      v0: props.v + dv - 0.14,
      u1: props.u + du + 0.1,
      y1: props.y + i.value * 0.004 + 0.004,
      v1: props.v + dv + 0.14,
    })
  }
  props.k.box({ side: ink, top: null, u0: props.u - 0.06, y0: props.y + n * 0.004, v0: props.v - 0.08, u1: props.u + 0.04, y1: props.y + n * 0.004 + 0.002, v1: props.v - 0.07 })
}
