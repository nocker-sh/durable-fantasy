import type { Mesh } from "three"
import type { StaticBatchMesh } from "#/lib/graphics/static-batch-types"

/** Keep independently controlled meshes and geometry layouts that cannot be concatenated out of static batches. */
export function isMergeableStaticMesh(mesh: Mesh): mesh is StaticBatchMesh {
  if (!mesh.visible || Array.isArray(mesh.material) || mesh.name || Object.keys(mesh.userData).length) return false
  if (("isInstancedMesh" in mesh && mesh.isInstancedMesh) || ("isSkinnedMesh" in mesh && mesh.isSkinnedMesh)) return false
  const geometry = mesh.geometry
  if (!geometry.attributes.position || Object.keys(geometry.morphAttributes).length) return false
  if (geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity) return false
  if (Object.values(geometry.attributes).some((attribute) => "isInterleavedBufferAttribute" in attribute && attribute.isInterleavedBufferAttribute)) return false
  return true
}
