import * as THREE from "three"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { RAMPS } from "#/world/scene/pix"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { addSprite } from "#/world/scene/construction/add-sprite"

type Props = {
  root: THREE.Group
  x: number
  z: number
  s?: number
  kind?: "leaf" | "leaf2"
  flowers?: boolean
}

export function bush(props: Props) {
  const s = props.s === undefined ? 0.5 : props.s
  const kind = props.kind === undefined ? "leaf2" : props.kind
  const flowers = props.flowers === undefined ? false : props.flowers

  const y0 = groundH(props.x, props.z)
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), M[kind])
  m.position.set(props.x, y0 + s * 0.5, props.z)
  m.scale.y = 0.75
  m.rotation.y = props.x * 3
  m.castShadow = true
  m.receiveShadow = true
  props.root.add(m)
  if (flowers) {
    const b = new PixBuf(24, 14)
    const r = new Rng(props.x * 100 + props.z)
    const c = r.pick([RAMPS.cRed[4], RAMPS.cMustard[4], RAMPS.wool[4], RAMPS.cPlum[4]])
    for (const k = { value: 0 }; k.value < 12; k.value++) {
      const px = r.int(22) + 1,
        py = r.int(10) + 2
      b.set({ x: px, y: py, color: c })
      b.set({ x: px + 1, y: py, color: c })
      b.set({ x: px, y: py - 1, color: RAMPS.cMustard[4] })
    }
    addSprite({ root: props.root, b: b, x: props.x, y: y0 + s * 0.65, z: props.z + 0.1 })
  }
  blockCircle(props.x, props.z, s * 0.8)
}
