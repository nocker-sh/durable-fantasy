import type { Object3D } from "three"
import { createStaticBatchMesh } from "#/lib/graphics/create-static-batch-mesh"
import type { StaticBatchGroup } from "#/lib/graphics/static-batch-types"

/** Replace only groups with multiple meshes; report newly emptied parents for a separate cleanup pass. */
export function mergeStaticBatchGroups(groups: Iterable<StaticBatchGroup>): Readonly<{ removed: number; emptied: ReadonlySet<Object3D> }> {
  const merged = { removed: 0, emptied: new Set<Object3D>() }
  for (const group of groups) {
    if (group.meshes.length < 2) continue
    group.anchor.add(createStaticBatchMesh(group))
    for (const mesh of group.meshes) {
      const parent = mesh.parent
      mesh.removeFromParent()
      if (parent) merged.emptied.add(parent)
    }
    merged.removed += group.meshes.length - 1
  }
  return merged
}
