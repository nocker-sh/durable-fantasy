import { STAT_NAME } from "#/world/core/growth-rules"
import { GATHER_SKILL_NAME } from "#/world/core/items/kinds"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { effectOf } from "#/world/core/effect-of"

/** What an item does, in short pieces. */
export function effects(id: ItemId): string[] {
  const d = ITEMS[id]
  const e = effectOf(id)
  return [
    e.hp ? `HP+${e.hp}` : "",
    e.sp ? `SP+${e.sp}` : "",
    e.stamina ? `スタミナ+${e.stamina}` : "",
    e.full ? `満腹+${e.full}` : "",
    e.warm ? `暖${e.warm}分` : "",
    d.equip?.atk ? `攻撃+${d.equip.atk}` : "",
    d.equip?.def ? `防御+${d.equip.def}` : "",
    ...Object.entries(d.equip?.bonus ?? {}).map((entry) => {
      const k = entry[0]
      const n = entry[1]
      return `${k === "maxHp" ? "最大HP" : k === "maxSp" ? "最大SP" : STAT_NAME[k as keyof typeof STAT_NAME]}+${n}`
    }),
    d.equip?.twoHanded ? "両手" : "",
    d.tool ? `${GATHER_SKILL_NAME[d.tool.skill]}×${d.tool.power}` : "",
  ].filter(Boolean)
}
