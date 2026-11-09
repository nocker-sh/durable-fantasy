import { roadD } from "#/world/scene/road-d"
import { dry } from "#/world/scene/fields/helpers/scatter/dry"
import { isFree } from "#/world/scene/is-free"
export const verge = (from: number, to: number) => (x: number, z: number) => {
  const d = roadD(x, z)
  return d > from && d < to && dry(x, z) && isFree(x, z)
}
