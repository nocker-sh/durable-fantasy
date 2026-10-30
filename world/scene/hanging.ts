import { RAMPS } from "#/world/scene/pix"
import { Rng } from "#/lib/engine/random"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { FR } from "#/world/scene/goods"
import { shade } from "#/world/scene/helpers/goods/shade"
import { blob } from "#/world/scene/helpers/goods/blob"

/** Things hung under awnings: garlic braids, sausages, herb bundles. */
export function hanging(kind: string, seed: number): PixBuf {
  const rng = new Rng(seed)
  const b = new PixBuf(12, 34)
  for (const y = { value: 0 }; y.value < 4; y.value++) b.set({ x: 6, y: y.value, color: RAMPS.thatch[2] })
  if (kind === "garlic") {
    for (const k = { value: 0 }; k.value < 6; k.value++) blob({ b: b, cx: 6 + (k.value % 2 ? 2 : -2), cy: 7 + k.value * 4.2, rx: 3, ry: 2.8, ramp: FR.garlic })
  } else if (kind === "sausage") {
    for (const s = { value: -1 }; s.value <= 1; s.value++)
      for (const y = { value: 3 }; y.value < 30 - Math.abs(s.value) * 4; y.value++) {
        const x = 6 + s.value * 3 + Math.sin(y.value * 0.3 + s.value) * 0.6
        for (const d = { value: -1 }; d.value <= 1; d.value++)
          b.set({ x: Math.round(x + d.value), y: y.value, color: shade({ ramp: FR.sausage, l: 0.6 - d.value * 0.25 - ((y.value + s.value * 3) % 9 === 0 ? 0.4 : 0), x: x, y: y.value }) })
      }
  } else {
    for (const k = { value: 0 }; k.value < 14; k.value++) {
      const x0 = 6 + (rng.next() - 0.5) * 3,
        len = 14 + rng.int(10)
      for (const t = { value: 0 }; t.value < len; t.value++) {
        const x = x0 + (k.value - 7) * t.value * 0.04
        b.set({ x: Math.round(x), y: 4 + t.value, color: FR.leafG[t.value < 3 ? 1 : 1 + ((k.value + t.value) % 4)] })
      }
    }
    for (const x = { value: 4 }; x.value < 9; x.value++) b.set({ x: x.value, y: 5, color: RAMPS.cRed[3] })
  }
  return b
}
