import * as THREE from "three"
import { expect, it } from "vitest"
import { GeometryBuilder } from "#/lib/graphics/geometry-builder"

it("keeps inspection snapshots independent of accumulated triangles and build resets", () => {
  const builder = new GeometryBuilder()
  const material = new THREE.MeshLambertMaterial()
  builder.tri({ material, a: [0, 0, 0], b: [1, 0, 0], c: [0, 1, 0], uvA: [0, 0], uvB: [1, 0], uvC: [0, 1] })
  const snapshot = builder.groups
  const group = snapshot.get(material)!

  expect(Object.isFrozen(builder)).toBe(true)
  expect(Reflect.set(group.pos, 0, 999)).toBe(false)
  expect(Reflect.set(group.uv, 0, 999)).toBe(false)
  Reflect.apply(Map.prototype.clear, snapshot, [])
  expect(builder.groups.size).toBe(1)
  expect(group.pos).toEqual([0, 0, 0, 1, 0, 0, 0, 1, 0])

  const beforeBuild = builder.groups
  const built = builder.build()
  expect(built.children).toHaveLength(1)
  expect(beforeBuild.size).toBe(1)
  expect(builder.groups.size).toBe(0)
  expect(builder.build().children).toHaveLength(0)
  built.traverse((object) => {
    if (object instanceof THREE.Mesh) object.geometry.dispose()
  })
  material.dispose()
})
