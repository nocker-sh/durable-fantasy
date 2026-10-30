import { flueFloor } from "#/world/town/flue-floor"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Interior } from "#/world/town/interiors"

type Props = {
  root: THREE.Group
  it: Interior
  y0: number
  name: string
}

export function floorboards(props: Props) {
  const gb = new GB()
  const parts = flueFloor({
    bounds: { x0: props.it.x0, z0: props.it.z0, x1: props.it.x1, z1: props.it.z1 },
    floor: props.it.floor,
    flues: props.it.flues ?? [],
    openings: props.it.floorOpenings ?? [],
  })
  for (const entry of [
    [M.wood, parts.timber],
    [M.stone, parts.stone],
  ] as const) {
    const material = entry[0]
    const slabs = entry[1]
    for (const slab of slabs)
      gb.box({
        side: material,
        top: material,
        x0: slab.x0,
        y0: props.y0 - (props.it.floorThickness ?? 0.1),
        z0: slab.z0,
        x1: slab.x1,
        y1: props.y0,
        z1: slab.z1,
        repeat: 2,
        bottom: material === M.stone,
      })
  }
  const floor = gb.build()
  floor.name = props.name
  props.root.add(floor)
}
