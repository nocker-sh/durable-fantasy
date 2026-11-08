import { expect, it } from "vitest"
import { getEyePortrait } from "#/dev/get-eye-portrait"
import { buildSheetStrip } from "#/world/scene/figure/build-sheet-strip"
import { FW, FH } from "#/world/scene/figure/render"
import { RESIDENT_LOOKS } from "#/world/town/residents"
it.each([0, 1, 2, 3, 4, 5, 6, 7])("preserves every original cropped RGBA pixel in view %s", (view) => {
  const look = RESIDENT_LOOKS[0],
    original = buildSheetStrip({ L: look, anim: "idle", item: null, view: view })
  const top = Array.from({ length: FH }, (_, y) => y).find((y) => Array.from({ length: FW }, (_, x) => x).some((x) => original.data[(y * original.w + x) * 4 + 3])) ?? FH
  const expected = Uint8Array.from({ length: 36 * 30 * 4 }, (_, index) => {
    const y = Math.floor(index / (36 * 4)),
      x = Math.floor(index / 4) % 36,
      channel = index % 4
    return original.data[((y + top - 2) * original.w + x + Math.round(FW / 2 - 18)) * 4 + channel] ?? 0
  })
  const portrait = getEyePortrait({ look, item: null, view })
  expect([portrait.w, portrait.h]).toEqual([36, 30])
  expect([...portrait.data]).toEqual([...expected])
})
