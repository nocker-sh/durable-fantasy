import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import type { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
type Profile = Exclude<ReturnType<typeof getPouringPotProfile>, Error>

/** The lid is a single removable object; its round edge leaves the shaped pouring lip uncovered. */
export function createPouringPotLid(profile: Profile): THREE.Group {
  const p = profile.dimensions,
    group = new THREE.Group(),
    plate = new THREE.Mesh(new THREE.CylinderGeometry(p.lidRadius, p.lidRadius, p.lidThickness, 12), M.iron),
    knob = new THREE.Mesh(new THREE.CylinderGeometry(p.knobRadius, p.knobRadius, p.knobHeight, 8), M.woodV)
  group.name = "pot-lid"
  plate.position.y = p.lidThickness / 2
  knob.position.y = p.lidThickness + p.knobHeight / 2
  for (const part of [plate, knob]) {
    part.castShadow = true
    part.receiveShadow = true
    group.add(part)
  }

  return group
}
