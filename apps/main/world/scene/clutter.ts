import { RAMPS } from "#/world/scene/pix"
import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { FR } from "#/world/scene/goods"

/** Scattered life clutter on the ground: straw, leaves, broken pot, bones, wood chips. */
export function clutter(kind: string, seed: number): PixBuf {
  const rng = new Rng(seed)
  const b = new PixBuf(24, 10)
  if (kind === "straw")
    for (const k = { value: 0 }; k.value < 18; k.value++) {
      const x = rng.int(20) + 2,
        y = 4 + rng.int(6),
        l = 2 + rng.int(4),
        d = rng.next() < 0.5 ? 1 : -1
      for (const t = { value: 0 }; t.value < l; t.value++) b.set({ x: x + t.value * d, y: y - (t.value >> 1), color: RAMPS.thatch[2 + rng.int(4)] })
    }
  if (kind === "chips")
    for (const k = { value: 0 }; k.value < 14; k.value++) {
      const x = rng.int(22) + 1,
        y = 5 + rng.int(5)
      b.set({ x: x, y: y, color: RAMPS.wood[3 + rng.int(2)] })
      b.set({ x: x + 1, y: y, color: RAMPS.wood[2] })
    }
  if (kind === "shards")
    for (const k = { value: 0 }; k.value < 6; k.value++) {
      const x = rng.int(18) + 3,
        y = 4 + rng.int(5)
      b.set({ x: x, y: y, color: FR.clay[3] })
      b.set({ x: x + 1, y: y, color: FR.clay[2] })
      b.set({ x: x, y: y + 1, color: FR.clay[1] })
    }
  if (kind === "leaves")
    for (const k = { value: 0 }; k.value < 10; k.value++) {
      const x = rng.int(20) + 2,
        y = 4 + rng.int(6)
      const c = rng.pick([RAMPS.autumn[2], RAMPS.autumn[3], RAMPS.autumn[4], RAMPS.leaf[3]])
      b.set({ x: x, y: y, color: c })
      b.set({ x: x + 1, y: y, color: c })
      b.set({ x: x, y: y - 1, color: c })
    }
  return b
}
