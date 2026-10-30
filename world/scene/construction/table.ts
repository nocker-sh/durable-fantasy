import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  w?: number
  d?: number
  h?: number
}

export function table(props: Props) {
  const w = props.w === undefined ? 1.2 : props.w
  const d = props.d === undefined ? 0.6 : props.d
  const h = props.h === undefined ? 0.62 : props.h

  const y0 = groundH(props.x, props.z)
  props.gb.box({ side: M.wood, top: M.wood, x0: props.x - w / 2, y0: y0 + h - 0.06, z0: props.z - d / 2, x1: props.x + w / 2, y1: y0 + h, z1: props.z + d / 2, repeat: 2 })
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      props.gb.box({
        side: M.woodDark,
        top: null,
        x0: props.x + sx * (w / 2 - 0.08) - 0.04,
        y0: y0 - 0.1,
        z0: props.z + sz * (d / 2 - 0.08) - 0.04,
        x1: props.x + sx * (w / 2 - 0.08) + 0.04,
        y1: y0 + h - 0.06,
        z1: props.z + sz * (d / 2 - 0.08) + 0.04,
        repeat: 2,
      })
  blockRect({ x0: props.x - w / 2, z0: props.z - d / 2, x1: props.x + w / 2, z1: props.z + d / 2 })
  return y0 + h
}
