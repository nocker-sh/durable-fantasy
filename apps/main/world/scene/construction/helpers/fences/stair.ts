import { stairSteps } from "#/world/scene/construction/stair-steps"
import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"

// ---------------------------------------------------------------- props
type Props = {
  root: THREE.Group
  x0: number
  x1: number
  zTop: number
  zBot: number
  yTop: number
  yBot: number
  n: number
  m?: typeof M.ashlar
}

export function stair(props: Props) {
  const m = props.m === undefined ? M.ashlar : props.m

  const gb = new GB()
  for (const step of stairSteps({ x0: props.x0, x1: props.x1, z0: props.zTop, z1: props.zBot, y0: props.yTop, y1: props.yBot, steps: props.n })) {
    gb.box({ side: m, top: m, x0: step.x0, y0: step.bottom, z0: step.z0, x1: step.x1, y1: step.top, z1: step.z1, repeat: 4 })
  }
  props.root.add(gb.build())
}
