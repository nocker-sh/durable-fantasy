// Life skills (game-system.md §9.1): woodcutting, fishing, foraging, cooking, alchemy, carpentry,
// smithing and tailoring. Each has its own level, raised by doing the work. Anyone with the tool can
// do any of them from level 0; the milestones at 2, 4, 8 (16, 32, 64 later) change what comes out.
// The levels together have a ceiling, so no one does everything well (economy.md §0).
import type { Skill } from "./items.ts"

export const LIFE_SKILLS = ["woodcutting", "fishing", "foraging", "cooking", "alchemy", "carpentry", "smithing", "tailoring"] as const satisfies readonly Skill[]
/** the most a life skill can ever reach, and where v0.1 stops it */
export const LIFE_FINAL = 64
export const LIFE_CAP = 8
/** the levels of all life skills together may not pass this (v0.1: three of the eight at 8) */
export const LIFE_TOTAL_CAP = 24
/** the ceiling once skills go to 64: two at 64 and one at 32 (economy.md §7.2) */
export const LIFE_TOTAL_FINAL = 160
/** levels where what you can do changes a lot */
export const MILESTONES = [2, 4, 8, 16, 32, 64] as const

/** experience one go at gathering brings */
export const GATHER_EXP = 10
/** experience a go at a recipe brings; half when it is spoiled */
export const craftExp = (min: number) => 10 + 4 * min

/** Experience to go from a level to the next. */
export const lifeToNext = (level: number) => Math.round(40 * (level + 1) ** 1.5)

// Include the next threshold so even the final level can render its experience meter.
const thresholds = [0]
for (let level = 0; level <= LIFE_FINAL; level++) thresholds.push(thresholds[level] + lifeToNext(level))

/** Experience it takes to stand at a level from nothing. */
export function lifeExpAt(level: number): number {
  const cached = thresholds[level]
  if (cached !== undefined) return cached
  let total = 0
  for (let l = 0; l < level; l++) total += lifeToNext(l)
  return total
}

/** The level a total of experience makes. */
export function lifeLevel(exp: number): number {
  if (!(exp >= thresholds[1])) return 0
  let low = 1
  let high = LIFE_FINAL
  while (low < high) {
    const middle = Math.ceil((low + high) / 2)
    if (exp >= thresholds[middle]) low = middle
    else high = middle - 1
  }
  return low
}

export type LifeExp = Readonly<Record<Skill, number>>

export const emptyLife = (): Record<Skill, number> => Object.fromEntries(LIFE_SKILLS.map((s) => [s, 0])) as Record<Skill, number>

export const lifeTotal = (life: LifeExp) => LIFE_SKILLS.reduce((a, s) => a + lifeLevel(life[s] ?? 0), 0)

/**
 * Add experience to one skill. It stops at the end of the level it is on when another level would
 * pass the skill's cap or the ceiling for all of them together.
 */
export function gainLife(life: LifeExp, skill: Skill, amount: number): { life: LifeExp; level: number; up: boolean } {
  const before = life[skill] ?? 0
  const lv = lifeLevel(before)
  const room = LIFE_TOTAL_CAP - lifeTotal(life)
  const top = Math.min(LIFE_CAP, lv + Math.max(0, room))
  // at a level it cannot leave, experience fills up to just short of the next
  const limit = top >= LIFE_CAP ? lifeExpAt(LIFE_CAP) : lifeExpAt(top + 1) - 1
  const exp = Math.max(before, Math.min(limit, before + Math.max(0, Math.floor(amount))))
  const level = lifeLevel(exp)
  return { life: exp === before ? life : { ...life, [skill]: exp }, level, up: level > lv }
}

/** How many come at one go at a spot: one more at 4 and again at 8. */
export const lifeYield = (level: number) => 1 + (level >= 4 ? 1 : 0) + (level >= 8 ? 1 : 0)

/** How practised the hand is for quality, from 0 (never done it) to 1 (level 64). */
export const lifeLift = (level: number) => Math.log2(level + 1) / 6

/** The next milestone above a level, if any within the cap. */
export const nextMilestone = (level: number) => MILESTONES.find((m) => m > level && m <= LIFE_CAP) ?? null

/** An old save's proficiency (0–200) as a level, keeping the highest within the ceiling. */
export function lifeFromProficiency(old: Readonly<Partial<Record<Skill, number>>>): Record<Skill, number> {
  const life = emptyLife()
  let left = LIFE_TOTAL_CAP
  const order = [...LIFE_SKILLS].sort((a, b) => (old[b] ?? 0) - (old[a] ?? 0))
  for (const s of order) {
    const p = old[s] ?? 0
    if (!p) continue
    const lv = Math.min(LIFE_CAP, 1 + Math.floor(p / 15), left)
    left -= lv
    life[s] = lifeExpAt(lv)
  }
  return life
}

/** What each milestone brings (game-system.md §9.1), for the skills window. */
export const LIFE_MILESTONE_TEXT: Readonly<Record<Skill, Partial<Record<number, string>>>> = {
  woodcutting: { 2: "羽根が混じる", 4: "一度に 2 つ。斧を武器に振れる（筋力 8）。戦技「薪割り」、祈り「木霊の呼び声」", 8: "一度に 3 つ。戦技「大木倒し」" },
  fishing: { 2: "錆びた鉄くずが掛かる", 4: "一度に 2 つ", 8: "一度に 3 つ" },
  foraging: { 2: "薬草の場所に青い薬草", 4: "一度に 2 つ。きのこの場所にも青い薬草", 8: "一度に 3 つ" },
  cooking: { 2: "きのこのスープ・魚のスープ", 4: "シチュー", 8: "きのこの煮込み" },
  alchemy: { 2: "応急手当がさらに効く", 4: "青い水薬", 8: "橙の水薬" },
  carpentry: { 2: "釣り竿", 4: "木の盾", 8: "短弓" },
  tailoring: { 2: "毛織りのマフラー", 4: "縞のマフラー", 8: "毛織りの外套" },
  smithing: { 2: "鎌・木こりの斧", 4: "ダガー", 8: "鉄の剣" },
}

/** Forget the current level and its partial progress; level zero loses only its progress. */
export const forgottenLifeExp = (exp: number) => lifeExpAt(Math.max(0, lifeLevel(exp) - 1))
