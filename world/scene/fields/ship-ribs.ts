import * as THREE from "three"
import { hash2 } from "#/lib/engine/hash2"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { stand } from "#/world/scene/fields/stand"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
}

/**
 * The bones of a ship the sea put on the shore long ago: the keel in the sand, the stem still
 * raked up at the bow, the ribs standing in pairs where the planking has gone, a few strakes left
 * low on one side. It lies heeled over, half buried.
 */
export function shipRibs(props: Props) {
  const here = stand(props.root, [props.x, props.z], props.rot)
  const hull = new THREE.Group()
  hull.position.set(0, -0.2, 0)
  hull.rotation.set(0, 0, 0.17, "YXZ")
  here.group.add(hull)
  const wood = ruinMats.greyWood
  const timber = (at: readonly [number, number, number], turn: readonly [number, number, number], len: number, thick: number) =>
    piece({
      root: hull,
      at: at,
      turn: turn,
      build: (gb) => gb.box({ side: wood, top: wood, x0: -thick, y0: 0, z0: -thick, x1: thick, y1: len, z1: thick, repeat: 1, bottom: true }),
    })
  piece({
    root: hull,
    at: [0, 0, 0],
    build: (gb) => gb.box({ side: wood, top: wood, x0: -0.15, y0: 0, z0: -3.6, x1: 0.15, y1: 0.32, z1: 3.2, repeat: 1 }),
  })
  timber([0, 0.2, 3.1], [0.5, 0, 0], 2.6, 0.13)
  timber([0, 0.2, -3.5], [-0.28, 0, 0], 1.7, 0.12)
  for (let k = 0; k < 8; k++) {
    const z = -3.0 + k * 0.85
    const beam = 0.5 + 0.85 * Math.sin(((k + 1) / 9) * Math.PI)
    for (const side of [-1, 1]) {
      // how much of this rib is left: the weather side has lost more
      const left = hash2(k, side + 3, 77) < (side > 0 ? 0.3 : 0.12) ? 1 : hash2(k, side + 5, 78) < 0.35 ? 2 : 3
      const p0: [number, number] = [side * 0.14, 0.22]
      timber([p0[0], p0[1], z], [0, 0, -side * 1.25], beam, 0.075)
      const p1: [number, number] = [p0[0] + side * Math.sin(1.25) * beam, p0[1] + Math.cos(1.25) * beam]
      if (left < 2) continue
      timber([p1[0], p1[1], z], [0, 0, -side * 0.5], 0.9, 0.07)
      const p2: [number, number] = [p1[0] + side * Math.sin(0.5) * 0.9, p1[1] + Math.cos(0.5) * 0.9]
      if (left < 3) continue
      timber([p2[0], p2[1], z], [0, 0, side * 0.06], 0.75, 0.06)
    }
  }
  // strakes still nailed to the ribs low on the lee side
  for (const k of [0, 1])
    piece({
      root: hull,
      at: [-0.75 - k * 0.42, 0.42 + k * 0.33, -0.4],
      turn: [0, 0, 1.0 - k * 0.3],
      build: (gb) => gb.box({ side: wood, top: wood, x0: -0.2, y0: -0.03, z0: -2.2 + k * 0.5, x1: 0.2, y1: 0.03, z1: 2.0 - k * 0.9, repeat: 1, bottom: true }),
    })
  for (const z of [-3, -1.5, 0, 1.5, 3]) here.block(0, z, z === 0 ? 1.3 : 1.0)
}
