// Values that follow from stats, level and equipment (game-system.md §3.4, §4.4).
import { GRADES, ITEMS, QUALITY_EFFECT, SLOTS, type Quality, type Equipment, type ItemId, type Skill, type Slot } from "./items.ts"
import { START_STAT, type Stat, type Stats } from "./growth.ts"
import { lifeLevel, type LifeExp } from "./life.ts"

export interface Derived {
  maxHp: number
  maxSp: number
  atk: number
  def: number
  hit: number
  flee: number
  /** critical chance in percent */
  crit: number
  /** milliseconds between auto attacks */
  attackDelay: number
  /** how much can be carried */
  maxWeight: number
  /** HP and SP that come back every while (core/player.ts settle) */
  regenHp: number
  regenSp: number
}

export interface Build {
  readonly level: number
  readonly stats: Stats
  readonly equipment: Readonly<Record<Slot, ItemId | null>>
  readonly worn?: Readonly<Partial<Record<Slot, { q?: Quality }>>>
}

/** Bare hands: a blow now and then. */
export const UNARMED_DELAY = 1500

/** What a weapon's stats add to its attack (game-system.md §3.4). */
export function scaling(e: Equipment | undefined, stats: Stats): number {
  if (!e?.atk || !e.scale) return 0
  let plus = 0
  for (const [s, g] of Object.entries(e.scale) as [Stat, keyof typeof GRADES][]) plus += Math.floor((e.atk * GRADES[g] * Math.max(0, stats[s] - START_STAT)) / 20)
  return plus
}

/** Unmarked and ordinary equipment retain their base defense. */
export function equipmentDefense(item: ItemId, quality: Quality = 1): number {
  const definition = ITEMS[item]
  return Math.round((definition.equip?.def ?? 0) * (definition.made ? QUALITY_EFFECT[quality] : 1))
}

export function derive(b: Build): Derived {
  let armorDef = 0
  const plus: Record<string, number> = {}
  for (const slot of SLOTS) {
    const id = b.equipment[slot]
    const e = id ? ITEMS[id].equip : undefined
    armorDef += id ? equipmentDefense(id, b.worn?.[slot]?.q) : 0
    for (const [key, n] of Object.entries(e?.bonus ?? {})) plus[key] = (plus[key] ?? 0) + (n ?? 0)
  }
  const stats = Object.fromEntries(Object.entries(b.stats).map(([s, n]) => [s, n + (plus[s] ?? 0)])) as unknown as Stats
  const weapon = b.equipment.weapon ? ITEMS[b.equipment.weapon].equip : undefined
  const { vit, mnd, str, dex } = stats
  return {
    maxHp: 20 + b.level * 3 + vit * 5 + (plus.maxHp ?? 0),
    maxSp: 5 + b.level + mnd * 3 + (plus.maxSp ?? 0),
    atk: 1 + (weapon?.atk ?? 0) + scaling(weapon, stats),
    def: Math.floor(vit / 4) + armorDef,
    hit: b.level + dex,
    flee: b.level + Math.floor(dex / 2),
    crit: Math.floor(dex / 4),
    attackDelay: Math.max(600, (weapon?.delay ?? UNARMED_DELAY) - dex * 8),
    maxWeight: 1800 + str * 40,
    regenHp: 1 + Math.floor(vit / 10),
    regenSp: 1 + Math.floor(mnd / 10),
  }
}

/** What a character has towards a need: a stat as raised, or a life skill's level. */
export const standing = (p: { stats: Stats; life: LifeExp }, key: Stat | Skill) => (key in p.stats ? p.stats[key as Stat] : lifeLevel(p.life[key as Skill] ?? 0))

/** The needs not met, as [what, needed, have]. Empty when all are. */
export function unmet(needs: Equipment["needs"], p: { stats: Stats; life: LifeExp }): [Stat | Skill, number, number][] {
  return (Object.entries(needs ?? {}) as [Stat | Skill, number][]).flatMap(([k, n]) => {
    const have = standing(p, k)
    return have < n ? [[k, n, have] as [Stat | Skill, number, number]] : []
  })
}
