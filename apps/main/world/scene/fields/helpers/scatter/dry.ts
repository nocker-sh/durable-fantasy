import { WATER_Y } from "#/world/maps/ground/rules"
import { groundH } from "#/world/scene/ground-h"

export const dry = (x: number, z: number) => groundH(x, z) > WATER_Y + 0.25
