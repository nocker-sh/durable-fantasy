// Levels, experience and stat points (game-system.md §3.1–3.2). There are no jobs: what a character
// can wield follows from the stats they raise (and, for some things, a life skill's level).

export const STATS = ["vit", "mnd", "str", "dex", "int", "fth"] as const
export type Stat = (typeof STATS)[number]
export type Stats = Readonly<Record<Stat, number>>

export const STAT_NAME: Record<Stat, string> = { vit: "体力", mnd: "精神", str: "筋力", dex: "技量", int: "知力", fth: "信仰" }

/** The character's level stops here for now (game-system.md §3.2). */
export const MAX_LEVEL = 32
export const MAX_STAT = 99
/** every stat a new character starts with */
export const START_STAT = 5

/** Experience needed to go from `level` to the next one. */
export function expToNext(level: number): number {
  if (level >= MAX_LEVEL) return 0
  return Math.round(9 * level ** 2.1 + 20 * level)
}

/** Points it takes to raise a stat by one. */
export const statCost = (_value: number) => 1

/** Stat points received on reaching a level. */
export const pointsForLevel = (_level: number) => 2

/** Stat points a new character has to spend. */
export const STARTING_POINTS = 10

export const startingStats = (): Stats => Object.fromEntries(STATS.map((s) => [s, START_STAT])) as unknown as Stats

export interface Progress {
  readonly level: number
  readonly exp: number
  readonly statPoints: number
}

/** Add experience, levelling up as many times as it reaches; returns how many levels were gained. */
export function gainExp(p: Progress, amount: number): Progress & { gained: number } {
  let { level, exp, statPoints } = p
  let gained = 0
  exp += Math.max(0, Math.floor(amount))
  while (level < MAX_LEVEL && exp >= expToNext(level)) {
    exp -= expToNext(level)
    level++
    gained++
    statPoints += pointsForLevel(level)
  }
  if (level >= MAX_LEVEL) exp = 0
  return { level, exp, statPoints, gained }
}
