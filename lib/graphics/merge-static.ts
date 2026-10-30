import type { Object3D } from "three"
import { getStaticBatchGroups } from "#/lib/graphics/get-static-batch-groups"
import { mergeStaticBatchGroups } from "#/lib/graphics/merge-static-batch-groups"
import { removeEmptyStaticParents } from "#/lib/graphics/remove-empty-static-parents"
import type { MergeOptions } from "#/lib/graphics/static-batch-types"

/** Merge compatible still meshes under their nearest controlling parent, preserving moving and independently hidden objects. */
export function mergeStatic(root: Object3D, options: MergeOptions): { before: number; after: number } {
  const moving = new Set(options.moving)
  const anchors = new Set([root, ...options.anchors, ...moving])
  root.updateMatrixWorld(true)

  const collection = getStaticBatchGroups({ root, moving, anchors })
  const merged = mergeStaticBatchGroups(collection.groups.values())
  removeEmptyStaticParents({ root, parents: merged.emptied, anchors })

  root.traverse((object) => {
    if (!anchors.has(object)) {
      object.updateMatrix()
      object.matrixAutoUpdate = false
    }
  })

  return { before: collection.before, after: collection.before - merged.removed }
}
