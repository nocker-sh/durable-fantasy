import { Matrix4, Mesh } from "three"
import { concatBufferGeometries } from "#/lib/graphics/concat-buffer-geometries"
import type { StaticBatchGroup, StaticBatchMesh } from "#/lib/graphics/static-batch-types"

/** Bake geometry into its controlling parent's coordinates and retain the sample's render state. */
export function createStaticBatchMesh(group: StaticBatchGroup): StaticBatchMesh {
  const inverse = group.anchor.matrixWorld.clone().invert()
  const toAnchor = new Matrix4()
  const geometries = group.meshes.map((mesh) => mesh.geometry.clone().applyMatrix4(toAnchor.copy(inverse).multiply(mesh.matrixWorld)))

  const merged = new Mesh(concatBufferGeometries(geometries), group.sample.material)
  for (const geometry of geometries) geometry.dispose()

  merged.castShadow = group.sample.castShadow
  merged.receiveShadow = group.sample.receiveShadow
  merged.renderOrder = group.sample.renderOrder
  merged.frustumCulled = group.sample.frustumCulled
  merged.layers.mask = group.sample.layers.mask

  return merged
}
