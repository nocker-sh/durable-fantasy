import { STAT_NAME } from "#/world/core/growth-rules"
import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"
import type { Stat } from "#/world/core/growth-types"
import type { Skill } from "#/world/core/items/kinds"

/** 「筋力 8・技量 7 が要る。」: what is missing for a piece of equipment, by name and the value it needs. */
export function statShortfallText(short: readonly (readonly [Stat | Skill, number, number])[]): string {
  const parts = short.map((need) => (need[0] in STAT_NAME ? `${STAT_NAME[need[0] as Stat]} ${need[1]}` : `${GATHER_SKILL_NAME[need[0] as Skill]} Lv${need[1]}`))
  return `${parts.join("・")} が要る。`
}
