import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { sack } from "#/world/scene/construction/sack"
import { crate } from "#/world/scene/construction/crate"
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
 * A carter's cart that lost a wheel on the road and was left: down on one side, a shaft snapped,
 * the wheel flat in the grass where it rolled, and what it carried tipped out beside it
 * (landscape.md「歩いて楽しい、とは」: 倒れた荷車と散らばった籠).
 */
export function brokenCart(props: Props) {
  const here = stand(props.root, [props.x, props.z], props.rot)
  const bed = new THREE.Group()
  bed.position.set(0, 0.4, 0)
  bed.rotation.set(0.04, 0, 0.3, "YXZ")
  here.group.add(bed)
  piece({
    root: bed,
    at: [0, 0, 0],
    build: (gb) => {
      gb.box({ side: M.wood, top: M.wood, x0: -0.6, y0: 0, z0: -0.9, x1: 0.6, y1: 0.12, z1: 0.9, repeat: 2, bottom: true })
      gb.box({ side: M.woodV, top: M.woodDark, x0: 0.56, y0: 0.12, z0: -0.9, x1: 0.64, y1: 0.42, z1: 0.9, repeat: 2 })
      // the low side stove in when it went over
      gb.box({ side: M.woodV, top: M.woodDark, x0: -0.64, y0: 0.12, z0: -0.9, x1: -0.56, y1: 0.36, z1: -0.1, repeat: 2 })
      gb.box({ side: M.woodV, top: M.woodDark, x0: -0.6, y0: 0.12, z0: 0.86, x1: 0.6, y1: 0.4, z1: 0.94, repeat: 2 })
      gb.box({ side: M.woodDark, top: M.woodDark, x0: 0.21, y0: 0, z0: -2.0, x1: 0.29, y1: 0.08, z1: -0.9, repeat: 2 })
      gb.box({ side: M.woodDark, top: M.woodDark, x0: -0.29, y0: 0, z0: -1.3, x1: -0.21, y1: 0.08, z1: -0.9, repeat: 2 })
    },
  })
  drum({ root: bed, at: [0.7, -0.12, 0.1], turn: [0, 0, Math.PI / 2], radius: 0.48, length: 0.08, material: M.woodDark, segments: 12 })
  drum({ root: bed, at: [0.7, -0.12, 0.1], turn: [0, 0, Math.PI / 2], radius: 0.1, length: 0.16, material: ruinMats.rustDark, segments: 7 })
  // the wheel that came off, and the end of the shaft that broke
  drum({ root: here.group, at: [-1.5, 0.06, 0.7], turn: [0.06, 0, 0.07], radius: 0.48, length: 0.08, material: M.woodDark, segments: 12 })
  drum({ root: here.group, at: [-1.5, 0.09, 0.7], turn: [0.06, 0, 0.07], radius: 0.1, length: 0.14, material: ruinMats.rustDark, segments: 7 })
  piece({
    root: here.group,
    at: [-0.5, 0.05, -1.8],
    turn: [0, 0.5, 0],
    build: (gb) => gb.box({ side: M.woodDark, top: M.woodDark, x0: -0.04, y0: 0, z0: -0.4, x1: 0.04, y1: 0.08, z1: 0.4, repeat: 2 }),
  })
  // the load, tipped out on the low side; these are set down in the world's own coordinates
  const c = Math.cos(props.rot),
    s = Math.sin(props.rot)
  const out = (lx: number, lz: number): [number, number] => [props.x + lx * c + lz * s, props.z - lx * s + lz * c]
  const gb = new GB()
  const a = out(-1.1, -0.3),
    b = out(-1.5, -0.6),
    d = out(-0.9, -0.9)
  sack({ gb: gb, x: a[0], z: a[1] })
  sack({ gb: gb, x: b[0], z: b[1] })
  crate({ gb: gb, x: d[0], z: d[1], s: 0.42, rot: props.rot + 0.5 })
  props.root.add(gb.build())
  here.block(0, 0, 0.95)
  here.block(-1.2, -0.5, 0.5)
}
