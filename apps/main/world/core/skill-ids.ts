import { SKILLS } from "#/world/core/skills"
import { isSkillId } from "#/world/core/is-skill-id"

export const SKILL_IDS = Object.keys(SKILLS).filter(isSkillId)
