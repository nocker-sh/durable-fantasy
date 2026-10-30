import * as THREE from "three"
import { fireLights } from "#/world/scene/construction/registry"
import type { Spot } from "#/world/scene/construction/furnishings"

/** The fire's light, flickering, in front of the hearth's mouth. */
export function fireLight(root: THREE.Group, s: Spot) {
  const out = s.face === 0 ? [0, 1] : s.face === 2 ? [0, -1] : s.face === 1 ? [1, 0] : [-1, 0]
  const depth = s.face === 1 || s.face === 3 ? s.w : s.d
  const l = new THREE.PointLight(0xff8a3a, 2.2, 7, 1.4)
  l.position.set(s.x + out[0] * (depth / 2 + 0.5), s.y + 0.6, s.z + out[1] * (depth / 2 + 0.5))
  root.add(l)
  fireLights.push({ light: l, base: 2.2, seed: s.x * 3 + s.z })
}
