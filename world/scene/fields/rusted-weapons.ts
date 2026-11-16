import * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { groundH } from "#/world/scene/ground-h"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"

const helmGeo = new THREE.SphereGeometry(0.19, 7, 4, 0, Math.PI * 2, 0, Math.PI / 2)

/**
 * Where a fight ended: blades and spears standing in the ground where they were driven or dropped,
 * a shield in the grass, a helm left on a hilt. Thin things, drawn only; one walks between them.
 */
export function rustedWeapons(root: THREE.Group, at: readonly [number, number], seed: number) {
  const r = new Rng(seed)
  for (let k = 0; k < 10; k++) {
    const a = r.next() * Math.PI * 2,
      d = 0.3 + r.next() * 2.6
    const x = at[0] + Math.cos(a) * d,
      z = at[1] + Math.sin(a) * d
    const y = groundH(x, z)
    const turn: readonly [number, number, number] = [(r.next() - 0.5) * 0.8, r.next() * Math.PI, (r.next() - 0.5) * 0.8]
    if (k % 3 === 2)
      piece({
        root: root,
        at: [x, y, z],
        turn: turn,
        build: (gb) => {
          gb.box({ side: ruinMats.greyWood, top: null, x0: -0.035, y0: -0.2, z0: -0.035, x1: 0.035, y1: 1.7, z1: 0.035, repeat: 1 })
          gb.box({ side: ruinMats.rust, top: ruinMats.rust, x0: -0.07, y0: 1.7, z0: -0.03, x1: 0.07, y1: 2.0, z1: 0.03, repeat: 1 })
        },
      })
    else
      piece({
        root: root,
        at: [x, y, z],
        turn: turn,
        build: (gb) => {
          gb.box({ side: ruinMats.rust, top: null, x0: -0.06, y0: -0.2, z0: -0.025, x1: 0.06, y1: 0.72, z1: 0.025, repeat: 1 })
          gb.box({ side: ruinMats.rustDark, top: ruinMats.rustDark, x0: -0.2, y0: 0.72, z0: -0.04, x1: 0.2, y1: 0.79, z1: 0.04, repeat: 1, bottom: true })
          gb.box({ side: ruinMats.greyWood, top: ruinMats.rustDark, x0: -0.035, y0: 0.79, z0: -0.035, x1: 0.035, y1: 1.02, z1: 0.035, repeat: 1 })
        },
      })
    if (k === 0) {
      // a helm hung on the first hilt
      const helm = new THREE.Mesh(helmGeo, ruinMats.rustDark)
      const lean = new THREE.Euler(turn[0], turn[1], turn[2], "YXZ")
      helm.position.copy(new THREE.Vector3(0, 0.98, 0).applyEuler(lean)).add(new THREE.Vector3(x, y, z))
      helm.rotation.copy(lean)
      helm.castShadow = true
      root.add(helm)
    }
  }
  for (const k of [0, 1]) {
    const x = at[0] + (k ? -1.2 : 0.9),
      z = at[1] + (k ? 0.7 : -0.5)
    drum({ root: root, at: [x, groundH(x, z) + 0.07, z], turn: [0.3 - k * 0.5, k, 0.12], radius: 0.42, length: 0.07, material: k ? ruinMats.rust : ruinMats.rustDark, segments: 10 })
    drum({ root: root, at: [x, groundH(x, z) + 0.11, z], turn: [0.3 - k * 0.5, k, 0.12], radius: 0.12, length: 0.1, material: k ? ruinMats.rustDark : ruinMats.rust, segments: 7 })
  }
}
