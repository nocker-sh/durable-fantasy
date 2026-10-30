import type { BufferGeometry, Material, Mesh, Object3D } from "three"

export type MergeOptions = Readonly<{
  /** Objects whose transform or visibility changes; descendants merge under them rather than above them. */
  anchors: Iterable<Object3D>
  /** Objects whose own local transforms change after construction. */
  moving: Iterable<Object3D>
}>
export type StaticBatchMesh = Mesh<BufferGeometry, Material>
export type StaticBatchGroup = Readonly<{ anchor: Object3D; sample: StaticBatchMesh; meshes: readonly StaticBatchMesh[] }>
export type StaticBatchCollection = Readonly<{ before: number; groups: ReadonlyMap<string, StaticBatchGroup> }>
