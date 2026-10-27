import { expect, it } from "vitest"
import { apply } from "./apply.ts"
import { artSwing, swing } from "./combat.ts"
import { emptyEquipment, loadPlayer } from "./player.ts"
import { ITEMS, ITEM_IDS, type Quality } from "./items.ts"
import { SKILLS } from "./skills.ts"
import { derive, equipmentAttack, scaling } from "./stats.ts"
import { player } from "../test/helpers.ts"

it("preserves the base attack of ordinary and unmarked weapons", () => {
  for (const id of ITEM_IDS) {
    const p = player({ equipment: { ...emptyEquipment(), weapon: id } })
    expect(equipmentAttack(id)).toBe(ITEMS[id].equip?.atk ?? 0)
    expect(derive(p).atk).toBe(1 + (ITEMS[id].equip?.atk ?? 0) + scaling(ITEMS[id].equip, p.stats))
    if (!ITEMS[id].made) expect(equipmentAttack(id, 3)).toBe(equipmentAttack(id))
  }
})

it.each<[Quality, number]>([
  [0, 18],
  [1, 22],
  [2, 26],
  [3, 32],
])("quality %s survives equipping and saving and contributes %s base attack", (q, attack) => {
  const base = player()
  const p = player({ stats: { ...base.stats, str: 8, dex: 7 }, bag: [{ item: "short-sword", count: 1, q, by: "エルナ" }, ...base.bag.slice(1)] })
  const equipped = apply(p, { type: "equip", slot: 0 })
  if (!equipped.ok) throw Error(equipped.reason)
  const saved = loadPlayer(JSON.parse(JSON.stringify(equipped.state)))
  expect(equipmentAttack("short-sword", q)).toBe(attack)
  const fighter = derive(saved)
  expect(fighter.atk).toBe(1 + attack + scaling(ITEMS["short-sword"].equip, p.stats))
  const target = { atk: 1, def: 0, hit: 0, flee: 0, crit: 0 }
  expect(swing(fighter, target, () => 0.5)).toEqual({ kind: "hit", damage: fighter.atk })
  expect(artSwing(SKILLS.lunge, fighter.stats, fighter, target, () => 0.5)).toEqual({ kind: "hit", damage: Math.round(fighter.atk * 1.6) })
  const ordinary = derive({ ...saved, worn: { weapon: { q: 1 } } })
  expect(artSwing(SKILLS.ember, fighter.stats, fighter, target, () => 0.5)).toEqual(artSwing(SKILLS.ember, ordinary.stats, ordinary, target, () => 0.5))
})
