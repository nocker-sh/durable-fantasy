import { SKILLS } from "#/world/core/skills"
import type { SkillDef, SkillId } from "#/world/core/skill-types"

export function skillOf(id: SkillId): SkillDef {
  return SKILLS[id]
}
