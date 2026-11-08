import { STATS } from "#/world/core/growth-rules"
import { LIFE_SKILLS } from "#/world/core/life-rules"
import { standing } from "#/world/core/standing"
import type { Stats, Stat } from "#/world/core/growth-types"
import type { Skill } from "#/world/core/items/kinds"
import type { LifeExp } from "#/world/core/life-types"
import type { Equipment } from "#/world/core/items/types"

type Props = { stats: Stats; life: LifeExp }

/** 不足条件を定義順で返す。未知の条件を無視して装備可能にしない。 */
export function unmet(needs: Equipment["needs"], player: Props): [Stat | Skill, number, number][] {
  const missing: [Stat | Skill, number, number][] = []
  const keys = [...STATS, ...LIFE_SKILLS]
  for (const name of Object.keys(needs ?? {})) {
    const key = keys.find((candidate) => candidate === name)
    if (!key) throw new Error("Unknown equipment requirement")
    const needed = needs?.[key]
    if (needed === undefined) continue
    const have = standing(player, key)
    if (have < needed) missing.push([key, needed, have])
  }
  return missing
}
