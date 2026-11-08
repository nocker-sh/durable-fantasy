import { WOODPILE_GROUND_HALF_DEPTH } from "#/world/town/workshop-footprints"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { blockRect } from "#/world/scene/block-rect"
import { M } from "#/world/scene/construction/materials"

type Props = {
  gb: GB
  x: number
  z: number
  len?: number
  layers?: number
  alongX?: boolean
}

export function woodpile(props: Props) {
  const len = props.len === undefined ? 1.6 : props.len
  const layers = props.layers === undefined ? 4 : props.layers
  const alongX = props.alongX === undefined ? true : props.alongX

  const y0 = groundH(props.x, props.z)
  for (const l = { value: 0 }; l.value < layers; l.value++)
    for (const k = { value: 0 }; k.value < 6 - l.value; k.value++) {
      const off = (k.value - (5 - l.value) / 2) * 0.2
      const cx = alongX ? props.x : props.x + off,
        cz = alongX ? props.z + off : props.z
      const yy = y0 + 0.1 + l.value * 0.17
      const g = new THREE.CylinderGeometry(0.09, 0.09, len, 6)
      void g
      if (alongX) props.gb.box({ side: M.woodV, top: M.woodDark, x0: cx - len / 2, y0: yy - 0.09, z0: cz - 0.09, x1: cx + len / 2, y1: yy + 0.08, z1: cz + 0.08, repeat: 2 })
      else props.gb.box({ side: M.woodV, top: M.woodDark, x0: cx - 0.09, y0: yy - 0.09, z0: cz - len / 2, x1: cx + 0.08, y1: yy + 0.08, z1: cz + len / 2, repeat: 2 })
    }
  if (alongX) blockRect({ x0: props.x - len / 2, z0: props.z - WOODPILE_GROUND_HALF_DEPTH, x1: props.x + len / 2, z1: props.z + WOODPILE_GROUND_HALF_DEPTH })
  else blockRect({ x0: props.x - WOODPILE_GROUND_HALF_DEPTH, z0: props.z - len / 2, x1: props.x + WOODPILE_GROUND_HALF_DEPTH, z1: props.z + len / 2 })
}
