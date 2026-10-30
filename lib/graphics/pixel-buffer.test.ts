import { expect, it } from "vitest"
import { PixelBuffer } from "#/lib/graphics/pixel-buffer"

it("keeps dimensions and storage together while drawing into the original RGBA buffer", () => {
  const pixels = new PixelBuffer(2, 3)
  const storage = pixels.data

  expect(Object.isFrozen(pixels)).toBe(true)
  expect(Reflect.set(pixels, "w", 4)).toBe(false)
  expect(Reflect.set(pixels, "h", 4)).toBe(false)
  expect(Reflect.set(pixels, "data", new Uint8ClampedArray(4))).toBe(false)
  pixels.set({ x: 1, y: 2, color: [4, 5, 6], alpha: 7 })
  expect(pixels.data).toBe(storage)
  expect(Array.from(storage.slice(20))).toEqual([4, 5, 6, 7])
})

it("can transfer the shared storage without copying it or changing its dimensions", () => {
  const pixels = new PixelBuffer(1, 1)
  pixels.set({ x: 0, y: 0, color: [4, 5, 6], alpha: 7 })

  const transferred = structuredClone(pixels.data, { transfer: [pixels.data.buffer] })

  expect(Array.from(transferred)).toEqual([4, 5, 6, 7])
  expect(pixels.data.byteLength).toBe(0)
  expect([pixels.w, pixels.h]).toEqual([1, 1])
})
