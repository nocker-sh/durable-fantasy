import type { Vector3 } from "../../engine/vector3-types"

export function hashSurfacePoint(point: Vector3): number {
  const hash = Math.sin(point[0] * 127.1 + point[1] * 311.7 + point[2] * 74.7) * 43758.5453
  return hash - Math.floor(hash)
}
