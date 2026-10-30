import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { R } from "#/world/scene/helpers/goods/r"
import { shade } from "#/world/scene/helpers/goods/shade"

/** Sprite frames for a cat: sit, walk1, walk2, wash. Side view facing right. */
export function catFrames(seed: number): PixBuf[] {
  const furs = [
    ["#1e1a22", "#2e2832", "#423a44", "#5a5058"],
    ["#3e2418", "#7a4a2a", "#b07038", "#d89c58"],
    ["#5a5458", "#8a8484", "#c4beb4", "#ece8de"],
  ]
  const fur = R(furs[seed % furs.length])
  const frames: PixBuf[] = []
  for (const f = { value: 0 }; f.value < 4; f.value++) {
    const b = new PixBuf(28, 22)
    const sit = f.value === 0 || f.value === 3
    const set = (x: number, y: number, l: number) => b.set({ x: x, y: y, color: shade({ ramp: fur, l: l, x: x, y: y }) })
    if (sit) {
      for (const y = { value: 9 }; y.value < 21; y.value++)
        for (const x = { value: 7 }; x.value < 19; x.value++) if (Math.hypot((x.value - 13) / 6, (y.value - 15) / 6.5) < 1) set(x.value, y.value, 0.75 - (x.value - 7) / 14 - (y.value - 9) / 30)
      for (const y = { value: 3 }; y.value < 11; y.value++)
        for (const x = { value: 12 }; x.value < 22; x.value++) if (Math.hypot((x.value - 17) / 4.6, (y.value - 7.5) / 4) < 1) set(x.value, y.value, 0.85 - (x.value - 12) / 14)
      set(13, 2, 0.6)
      set(14, 2, 0.5)
      set(13, 3, 0.6)
      set(20, 2, 0.4)
      set(21, 2, 0.3)
      set(20, 3, 0.4)
      for (const k = { value: 0 }; k.value < 9; k.value++) {
        set(6 - Math.round(Math.sin(k.value / 3) * 2), (20 - k.value * 0.2) | 0, 0.3)
        set(Math.max(0, 6 - k.value), 20, 0.25)
      }
      if (f.value === 0) {
        b.set({ x: 16, y: 7, color: R(["#c8b040"])[0] })
        b.set({ x: 19, y: 7, color: R(["#c8b040"])[0] })
      } else {
        b.set({ x: 16, y: 7, color: fur[0] })
        b.set({ x: 19, y: 7, color: fur[0] })
        for (const y = { value: 10 }; y.value < 13; y.value++) set(20, y.value, 0.6)
      }
    } else {
      const ph = f.value === 1 ? 1 : -1
      for (const y = { value: 8 }; y.value < 15; y.value++)
        for (const x = { value: 5 }; x.value < 20; x.value++) if (Math.hypot((x.value - 12.5) / 7.5, (y.value - 11.5) / 3.6) < 1) set(x.value, y.value, 0.8 - (y.value - 8) / 9)
      for (const y = { value: 4 }; y.value < 12; y.value++)
        for (const x = { value: 17 }; x.value < 26; x.value++) if (Math.hypot((x.value - 21.5) / 4.4, (y.value - 8) / 3.6) < 1) set(x.value, y.value, 0.85 - (y.value - 4) / 12)
      set(19, 3, 0.6)
      set(19, 4, 0.6)
      set(24, 3, 0.4)
      set(24, 4, 0.4)
      b.set({ x: 22, y: 7, color: R(["#c8b040"])[0] })
      b.set({ x: 25, y: 7, color: fur[0] })
      for (const entry of [
        [7, ph],
        [10, -ph],
        [15, -ph],
        [18, ph],
      ]) {
        const lx = entry[0]
        const o = entry[1]
        for (const y = { value: 14 }; y.value < 20; y.value++) set(lx + (y.value > 16 ? o : 0), y.value, 0.35)
      }
      for (const k = { value: 0 }; k.value < 8; k.value++) set(5 - k.value, 9 - Math.round(Math.sin(k.value / 2.5) * 4), 0.45)
    }
    b.outline(R(["#18121c"])[0])
    frames.push(b)
  }
  return frames
}
