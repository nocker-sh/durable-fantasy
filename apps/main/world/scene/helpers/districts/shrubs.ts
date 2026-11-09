import * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { bush } from "#/world/scene/construction/bush"
import type { V2 } from "#/world/scene/construction/registry"

export function shrubs(root: THREE.Group, spots: V2[], seed: number) {
  const r = new Rng(seed)
  for (const entry of spots) {
    const x = entry[0]
    const z = entry[1]
    bush({ root: root, x: x, z: z, s: 0.35 + r.next() * 0.2, kind: "leaf2", flowers: true })
  }
}
