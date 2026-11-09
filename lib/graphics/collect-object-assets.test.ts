import * as THREE from "three"
import { expect, it } from "vitest"
import { collectObjectAssets } from "#/lib/graphics/collect-object-assets"
import type { Disposable } from "#/lib/engine/cleanup-types"

it("hands over an instanced mesh itself, so its instance buffers are freed with the map", () => {
  const geometry = new THREE.BoxGeometry()
  const material = new THREE.MeshBasicMaterial()
  const trees = new THREE.InstancedMesh(geometry, material, 40)
  const assets = new Set<Disposable>()
  collectObjectAssets(trees, assets)
  expect(assets.has(trees)).toBe(true)
  expect(assets.has(geometry)).toBe(true)
  expect(assets.has(material)).toBe(true)
  const plain = new Set<Disposable>()
  collectObjectAssets(new THREE.Mesh(geometry, material), plain)
  expect([...plain].some((asset) => asset instanceof THREE.Mesh)).toBe(false)
})
