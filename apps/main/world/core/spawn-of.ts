import { SPAWNS } from "#/world/core/monsters"

const spawnsById = new Map(SPAWNS.map((spawn) => [spawn.id, spawn]))

export const spawnOf = (id: string) => spawnsById.get(id)
