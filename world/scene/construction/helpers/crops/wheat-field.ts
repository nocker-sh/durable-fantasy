import type * as THREE from "three"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { pick } from "#/world/scene/pick"
import { groundH } from "#/world/scene/ground-h"
import { addSprite } from "#/world/scene/construction/add-sprite"
import { animateObject } from "#/world/scene/construction/animate-object"

export function wheatField(root: THREE.Group, f: { x0: number; z0: number; x1: number; z1: number }) {
  const b = new PixBuf(64, 40)
  const r = new Rng(5)
  for (const k = { value: 0 }; k.value < 70; k.value++) {
    const x = r.int(62) + 1,
      h = 22 + r.int(16)
    for (const y = { value: 0 }; y.value < h; y.value++) b.set({ x: x, y: 39 - y.value, color: pick({ ramp: "thatch", b: 0.35 + (y.value / h) * 0.45, x: x, y: y.value }) })
    for (const y = { value: h - 6 }; y.value < h; y.value++) {
      b.set({ x: x - 1, y: 39 - y.value, color: pick({ ramp: "thatch", b: 0.8, x: x, y: y.value }) })
      b.set({ x: x + 1, y: 39 - y.value, color: pick({ ramp: "thatch", b: 0.6, x: x, y: y.value }) })
    }
  }
  for (const z = { value: f.z0 + 0.3 }; z.value < f.z1; z.value += 0.35)
    for (const x = { value: f.x0 + 0.5 }; x.value < f.x1 - 0.4; x.value += 0.9) {
      const s = addSprite({ root: root, b: b, x: x.value + (r.next() - 0.5) * 0.3, y: groundH(x.value, z.value) - 0.05, z: z.value, ppu: 64 })
      const ph = x.value * 0.7 + z.value * 0.3
      animateObject(s, (t) => {
        s.material.rotation = Math.sin(t * 1.2 + ph) * 0.04
      })
    }
}
