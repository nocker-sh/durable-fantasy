import { expect, it, vi } from "vitest"
import { collectMaterialAssets } from "#/lib/graphics/collect-material-assets"
import type { Disposable } from "#/lib/engine/cleanup-types"

it("accepts disposable texture markers without requiring a shared constructor", () => {
  const texture = { isTexture: true, dispose: vi.fn() }
  const material = { map: texture, uniforms: { nested: { value: [[texture]] } }, dispose: vi.fn() }
  const assets = new Set<Disposable>()
  collectMaterialAssets(material, assets)
  expect([...assets]).toEqual([texture, material])
  expect(texture.dispose).not.toHaveBeenCalled()
  expect(material.dispose).not.toHaveBeenCalled()
})

it("ignores invalid resources and uniforms while preserving valid material ownership", () => {
  const material = {
    map: { isTexture: true, dispose: false },
    uniforms: { empty: null, primitive: 1, missing: {}, invalid: { value: { isTexture: true } } },
    dispose: vi.fn(),
  }
  const assets = new Set<Disposable>()
  for (const candidate of [null, undefined, 0, {}, { dispose: 1 }, material]) collectMaterialAssets(candidate, assets)
  expect([...assets]).toEqual([material])
})
