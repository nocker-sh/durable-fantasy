import { isFree } from "#/world/scene/is-free"
import { roadD } from "#/world/scene/road-d"
import { trailD } from "#/world/scene/trail-d"
import { dry } from "#/world/scene/fields/helpers/scatter/dry"

export const offRoad = (gap: number) => (x: number, z: number) => roadD(x, z) > gap && trailD(x, z) > 0.55 && dry(x, z) && isFree(x, z)
