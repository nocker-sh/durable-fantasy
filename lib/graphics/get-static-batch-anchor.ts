import type { Object3D } from "three"

/** Find the nearest controlling parent; hidden ancestors stop the search unless they are registered anchors. */
export function getStaticBatchAnchor(mesh: Object3D, anchors: ReadonlySet<Object3D>): Object3D | null {
  const cursor = { object: mesh.parent }
  while (cursor.object) {
    const object = cursor.object
    if (anchors.has(object)) return object
    if (!object.visible) return null
    cursor.object = object.parent
  }
  return null
}
