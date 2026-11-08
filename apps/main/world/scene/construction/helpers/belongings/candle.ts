import { Kit } from "#/world/scene/construction/kit"
import { brass, wax, flame } from "#/world/scene/construction/belongings"

type Props = {
  k: Kit
  u: number
  v: number
  y: number
  tall?: number
}

export function candle(props: Props) {
  const tall = props.tall === undefined ? 0.14 : props.tall

  props.k.cyl({ side: brass, top: null, u: props.u, v: props.v, y0: props.y, y1: props.y + 0.02, r0: 0.045, r1: 0.045, seg: 6 })
  props.k.cyl({ side: wax, top: null, u: props.u, v: props.v, y0: props.y + 0.02, y1: props.y + 0.02 + tall, r0: 0.014, r1: 0.014, seg: 5 })
  props.k.box({ side: flame, top: null, u0: props.u - 0.007, y0: props.y + 0.02 + tall, v0: props.v - 0.007, u1: props.u + 0.007, y1: props.y + 0.05 + tall, v1: props.v + 0.007 })
}
