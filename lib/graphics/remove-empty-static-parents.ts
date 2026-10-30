import type { Object3D } from "three"

type Props = Readonly<{ root: Object3D; parents: Iterable<Object3D>; anchors: ReadonlySet<Object3D> }>

/** Remove abandoned containers without removing control anchors or walking beyond the scene root. */
export function removeEmptyStaticParents(props: Props): void {
  for (const parent of props.parents) {
    const cursor: { object: Object3D | null } = { object: parent }
    while (cursor.object && cursor.object !== props.root && !props.anchors.has(cursor.object) && cursor.object.children.length === 0) {
      const object = cursor.object
      cursor.object = object.parent
      object.removeFromParent()
    }
  }
}
