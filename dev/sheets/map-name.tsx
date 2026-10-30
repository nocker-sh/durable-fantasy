import { MAPS } from "#/world/maps/index"

export const mapName = (id: string) => MAPS[id]?.name ?? id
