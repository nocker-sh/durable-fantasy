import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { getPouringPotPoint } from "#/world/town/get-pouring-pot-point"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
type Profile = Exclude<ReturnType<typeof getPouringPotProfile>, Error>

/** The same inner and outer rim both open into the lip; no sealed side wall is disguised by an external spout. */
export function createPouringPotBody(profile: Profile): THREE.Mesh | Error {
  const points = [...profile.outer, ...profile.inner].map((point) => new THREE.Vector2(point[0], point[1])),
    geometry = new THREE.LatheGeometry(points, 12),
    position = geometry.getAttribute("position")
  for (const index of Array.from({ length: position.count }).keys()) {
    const x = position.getX(index),
      z = position.getZ(index),
      point = getPouringPotPoint({ profile, radius: Math.hypot(x, z), height: position.getY(index), angle: Math.atan2(z, x) })
    if (point instanceof Error) {
      geometry.dispose()
      return point
    }
    position.setXYZ(index, point[0], point[1], point[2])
  }
  geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(geometry, M.iron)
  mesh.name = "pot-body"
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}
