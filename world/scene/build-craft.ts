import { CRAFT_YARD } from "#/world/town/craft-yard"
import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { table } from "#/world/scene/construction/table"
import { well } from "#/world/scene/construction/well"
import { woodpile } from "#/world/scene/construction/woodpile"
import { cart } from "#/world/scene/construction/cart"
import { haystack } from "#/world/scene/construction/haystack"
import { forge } from "#/world/scene/construction/forge"
import { anvil } from "#/world/scene/construction/anvil"
import { lantern } from "#/world/scene/construction/lantern"
import { places } from "#/world/scene/construction/registry"
import { buildHouses } from "#/world/scene/construction/build-houses"
import { forestRing } from "#/world/scene/helpers/districts/forest-ring"
import { shrubs } from "#/world/scene/helpers/districts/shrubs"

/** Workshops along an east–west lane, yards behind them. */
export function buildCraft(root: THREE.Group) {
  buildHouses(root, "phanthiet-craft")
  // the lane's own well: quenching at the forge and the tanner's vats need water
  well(root, 24.5, 30.5)
  // yards: a second forge, timber, hides drying
  forge(root, ...CRAFT_YARD.forge)
  const gb = new GB()
  anvil(gb, ...CRAFT_YARD.anvil)
  woodpile({ gb, x: CRAFT_YARD.firewood.centre[0], z: CRAFT_YARD.firewood.centre[1], len: CRAFT_YARD.firewood.width, layers: CRAFT_YARD.firewood.layers, alongX: CRAFT_YARD.firewood.alongX })
  woodpile({ gb: gb, x: 11.4, z: 18.6, len: 1.4, layers: 3, alongX: false })
  barrel({ gb: gb, x: 18.8, z: 26.2, h: 0.55, r: 0.3 })
  crate({ gb: gb, x: 25.4, z: 25.6 })
  crate({ gb: gb, x: 26.2, z: 25.8, s: 0.4 })
  table({ gb: gb, x: 27.2, z: 26.6, w: 1.2, d: 0.6 })
  sack({ gb: gb, x: 28.4, z: 27.6 })
  root.add(gb.build())
  cart({ root: root, x: 22.4, z: 26.4, rot: 0.6, load: "barrels" })
  haystack({ root: root, x: 36.4, z: 31.6, s: 0.8 })
  for (const x of [4, 12, 22, 30, 38]) lantern(root, x, 21.8)
  shrubs(
    root,
    [
      [11.6, 24.8],
      [22.6, 21.4],
      [36, 24.4],
      [5.4, 24.6],
    ],
    9,
  )
  forestRing(root, 81)

  places.armorer = [8.3, 22.4]
  places.woodworker = [15, 22.4]
  places.leatherworker = [27.2, 22.2]
  places.craftForge = [16.6, 27.4]
}
