import type * as THREE from "three"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { heap } from "#/world/scene/heap"
import { basket } from "#/world/scene/basket"
import { groundH } from "#/world/scene/ground-h"
import type { Goods } from "#/world/scene/construction/stalls"
import { addSprite } from "#/world/scene/construction/add-sprite"

type Props = {
  root: THREE.Group
  f: { x0: number; z0: number; x1: number; z1: number; axis: "x" | "z" }
  kind: Goods
  seed: number
}

export function crops(props: Props) {
  const r = new Rng(props.seed)
  const spr = basket({ kind: props.kind, seed: 0, w: 4, h: 4 })
  void spr
  const cache: PixBuf[] = []
  for (const i = { value: 0 }; i.value < 4; i.value++) {
    const b = new PixBuf(18, 16)
    const h = heap({ kind: props.kind, w: 18, h: 14, seed: props.seed + i.value })
    b.blit({ source: h, x: 0, y: 2 })
    cache.push(b)
  }
  if (props.f.axis === "x") {
    for (const z = { value: props.f.z0 + 0.25 }; z.value < props.f.z1; z.value += 1 / 3)
      for (const x = { value: props.f.x0 + 0.3 }; x.value < props.f.x1 - 0.2; x.value += 0.42) {
        if (r.next() < 0.15) continue
        addSprite({ root: props.root, b: cache[r.int(4)], x: x.value + (r.next() - 0.5) * 0.1, y: groundH(x.value, z.value) - 0.02, z: z.value, ppu: 48 })
      }
  } else {
    for (const x = { value: props.f.x0 + 0.25 }; x.value < props.f.x1; x.value += 1 / 3)
      for (const z = { value: props.f.z0 + 0.3 }; z.value < props.f.z1 - 0.2; z.value += 0.42) {
        if (r.next() < 0.15) continue
        addSprite({ root: props.root, b: cache[r.int(4)], x: x.value, y: groundH(x.value, z.value) - 0.02, z: z.value + (r.next() - 0.5) * 0.1, ppu: 48 })
      }
  }
}
