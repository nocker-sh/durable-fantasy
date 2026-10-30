import type * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { groundH } from "#/world/scene/ground-h"
import { WATER_Y } from "#/world/scene/world"
import { currentLayout } from "#/world/scene/current-layout"
import { M } from "#/world/scene/construction/materials"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { bucket } from "#/world/scene/construction/bucket"
import { stair } from "#/world/scene/construction/helpers/fences/stair"
import { places } from "#/world/scene/construction/registry"
import { laundryBasket } from "#/world/scene/construction/helpers/waterworks/laundry-basket"

export function lavoir(root: THREE.Group) {
  const L = currentLayout().lavoir
  const gb = new GB()
  const y = L.h
  // washing slabs sloping into the water
  for (const z = { value: L.z0 + 0.3 }; z.value < L.z1 - 0.2; z.value += 0.85) {
    const xe = L.x1 + 0.05
    gb.quad({
      material: M.ashlar,
      a: [xe - 0.1, y + 0.12, z.value + 0.35],
      b: [xe + 0.35, WATER_Y + 0.02, z.value + 0.35],
      c: [xe + 0.35, WATER_Y + 0.02, z.value - 0.35],
      d: [xe - 0.1, y + 0.12, z.value - 0.35],
      repeatU: 4,
      repeatV: 4,
    })
    gb.box({ side: M.ashlar, top: null, x0: xe - 0.4, y0: y - 0.02, z0: z.value - 0.35, x1: xe - 0.1, y1: y + 0.12, z1: z.value + 0.35, repeat: 4 })
  }
  // shed roof on posts, sloping toward the river
  const gy = groundH(L.x0 - 0.3, (L.z0 + L.z1) / 2)
  for (const z of [L.z0 + 0.1, (L.z0 + L.z1) / 2, L.z1 - 0.1]) {
    gb.box({ side: M.woodV, top: M.woodDark, x0: L.x1 + 0.02, y0: y, z0: z - 0.07, x1: L.x1 + 0.16, y1: gy + 1.5, z1: z + 0.07, repeat: 2 })
  }
  const yA = gy + 2.0,
    yB = gy + 1.45
  gb.quad({ material: M.roof2, a: [L.x0 - 0.6, yA, L.z1 + 0.3], b: [L.x1 + 0.6, yB, L.z1 + 0.3], c: [L.x1 + 0.6, yB, L.z0 - 0.3], d: [L.x0 - 0.6, yA, L.z0 - 0.3], repeatU: 4, repeatV: 4 })
  gb.box({ side: M.woodDark, top: M.woodDark, x0: L.x1 + 0.02, y0: yB - 0.12, z0: L.z0 - 0.2, x1: L.x1 + 0.16, y1: yB, z1: L.z1 + 0.2, repeat: 2 })
  root.add(gb.build())
  // laundry baskets & washboards on the ledge
  addSprite({ root: root, b: laundryBasket(1), x: L.x0 + 0.35, y: y, z: L.z0 + 0.6 })
  addSprite({ root: root, b: laundryBasket(2), x: L.x0 + 0.35, y: y, z: L.z1 - 0.9 })
  const g2 = new GB()
  bucket({ gb: g2, x: L.x0 + 0.3, z: L.z0 + 1.6, y: y, water: true })
  root.add(g2.build())
  stair({
    root: root,
    x0: currentLayout().lavStairs.x0,
    x1: currentLayout().lavStairs.x1,
    zTop: currentLayout().lavStairs.z0,
    zBot: currentLayout().lavStairs.z1,
    yTop: L.h,
    yBot: groundH((currentLayout().lavStairs.x0 + currentLayout().lavStairs.x1) / 2, currentLayout().lavStairs.z1 + 0.1),
    n: 6,
    m: M.stone,
  })
  places.lavoir1 = [L.x1 - 0.35, L.z0 + 0.7]
  places.lavoir2 = [L.x1 - 0.35, L.z0 + 2.2]
  places.lavoir3 = [L.x1 - 0.35, L.z1 - 0.5]
}
