import { afterEach, expect, it, vi } from "vitest"
import { NearestFilter, Texture } from "three"
import { createGroundMaterial } from "#/world/scene/runtime/create-ground-material"
import { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import { CleanupStack } from "#/lib/engine/cleanup-stack"

afterEach(() => vi.restoreAllMocks())

it("keeps ground pixels sharp and owns the shader-only wall texture before the material", () => {
  const textureDisposals = vi.spyOn(Texture.prototype, "dispose")
  const resources = new CleanupStack()
  const ground = new PixelBuffer(2, 2)
  ground.data.set([11, 22, 33, 255])
  const material = createGroundMaterial(ground, resources)
  const texture = material.map
  if (!texture) throw Error("Missing ground texture")
  expect(texture.minFilter).toBe(NearestFilter)
  expect(texture.generateMipmaps).toBe(false)
  expect(texture.flipY).toBe(true)
  expect(texture.image.data).toBe(ground.data)
  const materialDisposal = vi.spyOn(material, "dispose")
  const events: string[] = []
  material.addEventListener("dispose", () => events.push("material"))
  texture.addEventListener("dispose", () => events.push("ground"))
  resources.dispose()
  resources.dispose()
  expect(events).toEqual(["material", "ground"])
  expect(textureDisposals).toHaveBeenCalledTimes(2)
  expect(textureDisposals.mock.contexts[1]).toBe(texture)
  expect(materialDisposal.mock.invocationCallOrder[0]).toBeLessThan(textureDisposals.mock.invocationCallOrder[0])
})
