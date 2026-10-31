import { expect, it, vi } from "vitest"
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three"
import { pickVisibleOwner } from "#/lib/graphics/pick-visible-owner"

function owner(z: number) {
  const root = new Group()
  const branch = new Group()
  const mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
  branch.add(mesh)
  root.add(branch)
  root.position.z = z
  root.updateMatrixWorld(true)
  return { root, mesh }
}

it("finds the nearest registered root through a nested actual mesh intersection", () => {
  const near = owner(-3)
  const far = owner(-6)
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  expect(pickVisibleOwner({ ray, owners: [far, near], root: (entry) => entry.root })).toBe(near)
})

it("excludes invisible roots and returns no owner when all are hidden", () => {
  const near = owner(-3)
  const far = owner(-6)
  near.root.visible = false
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  expect(pickVisibleOwner({ ray, owners: [near, far], root: (entry) => entry.root })).toBe(far)
  far.root.visible = false
  expect(pickVisibleOwner({ ray, owners: [near, far], root: (entry) => entry.root })).toBeNull()
})

it("does not trust a child tag that names a different owner", () => {
  const near = owner(-3)
  const far = owner(-6)
  near.mesh.userData.actor = far
  near.mesh.userData.monster = { invalid: true }
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  expect(pickVisibleOwner({ ray, owners: [near, far], root: (entry) => entry.root })).toBe(near)
})

it("does not skip an unmatched front hit to select a later target", () => {
  const target = owner(-6)
  const unknown = owner(-3)
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  const hits = ray.intersectObjects([unknown.root, target.root], true)
  const probe = vi.spyOn(ray, "intersectObjects").mockReturnValue(hits)
  expect(pickVisibleOwner({ ray, owners: [target], root: (entry) => entry.root })).toBeNull()
  expect(probe).toHaveBeenCalledExactlyOnceWith([target.root], true)
})

it("reads replacement roots and collection changes on the next query", () => {
  const target = owner(-3)
  const owners = [target]
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  expect(pickVisibleOwner({ ray, owners, root: (entry) => entry.root })).toBe(target)
  target.root = owner(-6).root
  expect(pickVisibleOwner({ ray, owners, root: (entry) => entry.root })).toBe(target)
  target.root.position.x = 10
  target.root.updateMatrixWorld(true)
  expect(pickVisibleOwner({ ray, owners, root: (entry) => entry.root })).toBeNull()
  owners.length = 0
  expect(pickVisibleOwner({ ray, owners, root: (entry) => entry.root })).toBeNull()
})

it("preserves the first owner of a shared root and accepts zero-valued owners", () => {
  const target = owner(-3)
  const ray = new Raycaster(new Vector3(), new Vector3(0, 0, -1))
  expect(pickVisibleOwner({ ray, owners: [0, 1], root: () => target.root })).toBe(0)
})
