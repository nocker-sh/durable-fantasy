import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { updaters } from "#/world/scene/construction/registry"
import { piece } from "#/world/scene/fields/piece"
import { stand } from "#/world/scene/fields/stand"

type Props = {
  root: THREE.Group
  /** the tree it hangs from */
  x: number
  z: number
  rot: number
}

/**
 * A swing the town's children hung from a bough of the lone tree: two ropes and a plank, moving a
 * little in the wind when nobody is on it.
 */
export function ropeSwing(props: Props) {
  const here = stand(props.root, [props.x, props.z], props.rot)
  piece({
    root: here.group,
    at: [0, 2.35, 0],
    turn: [0, 0, 0.06],
    build: (gb) => gb.box({ side: M.woodDark, top: M.woodDark, x0: 0, y0: -0.1, z0: -0.1, x1: 2.3, y1: 0.1, z1: 0.1, repeat: 2, bottom: true }),
  })
  const swing = new THREE.Group()
  swing.position.set(1.8, 2.4, 0)
  here.group.add(swing)
  piece({
    root: swing,
    at: [0, 0, 0],
    build: (gb) => {
      for (const s of [-1, 1]) gb.box({ side: M.rope, top: null, x0: -0.025, y0: -1.82, z0: s * 0.24 - 0.025, x1: 0.025, y1: 0, z1: s * 0.24 + 0.025, repeat: 1 })
      gb.box({ side: M.wood, top: M.wood, x0: -0.13, y0: -1.88, z0: -0.32, x1: 0.13, y1: -1.81, z1: 0.32, repeat: 2, bottom: true })
    },
  })
  updaters.push((t) => {
    swing.rotation.z = Math.sin(t * 1.3) * 0.14 + Math.sin(t * 0.47) * 0.06
  })
}
