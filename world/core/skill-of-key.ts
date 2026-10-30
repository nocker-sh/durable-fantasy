import { isSkillId } from "#/world/core/is-skill-id"
import type { SkillId } from "#/world/core/skill-types"

/** Only the skill prefix followed by a current own catalogue key identifies a skill shortcut. */
export function skillOfKey(key: string): SkillId | null {
  if (!key.startsWith("skill:")) return null
  const id = key.slice(6)

  return isSkillId(id) ? id : null
}
