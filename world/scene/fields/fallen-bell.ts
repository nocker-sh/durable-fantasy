import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"
import { stand } from "#/world/scene/fields/stand"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
}

/**
 * The bell of a wayside chapel that is no longer there: bronze gone green, on its side where it
 * came down when the frame gave way, one post of the frame still up and the beam lying across the
 * stump of the other.
 */
export function fallenBell(props: Props) {
  const here = stand(props.root, [props.x, props.z], props.rot)
  const bronze = ruinMats.bronze
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      gb.box({ side: M.stoneDark, top: M.stone, x0: -1.3, y0: -0.4, z0: -1.9, x1: 1.3, y1: 0.06, z1: 1.9, repeat: 2 })
      gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -0.6, y0: 0.06, z0: -1.55, x1: -0.36, y1: 2.7, z1: -1.31, repeat: 1 })
      gb.box({ side: ruinMats.greyWood, top: ruinMats.moss, x0: -0.6, y0: 0.06, z0: 1.31, x1: -0.36, y1: 0.66, z1: 1.55, repeat: 1 })
    },
  })
  // the beam: one end still in its mortise, the other down on the stump
  piece({
    root: here.group,
    at: [-0.48, 1.55, 0],
    turn: [0.72, 0, 0],
    build: (gb) => gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: -0.11, y0: -0.11, z0: -1.75, x1: 0.11, y1: 0.11, z1: 1.75, repeat: 1, bottom: true }),
  })
  const bell = new THREE.Group()
  bell.position.set(0.35, 0.5, 0.1)
  bell.rotation.set(0, 0.35, 1.22, "YXZ")
  here.group.add(bell)
  piece({
    root: bell,
    at: [0, 0, 0],
    build: (gb) => {
      gb.cyl({ side: bronze, top: null, centerX: 0, centerZ: 0, fromY: -0.62, toY: -0.36, fromRadius: 0.8, toRadius: 0.63, segments: 12, repeat: 2 })
      gb.cyl({ side: bronze, top: null, centerX: 0, centerZ: 0, fromY: -0.36, toY: 0.36, fromRadius: 0.63, toRadius: 0.5, segments: 12, repeat: 2 })
      gb.cyl({ side: bronze, top: bronze, centerX: 0, centerZ: 0, fromY: 0.36, toY: 0.6, fromRadius: 0.5, toRadius: 0.26, segments: 12, repeat: 2 })
      gb.cyl({ side: bronze, top: bronze, centerX: 0, centerZ: 0, fromY: 0.6, toY: 0.8, fromRadius: 0.11, toRadius: 0.11, segments: 6, repeat: 1 })
    },
  })
  // the dark of its mouth, and the clapper lying in it
  drum({ root: bell, at: [0, -0.6, 0], radius: 0.74, length: 0.04, material: M.dark, segments: 12 })
  drum({ root: bell, at: [0.2, -0.72, 0.1], turn: [0.3, 0, 0.4], radius: 0.09, length: 0.5, material: ruinMats.rustDark, segments: 6 })
  here.block(0.35, 0.1, 0.9)
  here.block(-0.48, -1.43, 0.3)
  here.block(-0.48, 1.43, 0.3)
}
