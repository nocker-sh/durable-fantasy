// Skills (game-system.md §9) other than the life skills (core/life.ts): what anyone can do —
// sit down to rest, see to a wound with a herb — and the arts that come with a weapon or a staff,
// usable by whoever holds it and meets the art's needs. There are no jobs and no skill points.
import type { Stat } from "./growth.ts"
import type { ItemId, Skill as LifeSkill } from "./items.ts"
import { lifeLevel, type LifeExp } from "./life.ts"
import { weaponsOf } from "./items/weapons.ts"

interface Base {
  name: string
  /** SP it takes */
  sp: number
  /** ms before it can be used again */
  cooldown: number
  text: string
}

/** Anyone, any time. */
export interface Action extends Base {
  kind: "action"
}

/** Comes with a weapon: a blow at what you are fighting, or (a prayer) something done to yourself. */
export interface Art extends Base {
  kind: "strike" | "spell" | "prayer"
  weapons: readonly ItemId[]
  needs: Partial<Record<Stat | LifeSkill, number>>
  /** a strike: times the usual blow */
  power?: number
  /** a strike: always a critical */
  sure?: boolean
  /** a spell's attack: base, and per point of this stat; it never misses and armour counts half */
  magic?: { base: number; per: number; stat: Stat }
  /** a prayer's HP back: base, and per point of this stat */
  heal?: { base: number; per: number; stat: Stat }
}

export type SkillDef = Action | Art

export const SKILLS = {
  sit: { kind: "action", name: "座る", sp: 0, cooldown: 0, text: "道ばたでも腰を下ろして休める。座っている間は HP と SP が倍の速さで戻る（Z キー）。" },
  "first-aid": { kind: "action", name: "応急手当", sp: 3, cooldown: 4000, text: "薬草を一つ使い、傷を洗って当てる。調合の腕があるほどよく効く。" },
  chop: { kind: "strike", name: "薪割り", sp: 4, cooldown: 6000, weapons: ["wood-axe", "steel-axe"], needs: { woodcutting: 4, str: 8 }, power: 1.8, text: "薪を割る要領で、斧を真上から振り下ろす。" },
  fell: {
    kind: "strike",
    name: "大木倒し",
    sp: 8,
    cooldown: 10_000,
    weapons: ["wood-axe", "steel-axe"],
    needs: { woodcutting: 8, str: 12 },
    power: 2.6,
    text: "大木の根元に入れる、腰の入った一振り。",
  },
  lunge: {
    kind: "strike",
    name: "踏み込み斬り",
    sp: 4,
    cooldown: 6000,
    weapons: ["short-sword", "iron-sword", "engine-steel-sword", "reforged-blade", ...weaponsOf("longsword", "machete")],
    needs: { str: 8 },
    power: 1.6,
    text: "一歩踏み込んで、体ごと斬りつける。",
  },
  pierce: {
    kind: "strike",
    name: "急所突き",
    sp: 3,
    cooldown: 5000,
    weapons: ["dagger", ...weaponsOf("dagger", "knife")],
    needs: { dex: 9 },
    power: 1,
    sure: true,
    text: "動きの止まった一瞬に、急所を突く。必ず会心になる。",
  },
  sweep: {
    kind: "strike",
    name: "薙ぎ払い",
    sp: 6,
    cooldown: 8000,
    weapons: ["battle-axe", "spear", ...weaponsOf("greatsword", "halberd", "battle-axe", "spear")],
    needs: { str: 12 },
    power: 2,
    text: "長い得物を腰から大きく回し、足もとを払う。",
  },
  crack: {
    kind: "strike",
    name: "殻割り",
    sp: 5,
    cooldown: 7000,
    weapons: ["mace", ...weaponsOf("warhammer", "flail", "mace")],
    needs: { str: 11 },
    power: 1.9,
    text: "硬い殻の継ぎ目めがけて、重い頭を真上から落とす。",
  },
  ember: {
    kind: "spell",
    name: "結晶の灯",
    sp: 6,
    cooldown: 4000,
    weapons: ["oak-staff", "amber-staff", "world-branch-staff"],
    needs: { int: 9 },
    magic: { base: 4, per: 1.5, stat: "int" },
    text: "杖の先の結晶に灯をともし、相手へ放つ術。外れず、鎧も半分しか効かない。",
  },
  kodama: {
    kind: "prayer",
    name: "木霊の呼び声",
    sp: 8,
    cooldown: 12_000,
    weapons: ["oak-staff", "amber-staff", "world-branch-staff"],
    needs: { woodcutting: 4, fth: 9 },
    heal: { base: 10, per: 2, stat: "fth" },
    text: "森の木に宿るものに呼びかける、木こりに伝わる祈り。傷がふさがる。",
  },
} satisfies Record<string, SkillDef>

export type SkillId = keyof typeof SKILLS
export const SKILL_IDS = Object.keys(SKILLS) as SkillId[]
export const isSkillId = (v: string): v is SkillId => Object.hasOwn(SKILLS, v)
export const skillOf = (id: SkillId): SkillDef => SKILLS[id]
export const isArt = (s: SkillDef): s is Art => s.kind !== "action"

/** HP first aid gives back, for alchemy's level and VIT (a herb chewed as it is gives 15). */
export const firstAid = (alchemy: number, vit: number) => 15 + alchemy * 3 + Math.floor(vit / 2)

/** Why an art cannot be used with what is held and what has been raised; null when it can. */
export function artBlocked(id: SkillId, p: { equipment: { weapon: ItemId | null }; stats: Readonly<Record<Stat, number>>; life: LifeExp }): "NO_WEAPON" | "STAT_TOO_LOW" | "SKILL_TOO_LOW" | null {
  const s = skillOf(id)
  if (!isArt(s)) return null
  if (!p.equipment.weapon || !s.weapons.includes(p.equipment.weapon)) return "NO_WEAPON"
  for (const [k, n] of Object.entries(s.needs) as [string, number][]) {
    if (k in p.stats) {
      if (p.stats[k as Stat] < n) return "STAT_TOO_LOW"
    } else if (lifeLevel(p.life[k as LifeSkill] ?? 0) < n) return "SKILL_TOO_LOW"
  }
  return null
}

/** The arts that come with a weapon. */
export const artsOf = (weapon: ItemId | null) =>
  SKILL_IDS.filter((id) => {
    const s = skillOf(id)
    return isArt(s) && !!weapon && s.weapons.includes(weapon)
  })

/** A skill on the shortcut bar is written "skill:<id>"; anything else there is an item. */
export type SkillKey = `skill:${SkillId}`
export const skillKey = (id: SkillId): SkillKey => `skill:${id}`
export const skillOfKey = (key: string): SkillId | null => (key.startsWith("skill:") && isSkillId(key.slice(6)) ? (key.slice(6) as SkillId) : null)
