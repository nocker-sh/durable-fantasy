import { OUTLINE, RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { SIZE } from "#/world/art/icon-rules"

/** A long wooden haft with a head: spear point, axe blade, mace, hammer, flail or halberd. */
export function polearm(kind: "spear" | "axe" | "mace" | "warhammer" | "flail" | "halberd" | "bill" | "pick", iron: RGB[]): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const wood = RAMPS.wood
  const reach = kind === "spear" || kind === "halberd" ? 17 : kind === "bill" ? 15 : kind === "flail" ? 11 : 13
  for (const k = { value: 0 }; k.value < reach; k.value++) {
    const x = 3 + k.value,
      y = 20 - k.value
    b.set({ x: x, y: y, color: wood[3] })
    b.set({ x: x + 1, y: y, color: wood[2] })
  }
  const hx = 3 + reach,
    hy = 20 - reach
  if (kind === "spear" || kind === "halberd") {
    for (const k = { value: 0 }; k.value < 4; k.value++) {
      b.set({ x: hx + k.value, y: hy - k.value, color: iron[4] })
      b.set({ x: hx + k.value + 1, y: hy - k.value, color: iron[3] })
    }
    b.set({ x: hx - 1, y: hy + 1, color: iron[2] })
    b.set({ x: hx + 1, y: hy + 1, color: iron[2] })
    if (kind === "halberd") {
      // an axe blade below the point on one side, a hook on the other
      for (const y = { value: 0 }; y.value <= 4; y.value++)
        for (const x = { value: 0 }; x.value <= 3 - Math.abs(y.value - 2) / 2; x.value++)
          b.set({ x: hx - 4 - x.value + y.value, y: hy + 2 + y.value + x.value, color: x.value > 2 - Math.abs(y.value - 2) / 2 ? iron[4] : iron[2 + ((x.value + y.value) & 1)] })
      b.set({ x: hx + 1, y: hy + 3, color: iron[3] })
      b.set({ x: hx + 2, y: hy + 3, color: iron[2] })
    }
  } else if (kind === "axe") {
    for (const y = { value: -4 }; y.value <= 3; y.value++)
      for (const x = { value: 0 }; x.value <= 4 - Math.abs(y.value) / 2; x.value++)
        b.set({ x: hx + x.value - 3, y: hy + y.value - 1 - x.value, color: x.value > 3 - Math.abs(y.value) / 2 ? iron[4] : iron[2 + ((x.value + y.value) & 1)] })
  } else if (kind === "bill") {
    // a hedging bill on a pole: a blade curving forward to a hook, a short spike on top
    for (const k = { value: 0 }; k.value < 6; k.value++) {
      b.set({ x: hx + k.value, y: hy - k.value, color: iron[k.value === 5 ? 4 : 3] })
      b.set({ x: hx + k.value + 1, y: hy - k.value + 1, color: iron[2] })
      b.set({ x: hx + k.value + 1, y: hy - k.value, color: iron[4] })
    }
    for (const k = { value: 1 }; k.value < 5; k.value++) b.set({ x: hx + k.value + 2, y: hy - k.value + 2, color: iron[2] }) // the belly of the blade
    b.set({ x: hx + 7, y: hy - 4, color: iron[3] })
    b.set({ x: hx + 8, y: hy - 4, color: iron[3] })
    b.set({ x: hx + 8, y: hy - 3, color: iron[4] }) // the hook turning back
    b.set({ x: hx + 7, y: hy - 2, color: iron[3] })
    b.set({ x: hx + 5, y: hy - 6, color: iron[4] })
    b.set({ x: hx + 5, y: hy - 7, color: iron[3] })
  } else if (kind === "pick") {
    // a beak across the haft, long and pointed one way, a short hammer face the other
    for (const t = { value: -2 }; t.value <= 5; t.value++) {
      b.set({ x: hx + t.value, y: hy + t.value, color: iron[t.value > 3 ? 4 : 3] })
      if (t.value < 4) b.set({ x: hx + t.value + 1, y: hy + t.value, color: iron[2] })
    }
    b.set({ x: hx - 3, y: hy - 3, color: iron[3] })
    b.set({ x: hx - 2, y: hy - 3, color: iron[4] })
  } else if (kind === "warhammer") {
    // a square head across the haft, a short spike behind
    for (const t = { value: -3 }; t.value <= 3; t.value++)
      for (const w = { value: -1 }; w.value <= 1; w.value++) {
        const x = hx + t.value + w.value,
          y = hy + t.value - w.value
        b.set({ x: x, y: y, color: iron[w.value === -1 ? 4 : w.value === 0 ? 3 : 2] })
      }
    b.set({ x: hx - 4, y: hy - 4, color: iron[3] })
  } else if (kind === "flail") {
    // a short chain, then a striking bar swinging free
    b.set({ x: hx + 1, y: hy - 1, color: iron[3] })
    b.set({ x: hx + 2, y: hy - 1, color: iron[2] })
    b.set({ x: hx + 3, y: hy - 2, color: iron[3] })
    for (const k = { value: 0 }; k.value < 6; k.value++) {
      b.set({ x: hx + 4 + k.value, y: hy - 2 + Math.floor(k.value / 2), color: iron[4] })
      b.set({ x: hx + 4 + k.value, y: hy - 1 + Math.floor(k.value / 2), color: iron[2] })
    }
  } else {
    for (const y = { value: -3 }; y.value <= 3; y.value++)
      for (const x = { value: -3 }; x.value <= 3; x.value++)
        if (x.value * x.value + y.value * y.value <= 10) b.set({ x: hx + x.value, y: hy + y.value, color: iron[Math.max(0, Math.min(4, 3 - Math.round((x.value + y.value) / 2)))] })
    for (const entry of [
      [0, -4],
      [4, 0],
      [0, 4],
      [-4, 0],
    ]) {
      const x = entry[0]
      const y = entry[1]
      b.set({ x: hx + x, y: hy + y, color: iron[3] })
    }
  }
  b.outline(OUTLINE)
  return b
}
