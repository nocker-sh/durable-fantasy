import type { SkillId, SkillKey } from "#/world/core/skill-types"

/** Distinguish skill shortcuts from item shortcuts without changing the saved key format. */
export function skillKey(id: SkillId): SkillKey {
  return `skill:${id}`
}
