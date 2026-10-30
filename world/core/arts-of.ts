import { SKILL_IDS } from "#/world/core/skill-ids"
import { skillOf } from "#/world/core/skill-of"
import { isArt } from "#/world/core/is-art"
import type { SkillId } from "#/world/core/skill-types"
import type { ItemId } from "#/world/core/items/catalog"

const weaponArts = new Map<ItemId, readonly SkillId[]>()
const noArts: readonly SkillId[] = Object.freeze([])
for (const id of SKILL_IDS) {
  const skill = skillOf(id)
  if (!isArt(skill)) continue
  for (const weapon of skill.weapons) weaponArts.set(weapon, [...(weaponArts.get(weapon) ?? noArts), id])
}
for (const arts of weaponArts.values()) Object.freeze(arts)

/** Stable, immutable lists in definition order, shared by skill windows and item descriptions. */
export function artsOf(weapon: ItemId | null): readonly SkillId[] {
  return weapon ? (weaponArts.get(weapon) ?? noArts) : noArts
}
