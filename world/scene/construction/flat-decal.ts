import * as THREE from "three"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { GPPU } from "#/world/scene/goods"
import { groundH } from "#/world/scene/ground-h"

type Props = {
  root: THREE.Object3D
  b: PixBuf
  x: number
  z: number
  scale?: number
  rot?: number
}

export function flatDecal(props: Props) {
  const scale = props.scale === undefined ? GPPU : props.scale
  const rot = props.rot === undefined ? 0 : props.rot

  const m = new THREE.MeshLambertMaterial({ map: toTex(props.b, false), alphaTest: 0.5, transparent: false })
  const p = new THREE.Mesh(new THREE.PlaneGeometry(props.b.w / scale, props.b.h / scale), m)
  p.rotation.x = -Math.PI / 2
  p.rotation.z = rot
  p.position.set(props.x, groundH(props.x, props.z) + 0.02, props.z)
  p.receiveShadow = true
  props.root.add(p)
}
