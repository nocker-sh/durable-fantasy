import type { Mesh, Object3D } from "three"
import { getStaticBatchAnchor } from "#/lib/graphics/get-static-batch-anchor"
import { getStaticBatchKey } from "#/lib/graphics/get-static-batch-key"
import { isMergeableStaticMesh } from "#/lib/graphics/is-mergeable-static-mesh"
import type { StaticBatchCollection, StaticBatchGroup, StaticBatchMesh } from "#/lib/graphics/static-batch-types"

type Props = Readonly<{ root: Object3D; moving: ReadonlySet<Object3D>; anchors: ReadonlySet<Object3D> }>
type CollectingGroup = Omit<StaticBatchGroup, "meshes"> & { meshes: StaticBatchMesh[] }
const isMesh = (object: Object3D): object is Mesh => "isMesh" in object && Boolean(object.isMesh)

/** Count every mesh while collecting compatible static meshes in their original traversal order. */
export function getStaticBatchGroups(props: Props): StaticBatchCollection {
  const collection = { before: 0, groups: new Map<string, CollectingGroup>() }

  props.root.traverse((mesh) => {
    if (!isMesh(mesh)) return
    collection.before++
    if (props.moving.has(mesh) || !isMergeableStaticMesh(mesh)) return
    const anchor = getStaticBatchAnchor(mesh, props.anchors)
    if (!anchor) return
    const key = getStaticBatchKey(mesh, anchor)
    const group = collection.groups.get(key)
    if (group) group.meshes.push(mesh)
    else collection.groups.set(key, { anchor, sample: mesh, meshes: [mesh] })
  })

  return collection
}
