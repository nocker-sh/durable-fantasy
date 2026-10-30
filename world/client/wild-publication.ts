import type { CreatureHealth } from "#/world/core/wild/types"

export type PublishedCreature = CreatureHealth & { revision?: number }

export type WildView = Record<string, PublishedCreature>
