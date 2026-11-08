import type { MapId } from "#/world/maps/types"
import type { MonsterKind } from "#/world/core/monster-types"

/**
 * A creature drawn and tuned but not yet let out: it has no spawns and no settings document.
 * Letting one out moves its kind to MONSTER_KINDS with spawns, ecology and a document (game-system.md §8).
 */
export type MonsterDraft = {
  kind: MonsterKind & { look: "model"; model: NonNullable<MonsterKind["model"]> }
  /** the map it would live on */
  home: MapId
  /** what it eats, where it rests and what it does when people come near, in a sentence or two */
  life: string
  /** what is left of the war weapon it descends from (world.md「魔物」) */
  origin: string
}
