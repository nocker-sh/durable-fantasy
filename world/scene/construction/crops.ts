import type * as THREE from "three"
import { PixBuf, Rng, pick } from "../pix"
import { heap, basket } from "../goods"
import { groundH } from "../world"
import type { Goods } from "./stalls.ts"
import { addSprite } from "./sprites.ts"
import { updaters } from "./registry.ts"

export function crops(root: THREE.Group, f: { x0: number; z0: number; x1: number; z1: number; axis: "x" | "z" }, kind: Goods, seed: number) {
  const r = new Rng(seed)
  const spr = basket(kind, 0, 4, 4)
  void spr
  const cache: PixBuf[] = []
  for (let i = 0; i < 4; i++) {
    const b = new PixBuf(18, 16)
    const h = heap(kind, 18, 14, seed + i)
    b.blit(h, 0, 2)
    cache.push(b)
  }
  if (f.axis === "x") {
    for (let z = f.z0 + 0.25; z < f.z1; z += 1 / 3)
      for (let x = f.x0 + 0.3; x < f.x1 - 0.2; x += 0.42) {
        if (r.next() < 0.15) continue
        addSprite(root, cache[r.int(4)], x + (r.next() - 0.5) * 0.1, groundH(x, z) - 0.02, z, 48)
      }
  } else {
    for (let x = f.x0 + 0.25; x < f.x1; x += 1 / 3)
      for (let z = f.z0 + 0.3; z < f.z1 - 0.2; z += 0.42) {
        if (r.next() < 0.15) continue
        addSprite(root, cache[r.int(4)], x, groundH(x, z) - 0.02, z + (r.next() - 0.5) * 0.1, 48)
      }
  }
}

function wheatField(root: THREE.Group, f: { x0: number; z0: number; x1: number; z1: number }) {
  const b = new PixBuf(64, 40)
  const r = new Rng(5)
  for (let k = 0; k < 70; k++) {
    const x = r.int(62) + 1,
      h = 22 + r.int(16)
    for (let y = 0; y < h; y++) b.set(x, 39 - y, pick("thatch", 0.35 + (y / h) * 0.45, x, y))
    for (let y = h - 6; y < h; y++) {
      b.set(x - 1, 39 - y, pick("thatch", 0.8, x, y))
      b.set(x + 1, 39 - y, pick("thatch", 0.6, x, y))
    }
  }
  for (let z = f.z0 + 0.3; z < f.z1; z += 0.35)
    for (let x = f.x0 + 0.5; x < f.x1 - 0.4; x += 0.9) {
      const s = addSprite(root, b, x + (r.next() - 0.5) * 0.3, groundH(x, z) - 0.05, z, 64)
      const ph = x * 0.7 + z * 0.3
      updaters.push((t) => {
        s.material.rotation = Math.sin(t * 1.2 + ph) * 0.04
      })
    }
}

export { wheatField }
