import * as THREE from "three"
import { pixSprite } from "#/world/scene/gfx"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { GPPU } from "#/world/scene/goods"

type Props = {
  root: THREE.Object3D
  b: PixBuf
  x: number
  y: number
  z: number
  ppu?: number
}

export function addSprite(props: Props) {
  const ppu = props.ppu === undefined ? GPPU : props.ppu

  const s = pixSprite(props.b, ppu)
  s.position.set(props.x, props.y, props.z)
  props.root.add(s)
  return s
}
