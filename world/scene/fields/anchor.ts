import * as THREE from "three"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"
import { stand } from "#/world/scene/fields/stand"

/**
 * A ship's anchor on the shore, taller than a man, one fluke in the sand: too heavy for anyone to
 * have carried off, so it has stayed where the ship that dropped it left it.
 */
export function anchor(root: THREE.Group, at: readonly [number, number], rot: number) {
  const here = stand(root, at, rot)
  const tilted = new THREE.Group()
  tilted.position.set(0, 0.15, 0)
  tilted.rotation.set(0.12, 0, 0.5, "YXZ")
  here.group.add(tilted)
  piece({
    root: tilted,
    at: [0, 0, 0],
    build: (gb) => {
      gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: -0.09, y0: 0, z0: -0.09, x1: 0.09, y1: 2.4, z1: 0.09, repeat: 2, bottom: true })
      gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -0.08, y0: 2.0, z0: -0.85, x1: 0.08, y1: 2.14, z1: 0.85, repeat: 1, bottom: true })
    },
  })
  drum({ root: tilted, at: [0, 2.55, 0], turn: [Math.PI / 2, 0, 0], radius: 0.22, length: 0.07, material: ruinMats.rustDark, segments: 9 })
  for (const s of [-1, 1]) {
    piece({
      root: tilted,
      at: [0, 0.08, 0],
      turn: [0, 0, s * 1.05],
      build: (gb) => {
        gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: -0.09, y0: 0, z0: -0.08, x1: 0.09, y1: 0.95, z1: 0.08, repeat: 2, bottom: true })
        gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.05, y0: 0.7, z0: -0.24, x1: 0.05, y1: 1.15, z1: 0.24, repeat: 2, bottom: true })
      },
    })
  }
  here.block(0, 0, 0.5)
  here.block(-0.9, 0, 0.35)
}
