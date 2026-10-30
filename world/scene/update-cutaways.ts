import * as THREE from "three"
import { cutaways } from "#/world/scene/interior"

export function updateCutaways(cam: THREE.Vector3) {
  for (const c of cutaways) {
    const facing = (cam.x - c.at[0]) * c.normal[0] + (cam.z - c.at[1]) * c.normal[1] > 0
    const want = facing ? 0.12 : 1
    c.obj.scale.y += (want - c.obj.scale.y) * 0.25
    for (const detail of c.details ?? []) detail.visible = !facing && c.obj.scale.y >= 0.95
  }
}
