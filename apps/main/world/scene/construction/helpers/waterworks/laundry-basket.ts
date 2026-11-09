import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { Rng } from "#/lib/engine/random"
import { pick } from "#/world/scene/pick"

export function laundryBasket(seed: number): PixBuf {
  const b = new PixBuf(32, 24)
  const r = new Rng(seed)
  const cl = ["cLinen", "cBlue", "cRed", "wool"]
  for (const k = { value: 0 }; k.value < 7; k.value++) {
    const cx = 6 + r.int(20),
      cy = 6 + r.int(4),
      ramp = cl[r.int(4)]
    for (const y = { value: -4 }; y.value < 5; y.value++)
      for (const x = { value: -6 }; x.value < 7; x.value++)
        if (Math.hypot(x.value / 6, y.value / 4) < 1)
          b.set({ x: cx + x.value, y: cy + y.value, color: pick({ ramp: ramp, b: 0.65 - y.value * 0.06 + Math.sin(x.value * 0.9 + k.value) * 0.1, x: cx + x.value, y: cy + y.value }) })
  }
  for (const y = { value: 10 }; y.value < 24; y.value++)
    for (const x = { value: 1 }; x.value < 31; x.value++) {
      const ins = Math.round((y.value - 10) * 0.18)
      if (x.value < 1 + ins || x.value > 30 - ins) continue
      const weave = (x.value + (y.value >> 1)) % 4 < 2 !== (((y.value >> 1) & 1) === 0)
      b.set({
        x: x.value,
        y: y.value,
        color: pick({ ramp: "thatch", b: (y.value < 12 ? 0.8 : 0.55) + (weave ? 0.1 : -0.1) - (x.value - 16) / 40 - (y.value === 23 ? 0.5 : 0), x: x.value, y: y.value }),
      })
    }
  return b
}
