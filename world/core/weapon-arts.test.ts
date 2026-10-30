import { expect, it } from "vitest"
import { apply } from "./apply"
import { artSwing } from "#/world/core/art-swing"
import { commandSchema } from "./commands"
import { startingStats } from "#/world/core/starting-stats"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { loadPlayer } from "#/world/core/load-player"
import { SHOPS } from "#/world/core/shops"
import { SKILLS } from "#/world/core/skills"
import { artsOf } from "#/world/core/arts-of"
import type { SkillId } from "#/world/core/skill-types"
import { player } from "#/world/test/player"

const stats = { ...startingStats(), str: 16, dex: 14, int: 14, fth: 9, mnd: 7 }
const equipped = (weapon: ItemId) => player({ hp: 10, sp: 20, stats, equipment: { ...emptyEquipment(), weapon } })

it.each<[ItemId, SkillId]>([
  ["hand-axe", "cleave"],
  ["battle-axe", "cleave"],
  ["spear", "thrust"],
  ["mace", "crush"],
  ["short-bow", "aim"],
  ["oak-staff", "flare"],
])("%s provides %s through a purchasable weapon, with SP and cooldown enforced", (weapon, skill) => {
  expect(Object.values(SHOPS).some((shop) => (shop.stock as readonly string[]).includes(weapon))).toBe(true)
  expect(artsOf(weapon)).toContain(skill)
  const p = equipped(weapon)
  const used = apply(p, { type: "art", skill }, { now: 1000 })
  expect(used.ok).toBe(true)
  if (!used.ok) throw Error(used.reason)
  expect(used.state.sp).toBe(p.sp - SKILLS[skill].sp)
  expect(apply(used.state, { type: "art", skill }, { now: 1001 })).toEqual({ ok: false, reason: "COOLDOWN" })
  expect(apply({ ...p, sp: 0 }, { type: "art", skill }, { now: 1000 })).toEqual({ ok: false, reason: "SP_SHORT" })
  expect(apply({ ...p, equipment: emptyEquipment() }, { type: "art", skill }, { now: 1000 })).toEqual({ ok: false, reason: "NO_WEAPON" })
  const bound = apply(p, commandSchema.parse({ type: "hotbar", index: 2, item: `skill:${skill}` }))
  expect(bound.ok && loadPlayer(bound.state).hotbar[2]).toBe(`skill:${skill}`)
  expect(ITEMS[weapon].equip).toBeDefined()
})

it("offers a faith prayer before learning woodcutting, retaining the stronger specialist prayer", () => {
  const p = equipped("oak-staff")
  const healed = apply(p, { type: "cast", skill: "mend" }, { now: 1000 })
  expect(healed.ok).toBe(true)
  if (!healed.ok) throw Error(healed.reason)
  expect(healed.state.hp).toBe(26)
  expect(healed.state.sp).toBe(14)
  expect(apply(healed.state, { type: "cast", skill: "mend" }, { now: 1001 })).toEqual({ ok: false, reason: "COOLDOWN" })
  expect(apply(p, { type: "cast", skill: "kodama" }, { now: 1000 })).toEqual({ ok: false, reason: "SKILL_TOO_LOW" })
  expect(apply({ ...p, stats: { ...stats, fth: 8 } }, { type: "cast", skill: "mend" }, { now: 1000 })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
})

it("gives aimed arrows a sure critical and the advanced spell damage against armour", () => {
  const fighter = { atk: 20, def: 10, hit: 0, flee: 999, crit: 0 }
  expect(artSwing({ art: SKILLS.aim, stats: stats, attacker: fighter, target: fighter, random: () => 0.99 }).kind).toBe("critical")
  expect(artSwing({ art: SKILLS.flare, stats: stats, attacker: fighter, target: fighter, random: () => 0.5 })).toEqual({ kind: "hit", damage: 34 })
  expect(apply({ ...equipped("oak-staff"), stats: { ...stats, int: 13 } }, { type: "art", skill: "flare" }, { now: 1000 })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
})
