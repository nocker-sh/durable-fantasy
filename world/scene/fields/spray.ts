import * as THREE from "three"
import { groundH } from "#/world/scene/ground-h"
import { updaters } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"

const COUNT = 40

/**
 * Spray thrown up at the foot of a fall: pale specks rising off the water, drifting and thinning
 * out, over and over. Drawn as square points so they stay pixels at any distance.
 */
export function spray(root: THREE.Group, at: V2) {
  const base = groundH(at[0], at[1]) + 0.05
  const pos = new Float32Array(COUNT * 3)
  const seeds = Array.from({ length: COUNT }, (_, i) => [Math.sin(i * 12.9898) * 0.5 + 0.5, Math.sin(i * 78.233) * 0.5 + 0.5, Math.sin(i * 37.719) * 0.5 + 0.5])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  const material = new THREE.PointsMaterial({ color: 0xe4eef0, size: 0.09, transparent: true, opacity: 0.75, depthWrite: false })
  const points = new THREE.Points(geo, material)
  points.frustumCulled = false
  root.add(points)
  updaters.push((t) => {
    seeds.forEach((s, i) => {
      const k = (t * (0.35 + s[2] * 0.3) + s[0]) % 1
      const a = s[1] * Math.PI * 2
      const r = 0.15 + k * 0.7
      pos[i * 3] = at[0] + Math.cos(a) * r
      pos[i * 3 + 1] = base + Math.sin(k * Math.PI) * (0.5 + s[2] * 0.6)
      pos[i * 3 + 2] = at[1] + Math.sin(a) * r * 0.7
    })
    geo.attributes.position.needsUpdate = true
  })
}
