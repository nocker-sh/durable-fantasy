import { describe, expect, it } from "vitest"
import * as THREE from "three"
import { BillboardBatch } from "./billboards.ts"

describe("billboard batching", () => {
  it("sorts transparent particles back to front with their size and opacity", () => {
    const batch = new BillboardBatch(new THREE.Texture(), 3)
    const camera = new THREE.PerspectiveCamera()
    camera.updateMatrixWorld()
    batch.set(0, 1, 0, -2, 0.2, 0.1)
    batch.set(1, 2, 0, -8, 0.6, 0.5)
    batch.set(2, 3, 0, -4, 0.4, 0.3)
    batch.prepare(camera)
    const g = batch.mesh.geometry
    expect(g.instanceCount).toBe(3)
    expect(Array.from(g.getAttribute("offset").array)).toEqual([2, 0, -8, 3, 0, -4, 1, 0, -2])
    expect(g.getAttribute("size").getX(0)).toBeCloseTo(0.6)
    expect(g.getAttribute("alpha").getX(2)).toBeCloseTo(0.1)
    camera.rotation.y = Math.PI
    camera.updateMatrixWorld()
    batch.prepare(camera)
    expect(g.getAttribute("offset").getZ(0)).toBe(-2)
    batch.dispose()
  })
  it("sorts using the batch parent transform", () => {
    const batch = new BillboardBatch(new THREE.Texture(), 2)
    const parent = new THREE.Group()
    parent.rotation.y = Math.PI
    parent.add(batch.mesh)
    batch.set(0, 0, 0, -2, 1, 1)
    batch.set(1, 0, 0, -8, 1, 1)
    batch.prepare(new THREE.PerspectiveCamera())
    expect(batch.mesh.geometry.getAttribute("offset").getZ(0)).toBe(-2)
    batch.dispose()
  })
  it("supports an empty scene without creating phantom instances", () => {
    const batch = new BillboardBatch(new THREE.Texture(), 0)
    batch.prepare(new THREE.Camera())
    expect(batch.mesh.geometry.instanceCount).toBe(0)
    batch.dispose()
  })
})
