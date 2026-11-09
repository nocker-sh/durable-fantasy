import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

const TRACE_GOODS: [RegExp, string][] = [
  [/パン/, "bread"],
  [/チーズ/, "cheese"],
  [/薬草|干し|花/, "garlic"],
  [/玉ねぎ/, "onion"],
  [/林檎|果/, "apple"],
  [/魚/, "fish"],
  [/卵/, "egg"],
  [/葡萄/, "grape"],
  [/蕪/, "turnip"],
  [/茶|椀|杯|皿|壺|瓶|鍋/, "jar"],
]
import { INTERIOR_CLOTH as cloth } from "#/world/scene/construction/interior-cloth-materials"

import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"

import { M } from "#/world/scene/construction/materials"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { heap } from "#/world/scene/heap"
import type { Furniture } from "#/world/town/interiors"

type Props = {
  root: THREE.Group
  props: GB
  f: Furniture
  y0: number
  seed: number
  onTable: (x: number, z: number) => number
}

export function trace(props: Props) {
  const name = props.f.name ?? ""
  const good = TRACE_GOODS.find((entry) => {
    const re = entry[0]
    return re.test(name)
  })?.[1]
  const h = /床/.test(name) || /くず|跡|粉|藁|羽根|籾/.test(name) ? 0 : null
  if (h === 0) {
    // scraps and dust on the floor: a few flecks
    const fleck = colorMat(/粉/.test(name) ? 0xe8e0d0 : /藁|籾/.test(name) ? 0xc8a85a : /泥|足跡|灰|煤/.test(name) ? 0x4a3a2a : /鉄/.test(name) ? 0x5a5a62 : 0xb08a5a)
    for (const k = { value: 0 }; k.value < 7; k.value++) {
      const fx = props.f.x + (((props.seed * 13 + k.value * 37) % 100) / 100 - 0.5) * props.f.w * 1.6,
        fz = props.f.z + (((props.seed * 7 + k.value * 53) % 100) / 100 - 0.5) * props.f.d * 1.6
      props.props.box({ side: fleck, top: null, x0: fx - 0.05, y0: props.y0 + 0.002, z0: fz - 0.04, x1: fx + 0.05, y1: props.y0 + 0.01, z1: fz + 0.04, repeat: 1 })
    }
    return
  }
  if (props.f.on === "壁" && props.f.wallMount) {
    props.props.box({
      side: colorMat(0xe8dcc0),
      top: null,
      x0: props.f.x - props.f.w / 2,
      y0: props.y0 + props.f.wallMount.bottom,
      z0: props.f.z - props.f.d / 2,
      x1: props.f.x + props.f.w / 2,
      y1: props.y0 + props.f.wallMount.bottom + props.f.wallMount.height,
      z1: props.f.z + props.f.d / 2,
      repeat: 1,
    })
    return
  }
  const y = props.onTable(props.f.x, props.f.z)
  if (/火鉢/.test(name)) {
    props.props.cyl({
      side: M.iron,
      top: M.ashlar,
      centerX: props.f.x,
      centerZ: props.f.z,
      fromY: y,
      toY: y + 0.08,
      fromRadius: Math.min(props.f.w, props.f.d) * 0.45,
      toRadius: undefined,
      segments: 10,
    })
    return
  }
  if (good) {
    const g = new THREE.Group()
    g.position.set(props.f.x, 0, props.f.z)
    props.root.add(g)
    addSprite({ root: g, b: heap({ kind: good, w: 14, h: 10, seed: props.seed }), x: 0, y: y, z: 0 })
    return
  }
  // cloth, leather, paper and tools: a small slab in a colour of its own
  const c = /外套|前掛け|膝掛け|手袋|首巻き|布|靴下|長靴|帽子/.test(name)
    ? cloth[props.seed % cloth.length]
    : /帳|書|札|紙|地図|暦|本|議事録|記録/.test(name)
      ? colorMat(0xe8dcc0)
      : /斧|鋏|鉄|兜|蹄鉄|鍵|鎌|蝶番/.test(name)
        ? M.iron
        : M.woodV
  const tall = /外套|前掛け|靴下|網|紐|束/.test(name) && y > props.y0 + 0.9 ? 0.45 : 0.08
  props.props.box({ side: c, top: c, x0: props.f.x - props.f.w / 2, y0: y, z0: props.f.z - props.f.d / 2, x1: props.f.x + props.f.w / 2, y1: y + tall, z1: props.f.z + props.f.d / 2, repeat: 1 })
}
