import type { Skill } from "#/world/core/items/kinds"

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
