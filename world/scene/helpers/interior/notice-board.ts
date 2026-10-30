import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { M } from "#/world/scene/construction/materials"

/** The exchange board on the hall's back wall: a cork board pinned with orders (town/boards.ts). */
type Props = {
  root: THREE.Group
  x: number
  z: number
  y0: number
}

export function noticeBoard(props: Props) {
  const gb = new GB()
  gb.box({ side: M.woodDark, top: M.woodDark, x0: props.x - 0.85, y0: props.y0 + 0.9, z0: props.z, x1: props.x + 0.85, y1: props.y0 + 1.95, z1: props.z + 0.06, repeat: 2 })
  gb.box({ side: colorMat(0x9a7a52), top: null, x0: props.x - 0.78, y0: props.y0 + 0.97, z0: props.z + 0.06, x1: props.x + 0.78, y1: props.y0 + 1.88, z1: props.z + 0.07, repeat: 1 })
  const paper = [colorMat(0xece4d0), colorMat(0xd8d0bc), colorMat(0xf2ead8)]
  for (const k = { value: 0 }; k.value < 9; k.value++) {
    const px = props.x - 0.62 + (k.value % 3) * 0.5 + ((k.value * 37) % 7) * 0.02,
      py = props.y0 + 1.05 + Math.floor(k.value / 3) * 0.27
    gb.box({ side: paper[k.value % 3], top: null, x0: px, y0: py, z0: props.z + 0.07, x1: px + 0.28, y1: py + 0.2, z1: props.z + 0.075, repeat: 1 })
  }
  props.root.add(gb.build())
}
