import { expect, it, vi } from "vitest"
import * as THREE from "three"
import { WarpMarkers } from "./warps"

vi.mock("../world", async (original) => ({ ...(await original<typeof import("../world")>()), walkH: () => 2 }))

it("reuses one geometry and material through repeated exit list changes", () => {
  const scene = new THREE.Scene()
  const marks = new WarpMarkers(scene)
  marks.set([
    [2, 4],
    [6, 8],
  ])
  const first = scene.children[0] as THREE.Mesh
  const geometry = first.geometry
  const material = first.material
  expect(first.position.toArray()).toEqual([1.25, 2.05, 2.25])
  for (let i = 0; i < 100; i++) {
    marks.set([[4, 6]])
    expect(scene.children).toEqual([first])
    marks.set([
      [4, 6],
      [8, 10],
      [12, 14],
    ])
    expect(scene.children).toHaveLength(3)
    for (const child of scene.children as THREE.Mesh[]) {
      expect(child.geometry).toBe(geometry)
      expect(child.material).toBe(material)
    }
  }
  const disposeGeometry = vi.spyOn(geometry, "dispose")
  const disposeMaterial = vi.spyOn(material as THREE.Material, "dispose")
  marks.dispose()
  expect(scene.children).toHaveLength(0)
  expect(disposeGeometry).toHaveBeenCalledOnce()
  expect(disposeMaterial).toHaveBeenCalledOnce()
})

it("preserves pulsing and rotation when exits are removed and restored", () => {
  const scene = new THREE.Scene()
  const marks = new WarpMarkers(scene)
  marks.set([[0, 0]])
  const first = scene.children[0] as THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>
  marks.set([])
  expect(scene.children).toHaveLength(0)
  marks.set([[0, 0]])
  marks.update(2)
  const restored = scene.children[0] as typeof first
  expect(restored.geometry).toBe(first.geometry)
  expect(restored.material).toBe(first.material)
  expect(restored.rotation.x).toBe(-Math.PI / 2)
  expect(restored.rotation.z).toBe(0.6)
  expect(restored.material.opacity).toBeCloseTo(0.4 + Math.sin(4) * 0.15)
  marks.dispose()
})
