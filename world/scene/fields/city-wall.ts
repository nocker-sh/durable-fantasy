import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { chimneys } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { N } from "#/world/scene/world"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"
import { signboard } from "#/world/scene/fields/signboard"

/** A city wall across the map at `z` with a shut gate at `gx`, and the sign about the work. */
type Props = {
  root: THREE.Group
  z: number
  gx: number
  chimneysBehind: boolean
}

export function cityWall(props: Props) {
  const gb = new GB()
  for (const entry of [
    [0, props.gx - 2.4],
    [props.gx + 2.4, N],
  ] as V2[]) {
    const x0 = entry[0]
    const x1 = entry[1]

    const y = Math.min(groundH(x0 + 1, props.z), groundH(x1 - 1, props.z))
    gb.box({ side: M.ashlar, top: M.stone, x0: x0, y0: y - 0.8, z0: props.z - 0.6, x1: x1, y1: y + 3.4, z1: props.z + 0.6, repeat: 2 })
    for (const x = { value: x0 + 0.4 }; x.value < x1 - 0.4; x.value += 1.2)
      gb.box({ side: M.ashlar, top: M.stone, x0: x.value, y0: y + 3.4, z0: props.z - 0.6, x1: x.value + 0.6, y1: y + 3.9, z1: props.z + 0.6, repeat: 2 })
    blockRect({ x0: x0, z0: props.z - 0.7, x1: x1, z1: props.z + 0.7 })
  }
  for (const x of [props.gx - 3, props.gx + 3]) {
    const y = groundH(x, props.z)
    gb.box({ side: M.ashlar, top: M.stone, x0: x - 1.3, y0: y - 0.8, z0: props.z - 1.3, x1: x + 1.3, y1: y + 4.8, z1: props.z + 1.3, repeat: 2 })
    blockRect({ x0: x - 1.35, z0: props.z - 1.35, x1: x + 1.35, z1: props.z + 1.35 })
  }
  const y = groundH(props.gx, props.z)
  gb.box({ side: M.woodDark, top: M.woodDark, x0: props.gx - 1.7, y0: y - 0.2, z0: props.z - 0.2, x1: props.gx + 1.7, y1: y + 3.2, z1: props.z + 0.2, repeat: 2 }) // the gate, shut
  for (const t of [0.8, 2.2]) gb.box({ side: M.iron, top: null, x0: props.gx - 1.7, y0: y + t, z0: props.z + 0.2, x1: props.gx + 1.7, y1: y + t + 0.12, z1: props.z + 0.26, repeat: 1 })
  blockRect({ x0: props.gx - 1.8, z0: props.z - 0.3, x1: props.gx + 1.8, z1: props.z + 0.3 })
  // scaffolding and a barrier: the town beyond is still being built
  for (const x of [props.gx - 1.4, props.gx + 1.4]) gb.box({ side: M.wood, top: null, x0: x - 0.06, y0: y, z0: props.z + 1.4, x1: x + 0.06, y1: y + 1.0, z1: props.z + 1.52, repeat: 2 })
  gb.box({ side: M.wood, top: M.wood, x0: props.gx - 1.6, y0: y + 0.7, z0: props.z + 1.38, x1: props.gx + 1.6, y1: y + 0.86, z1: props.z + 1.54, repeat: 2 })
  blockRect({ x0: props.gx - 1.7, z0: props.z + 1.2, x1: props.gx + 1.7, z1: props.z + 1.7 })
  props.root.add(gb.build())
  signboard({ root: props.root, x: props.gx + 2.4, z: props.z + 2.2, lines: ["この先は工事中", "まだ入れない"], rot: -0.2 })
  if (props.chimneysBehind)
    for (const entry2 of [
      [14, props.z - 4],
      [21, props.z - 7],
      [31, props.z - 5],
      [37, props.z - 8],
    ] as V2[]) {
      const cx = entry2[0]
      const cz = entry2[1]

      const g2 = new GB()
      const cy = groundH(cx, cz)
      g2.box({ side: M.stoneDark, top: M.stone, x0: cx - 0.4, y0: cy, z0: cz - 0.4, x1: cx + 0.4, y1: cy + 5.2, z1: cz + 0.4, repeat: 2 })
      props.root.add(g2.build())
      chimneys.push(new THREE.Vector3(cx, cy + 5.3, cz))
    }
}
