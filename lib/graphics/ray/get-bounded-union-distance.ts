import type { BoundedField } from "#/lib/engine/field-separation"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
type Props = Readonly<{ fields: readonly BoundedField[]; point: V3 }>

/** Evaluate every bounded component in order without allocating arrays for each sampled point. */
export function getBoundedUnionDistance(props: Props): number {
  const minimum = { distance: Infinity }
  for (const field of props.fields) {
    const distance = Math.max(
      field.value(props.point) - (field.level ?? 0),
      field.min[0] - props.point[0],
      field.min[1] - props.point[1],
      field.min[2] - props.point[2],
      props.point[0] - field.max[0],
      props.point[1] - field.max[1],
      props.point[2] - field.max[2],
    )
    minimum.distance = Math.min(minimum.distance, distance)
  }
  return minimum.distance
}
