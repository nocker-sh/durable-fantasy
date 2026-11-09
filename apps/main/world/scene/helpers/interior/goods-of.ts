import type { Interior } from "#/world/town/interiors"
import { HOUSEHOLDS } from "#/world/town/houses"
import { DAILY_OUTPUT } from "#/world/town/ledger"
import type { Good } from "#/world/town/ledger"
export function goodsOf(it: Interior): string[] {
  const hh = HOUSEHOLDS.find((h) => h.id === it.house.household)
  if (!hh) return []
  const goods = new Set(hh.members.flatMap((m) => Object.keys(DAILY_OUTPUT[m] ?? {}) as Good[]))
  const dish = /魚|網/.test(hh.trade) ? "魚" : /乳|チーズ|羊/.test(hh.trade) ? "チーズ" : /腸詰め|豚/.test(hh.trade) ? "腸詰め" : "肉"
  const look: Record<Good, string> = {
    パン: "パン",
    粉: "袋",
    野菜: "蕪の籠",
    おかず: dish,
    薪: "木切れ",
    炭: "炭",
  }
  return [...goods].map((g) => look[g])
}
