import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  alongX?: boolean
}

export function trough(props: Props) {
  const alongX = props.alongX === undefined ? true : props.alongX

  const y0 = groundH(props.x, props.z)
  const hw = alongX ? 0.7 : 0.25,
    hd = alongX ? 0.25 : 0.7
  props.gb.box({ side: M.wood, top: null, x0: props.x - hw, y0: y0, z0: props.z - hd, x1: props.x + hw, y1: y0 + 0.35, z1: props.z + hd, repeat: 2 })
  props.gb.box({ side: M.water, top: M.water, x0: props.x - hw + 0.06, y0: y0, z0: props.z - hd + 0.06, x1: props.x + hw - 0.06, y1: y0 + 0.3, z1: props.z + hd - 0.06, repeat: 2 })
  blockRect({ x0: props.x - hw, z0: props.z - hd, x1: props.x + hw, z1: props.z + hd })
}
