import { SKILLS } from "#/world/core/skills"
import type { SkillId } from "#/world/core/skill-types"

export function isSkillId(value: string): value is SkillId {
  return Object.hasOwn(SKILLS, value)
}
