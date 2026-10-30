import { expect, it } from "vitest"
import { BoxGeometry, BufferAttribute, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Mesh, MeshBasicMaterial, SkinnedMesh } from "three"
import { isMergeableStaticMesh } from "#/lib/graphics/is-mergeable-static-mesh"

const exclusions: ReadonlyArray<Readonly<{ name: string; configure: (mesh: Mesh) => void }>> = [
  {
    name: "hidden",
    configure: (mesh) => {
      mesh.visible = false
    },
  },
  {
    name: "named",
    configure: (mesh) => {
      mesh.name = "controlled"
    },
  },
  {
    name: "metadata",
    configure: (mesh) => {
      mesh.userData.action = true
    },
  },
  {
    name: "multiple materials",
    configure: (mesh) => {
      mesh.material = [new MeshBasicMaterial()]
    },
  },
  {
    name: "missing positions",
    configure: (mesh) => {
      mesh.geometry.deleteAttribute("position")
    },
  },
  {
    name: "morphs",
    configure: (mesh) => {
      mesh.geometry.morphAttributes.position = [new BufferAttribute(new Float32Array(3), 3)]
    },
  },
  {
    name: "draw start",
    configure: (mesh) => {
      mesh.geometry.setDrawRange(1, Infinity)
    },
  },
  {
    name: "draw count",
    configure: (mesh) => {
      mesh.geometry.setDrawRange(0, 3)
    },
  },
  {
    name: "interleaved attributes",
    configure: (mesh) => {
      mesh.geometry.setAttribute("position", new InterleavedBufferAttribute(new InterleavedBuffer(new Float32Array(9), 3), 3, 0))
    },
  },
]

it("accepts a static mesh with one material and ordinary attributes", () => {
  expect(isMergeableStaticMesh(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))).toBe(true)
})

it.each(exclusions)("preserves the $name exclusion", (entry) => {
  const mesh: Mesh = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
  entry.configure(mesh)
  expect(isMergeableStaticMesh(mesh)).toBe(false)
})

it("keeps instanced and skinned meshes independent", () => {
  expect(isMergeableStaticMesh(new InstancedMesh(new BoxGeometry(), new MeshBasicMaterial(), 1))).toBe(false)
  expect(isMergeableStaticMesh(new SkinnedMesh(new BoxGeometry(), new MeshBasicMaterial()))).toBe(false)
})
