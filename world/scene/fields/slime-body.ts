import { SLIME_BODY_RADIUS } from "#/world/core/monster-body-shapes"
import * as THREE from "three"
import { slimeTex } from "#/world/scene/fields/helpers/creatures/slime-tex"

export function slimeBody(color: number): THREE.Group {
  const body = new THREE.Group()
  const gel = new THREE.Mesh(
    new THREE.SphereGeometry(SLIME_BODY_RADIUS, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshLambertMaterial({ map: slimeTex(color), transparent: true, opacity: 0.92 }),
  )
  gel.position.y = -0.06
  gel.castShadow = true
  body.add(gel)
  return body
}
