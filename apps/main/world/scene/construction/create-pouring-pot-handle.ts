import { getPotHandleGeometry } from "#/world/scene/construction/get-pot-handle-geometry"
import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import type { PotHandleSection } from "#/world/town/get-pouring-pot-handle"

/** The wooden sleeve encloses the middle of one continuous iron bridge; its ends stay outside the hands. */
export function createPouringPotHandle(section: PotHandleSection): THREE.Mesh | Error {
  const from = new THREE.Vector3(...section.from),
    to = new THREE.Vector3(...section.to),
    direction = to.clone().sub(from)
  const geometry = getPotHandleGeometry(section)
  if (geometry instanceof Error) return geometry
  const material = section.material === "wood" ? M.woodV : M.iron,
    mesh = new THREE.Mesh(geometry, material)
  mesh.name = section.material === "wood" ? "wooden-grip" : "carrying-bridge"
  mesh.position.copy(from.add(to).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}
