import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { barrel } from "#/world/scene/construction/barrel"
import { bench } from "#/world/scene/construction/bench"
import { crate } from "#/world/scene/construction/crate"
import { sack } from "#/world/scene/construction/sack"
import { lantern } from "#/world/scene/construction/lantern"
import { groundH } from "#/world/scene/ground-h"

/**
 * The alley behind the shopping street's north row. Empty bottles wait behind the tavern
 * for the brewery, herbs grow
 * in pots behind the apothecary, a rain barrel stands under each eave.
 */
export function backAlley(root: THREE.Group) {
  const gb = new GB()
  // behind the tavern: crates of empty bottles going back to the brewery, a spare barrel
  crate({ gb: gb, x: 4.4, z: 15.0, s: 0.5 })
  crate({ gb: gb, x: 4.4, z: 15.0, s: 0.4, y: groundH(4.4, 15.0) + 0.4 })
  barrel({ gb: gb, x: 6.6, z: 14.9, h: 0.6, r: 0.26 })
  // rain barrels under the eaves
  for (const x of [11.2, 16.4, 33.0, 36.8, 41.4]) barrel({ gb: gb, x: x, z: 17.0, h: 0.55, r: 0.24 })
  // behind the general store: sacks waiting to be shelved
  sack({ gb: gb, x: 17.8, z: 15.0 })
  sack({ gb: gb, x: 18.2, z: 15.2 })
  crate({ gb: gb, x: 18.9, z: 14.9, s: 0.45 })
  // behind the crystal shop: a locked chest, nothing else
  crate({ gb: gb, x: 35.6, z: 15.0, s: 0.55 })
  bench({ gb: gb, x: 23.0, z: 14.7, w: 1.0, alongX: true })
  root.add(gb.build())
  lantern(root, 12.8, 15.0)
  lantern(root, 27.0, 15.0)
  lantern(root, 39.2, 15.0)
}
