import type * as THREE from "three"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { plainTex } from "#/world/scene/textures/plain-tex"
import { M } from "#/world/scene/construction/materials"
import { piece } from "#/world/scene/fields/piece"
import { stand } from "#/world/scene/fields/stand"

const coat = mat(plainTex({ ramp: "cBlue", light: 0.5, noise: 0.35, seed: 71 }))
const hat = mat(plainTex({ ramp: "leatherD", light: 0.5, noise: 0.3, seed: 72 }))

/**
 * A scarecrow in somebody's old coat and hat, straw at the cuffs, a sack for a head: put up by
 * whoever works the rows beside it, leaning a little more each year.
 */
export function scarecrow(root: THREE.Group, at: readonly [number, number], rot: number) {
  const here = stand(root, at, rot)
  piece({
    root: here.group,
    at: [0, 0, 0],
    turn: [0.05, 0, 0.07],
    build: (gb) => {
      gb.box({ side: M.woodDark, top: M.woodDark, x0: -0.05, y0: -0.3, z0: -0.05, x1: 0.05, y1: 1.4, z1: 0.05, repeat: 1 })
      gb.box({ side: M.woodDark, top: M.woodDark, x0: -0.82, y0: 1.2, z0: -0.04, x1: 0.82, y1: 1.28, z1: 0.04, repeat: 1, bottom: true })
      gb.box({ side: coat, top: coat, x0: -0.27, y0: 0.58, z0: -0.13, x1: 0.27, y1: 1.36, z1: 0.13, repeat: 2, bottom: true })
      for (const s of [-1, 1]) {
        gb.box({ side: coat, top: coat, x0: s > 0 ? 0.27 : -0.7, y0: 1.1, z0: -0.09, x1: s > 0 ? 0.7 : -0.27, y1: 1.36, z1: 0.09, repeat: 2, bottom: true })
        gb.box({ side: M.hay, top: M.hay, x0: s > 0 ? 0.7 : -0.86, y0: 1.08, z0: -0.07, x1: s > 0 ? 0.86 : -0.7, y1: 1.34, z1: 0.07, repeat: 1, bottom: true })
      }
      gb.box({ side: M.hay, top: null, x0: -0.2, y0: 0.42, z0: -0.09, x1: 0.2, y1: 0.58, z1: 0.09, repeat: 1 })
      gb.cyl({ side: M.sack, top: M.sack, centerX: 0, centerZ: 0, fromY: 1.36, toY: 1.72, fromRadius: 0.18, toRadius: 0.16, segments: 7, repeat: 2 })
      gb.cyl({ side: hat, top: hat, centerX: 0, centerZ: 0, fromY: 1.68, toY: 1.73, fromRadius: 0.34, toRadius: 0.34, segments: 9, repeat: 2 })
      gb.cyl({ side: hat, top: hat, centerX: 0, centerZ: 0, fromY: 1.73, toY: 1.98, fromRadius: 0.18, toRadius: 0.14, segments: 8, repeat: 2 })
    },
  })
  here.block(0, 0, 0.3)
}
