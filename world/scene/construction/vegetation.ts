import * as THREE from "three"
import { GB } from "../gfx"
import { PixBuf, Rng, RAMPS } from "../pix"
import { groundH, blockCircle } from "../world"
import { M } from "./materials.ts"
import { occluder, updaters } from "./registry.ts"
import { addSprite } from "./sprites.ts"

export function tree(root: THREE.Group, x: number, z: number, scale = 1, kind: "leaf" | "leaf2" | "autumn" = "leaf", seed = 0) {
  const gb = new GB()
  const y0 = groundH(x, z)
  const r = new Rng(seed + 100)
  const th = 1.4 * scale
  gb.cyl(M.woodDark, null, x, z, y0 - 0.2, y0 + th, 0.16 * scale, 0.1 * scale, 7, 2)
  const g = gb.build()
  root.add(g)
  const leafM = M[kind]
  const crown = new THREE.Group()
  for (let i = 0; i < 6; i++) {
    const rad = (0.7 + r.next() * 0.5) * scale
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(rad, 0), leafM)
    m.position.set((r.next() - 0.5) * 1.1 * scale, th + (r.next() * 0.9 + (i === 0 ? 0.6 : 0)) * scale, (r.next() - 0.5) * 1.1 * scale)
    m.rotation.set(r.next() * 3, r.next() * 3, r.next() * 3)
    m.castShadow = true
    m.receiveShadow = true
    crown.add(m)
  }
  crown.position.set(x, y0, z)
  root.add(crown)
  crown.updateMatrixWorld(true)
  occluder(crown, 0)
  const ph = r.next() * 6
  updaters.push((t) => {
    crown.rotation.z = Math.sin(t * 0.9 + ph) * 0.012
    crown.rotation.x = Math.sin(t * 0.7 + ph) * 0.01
  })
  blockCircle(x, z, 0.35 * scale)
}

export function bush(root: THREE.Group, x: number, z: number, s = 0.5, kind: "leaf" | "leaf2" = "leaf2", flowers = false) {
  const y0 = groundH(x, z)
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), M[kind])
  m.position.set(x, y0 + s * 0.5, z)
  m.scale.y = 0.75
  m.rotation.y = x * 3
  m.castShadow = true
  m.receiveShadow = true
  root.add(m)
  if (flowers) {
    const b = new PixBuf(24, 14)
    const r = new Rng(x * 100 + z)
    const c = r.pick([RAMPS.cRed[4], RAMPS.cMustard[4], RAMPS.wool[4], RAMPS.cPlum[4]])
    for (let k = 0; k < 12; k++) {
      const px = r.int(22) + 1,
        py = r.int(10) + 2
      b.set(px, py, c)
      b.set(px + 1, py, c)
      b.set(px, py - 1, RAMPS.cMustard[4])
    }
    addSprite(root, b, x, y0 + s * 0.65, z + 0.1)
  }
  blockCircle(x, z, s * 0.8)
}
