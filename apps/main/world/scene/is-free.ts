import { blocked } from "#/world/scene/world"
import { WR, WN } from "#/world/maps/ground/rules"

export function isFree(x: number, z: number): boolean {
  const i = Math.floor(x * WR),
    j = Math.floor(z * WR)
  if (i < 0 || j < 0 || i >= WN || j >= WN) return false
  return !blocked[j * WN + i]
}
