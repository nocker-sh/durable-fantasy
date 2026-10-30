import * as THREE from "three"
import { Rng } from "#/lib/engine/random"
import { tree } from "#/world/scene/construction/tree"
import { isFree } from "#/world/scene/is-free"
import { N } from "#/world/scene/world"
import { roadD } from "#/world/scene/road-d"
import { riverD } from "#/world/scene/river-d"
import { currentLayout } from "#/world/scene/current-layout"

/** A ring of trees around the edge, keeping the roads and their ends clear. */
export function forestRing(root: THREE.Group, seed: number, depth = 5) {
  const tr = new Rng(seed)
  for (const i = { value: 0 }; i.value < 300; i.value++) {
    const x = tr.next() * N,
      z = tr.next() * N
    const edge = Math.min(x, z, N - x, N - z)
    if (edge > depth + tr.next() * 3) continue
    if (roadD(x, z) < 1.4) continue
    if (riverD(x, z) < currentLayout().riverHW + 1.2) continue
    if (!isFree(x, z)) continue
    tree({ root: root, x: x, z: z, scale: 0.9 + tr.next() * 0.6, kind: tr.next() < 0.18 ? "autumn" : tr.next() < 0.5 ? "leaf2" : "leaf", seed: seed * 10 + i.value })
  }
}
