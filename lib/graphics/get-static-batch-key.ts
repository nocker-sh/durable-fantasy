import type { Object3D } from "three"
import type { StaticBatchMesh } from "#/lib/graphics/static-batch-types"

/** Only identical material, control parent, render state and attribute layouts share a batch. */
export function getStaticBatchKey(mesh: StaticBatchMesh, anchor: Object3D): string {
  const geometry = mesh.geometry
  const attributes = Object.keys(geometry.attributes)
    .sort()
    .map((name) => `${name}:${geometry.attributes[name].itemSize}:${geometry.attributes[name].normalized}:${geometry.attributes[name].array.constructor.name}`)
    .join(",")
  return [anchor.id, mesh.material.id, +mesh.castShadow, +mesh.receiveShadow, mesh.renderOrder, +mesh.frustumCulled, mesh.layers.mask, geometry.index ? 1 : 0, attributes].join("|")
}
