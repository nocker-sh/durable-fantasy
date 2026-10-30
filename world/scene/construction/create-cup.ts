import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { createCupHandle } from "#/world/scene/construction/create-cup-handle"
import type { getCupProfile } from "#/world/town/get-cup-profile"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { profile: Exclude<ReturnType<typeof getCupProfile>, Error>; at: Point3; inverted: boolean }

/** Keep the hollow, base and handle in the existing ceramic material; invert the same object rather than inventing a drying shape. */
export function createCup(props: Props): THREE.Group {
  const profile = props.profile,
    root = new THREE.Group(),
    points = [...profile.bowl.outerProfile, ...profile.bowl.innerProfile].map((point) => new THREE.Vector2(point[0], point[1]))
  const body = new THREE.Mesh(new THREE.LatheGeometry(points, 12), M.ceramic)
  root.name = "cup"
  body.name = "body"
  body.position.set(profile.centre[0], 0, profile.centre[1])
  body.castShadow = true
  body.receiveShadow = true
  root.add(body)
  for (const section of profile.handle) root.add(createCupHandle(section))
  root.position.set(...props.at)
  if (props.inverted) {
    root.rotation.x = Math.PI
    root.position.y += profile.height
    root.position.z += profile.depth
  }

  return root
}
