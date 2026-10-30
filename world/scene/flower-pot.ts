import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const soil = colorMat(0x3a2a24)

const potMat = colorMat(0x9a5a3a)

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { basket } from "#/world/scene/basket"
import { blockCircle } from "#/world/scene/block-circle"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  gb: GB
  root: THREE.Group
  x: number
  z: number
  seed: number
}

export function flowerPot(props: Props) {
  const y = groundH(props.x, props.z)
  props.gb.cyl({ side: potMat, top: soil, centerX: props.x, centerZ: props.z, fromY: y, toY: y + 0.22, fromRadius: 0.1, toRadius: 0.14, segments: 7, repeat: 1 })
  const g = new THREE.Group()
  g.position.set(props.x, 0, props.z + 0.02)
  props.root.add(g)
  addSprite({ root: g, b: basket({ kind: "herb", seed: props.seed, w: 16, h: 14 }), x: 0, y: y + 0.2, z: 0 })
  blockCircle(props.x, props.z, 0.16)
}
