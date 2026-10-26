import { describe, expect, it } from "vitest"
import { apply } from "./apply.ts"
import { countItem } from "./bag.ts"
import { MAX_LEVEL, expToNext, gainExp, pointsForLevel, startingStats, statCost } from "./growth.ts"
import { lifeExpAt, lifeLevel as lifeLevelOf } from "./life.ts"
import { emptyEquipment, loadPlayer, newPlayer } from "./player.ts"
import { derive } from "./stats.ts"
import { bagWith, player } from "../test/helpers.ts"

describe("growth", () => {
  it("a point raises a stat by one, whatever it is at", () => {
    expect([1, 10, 50, 98].map(statCost)).toEqual([1, 1, 1, 1])
  })

  it("a new character has every stat at 5 and ten points to give; the level stops at 32", () => {
    const p = newPlayer()
    expect(Object.values(p.stats)).toEqual([5, 5, 5, 5, 5, 5])
    expect(p.statPoints).toBe(10)
    const top = gainExp({ level: MAX_LEVEL - 1, exp: 0, statPoints: 0 }, 10_000_000)
    expect(top).toMatchObject({ level: MAX_LEVEL, exp: 0, statPoints: 2 })
    expect(MAX_LEVEL).toBe(32)
  })

  it("levels up as many times as the experience reaches and hands out points", () => {
    const need = expToNext(1) + expToNext(2)
    const p = gainExp({ level: 1, exp: 0, statPoints: 0 }, need + 5)
    expect(p).toEqual({ level: 3, exp: 5, statPoints: pointsForLevel(2) + pointsForLevel(3), gained: 2 })
  })

  it("continues from the former cap, restores HP and SP, and preserves the expanded save", () => {
    const old = player({ level: 16, exp: 0, statPoints: 3, hp: 1, sp: 0 })
    expect(loadPlayer(JSON.parse(JSON.stringify(old)))).toEqual(old)
    const result = apply(old, { type: "loot", monster: "slime", exp: expToNext(16), items: [] })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state).toMatchObject({ level: 17, exp: 0, statPoints: 5 })
    expect(result.state.hp).toBe(derive(result.state).maxHp)
    expect(result.state.sp).toBe(derive(result.state).maxSp)
    expect(loadPlayer(JSON.parse(JSON.stringify(result.state)))).toEqual(result.state)
  })

  it("awards each new level once and discards excess experience only at the new cap", () => {
    const start = player({ level: 16, exp: 0, statPoints: 0 })
    let need = 0
    for (let level = 16; level < 32; level++) {
      const next = expToNext(level)
      expect(next).toBeGreaterThan(expToNext(level - 1))
      need += next
    }
    const below = gainExp(start, need - 1)
    expect(below).toMatchObject({ level: 31, statPoints: 30, gained: 15 })
    const top = gainExp(start, need + 100)
    expect(top).toEqual({ level: 32, exp: 0, statPoints: 32, gained: 16 })
    expect(gainExp(top, 10000)).toEqual({ ...top, gained: 0 })
    const saved = player({ level: top.level, exp: top.exp, statPoints: top.statPoints })
    expect(loadPlayer(JSON.parse(JSON.stringify(saved)))).toEqual(saved)
  })

  it("raising a stat spends points and refuses without enough", () => {
    const start = player({ statPoints: 1 })
    const once = apply(start, { type: "raise", stat: "str" })
    expect(once.ok && once.state.stats.str).toBe(6)
    expect(once.ok && once.state.statPoints).toBe(0)
    expect(once.ok && apply(once.state, { type: "raise", stat: "str" })).toEqual({ ok: false, reason: "NO_POINTS" })
  })
})

describe("derived values", () => {
  it("follow stats, level and equipment", () => {
    const p = newPlayer()
    const bare = derive({ ...p, equipment: emptyEquipment() })
    expect(bare.maxHp).toBe(20 + 3 + 25)
    expect(bare.maxSp).toBe(5 + 1 + 15)
    expect(bare.atk).toBe(1)
    expect(bare.attackDelay).toBe(1500 - 40)
    const armed = derive({ ...p, equipment: { ...emptyEquipment(), weapon: "short-sword", body: "traveller-coat" } })
    expect(armed.atk).toBe(1 + 22)
    expect(armed.def).toBe(1 + 3)
  })

  it("a weapon's attack grows with the stats it is graded in (game-system.md §3.4)", () => {
    const stats = { ...startingStats(), str: 15, dex: 10 }
    const d = derive({ level: 1, stats, equipment: { ...emptyEquipment(), weapon: "short-sword" } })
    expect(d.atk).toBe(1 + 22 + Math.floor((22 * 0.4 * 10) / 20) + Math.floor((22 * 0.4 * 5) / 20))
    // the weapon sets the pace: a dagger is quicker than a battle axe
    const quick = derive({ level: 1, stats, equipment: { ...emptyEquipment(), weapon: "dagger" } }).attackDelay
    const slow = derive({ level: 1, stats, equipment: { ...emptyEquipment(), weapon: "battle-axe" } }).attackDelay
    expect(quick).toBeLessThan(slow)
  })
})

describe("equipment", () => {
  it("wears an item in its slot and puts the old one back in the bag", () => {
    const start = player({ stats: { ...startingStats(), str: 10, dex: 10 }, bag: bagWith(["spear", 1]), equipment: { ...emptyEquipment(), weapon: "dagger" } })
    const result = apply(start, { type: "equip", slot: 0 })
    expect(result.ok && result.state.equipment.weapon).toBe("spear")
    expect(result.ok && countItem(result.state.bag, "dagger")).toBe(1)
  })

  it("a two-handed weapon takes off the shield, and a shield is refused while it is held", () => {
    const shielded = player({ stats: { ...startingStats(), str: 10, dex: 10 }, bag: bagWith(["spear", 1]), equipment: { ...emptyEquipment(), shield: "wooden-shield" } })
    const result = apply(shielded, { type: "equip", slot: 0 })
    expect(result.ok && result.state.equipment.shield).toBeNull()
    expect(result.ok && countItem(result.state.bag, "wooden-shield")).toBe(1)
    const spear = player({ bag: bagWith(["wooden-shield", 1]), equipment: { ...emptyEquipment(), weapon: "spear" } })
    expect(apply(spear, { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "TWO_HANDED" })
  })

  it("checks the stats and life skill a thing needs, and fills the free accessory slot first", () => {
    expect(apply(player({ bag: bagWith(["mace", 1]) }), { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
    expect(apply(player({ bag: bagWith(["mace", 1]), stats: { ...startingStats(), str: 12 } }), { type: "equip", slot: 0 }).ok).toBe(true)
    // the woodcutter's axe as a weapon: the arm and the practice
    const axe = (str: number, wood: number) => player({ bag: bagWith(["wood-axe", 1]), stats: { ...startingStats(), str }, life: { ...player().life, woodcutting: lifeExpAt(wood) } })
    expect(apply(axe(8, 3), { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "SKILL_TOO_LOW" })
    expect(apply(axe(7, 4), { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "STAT_TOO_LOW" })
    expect(apply(axe(8, 4), { type: "equip", slot: 0 }).ok).toBe(true)
    const two = player({ bag: bagWith(["charm", 2]) })
    const first = apply(two, { type: "equip", slot: 0 })
    const second = first.ok ? apply(first.state, { type: "equip", slot: 1 }) : first
    expect(second.ok && second.state.equipment).toMatchObject({ accessory1: "charm", accessory2: "charm" })
  })

  it("refuses to wear food and to take off an empty slot", () => {
    expect(apply(player(), { type: "equip", slot: 0 })).toEqual({ ok: false, reason: "NOT_EQUIPPABLE" })
    expect(apply(player(), { type: "unequip", slot: "head" })).toEqual({ ok: false, reason: "NOTHING_EQUIPPED" })
  })
})

describe("items in use", () => {
  it("eating heals up to the maximum and uses one", () => {
    const max = derive(newPlayer()).maxHp
    const start = player({ hp: max - 5, bag: bagWith(["cheese", 2]) })
    const result = apply(start, { type: "use", slot: 0 })
    expect(result.ok && result.state.hp).toBe(max)
    expect(result.ok && result.events[0]).toMatchObject({ type: "used", item: "cheese", hp: 5, sp: 0 })
  })

  it("refuses to eat when it would do nothing, and refuses equipment", () => {
    const rested = player({ hp: derive(newPlayer()).maxHp, stamina: 100 })
    expect(apply(rested, { type: "use-item", item: "rye-bread" })).toEqual({ ok: false, reason: "NOTHING_TO_GAIN" })
    expect(apply(player({ hp: derive(newPlayer()).maxHp, bag: bagWith(["herb", 1]) }), { type: "use", slot: 0 })).toEqual({ ok: false, reason: "HP_FULL" })
    expect(apply(player({ bag: bagWith(["dagger", 1]) }), { type: "use", slot: 0 })).toEqual({ ok: false, reason: "NOT_USABLE" })
  })

  it("binding an item to the hotbar moves it off its old key", () => {
    const result = apply(player(), { type: "hotbar", index: 3, item: "rye-bread" })
    expect(result.ok && result.state.hotbar[0]).toBeNull()
    expect(result.ok && result.state.hotbar[3]).toBe("rye-bread")
  })
})

describe("items", () => {
  it("every item has a known icon and sensible numbers", async () => {
    const { ITEMS, ITEM_ICONS } = await import("./items.ts")
    for (const [id, d] of Object.entries(ITEMS)) {
      expect(ITEM_ICONS as readonly string[], id).toContain(d.icon)
      expect(d.stack, id).toBeGreaterThan(0)
      expect(d.weight, id).toBeGreaterThanOrEqual(0)
      if (d.kind === "consumable") expect(d.use, id).toBeDefined()
      if (d.kind === "equipment") expect(d.equip, id).toBeDefined()
    }
  })

  it("a blue potion restores SP and is refused when SP is full", () => {
    const tired = player({ sp: 0, bag: bagWith(["blue-potion", 1]) })
    const result = apply(tired, { type: "use", slot: 0 })
    expect(result.ok && result.state.sp).toBe(derive(tired).maxSp)
    expect(apply(player({ bag: bagWith(["blue-potion", 1]) }), { type: "use", slot: 0 })).toEqual({ ok: false, reason: "SP_FULL" })
  })

  it("equipment bonuses add to stats and maximums", () => {
    const p = { ...newPlayer(), equipment: { ...emptyEquipment(), weapon: "oak-staff" as const, accessory1: "fang-charm" as const } }
    const d = derive(p)
    expect(d.maxSp).toBe(derive(newPlayer()).maxSp + 15)
    // the charm's strength counts towards nothing the staff grows with
    expect(d.atk).toBe(1 + 6)
    const sword = derive({ ...newPlayer(), stats: { ...startingStats(), str: 15 }, equipment: { ...emptyEquipment(), weapon: "short-sword", accessory1: "fang-charm" } })
    expect(sword.atk).toBe(1 + 22 + Math.floor((22 * 0.4 * 12) / 20))
  })
})

describe("saves", () => {
  it("starts a new traveller tired, with gold, bread and points to spend", () => {
    const fresh = newPlayer()
    expect(fresh.name).toBe("シグレニ")
    expect(fresh.gold).toBe(200)
    expect(fresh.statPoints).toBe(10)
    expect(fresh.hp).toBe(Math.floor(derive(fresh).maxHp * 0.6))
    expect(countItem(fresh.bag, "rye-bread")).toBe(2)
  })

  it("reads back what it saved, moves the first shape forward and replaces anything broken", () => {
    expect(loadPlayer(JSON.parse(JSON.stringify(player({ gold: 7 })))).gold).toBe(7)
    const v1 = { version: 1, gold: 9, hp: 30, maxHp: 100, bag: bagWith(["apple", 3]), weapon: "dagger", hotbar: newPlayer().hotbar }
    const moved = loadPlayer(v1)
    expect(moved).toMatchObject({ version: 3, gold: 9, hp: 30 })
    expect(moved.equipment.weapon).toBe("dagger")
    expect(loadPlayer({ gold: -1 })).toEqual(newPlayer())
  })

  it("moves a save with a job forward: level retained within the cap, stats begun again with the points, proficiency as levels", () => {
    const { life: _life, worn: _worn, stats: _stats, ...now } = newPlayer()
    const v2 = {
      ...now,
      version: 2,
      job: "novice",
      jobLevel: 4,
      jobExp: 3,
      skillPoints: 0,
      learned: { basic: 1 },
      level: 20,
      exp: 77,
      statPoints: 0,
      stats: { str: 30, agi: 9, vit: 9, int: 1, dex: 9, luk: 1 },
      skills: { woodcutting: 120, cooking: 40, fishing: 10, foraging: 200, alchemy: 90 },
      equipment: { ...emptyEquipment(), weapon: "battle-axe" },
      hotbar: ["skill:basic", "rye-bread", ...Array(8).fill(null)],
    }
    const p = loadPlayer(JSON.parse(JSON.stringify(v2)))
    expect(p).toMatchObject({ version: 3, level: 20, exp: 77, statPoints: 10 + 19 * 2 })
    expect(p.stats).toEqual(startingStats())
    expect(p.hotbar.slice(0, 2)).toEqual(["skill:sit", "rye-bread"])
    // the battle axe needs more strength than a fresh start: back in the bag
    expect(p.equipment.weapon).toBeNull()
    expect(countItem(p.bag, "battle-axe")).toBe(1)
    // the three best (8, 8, 7 → within 24) and what is left over
    expect(Object.values(p.life).reduce((a, n) => a + lifeLevelOf(n), 0)).toBeLessThanOrEqual(24)
    expect(lifeLevelOf(p.life.foraging)).toBe(8)
    expect(lifeLevelOf(p.life.woodcutting)).toBe(8)
    expect(loadPlayer(JSON.parse(JSON.stringify(p)))).toEqual(p)
  })
})
