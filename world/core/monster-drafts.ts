import type { MonsterDraft } from "#/world/core/monster-draft-types"
import { draft as lanternBeetle } from "#/world/core/bestiary/lantern-beetle"

/** Creatures drawn and tuned but not yet let out into any map (game-system.md §8「魔物の案」). */
export const MONSTER_DRAFTS: Record<string, MonsterDraft> = {
  "lantern-beetle": lanternBeetle,
}
