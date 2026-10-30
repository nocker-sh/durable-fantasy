import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const SHELF_GOODS: Record<string, string[]> = {
  bakery: ["bread", "bread", "cheese"],
  inn: ["jar", "bread", "cheese"],
  tavern: ["jar", "grape", "sausage"],
  apothecary: ["jar", "jar", "garlic"],
  general: ["jar", "onion", "clay"],
  crystal: ["jar", "jar", "clay"],
  buyer: ["fish", "clay", "egg"],
}

const bottle = [colorMat(0x3a6a5a), colorMat(0x6a3a2a), colorMat(0x8aa8b0), colorMat(0x5a4a7a)]

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { basket } from "#/world/scene/basket"
import type { Furniture } from "#/world/town/interiors"
import { topOf } from "#/world/scene/construction/top-of"
import { COUNTER_H } from "#/world/scene/interior"

/** What the shop sets out on its counter: bottles in a row, a basket of its goods. */
type Props = {
  root: THREE.Group
  f: Furniture
  y0: number
  shop: string | undefined
  seed: number
}

export function counterGoods(props: Props) {
  const xSource = props.f,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w
  const top = props.y0 + (topOf(props.f.name ?? "") ?? COUNTER_H)
  if (props.shop === "apothecary" || props.shop === "crystal" || props.shop === "tavern" || props.shop === "inn") {
    const gb = new GB()
    for (const k = { value: 0 }; k.value < 4; k.value++) {
      const bx = x - w / 2 + 0.3 + k.value * 0.22
      gb.cyl({ side: bottle[(k.value + props.seed) % bottle.length], top: null, centerX: bx, centerZ: z, fromY: top, toY: top + 0.2, fromRadius: 0.05, toRadius: 0.05, segments: 6, repeat: 1 })
    }
    props.root.add(gb.build())
  }
  const g = new THREE.Group()
  g.position.set(x + w / 2 - 0.4, 0, z + 0.1)
  props.root.add(g)
  const goods = SHELF_GOODS[props.shop ?? ""]
  if (goods) addSprite({ root: g, b: basket({ kind: goods[props.seed % goods.length], seed: props.seed, w: 26, h: 22 }), x: 0, y: top, z: 0 })
}
