import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  gb: GB
  x: number
  z: number
  alongX: boolean
}

export function planks(props: Props) {
  const y = groundH(props.x, props.z)
  for (const k = { value: 0 }; k.value < 5; k.value++) {
    const yy = y + 0.04 + k.value * 0.07
    if (props.alongX) props.gb.box({ side: M.wood, top: M.wood, x0: props.x - 0.9, y0: yy, z0: props.z - 0.22, x1: props.x + 0.9, y1: yy + 0.06, z1: props.z + 0.22, repeat: 2 })
    else props.gb.box({ side: M.wood, top: M.wood, x0: props.x - 0.22, y0: yy, z0: props.z - 0.9, x1: props.x + 0.22, y1: yy + 0.06, z1: props.z + 0.9, repeat: 2 })
  }
  if (props.alongX) blockRect({ x0: props.x - 0.95, z0: props.z - 0.3, x1: props.x + 0.95, z1: props.z + 0.3 })
  else blockRect({ x0: props.x - 0.3, z0: props.z - 0.95, x1: props.x + 0.3, z1: props.z + 0.95 })
}
