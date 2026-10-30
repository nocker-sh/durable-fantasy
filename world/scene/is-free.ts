import { WR, WN, blocked } from "#/world/scene/world"

export function isFree(x: number, z: number): boolean {
  const i = Math.floor(x * WR),
    j = Math.floor(z * WR)
  if (i < 0 || j < 0 || i >= WN || j >= WN) return false
  return !blocked[j * WN + i]
}
