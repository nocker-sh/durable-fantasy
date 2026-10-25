import { describe, expect, it } from "vitest"
import { PixelBuffer } from "./pixel-buffer.ts"

describe("graphics engine", () => {
  it("clips pixels and applies caller-supplied outline colors without filling corners", () => {
    const pixels = new PixelBuffer(3, 3)
    pixels.set(1, 1, [200, 100, 50])
    pixels.set(-1, 0, [255, 0, 0])
    pixels.outline([1, 2, 3])
    expect(pixels.get(1, 1)).toEqual([200, 100, 50])
    expect(pixels.get(0, 1)).toEqual([1, 2, 3])
    expect(pixels.alpha(0, 0)).toBe(0)
  })
})

it("groups geometry by material and clears the builder after emitting meshes", async () => {
  const THREE = await import("three")
  const { GeometryBuilder } = await import("./geometry.ts")
  const builder = new GeometryBuilder()
  const side = new THREE.MeshLambertMaterial()
  const top = new THREE.MeshLambertMaterial()
  builder.box(side, top, 1, 2, 3, 5, 6, 7)
  const group = builder.build()
  expect(group.children).toHaveLength(2)
  const meshes = group.children as import("three").Mesh[]
  expect(meshes.map((mesh) => mesh.geometry.getAttribute("position").count)).toEqual([24, 6])
  expect(new THREE.Box3().setFromObject(group).min.toArray()).toEqual([1, 2, 3])
  expect(new THREE.Box3().setFromObject(group).max.toArray()).toEqual([5, 6, 7])
  expect(builder.build().children).toHaveLength(0)
})

it("preserves pixel texture sampling and RGBA data", async () => {
  const THREE = await import("three")
  const { toTex } = await import("./materials.ts")
  const pixels = new PixelBuffer(2, 3)
  pixels.set(0, 0, [5, 6, 7])
  const texture = toTex(pixels, false)
  expect(texture.image.data).toBe(pixels.data)
  expect(texture.image.width).toBe(2)
  expect(texture.image.height).toBe(3)
  expect(texture.magFilter).toBe(THREE.NearestFilter)
  expect(texture.wrapS).toBe(THREE.ClampToEdgeWrapping)
})
