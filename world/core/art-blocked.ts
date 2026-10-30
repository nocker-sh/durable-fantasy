import { skillOf } from "#/world/core/skill-of"
import { isArt } from "#/world/core/is-art"
import { lifeLevel } from "#/world/core/life-level"
import type { Stat } from "#/world/core/growth-types"
import type { ItemId } from "#/world/core/items/catalog"
import type { LifeExp } from "#/world/core/life-types"
import type { SkillId } from "#/world/core/skill-types"

type Props = { equipment: { weapon: ItemId | null }; stats: Readonly<Record<Stat, number>>; life: LifeExp }

/** Check the held weapon before requirements, retaining their authored order and raw stat values. */
export function artBlocked(id: SkillId, player: Props): "NO_WEAPON" | "STAT_TOO_LOW" | "SKILL_TOO_LOW" | null {
  const skill = skillOf(id)
  if (!isArt(skill)) return null
  if (!player.equipment.weapon || !skill.weapons.includes(player.equipment.weapon)) return "NO_WEAPON"

  const stats: Readonly<Partial<Record<string, number>>> = player.stats
  const life: Readonly<Partial<Record<string, number>>> = player.life
  for (const need of Object.entries(skill.needs)) {
    if (need[0] in player.stats) {
      const stat = stats[need[0]]
      if (stat !== undefined && stat < need[1]) return "STAT_TOO_LOW"
    } else if (lifeLevel(life[need[0]] ?? 0) < need[1]) return "SKILL_TOO_LOW"
  }

  return null
}
