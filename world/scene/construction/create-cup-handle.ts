import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import type { getCupProfile } from "#/world/town/get-cup-profile"
type Props = Exclude<ReturnType<typeof getCupProfile>, Error>["handle"][number]

/** Capsule endpoints are the same physical handle centres used for the measured cup envelope. */
export function createCupHandle(props: Props): THREE.Mesh {
  const from = new THREE.Vector3(...props.from),
    to = new THREE.Vector3(...props.to),
    direction = to.clone().sub(from)
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(props.radius, direction.length(), 4, 8), M.ceramic)
  mesh.name = "handle"
  mesh.position.copy(from.add(to).multiplyScalar(0.5))
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}
