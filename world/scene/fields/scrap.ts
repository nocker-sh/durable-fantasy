import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import type { Spot } from "#/world/scene/fields/instancing"
import { instanced } from "#/world/scene/fields/instancing"

const plateGeo = new THREE.BoxGeometry(0.55, 0.05, 0.36)
const pipeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6).rotateZ(Math.PI / 2)
const boltGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 6)

/**
 * The small iron of the war lying in the grass: torn plate, lengths of pipe, wheels and bolts
 * off the engines, all rusted and half sunk. Thin things, drawn only.
 */
export function scrap(root: THREE.Group, spots: Spot[]) {
  instanced({
    root: root,
    geo: plateGeo,
    material: ruinMats.rust,
    spots: spots.filter((_, i) => i % 3 === 0),
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.04, s.z],
      [Math.sin(s.r * 3) * 0.3, s.r, Math.cos(s.r * 5) * 0.25],
      [s.s, 1, s.s],
    ],
  })
  instanced({
    root: root,
    geo: pipeGeo,
    material: ruinMats.rustDark,
    spots: spots.filter((_, i) => i % 3 === 1),
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.05, s.z],
      [0, s.r, Math.sin(s.r * 3) * 0.2],
      [s.s, s.s, s.s],
    ],
  })
  instanced({
    root: root,
    geo: boltGeo,
    material: ruinMats.rust,
    spots: spots.filter((_, i) => i % 3 === 2),
    place: (s) => [
      [s.x, groundH(s.x, s.z) + 0.03, s.z],
      [Math.sin(s.r * 4) * 0.4, s.r, 0.2],
      [s.s, s.s, s.s],
    ],
  })
}
