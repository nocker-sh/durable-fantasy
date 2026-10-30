import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { toTexture as toTex } from "#/lib/graphics/to-texture"
import { laundry } from "#/world/scene/laundry"
import { GPPU } from "#/world/scene/goods"
import { groundH } from "#/world/scene/ground-h"
import { blockCircle } from "#/world/scene/block-circle"
import { M } from "#/world/scene/construction/materials"
import { animateObject } from "#/world/scene/construction/animate-object"

export function laundryLine(inputProps: { root: THREE.Group; ax: number; az: number; bx: number; bz: number; seed: number }) {
  const root = inputProps.root
  const ax = inputProps.ax
  const az = inputProps.az
  const bx = inputProps.bx
  const bz = inputProps.bz
  const seed = inputProps.seed

  const gb = new GB()
  const ya = groundH(ax, az),
    yb = groundH(bx, bz)
  for (const entry of [
    [ax, az, ya],
    [bx, bz, yb],
  ]) {
    const x = entry[0]
    const z = entry[1]
    const y = entry[2]

    gb.box({ side: M.woodV, top: M.woodDark, x0: x - 0.05, y0: y - 0.2, z0: z - 0.05, x1: x + 0.05, y1: y + 1.75, z1: z + 0.05, repeat: 2 })
    blockCircle(x, z, 0.15)
  }
  const L = Math.hypot(bx - ax, bz - az)
  const ang = Math.atan2(bz - az, bx - ax)
  const line = new THREE.Mesh(new THREE.BoxGeometry(L, 0.015, 0.015), M.rope)
  line.position.set((ax + bx) / 2, (ya + yb) / 2 + 1.68, (az + bz) / 2)
  line.rotation.y = -ang
  root.add(line)
  root.add(gb.build())
  let t = 0.4
  let k = seed
  while (t < L - 0.4) {
    const b = laundry(k, seed + k * 7)
    const x = ax + Math.cos(ang) * t,
      z = az + Math.sin(ang) * t
    const m = new THREE.Mesh(new THREE.PlaneGeometry(b.w / GPPU, b.h / GPPU), new THREE.MeshLambertMaterial({ map: toTex(b, false), alphaTest: 0.5, side: THREE.DoubleSide }))
    m.geometry.translate(0, -b.h / GPPU / 2, 0)
    m.position.set(x, (ya + yb) / 2 + 1.68, z)
    m.rotation.y = -ang
    m.castShadow = true
    root.add(m)
    const ph = k * 1.7
    animateObject(m, (tt) => {
      m.rotation.x = Math.sin(tt * 1.6 + ph) * 0.18 + 0.12
    })
    t += b.w / GPPU + 0.12
    k++
  }
}
