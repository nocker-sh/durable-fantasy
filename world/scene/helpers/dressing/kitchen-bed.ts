import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const BED_CROPS = ["cabbage", "turnip", "onion", "carrot"] as const

const bedEarth = colorMat(0x4a3428)

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { heap } from "#/world/scene/heap"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { blockRect } from "#/world/scene/block-rect"
import { groundH } from "#/world/scene/ground-h"

/** A raised bed of earth in a plank frame, with a few rows of greens: the household's own vegetables. */
type Props = {
  gb: GB
  root: THREE.Group
  x: number
  z: number
  alongX: boolean
  seed: number
}

export function kitchenBed(props: Props) {
  const hwState = props.alongX ? [0.7, 0.38] : [0.38, 0.7],
    hw = hwState[0],
    hd = hwState[1]
  const y = groundH(props.x, props.z)
  const top = y + 0.14
  props.gb.box({ side: bedEarth, top: bedEarth, x0: props.x - hw, y0: y - 0.05, z0: props.z - hd, x1: props.x + hw, y1: top, z1: props.z + hd, repeat: 1 })
  // the plank frame round it
  for (const entry of [
    [props.x - hw - 0.04, props.z - hd - 0.04, props.x + hw + 0.04, props.z - hd],
    [props.x - hw - 0.04, props.z + hd, props.x + hw + 0.04, props.z + hd + 0.04],
    [props.x - hw - 0.04, props.z - hd, props.x - hw, props.z + hd],
    [props.x + hw, props.z - hd, props.x + hw + 0.04, props.z + hd],
  ]) {
    const ax = entry[0]
    const az = entry[1]
    const bx = entry[2]
    const bz = entry[3]
    props.gb.box({ side: M.wood, top: M.woodDark, x0: ax, y0: y - 0.05, z0: az, x1: bx, y1: top + 0.03, z1: bz, repeat: 1 })
  }
  const kind = BED_CROPS[props.seed % BED_CROPS.length]
  const r = new Rng(props.seed)
  const looks = [0, 1, 2].map((i) => {
    const b = new PixBuf(18, 16)
    b.blit({ source: heap({ kind: kind, w: 18, h: 14, seed: props.seed + i }), x: 0, y: 2 })
    return b
  })
  // two rows along the bed, a gap here and there where something was pulled
  for (const row of [-0.5, 0.5])
    for (const t = { value: -0.55 }; t.value <= 0.56; t.value += 0.37) {
      if (r.next() < 0.2) continue
      const pxState = props.alongX ? [props.x + t.value, props.z + row * hd] : [props.x + row * hw, props.z + t.value],
        px = pxState[0],
        pz = pxState[1]
      addSprite({ root: props.root, b: looks[r.int(3)], x: px, y: top - 0.02, z: pz, ppu: 48 })
    }
  blockRect({ x0: props.x - hw - 0.05, z0: props.z - hd - 0.05, x1: props.x + hw + 0.05, z1: props.z + hd + 0.05 })
}
