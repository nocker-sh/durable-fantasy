import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { createSignTexture } from "#/world/scene/textures/create-sign-texture"
import type { V2 } from "#/world/scene/construction/registry"
import { animateObject } from "#/world/scene/construction/animate-object"
import { M } from "#/world/scene/construction/materials"
import type { HouseOpts } from "#/world/scene/construction/houses"

type Props = {
  root: THREE.Group
  o: HouseOpts
  door: V2
  y0: number
}

export function hangSign(props: Props) {
  const gb = new GB()
  const side = props.o.door.side
  const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
    nz = side === "s" ? 1 : side === "n" ? -1 : 0
  const tx = -nz,
    tz = nx // along wall
  const wx = props.door[0] - nx * 0.55 + tx * 0.75,
    wz = props.door[1] - nz * 0.55 + tz * 0.75
  const yb = props.y0 + 1.75
  gb.box({
    side: M.iron,
    top: M.iron,
    x0: Math.min(wx, wx + nx * 0.7) - 0.02,
    y0: yb,
    z0: Math.min(wz, wz + nz * 0.7) - 0.02,
    x1: Math.max(wx, wx + nx * 0.7) + 0.02,
    y1: yb + 0.04,
    z1: Math.max(wz, wz + nz * 0.7) + 0.02,
    repeat: 2,
  })
  props.root.add(gb.build())
  const sm = new THREE.MeshLambertMaterial({ map: toTex(createSignTexture(props.o.sign!), false), side: THREE.DoubleSide })
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), sm)
  p.position.set(wx + nx * 0.45, yb - 0.26, wz + nz * 0.45)
  p.rotation.y = Math.atan2(nx, nz) + Math.PI / 2
  p.castShadow = true
  props.root.add(p)
  animateObject(p, (t) => {
    p.rotation.z = Math.sin(t * 1.3 + wx) * 0.06
  })
}
