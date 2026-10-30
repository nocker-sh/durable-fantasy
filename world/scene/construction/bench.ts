import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  w?: number
  alongX?: boolean
}

export function bench(props: Props) {
  const w = props.w === undefined ? 1.2 : props.w
  const alongX = props.alongX === undefined ? true : props.alongX

  const y0 = groundH(props.x, props.z)
  const hw = alongX ? w / 2 : 0.18,
    hd = alongX ? 0.18 : w / 2
  props.gb.box({ side: M.wood, top: M.wood, x0: props.x - hw, y0: y0 + 0.36, z0: props.z - hd, x1: props.x + hw, y1: y0 + 0.42, z1: props.z + hd, repeat: 2 })
  for (const s of [-1, 1]) {
    const lx = alongX ? props.x + s * (hw - 0.1) : props.x,
      lz = alongX ? props.z : props.z + s * (hd - 0.1)
    props.gb.box({ side: M.woodDark, top: null, x0: lx - 0.05, y0: y0 - 0.1, z0: lz - 0.05, x1: lx + 0.05, y1: y0 + 0.36, z1: lz + 0.05, repeat: 2 })
  }
  blockRect({ x0: props.x - hw, z0: props.z - hd, x1: props.x + hw, z1: props.z + hd })
}
