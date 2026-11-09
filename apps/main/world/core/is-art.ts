import type { Art, SkillDef } from "#/world/core/skill-types"

export function isArt(skill: SkillDef): skill is Art {
  return skill.kind !== "action"
}
