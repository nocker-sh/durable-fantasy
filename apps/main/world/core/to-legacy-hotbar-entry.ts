import { isItemId } from "#/world/core/items/is-item-id"
import { skillKey } from "#/world/core/skill-key"
import { skillOfKey } from "#/world/core/skill-of-key"
import type { HotbarEntry } from "#/world/core/player-types"

/** 旧保存の基本技だけを座る操作へ移し、未対応の項目は空ける。 */
export function toLegacyHotbarEntry(entry: string | null): HotbarEntry | null {
  if (entry === "skill:basic") return skillKey("sit")
  if (!entry) return null
  if (isItemId(entry)) return entry
  const skill = skillOfKey(entry)

  return skill === null ? null : skillKey(skill)
}
