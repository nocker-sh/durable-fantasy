import { HOUSEHOLDS, HOUSES } from "#/world/town/houses"
import { PER_HEAD, TRADE_FIRES } from "#/world/town/ledger"
import type { Good } from "#/world/town/ledger"

/** Everyone who lives in the town (members of a household). */
const heads = () => HOUSEHOLDS.reduce((n, hh) => n + hh.members.length, 0)

/** The houses whose hearth burns every day: every lived house with one. */
const hearths = () => HOUSES.filter((h) => h.kind !== "vacant" && h.household && h.plan.hearth)

/** What the town uses of a good in a day. */
export function used(g: Good): number {
  if (g === "薪") return hearths().length + Object.values(TRADE_FIRES).reduce((n, f) => n + (f.薪 ?? 0), 0)
  if (g === "炭") return Object.values(TRADE_FIRES).reduce((n, f) => n + (f.炭 ?? 0), 0)
  return heads() * (PER_HEAD[g] ?? 0)
}
