import { expect, it } from "vitest"
import * as THREE from "three"
import { PixelBuffer } from "./pixel-buffer"
import { mat } from "./materials"

it("shares equivalent materials while keeping distinct rendering options separate", () => {
  const pixels = new PixelBuffer(2, 2)
  const plain = mat(pixels)
  expect(mat(pixels, { repeat: true, alpha: false, side: THREE.FrontSide })).toBe(plain)
  const clamped = mat(pixels, { repeat: false })
  expect(clamped).not.toBe(plain)
  expect(clamped.map!.wrapS).toBe(THREE.ClampToEdgeWrapping)
  const glowing = mat(pixels, { emissive: 0xffaa00 })
  expect(glowing).not.toBe(plain)
  expect(glowing.emissive.getHex()).toBe(0xffaa00)
  expect(plain.emissive.getHex()).toBe(0)
  const cutout = mat(pixels, { alpha: true, side: THREE.DoubleSide })
  expect(cutout.alphaTest).toBe(0.5)
  expect(cutout.side).toBe(THREE.DoubleSide)
  expect(mat(pixels, { alpha: true, side: THREE.DoubleSide })).not.toBe(cutout)
  expect(mat(new PixelBuffer(2, 2))).not.toBe(plain)
})

it("recreates disposed materials without invalidating another variant or its replacement", () => {
  const pixels = new PixelBuffer(2, 2)
  const first = mat(pixels)
  const other = mat(pixels, { repeat: false })
  first.dispose()
  const replacement = mat(pixels)
  expect(replacement).not.toBe(first)
  expect(replacement.map).not.toBe(first.map)
  expect(mat(pixels, { repeat: false })).toBe(other)
  first.dispose()
  expect(mat(pixels)).toBe(replacement)
  replacement.dispose()
  expect(mat(pixels)).not.toBe(replacement)
})
