import { BufferAttribute, BufferGeometry, Mesh } from "three"
import { createHeightfieldVertices } from "#/lib/graphics/create-heightfield-vertices"
import { createGridIndices } from "#/lib/graphics/create-grid-indices"
import { createGroundMaterial } from "#/world/scene/runtime/create-ground-material"
import { meshHeights } from "#/world/scene/mesh-heights"
import { N } from "#/world/scene/world"
import type { PixelBuffer } from "#/lib/graphics/pixel-buffer"
import type { CleanupStack } from "#/lib/engine/cleanup-stack"

/** 地形の頂点と三角形を組み、材質の取得前に幾何を所有して途中の失敗でも回収する。 */
export function createGroundSurface(ground: PixelBuffer, resources: CleanupStack) {
  const vertices = createHeightfieldVertices({ size: N, resolution: 4, heights: meshHeights(4) })
  const indices = createGridIndices(vertices.side)
  const geometry = resources.use(new BufferGeometry())
  geometry.setAttribute("position", new BufferAttribute(vertices.positions, 3))
  geometry.setAttribute("uv", new BufferAttribute(vertices.uv, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  const terrain = new Mesh(geometry, createGroundMaterial(ground, resources))
  terrain.receiveShadow = true
  terrain.castShadow = true
  return terrain
}
