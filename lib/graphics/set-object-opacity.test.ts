import { expect, it } from "vitest"
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from "three"
import { setObjectOpacity } from "#/lib/graphics/set-object-opacity"

it("updates single and multiple materials through a nested group and restores depth writes", () => {
  const first = new MeshBasicMaterial()
  const second = new MeshBasicMaterial()
  const root = new Group()
  root.add(new Group().add(new Mesh(new BoxGeometry(), first), new Mesh(new BoxGeometry(), [first, second])))
  setObjectOpacity(root, 0.2)
  for (const material of [first, second]) {
    expect(material.opacity).toBe(0.2)
    expect(material.transparent).toBe(true)
    expect(material.depthWrite).toBe(false)
  }
  setObjectOpacity(root, 1)
  for (const material of [first, second]) {
    expect(material.opacity).toBe(1)
    expect(material.transparent).toBe(false)
    expect(material.depthWrite).toBe(true)
  }
})
