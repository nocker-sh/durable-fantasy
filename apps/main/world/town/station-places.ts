import type { Station } from "#/world/core/crafting-types"

export type StationPlace = Pick<Station, "map" | "cell">
