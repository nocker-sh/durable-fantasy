import type * as THREE from "three"
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

/** How much bigger than the drawing below the beast was. */
const SIZE = 1.2

/**
 * The skeleton of one of the war's living weapons (world.md「魔物」: 大戦のころの個体はもういない),
 * lying where it died: the spine held up on its ribs, the neck and tail gone down into the sand,
 * the long skull at rest. The ribs arch high enough to walk in under them.
 */
export function beastBones(props: Props) {
  const here = stand(props.root, [props.x, props.z], props.rot)
  here.group.scale.setScalar(SIZE)
  const bone = ruinMats.bone
  // the spine: level over the ribs, dipping to the skull in front and into the sand behind
  for (let k = 0; k < 12; k++) {
    const z = 4.2 - k * 0.72
    const y = z > 2.6 ? 1.25 - (z - 2.6) * 0.55 : z < -2.2 ? 1.25 + (z + 2.2) * 0.5 : 1.25
    if (y < -0.1) continue
    const s = z < -2.2 ? 0.75 : 1
    piece({
      root: here.group,
      at: [0, y, z],
      turn: [z > 2.6 ? 0.5 : z < -2.2 ? -0.45 : 0, 0, 0],
      build: (gb) => {
        gb.box({ side: bone, top: bone, x0: -0.17 * s, y0: -0.15 * s, z0: -0.28, x1: 0.17 * s, y1: 0.15 * s, z1: 0.28, repeat: 2, bottom: true })
        gb.box({ side: bone, top: bone, x0: -0.05, y0: 0.15 * s, z0: -0.12, x1: 0.05, y1: 0.15 * s + 0.3 * s, z1: 0.1, repeat: 2 })
      },
    })
  }
  // the ribs: out from the spine, over, and down into the sand
  const rib = (at: readonly [number, number, number], lean: number, len: number, thick: number) =>
    piece({
      root: here.group,
      at: at,
      turn: [0, 0, -lean],
      build: (gb) => gb.box({ side: bone, top: bone, x0: -thick, y0: 0, z0: -thick, x1: thick, y1: len, z1: thick, repeat: 2, bottom: true }),
    })
  for (let k = 0; k < 7; k++) {
    const z = 2.3 - k * 0.72
    const size = 0.72 + 0.28 * Math.sin(((k + 0.6) / 7.2) * Math.PI)
    for (const side of [-1, 1]) {
      const broken = (k === 2 && side > 0) || (k === 5 && side < 0)
      const p0: [number, number] = [side * 0.15, 1.2]
      rib([p0[0], p0[1], z], side * 1.2, 0.95 * size, 0.085)
      const p1: [number, number] = [p0[0] + side * Math.sin(1.2) * 0.95 * size, p0[1] + Math.cos(1.2) * 0.95 * size]
      rib([p1[0], p1[1], z], side * 2.1, 0.95 * size, 0.075)
      if (broken) continue
      const p2: [number, number] = [p1[0] + side * Math.sin(2.1) * 0.95 * size, p1[1] + Math.cos(2.1) * 0.95 * size]
      rib([p2[0], p2[1], z], side * 2.95, 1.0 * size + 0.3, 0.06)
      here.block((p2[0] + side * 0.15) * SIZE, z * SIZE, 0.28)
    }
  }
  // the skull, its jaw fallen open beside it
  piece({
    root: here.group,
    at: [0, 0.3, 5.2],
    turn: [0.12, 0.1, 0.06],
    build: (gb) => {
      gb.box({ side: bone, top: bone, x0: -0.52, y0: -0.3, z0: -0.8, x1: 0.52, y1: 0.42, z1: 0.3, repeat: 2 })
      gb.box({ side: bone, top: bone, x0: -0.34, y0: -0.3, z0: 0.3, x1: 0.34, y1: 0.22, z1: 1.5, repeat: 2 })
      for (const s of [-1, 1]) {
        gb.box({ side: M.dark, top: null, x0: s * 0.52 - 0.02, y0: 0.02, z0: -0.35, x1: s * 0.52 + 0.02, y1: 0.28, z1: 0.0, repeat: 1 })
        gb.box({ side: M.dark, top: M.dark, x0: s * 0.2 - 0.07, y0: 0.2, z0: 1.25, x1: s * 0.2 + 0.07, y1: 0.235, z1: 1.42, repeat: 1 })
      }
    },
  })
  for (const s of [-1, 1]) drum({ root: here.group, at: [s * 0.5, 0.95, 4.5], turn: [-0.7, 0, -s * 0.5], radius: 0.13, radiusTop: 0.04, length: 0.9, material: bone, segments: 6 })
  piece({
    root: here.group,
    at: [0.9, 0.08, 5.9],
    turn: [0, 0.5, 0.05],
    build: (gb) => gb.box({ side: bone, top: bone, x0: -0.26, y0: -0.08, z0: -0.7, x1: 0.26, y1: 0.1, z1: 0.7, repeat: 2 }),
  })
  here.block(0, 5.2 * SIZE, 0.9)
  here.block(0, 6.1 * SIZE, 0.6)
}
