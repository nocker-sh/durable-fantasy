import { isStat } from "#/world/core/is-stat"
import { lifeLevel } from "#/world/core/life-level"
import type { Stats, Stat } from "#/world/core/growth-types"
import type { Skill } from "#/world/core/items/kinds"
import type { LifeExp } from "#/world/core/life-types"

type Props = { stats: Stats; life: LifeExp }

/** 装備条件には装備の補正前の能力値と生活スキルのレベルを使う。 */
export function standing(player: Props, key: Stat | Skill): number {
  if (isStat(key)) return player.stats[key]

  return lifeLevel(player.life[key] ?? 0)
}
