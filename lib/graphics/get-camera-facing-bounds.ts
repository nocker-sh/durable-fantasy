import { Box3, Sphere, Sprite, Vector3 } from "three"
import type { Object3D } from "three"

/** Ordinary geometry has fixed bounds; anchored sprites need room for their camera-facing corners throughout rotation. */
export function getCameraFacingBounds(root: Object3D): Box3 {
  const bounds = new Box3().setFromObject(root)
  root.traverse((object) => {
    if (!(object instanceof Sprite)) return
    const scale = object.getWorldScale(new Vector3()),
      centre = object.getWorldPosition(new Vector3())
    const width = Math.max(Math.abs(object.center.x), Math.abs(1 - object.center.x)) * Math.abs(scale.x)
    const height = Math.max(Math.abs(object.center.y), Math.abs(1 - object.center.y)) * Math.abs(scale.y)
    const envelope = new Sphere(centre, Math.hypot(width, height)).getBoundingBox(new Box3())
    bounds.union(envelope)
  })

  return bounds
}
