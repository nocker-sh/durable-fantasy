import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { hareBody } from "./creatures"
import { outlineShape } from "../outline"

it("keeps all seven boxes and the body shadow in four draws", () => {
  const disposed = vi.spyOn(THREE.BufferGeometry.prototype, "dispose")
  try {
    const body = hareBody(0x85858b)
    const parts = body.children as THREE.Mesh[]
    expect(parts).toHaveLength(4)
    expect(parts.reduce((n, p) => n + p.geometry.index!.count / 3, 0)).toBe(84)
    const shadows = parts.filter((p) => p.castShadow)
    expect(shadows).toHaveLength(1)
    expect(shadows[0].geometry.index!.count / 3).toBe(12)
    expect(disposed).toHaveBeenCalledTimes(10) // five temporary transformed copies and five replaced originals
    const bounds = new THREE.Box3().setFromObject(body)
    expect(bounds.min.z).toBeCloseTo(-0.165)
    expect(bounds.max.y).toBeCloseTo(0.345)
    expect(bounds.max.z).toBeCloseTo(0.2)
  } finally {
    disposed.mockRestore()
  }
})

it("keeps picking and the selection outline attached while the body moves", () => {
  const body = hareBody()
  body.position.set(2, 0, 3)
  body.rotation.y = Math.PI / 2
  body.updateMatrixWorld(true)
  const ray = new THREE.Raycaster(new THREE.Vector3(3, 0.09, 3), new THREE.Vector3(-1, 0, 0))
  expect(ray.intersectObject(body, true).length).toBeGreaterThan(0)
  outlineShape(body, true)
  const shells = body.userData.shells as THREE.Mesh[]
  expect(shells).toHaveLength(4)
  expect(shells.every((s) => s.visible && s.geometry === (s.parent as THREE.Mesh).geometry)).toBe(true)
  outlineShape(body, false)
  expect(shells.every((s) => !s.visible)).toBe(true)
})
