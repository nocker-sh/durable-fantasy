import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  y?: number
  water?: boolean
}

export function bucket(props: Props) {
  const water = props.water === undefined ? true : props.water

  const y0 = props.y ?? groundH(props.x, props.z)
  props.gb.cyl({ side: M.woodV, top: null, centerX: props.x, centerZ: props.z, fromY: y0, toY: y0 + 0.24, fromRadius: 0.12, toRadius: 0.15, segments: 8, repeat: 2 })
  if (water) props.gb.cyl({ side: M.water, top: M.water, centerX: props.x, centerZ: props.z, fromY: y0, toY: y0 + 0.2, fromRadius: 0.01, toRadius: 0.13, segments: 8, repeat: 2 })
  props.gb.cyl({ side: M.iron, top: null, centerX: props.x, centerZ: props.z, fromY: y0 + 0.18, toY: y0 + 0.21, fromRadius: 0.145, toRadius: 0.15, segments: 8, repeat: 1 })
}
