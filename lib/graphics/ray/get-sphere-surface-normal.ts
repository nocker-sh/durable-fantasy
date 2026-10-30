import { normalizeVector3 } from "#/lib/engine/normalize-vector3"
import type { Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"
type Props = Readonly<{ a: Vector3; sx?: number; sy?: number; sz?: number }>

export function getSphereSurfaceNormal(point: Vector3, primitive: Props): Vector3Tuple {
  const scaleX = primitive.sx ?? 1
  const scaleY = primitive.sy ?? 1
  const scaleZ = primitive.sz ?? 1
  return normalizeVector3([(point[0] - primitive.a[0]) / (scaleX * scaleX), (point[1] - primitive.a[1]) / (scaleY * scaleY), (point[2] - primitive.a[2]) / (scaleZ * scaleZ)])
}
