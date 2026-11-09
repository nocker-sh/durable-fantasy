import { expect, it } from "vitest"
import { HuntSimulation } from "#/world/test/hunt-simulation"
import { newPlayer } from "#/world/core/new-player"
import { derive } from "#/world/core/derive"
import { bagWith } from "#/world/test/bag-with"
import type { ItemId } from "#/world/core/items/catalog"
import type { SkillId } from "#/world/core/skill-types"
import type { Stats } from "#/world/core/growth-types"

// the same earned budgets as the sword stages in hunting-stages.ts, leaning on dexterity for the dagger and bow
const BUILDS: Record<string, Record<22 | 32, Stats>> = {
  str: { 22: { vit: 22, mnd: 12, str: 22, dex: 16, int: 5, fth: 5 }, 32: { vit: 30, mnd: 13, str: 26, dex: 22, int: 5, fth: 5 } },
  dex: { 22: { vit: 22, mnd: 12, str: 14, dex: 24, int: 5, fth: 5 }, 32: { vit: 30, mnd: 13, str: 16, dex: 32, int: 5, fth: 5 } },
}
const OPPONENT = { 22: "resin-slime", 32: "old-moss-slime" } as const
const CASES: readonly { level: 22 | 32; weapon: ItemId; build: "str" | "dex"; arts: readonly SkillId[] }[] = [
  { level: 22, weapon: "reinforced-battle-axe", build: "str", arts: ["cleave", "sweep"] },
  { level: 22, weapon: "reinforced-spear", build: "str", arts: ["thrust", "sweep"] },
  { level: 22, weapon: "reinforced-mace", build: "str", arts: ["crush", "crack"] },
  { level: 22, weapon: "reinforced-dagger", build: "dex", arts: ["pierce"] },
  { level: 22, weapon: "resin-bow", build: "dex", arts: ["aim"] },
  { level: 32, weapon: "tempered-battle-axe", build: "str", arts: ["cleave", "sweep"] },
  { level: 32, weapon: "tempered-spear", build: "str", arts: ["thrust", "sweep"] },
  { level: 32, weapon: "tempered-mace", build: "str", arts: ["crush", "crack"] },
  { level: 32, weapon: "tempered-dagger", build: "dex", arts: ["pierce"] },
  { level: 32, weapon: "root-bow", build: "dex", arts: ["aim"] },
]

it.each(CASES)("lets a level $level $weapon hunter beat the stage opponent like the sword does", (entry) => {
  const starter = newPlayer()
  const base = {
    ...starter,
    level: entry.level,
    stats: BUILDS[entry.build][entry.level],
    bag: bagWith(["herb", 30]),
    equipment: { ...starter.equipment, weapon: entry.weapon, body: "chain-mail" as const, head: "iron-helm" as const, shield: "wooden-shield" as const },
  }
  const stats = derive(base)
  const full = { ...base, hp: stats.maxHp, sp: stats.maxSp }
  for (const seed of [1, 7, 42, 99, 1234]) {
    const fight = new HuntSimulation({ player: full, kind: OPPONENT[entry.level], arts: entry.arts, heal: true, seed }).fight()
    expect(fight.beaten, JSON.stringify(fight)).toBe(true)
    expect(fight.arts).toBeGreaterThan(0)
    expect(fight.duration).toBeLessThan(90000)
  }
})
