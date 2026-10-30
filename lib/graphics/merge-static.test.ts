import { describe, expect, it } from "vitest"
import * as THREE from "three"
import { mergeStatic } from "#/lib/graphics/merge-static"

const material = new THREE.MeshBasicMaterial()
function box(x: number) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
  m.position.x = x
  return m
}

describe("static batching", () => {
  it("preserves world bounds beneath transformed parents", () => {
    const root = new THREE.Group()
    root.position.set(3, 2, 1)
    const parent = new THREE.Group()
    parent.rotation.y = Math.PI / 4
    parent.add(box(1), box(3))
    root.add(parent)
    const before = new THREE.Box3().setFromObject(root)
    expect(mergeStatic(root, { anchors: [], moving: [] })).toEqual({ before: 2, after: 1 })
    const after = new THREE.Box3().setFromObject(root)
    expect(after.min.distanceTo(before.min)).toBeLessThan(1e-6)
    expect(after.max.distanceTo(before.max)).toBeLessThan(1e-6)
    expect(root.children[0].matrixAutoUpdate).toBe(false)
  })

  it("keeps animated objects and their children attached to their moving parent", () => {
    const root = new THREE.Group()
    const moving = new THREE.Group()
    moving.add(box(0), box(2))
    root.add(moving, box(5))
    mergeStatic(root, { anchors: [], moving: [moving] })
    expect(moving.children).toHaveLength(1)
    expect(moving.matrixAutoUpdate).toBe(true)
    moving.position.x = 7
    root.updateMatrixWorld(true)
    const bounds = new THREE.Box3().setFromObject(moving)
    expect(bounds.min.x).toBeCloseTo(6.5)
    expect(bounds.max.x).toBeCloseTo(9.5)
  })

  it("keeps independently hidden groups separate", () => {
    const root = new THREE.Group()
    const stall = new THREE.Group()
    stall.add(box(0), box(1))
    root.add(stall, box(5), box(6))
    mergeStatic(root, { anchors: [stall], moving: [] })
    expect(stall.children).toHaveLength(1)
    expect(root.children).toHaveLength(2)
    stall.visible = false
    const visible: THREE.Object3D[] = []
    root.traverseVisible((o) => {
      if ("isMesh" in o && o.isMesh) visible.push(o)
    })
    expect(visible).toHaveLength(1)
  })

  it("does not copy geometry for a unique material or merge partial draw ranges", () => {
    const root = new THREE.Group()
    const a = box(0),
      b = box(1)
    b.geometry.setDrawRange(0, 3)
    const geometry = a.geometry
    root.add(a, b)
    expect(mergeStatic(root, { anchors: [], moving: [] })).toEqual({ before: 2, after: 2 })
    expect(a.geometry).toBe(geometry)
    expect(b.geometry.drawRange.count).toBe(3)
  })
})
