import { expect, it } from "vitest"
import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { downsamplePixelArt } from "#/lib/graphics/downsample-pixel-art"
import type { RGB } from "#/lib/graphics/pixel-types"

const SKIN: RGB = [224, 180, 150]
const EYE: RGB = [32, 24, 42]
const LINE: RGB = [40, 30, 30]

/** A 12 × 12 face: a one-pixel dark outline round skin, with a one-pixel eye. */
const face = () => {
  const b = new PixelBuffer(12, 12)
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) b.set({ x, y, color: x === 0 || y === 0 || x === 11 || y === 11 ? LINE : SKIN })
  b.set({ x: 4, y: 5, color: EYE })
  return b
}

const at = (b: PixelBuffer, x: number, y: number) => Array.from(b.data.slice((y * b.w + x) * 4, (y * b.w + x) * 4 + 4))

it("keeps a one-pixel eye and the outline when it halves a picture", () => {
  const out = downsamplePixelArt(face(), 2)
  expect([out.w, out.h]).toEqual([6, 6])
  expect(at(out, 2, 2)).toEqual([...EYE, 255])
  // the outline is drawn again round the shrunk shape, one pixel wide, and the inside stays skin
  for (let i = 0; i < 6; i++) expect(at(out, i, 0)).toEqual([...LINE, 255])
  expect(at(out, 3, 3)).toEqual([...SKIN, 255])
})

it("keeps only colours already drawn, and drops a block mostly empty", () => {
  const b = new PixelBuffer(4, 2)
  b.set({ x: 0, y: 0, color: SKIN })
  b.set({ x: 2, y: 0, color: SKIN })
  b.set({ x: 3, y: 0, color: SKIN })
  const out = downsamplePixelArt(b, 2)
  expect(at(out, 0, 0)[3]).toBe(0)
  expect(at(out, 1, 0)).toEqual([...SKIN, 255])
})
