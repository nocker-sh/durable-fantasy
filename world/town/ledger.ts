// The town's day in numbers (economy.md「町の帳簿」): what everyone eats and burns in a day, and who
// makes it. ledger.test.ts checks that what is made covers what is used, that every lived house has
// water within reach, and that every household earns its keep, so a new household or a lost trade
// that would leave the town short shows up as a failing test before it shows up in the game.
import { HOUSEHOLDS, HOUSES } from "./houses.ts"

/** What the town lives on, in the units it is counted in. */
export type Good = "パン" | "粉" | "野菜" | "おかず" | "薪" | "炭"

export const UNITS: Readonly<Record<Good, string>> = { パン: "個", 粉: "kg", 野菜: "kg", おかず: "皿", 薪: "束", 炭: "俵" }

/** What one person eats in a day: two loaves, porridge and bread flour, vegetables, one dish of fish, meat or milk. */
export const PER_HEAD: Readonly<Partial<Record<Good, number>>> = { パン: 2, 粉: 0.4, 野菜: 0.5, おかず: 1 }

/** What each maker makes in a day, by resident. Grain is counted as the flour it mills to. */
export const DAILY_OUTPUT: Readonly<Record<string, Partial<Record<Good, number>>>> = {
  // bread: the bakery's oven, three batches a night and morning
  マルタ: { パン: 120 },
  レオポルト: { パン: 120 },
  ハンス: { パン: 60 },
  // rye and wheat, milled at Bertram's windmill
  カール: { 粉: 25 },
  オスカー: { 粉: 25 },
  ヴェンデル: { 粉: 25 },
  ルートヴィヒ: { 粉: 25 },
  // vegetables: the tenants' fields and Karl's cabbages
  ヨハンナ: { 野菜: 30 },
  アグネス: { 野菜: 30 },
  ウルリケ: { 野菜: 20 },
  // a dish a head: sea and river fish, pork, game, milk and cheese
  ヤコブ: { おかず: 30 },
  クーノ: { おかず: 30 },
  アルブレヒト: { おかず: 40 },
  ファルク: { おかず: 15 },
  レーニ: { おかず: 40 },
  マティアス: { おかず: 20 },
  // firewood from the forest's edge, charcoal from the kilns
  ヨーゼフ: { 薪: 20, 炭: 5 },
  アンゼルム: { 薪: 20 },
  ルーペルト: { 薪: 20 },
  フロリアン: { 薪: 20 },
  ゼヴェリン: { 炭: 10 },
  ティル: { 炭: 10 },
}

/** Fires beyond the hearths, by building: ovens, stoves and kilns burn wood, forges charcoal. */
export const TRADE_FIRES: Readonly<Record<string, Partial<Record<"薪" | "炭", number>>>> = {
  bakery: { 薪: 6 },
  "h-m6": { 薪: 3 },
  inn: { 薪: 2 },
  tavern: { 薪: 2 },
  "h-m8": { 薪: 2 },
  "h-c1": { 薪: 4 },
  smithy: { 炭: 6 },
  armorer: { 炭: 4 },
  "h-g2": { 炭: 3 },
}

/** Who turns the grain into flour: without a miller, no field feeds anyone. */
export const MILLER = "ベルトラム"

/** How far a lived house's door may be from a well or the river (tiles; about forty paces with a bucket). */
export const WATER_REACH = 20

/** Everyone who lives in the town (members of a household). */
export const heads = () => HOUSEHOLDS.reduce((n, hh) => n + hh.members.length, 0)

/** The houses whose hearth burns every day: every lived house with one. */
export const hearths = () => HOUSES.filter((h) => h.kind !== "vacant" && h.household && h.plan.hearth)

/** What the town makes of a good in a day. */
export const made = (g: Good) => Object.values(DAILY_OUTPUT).reduce((n, o) => n + (o[g] ?? 0), 0)

/** What the town uses of a good in a day. */
export function used(g: Good): number {
  if (g === "薪") return hearths().length + Object.values(TRADE_FIRES).reduce((n, f) => n + (f.薪 ?? 0), 0)
  if (g === "炭") return Object.values(TRADE_FIRES).reduce((n, f) => n + (f.炭 ?? 0), 0)
  return heads() * (PER_HEAD[g] ?? 0)
}
