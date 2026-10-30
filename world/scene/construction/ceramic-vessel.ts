import * as THREE from "three"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"
export type VesselPurpose = "tea" | "oil" | "glaze"
type Profile = readonly (readonly [number, number])[]

/** Closed household and workshop vessels; their silhouettes identify the use without added labels. */
export function ceramicVessel(furniture: Furniture, floorY: number, purpose: VesselPurpose): THREE.Group {
  const diameter = Math.min(furniture.w, furniture.d)
  const height = diameter * (purpose === "oil" ? 1.35 : purpose === "glaze" ? 0.9 : 0.95)
  const root = new THREE.Group()
  root.name = `${purpose}-jar`
  root.position.set(furniture.x, floorY, furniture.z)
  const lathe = (name: string, profile: Profile, material: THREE.Material) => {
    const source = new THREE.LatheGeometry(
      profile.map((entry) => {
        const radius = entry[0]
        const y = entry[1]
        return new THREE.Vector2(radius * diameter, y * height)
      }),
      10,
    )
    const geometry = source.toNonIndexed()
    source.dispose()
    geometry.computeVertexNormals()
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  }
  if (purpose === "oil") {
    lathe(
      "body",
      [
        [0, 0],
        [0.22, 0],
        [0.32, 0.08],
        [0.42, 0.35],
        [0.4, 0.62],
        [0.16, 0.8],
        [0.13, 0.84],
        [0.13, 0.93],
        [0, 0.93],
      ],
      M.ceramic,
    )
    lathe(
      "stopper",
      [
        [0, 0.92],
        [0.145, 0.92],
        [0.15, 0.99],
        [0, 0.99],
      ],
      M.woodV,
    )
    const tie = new THREE.Mesh(new THREE.TorusGeometry(diameter * 0.145, diameter * 0.012, 4, 10), M.rope)
    tie.name = "neck-tie"
    tie.rotation.x = Math.PI / 2
    tie.position.y = height * 0.89
    root.add(tie)
  } else if (purpose === "glaze") {
    lathe(
      "body",
      [
        [0, 0],
        [0.3, 0],
        [0.4, 0.1],
        [0.43, 0.6],
        [0.39, 0.82],
        [0.39, 0.9],
        [0, 0.9],
      ],
      M.ceramic,
    )
    lathe(
      "lid",
      [
        [0, 0.9],
        [0.42, 0.9],
        [0.42, 0.95],
        [0.07, 0.95],
        [0.07, 1],
        [0, 1],
      ],
      M.woodV,
    )
  } else {
    lathe(
      "body",
      [
        [0, 0],
        [0.23, 0],
        [0.32, 0.08],
        [0.42, 0.35],
        [0.4, 0.65],
        [0.29, 0.8],
        [0.27, 0.84],
        [0, 0.84],
      ],
      M.ceramic,
    )
    lathe(
      "lid",
      [
        [0, 0.84],
        [0.31, 0.84],
        [0.29, 0.9],
        [0.05, 0.92],
        [0.05, 0.98],
        [0, 0.98],
      ],
      M.ceramic,
    )
    for (const side of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(diameter * 0.08, diameter * 0.025, 4, 10), M.ceramic)
      handle.name = "handle"
      handle.rotation.y = Math.PI / 2
      handle.position.set(side * diameter * 0.41, height * 0.5, 0)
      root.add(handle)
    }
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  return root
}
