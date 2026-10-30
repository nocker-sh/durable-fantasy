import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  y?: number
}

export function sack(props: Props) {
  const y0 = props.y ?? groundH(props.x, props.z)
  props.gb.cyl({ side: M.sack, top: M.sack, centerX: props.x, centerZ: props.z, fromY: y0, toY: y0 + 0.35, fromRadius: 0.2, toRadius: 0.22, segments: 7, repeat: 2 })
  props.gb.cyl({ side: M.sack, top: M.sack, centerX: props.x, centerZ: props.z, fromY: y0 + 0.35, toY: y0 + 0.5, fromRadius: 0.22, toRadius: 0.08, segments: 7, repeat: 2 })
  props.gb.cyl({ side: M.rope, top: null, centerX: props.x, centerZ: props.z, fromY: y0 + 0.45, toY: y0 + 0.5, fromRadius: 0.1, toRadius: 0.1, segments: 6, repeat: 1 })
}
