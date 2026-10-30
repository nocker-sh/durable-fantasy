import { BufferAttribute, BufferGeometry } from "three"
import { createAttributeArray } from "#/lib/graphics/create-attribute-array"
import { getConcatenatedGeometryIndex } from "#/lib/graphics/get-concatenated-geometry-index"

/** Join compatible, non-interleaved attributes; callers group identical layouts and indexing modes first. */
export function concatBufferGeometries(geometries: readonly BufferGeometry[]): BufferGeometry {
  const first = geometries[0]
  if (!first) throw new RangeError("Geometry concatenation requires at least one geometry")
  const combined = new BufferGeometry()
  for (const name of Object.keys(first.attributes)) {
    const attribute = first.attributes[name]
    const count = geometries.reduce((total, geometry) => total + geometry.attributes[name].count, 0)
    const array = createAttributeArray(attribute.array, count * attribute.itemSize)
    geometries.reduce((offset, geometry) => {
      const source = geometry.attributes[name]
      array.set(source.array, offset)
      return offset + source.count * attribute.itemSize
    }, 0)
    combined.setAttribute(name, new BufferAttribute(array, attribute.itemSize, attribute.normalized))
  }
  if (first.index) combined.setIndex(new BufferAttribute(getConcatenatedGeometryIndex(geometries), 1))
  return combined
}
