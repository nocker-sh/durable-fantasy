import { RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"
import { shade } from "#/world/scene/helpers/goods/shade"

/** Hen frames: stand, walk, peck1, peck2. Side view facing right. */
export function henFrames(seed: number): PixBuf[] {
  const brown = seed % 3 !== 0
  const body = brown ? RAMPS.henB : RAMPS.hen
  const out: PixBuf[] = []
  for (const f = { value: 0 }; f.value < 4; f.value++) {
    const b = new PixBuf(20, 20)
    const peck = f.value >= 2 ? (f.value === 2 ? 3 : 5) : 0
    for (const y = { value: 6 }; y.value < 15; y.value++)
      for (const x = { value: 3 }; x.value < 15; x.value++) {
        const d = Math.hypot((x.value - 9) / 6, (y.value - 10.5) / 4.4)
        if (d > 1) continue
        const l = { value: 0.75 - (y.value - 6) / 10 - (x.value - 3) / 40 }
        if ((x.value + y.value) % 5 === 0 && y.value > 9) l.value -= 0.25
        b.set({ x: x.value, y: y.value, color: shade({ ramp: body, l: l.value, x: x.value, y: y.value }) })
      }
    for (const y = { value: 3 }; y.value < 9; y.value++)
      for (const x = { value: 1 }; x.value < 6; x.value++)
        if (x.value - 1 < 9 - y.value) b.set({ x: x.value, y: y.value, color: shade({ ramp: body, l: 0.4 + (x.value === 1 ? -0.2 : 0), x: x.value, y: y.value }) }) // tail
    const hx = 14 + Math.round(peck * 0.4),
      hy = 6 + peck
    for (const y = { value: hy - 2 }; y.value < hy + 3; y.value++)
      for (const x = { value: hx - 2 }; x.value < hx + 3; x.value++)
        if (Math.hypot(x.value - hx, y.value - hy) < 2.6) b.set({ x: x.value, y: y.value, color: shade({ ramp: body, l: 0.8, x: x.value, y: y.value }) })
    b.set({ x: hx, y: hy - 3, color: RAMPS.comb[1] })
    b.set({ x: hx + 1, y: hy - 3, color: RAMPS.comb[2] })
    b.set({ x: hx - 1, y: hy - 2, color: RAMPS.comb[1] })
    // eyes only: no beak or wattle drawn on the creatures (ui.md §6.4.2)
    b.set({ x: hx + 1, y: hy - 1, color: RAMPS.iron[0] })
    const step = f.value === 1 ? 1 : 0
    for (const y = { value: 15 }; y.value < 19; y.value++) {
      b.set({ x: 8 - step, y: y.value, color: RAMPS.beak[1] })
      b.set({ x: 11 + step, y: y.value, color: RAMPS.beak[1] })
    }
    b.set({ x: 9 - step, y: 18, color: RAMPS.beak[1] })
    b.set({ x: 12 + step, y: 18, color: RAMPS.beak[1] })
    b.outline(hex("#1c1418"))
    out.push(b)
  }
  return out
}
