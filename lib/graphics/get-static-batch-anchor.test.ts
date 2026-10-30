import { expect, it } from "vitest"
import { Group, Object3D } from "three"
import { getStaticBatchAnchor } from "#/lib/graphics/get-static-batch-anchor"
import { removeEmptyStaticParents } from "#/lib/graphics/remove-empty-static-parents"

it("uses the nearest registered ancestor and respects hidden unregistered parents", () => {
  const root = new Group(),
    parent = new Group(),
    mesh = new Object3D()
  root.add(parent)
  parent.add(mesh)
  expect(getStaticBatchAnchor(mesh, new Set([root, parent]))).toBe(parent)
  parent.visible = false
  expect(getStaticBatchAnchor(mesh, new Set([root]))).toBeNull()
  expect(getStaticBatchAnchor(mesh, new Set([root, parent]))).toBe(parent)
  expect(getStaticBatchAnchor(root, new Set([root]))).toBeNull()
})

it("removes empty parent chains while retaining roots, anchors and populated containers", () => {
  const root = new Group(),
    anchor = new Group(),
    empty = new Group(),
    leaf = new Group(),
    occupied = new Group()
  root.add(anchor, occupied)
  anchor.add(empty)
  empty.add(leaf)
  occupied.add(new Object3D())
  removeEmptyStaticParents({ root, parents: [leaf, empty, occupied, anchor, root], anchors: new Set([root, anchor]) })
  expect(anchor.children).toEqual([])
  expect(root.children).toEqual([anchor, occupied])
  expect(occupied.children).toHaveLength(1)
  expect(empty.parent).toBeNull()
  expect(leaf.parent).toBeNull()
})
