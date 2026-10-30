import { RAMPS } from "#/world/scene/pix"
import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hash2 } from "#/lib/engine/hash2"
import { shade } from "#/world/scene/helpers/goods/shade"

/** Laundry piece hung on a line. */
export function laundry(kind: number, seed: number): PixBuf {
  const rng = new Rng(seed)
  const ramps = ["cLinen", "cLinen", "cBlue", "cRed", "cMustard", "wool", "cGreen"]
  const ramp = RAMPS[ramps[kind % ramps.length]]
  const shapes = ["sheet", "shirt", "sheet", "apron", "sock"]
  const shape = shapes[(kind + seed) % shapes.length]
  const w = shape === "sheet" ? 44 : shape === "sock" ? 8 : 26,
    h = shape === "sheet" ? 40 : shape === "sock" ? 14 : 28
  const b = new PixBuf(w, h)
  for (const y = { value: 0 }; y.value < h; y.value++)
    for (const x = { value: 0 }; x.value < w; x.value++) {
      if (shape === "shirt") {
        const body = x.value > 6 && x.value < w - 7
        const sleeve = y.value < 12 && (x.value <= 6 || x.value >= w - 7) && y.value > (x.value <= 6 ? 6 - x.value : x.value - (w - 7)) * 0.4
        if (!body && !sleeve) continue
        if (body && y.value > h - 1 - (hash2(x.value >> 2, 0, seed) > 0.5 ? 1 : 0)) continue
      }
      if (shape === "apron" && (x.value < 3 + y.value * 0.12 || x.value > w - 4 - y.value * 0.12)) continue
      if (shape === "sock" && x.value > 4 && y.value < h - 5) continue
      const fold = Math.sin(x.value * 0.45 + rng.next() * 0.2) * 0.12 + Math.sin(x.value * 0.13 + seed) * 0.1
      const l = { value: 0.66 + fold - (y.value / h) * 0.12 }
      if (y.value < 2) l.value += 0.1
      if (hash2(x.value, y.value, seed) > 0.985) l.value -= 0.3
      b.set({ x: x.value, y: y.value, color: shade({ ramp: ramp, l: l.value, x: x.value, y: y.value }) })
    }
  // pegs
  for (const px of [2, w - 3]) {
    b.set({ x: px, y: 0, color: RAMPS.wood[3] })
    b.set({ x: px, y: 1, color: RAMPS.wood[2] })
    b.set({ x: px, y: 2, color: RAMPS.wood[1] })
  }
  return b
}
