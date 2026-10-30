import type { BufferGeometry } from "three"

/** Shift each indexed geometry by its preceding vertex count, retaining source index order. */
export function getConcatenatedGeometryIndex(geometries: readonly BufferGeometry[]): Uint32Array {
  const length = geometries.reduce((count, geometry) => count + (geometry.index?.count ?? 0), 0)
  const index = new Uint32Array(length)
  const cursor = { index: 0, vertices: 0 }
  for (const geometry of geometries) {
    const source = geometry.index
    if (!source) throw new TypeError("Concatenated index requires indexed geometries")
    for (const vertex of source.array) index[cursor.index++] = vertex + cursor.vertices
    cursor.vertices += geometry.attributes.position.count
  }
  return index
}
