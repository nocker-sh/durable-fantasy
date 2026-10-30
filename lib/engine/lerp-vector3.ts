import type { Vector3, Vector3Tuple } from "#/lib/engine/vector3-types"
export function lerpVector3(from: Vector3, to: Vector3, progress: number): Vector3Tuple {
  return [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress, from[2] + (to[2] - from[2]) * progress]
}
