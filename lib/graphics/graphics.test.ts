import * as THREE from "three"
import { GeometryBuilder } from "#/lib/graphics/geometry-builder"
import { toTexture as toTex } from "./to-texture"
import { describe, expect, it } from "vitest"
import { PixelBuffer } from "./pixel-buffer"

describe("graphics engine", () => {
  it("clips pixels and applies caller-supplied outline colors without filling corners", () => {
    const pixels = new PixelBuffer(3, 3)
    pixels.set({ x: 1, y: 1, color: [200, 100, 50] })
    pixels.set({ x: -1, y: 0, color: [255, 0, 0] })
    pixels.outline([1, 2, 3])
    expect(pixels.get(1, 1)).toEqual([200, 100, 50])
    expect(pixels.get(0, 1)).toEqual([1, 2, 3])
    expect(pixels.alpha(0, 0)).toBe(0)
  })
})

it("groups geometry by material and clears the builder after emitting meshes", () => {
  const builder = new GeometryBuilder()
  const side = new THREE.MeshLambertMaterial()
  const top = new THREE.MeshLambertMaterial()
  builder.box({ side: side, top: top, x0: 1, y0: 2, z0: 3, x1: 5, y1: 6, z1: 7 })
  const group = builder.build()
  expect(group.children).toHaveLength(2)
  const meshes = group.children as THREE.Mesh[]
  expect(meshes.map((mesh) => mesh.geometry.getAttribute("position").count)).toEqual([24, 6])
  expect(new THREE.Box3().setFromObject(group).min.toArray()).toEqual([1, 2, 3])
  expect(new THREE.Box3().setFromObject(group).max.toArray()).toEqual([5, 6, 7])
  expect(builder.build().children).toHaveLength(0)
})

it("preserves pixel texture sampling and RGBA data", () => {
  const pixels = new PixelBuffer(2, 3)
  pixels.set({ x: 0, y: 0, color: [5, 6, 7] })
  const texture = toTex(pixels, false)
  expect(texture.image.data).toBe(pixels.data)
  expect(texture.image.width).toBe(2)
  expect(texture.image.height).toBe(3)
  expect(texture.magFilter).toBe(THREE.NearestFilter)
  expect(texture.wrapS).toBe(THREE.ClampToEdgeWrapping)
})
