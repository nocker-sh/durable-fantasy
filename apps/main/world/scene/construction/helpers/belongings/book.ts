import { Kit } from "#/world/scene/construction/kit"
import { cloth, paper, ink } from "#/world/scene/construction/belongings"
import { pick } from "#/world/scene/construction/helpers/belongings/pick"

type Props = {
  k: Kit
  u: number
  v: number
  y: number
  seed: number
  open?: boolean
}

export function book(props: Props) {
  const open = props.open === undefined ? false : props.open

  const c = pick(cloth, props.seed, 3)
  if (open) {
    props.k.box({ side: c, top: null, u0: props.u - 0.17, y0: props.y, v0: props.v - 0.11, u1: props.u + 0.17, y1: props.y + 0.015, v1: props.v + 0.11 })
    props.k.box({ side: paper, top: paper, u0: props.u - 0.16, y0: props.y + 0.015, v0: props.v - 0.1, u1: props.u - 0.005, y1: props.y + 0.03, v1: props.v + 0.1 })
    props.k.box({ side: paper, top: paper, u0: props.u + 0.005, y0: props.y + 0.015, v0: props.v - 0.1, u1: props.u + 0.16, y1: props.y + 0.03, v1: props.v + 0.1 })
    for (const i = { value: 0 }; i.value < 4; i.value++)
      props.k.box({ side: ink, top: null, u0: props.u - 0.13, y0: props.y + 0.031, v0: props.v - 0.07 + i.value * 0.04, u1: props.u - 0.04, y1: props.y + 0.032, v1: props.v - 0.065 + i.value * 0.04 })
  } else props.k.box({ side: c, top: paper, u0: props.u - 0.1, y0: props.y, v0: props.v - 0.14, u1: props.u + 0.1, y1: props.y + 0.05, v1: props.v + 0.14 })
}
