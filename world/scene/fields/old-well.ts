import type * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"
import { stand } from "#/world/scene/fields/stand"

/**
 * A well of a farm that is gone: the stone ring still sound and dark water far down in it, one
 * post of the windlass standing, the roller and the other post fallen across the rim, the bucket
 * on its side in the grass.
 */
export function oldWell(root: THREE.Group, at: readonly [number, number], rot: number) {
  const here = stand(root, at, rot)
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      gb.cyl({ side: M.stone, top: M.stoneDark, centerX: 0, centerZ: 0, fromY: -0.4, toY: 0.62, fromRadius: 0.8, toRadius: 0.76, segments: 11, repeat: 2 })
      gb.cyl({ side: M.dark, top: M.dark, centerX: 0, centerZ: 0, fromY: 0.6, toY: 0.625, fromRadius: 0.54, toRadius: 0.54, segments: 11, repeat: 1 })
      gb.box({ side: ruinMats.moss, top: ruinMats.moss, x0: 0.2, y0: 0.5, z0: 0.5, x1: 0.75, y1: 0.68, z1: 0.82, repeat: 2 })
      gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -0.98, y0: -0.2, z0: -0.07, x1: -0.84, y1: 1.95, z1: 0.07, repeat: 1 })
      gb.box({ side: ruinMats.greyWood, top: ruinMats.moss, x0: 0.84, y0: -0.2, z0: -0.07, x1: 0.98, y1: 0.55, z1: 0.07, repeat: 1 })
    },
  })
  drum({ root: here.group, at: [0.25, 0.78, 0.35], turn: [Math.PI / 2 - 0.12, 1.0, 0], radius: 0.11, length: 1.9, material: ruinMats.greyWood, segments: 7 })
  piece({
    root: here.group,
    at: [1.5, 0.08, -0.5],
    turn: [0, 0.4, 0.04],
    build: (gb) => gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -0.07, y0: -0.07, z0: -0.75, x1: 0.07, y1: 0.07, z1: 0.75, repeat: 1 }),
  })
  drum({ root: here.group, at: [1.2, 0.17, 0.9], turn: [Math.PI / 2, 0.7, 0], radius: 0.17, radiusTop: 0.2, length: 0.34, material: M.woodDark, segments: 8 })
  here.block(0, 0, 0.95)
}
