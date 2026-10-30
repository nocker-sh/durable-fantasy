import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { HOUSES } from "#/world/town/houses"
import { dress } from "#/world/scene/helpers/dressing/dress"
import { shopBoards, placed } from "#/world/scene/dressing"
import { shopBoard } from "#/world/scene/helpers/dressing/shop-board"
import { shopFront } from "#/world/scene/helpers/dressing/shop-front"
import { dressStreets } from "#/world/scene/helpers/dressing/dress-streets"

/** Dress every house on a map. Call after everything else is placed, so it fits round them. */
export function dressHouses(root: THREE.Group, map: string) {
  const gb = new GB()
  placed.length = 0
  shopBoards.length = 0
  for (const h of HOUSES)
    if (h.map === map) {
      dress(root, gb, h)
      shopBoard(root, h)
      shopFront(root, gb, h)
    }
  dressStreets(gb, map)
  ;(globalThis as { __dressed?: string[] }).__dressed = [...placed]
  root.add(gb.build())
}
