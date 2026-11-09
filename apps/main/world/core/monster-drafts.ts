import type { MonsterDraft } from "#/world/core/monster-draft-types"
import { draft as duneSidewinder } from "#/world/core/bestiary/dune-sidewinder"
import { draft as forestSpider } from "#/world/core/bestiary/forest-spider"

/** Creatures drawn and tuned but not yet let out into any map (game-system.md §8). */
export const MONSTER_DRAFTS: Record<string, MonsterDraft> = {
  "dune-sidewinder": duneSidewinder,
  "forest-spider": forestSpider,
}
