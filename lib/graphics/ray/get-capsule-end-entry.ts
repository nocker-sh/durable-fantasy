import { dotVector3 } from "#/lib/engine/dot-vector3"
import type { Vector3 } from "#/lib/engine/vector3-types"

/** 正規化した光線の球への入口。未交差は負の交点と区別し、端の接線の扱いは維持する。 */
export function getCapsuleEndEntry(offset: Vector3, direction: Vector3, radius: number): number | null {
  const projection = dotVector3(direction, offset)
  const constant = dotVector3(offset, offset) - radius * radius
  const discriminant = projection * projection - constant
  if (discriminant > 0) return -projection - Math.sqrt(discriminant)
  return null
}
