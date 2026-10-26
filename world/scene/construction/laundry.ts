import * as THREE from "three"
import { GB, toTex } from "../gfx"
import { laundry, GPPU } from "../goods"
import { groundH, blockCircle } from "../world"
import { M } from "./materials.ts"
import { animateObject } from "./registry.ts"

export function laundryLine(root: THREE.Group, ax: number, az: number, bx: number, bz: number, seed: number) {
  const gb = new GB()
  const ya = groundH(ax, az),
    yb = groundH(bx, bz)
  for (const [x, z, y] of [
    [ax, az, ya],
    [bx, bz, yb],
  ]) {
    gb.box(M.woodV, M.woodDark, x - 0.05, y - 0.2, z - 0.05, x + 0.05, y + 1.75, z + 0.05, 2)
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
