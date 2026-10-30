import { MAPS } from "#/world/maps"
import type { MapId } from "#/world/maps/types"

export const isMapId = (value: string): value is MapId => Object.hasOwn(MAPS, value)
