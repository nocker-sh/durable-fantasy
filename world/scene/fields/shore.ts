import { groundH } from "#/world/scene/ground-h"
import { WATER_Y } from "#/world/maps/ground/rules"
import { roadD } from "#/world/scene/road-d"
export const shore = (x: number, z: number) => {
  const h = groundH(x, z)
  return h > WATER_Y - 0.05 && h < WATER_Y + 0.45 && roadD(x, z) > 0.8
}
