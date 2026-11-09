import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { slotsFor } from "#/world/core/items/slots-for"
import { STATS, MAX_LEVEL, MAX_STAT } from "#/world/core/growth-rules"
import { LIFE_SKILLS } from "#/world/core/life-rules"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { emptyBag } from "#/world/core/empty-bag"
import { derive } from "#/world/core/derive"
import { markFor } from "#/world/core/mark-for"
import type { Stack } from "#/world/core/bag-types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

for (const item of ITEM_IDS)
  for (const slot of slotsFor(item))
    it(`${item} in ${slot}: equip and unequip resume after failed writes without losing marks`, async () => {
      vi.useFakeTimers()
      vi.setSystemTime(1000)
      const definition = ITEMS[item]
      const base = player()
      const marks = {
        ...(definition.made ? ({ q: 2, by: "エルナ" } as const) : {}),
        ...(definition.tool ? { dur: definition.tool.durability - 1 } : {}),
      }
      const stack: Stack = { item, count: 1, ...marks }
      // Owned equipment and sufficient requirements are local conditions, not crafting or growth routes.
      const initial = player({
        level: MAX_LEVEL,
        hp: 1,
        sp: 0,
        hpAt: 1000,
        spAt: 1000,
        stats: Object.fromEntries(STATS.map((key) => [key, MAX_STAT])) as typeof base.stats,
        life: Object.fromEntries(LIFE_SKILLS.map((key) => [key, lifeExpAt(definition.equip?.needs?.[key] ?? 0)])) as typeof base.life,
        equipment: emptyEquipment(),
        worn: {},
        bag: [stack, ...emptyBag(23)],
      })
      const store = durableStorage({ ...initialPlayerRecord(), player: initial }, 8)
      const actors = { current: new Player.class(store.state, {}) }
      const command = { type: "equip" as const, slot: 0, to: slot, expectedStack: structuredClone(stack) }
      const before = structuredClone(store.saved.get("__void_durable_state"))
      store.failNextSave()
      await expect(actors.current.run(command)).rejects.toThrow("Storage unavailable")
      expect(store.saved.get("__void_durable_state")).toEqual(before)
      actors.current = new Player.class(store.state, {})
      const equipped = await actors.current.run(command)
      if (!equipped.ok) throw new Error(`${item}: ${equipped.reason}`)
      expect(equipped.events).toEqual([{ type: "equipped", item, slot }])
      expect(equipped.state.equipment).toEqual({ ...initial.equipment, [slot]: item })
      expect(equipped.state.worn).toEqual({ [slot]: marks })
      expect(equipped.state.bag).toEqual(emptyBag())
      const saved = structuredClone(store.saved.get("__void_durable_state"))
      actors.current = new Player.class(store.state, {})
      expect(await actors.current.run(command)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
      expect(store.saved.get("__void_durable_state")).toEqual(saved)
      const remove = { type: "unequip" as const, slot, expectedStack: structuredClone(stack) }
      store.failNextSave()
      await expect(actors.current.run(remove)).rejects.toThrow("Storage unavailable")
      expect(store.saved.get("__void_durable_state")).toEqual(saved)
      actors.current = new Player.class(store.state, {})
      const removed = await actors.current.run(remove)
      if (!removed.ok) throw new Error(`${item}: ${removed.reason}`)
      expect(removed.events).toEqual([{ type: "unequipped", item, slot }])
      expect(removed.state).toEqual({ ...initial, revision: removed.state.revision })
      expect(derive(removed.state)).toEqual(derive(initial))
      const completed = structuredClone(store.saved.get("__void_durable_state"))
      actors.current = new Player.class(store.state, {})
      expect(await actors.current.run(remove)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
      expect(store.saved.get("__void_durable_state")).toEqual(completed)
    })

for (const item of ITEM_IDS.filter((id) => ITEMS[id].equip?.twoHanded))
  for (const hasSpace of [false, true])
    it(`${item}: swapping two worn pieces is atomic, spare slot=${hasSpace}`, async () => {
      vi.useFakeTimers()
      vi.setSystemTime(1000)
      const base = player()
      const held = { item, count: 1, ...markFor(item) }
      const initial = player({
        level: MAX_LEVEL,
        hp: 1,
        sp: 0,
        hpAt: 1000,
        spAt: 1000,
        stats: Object.fromEntries(STATS.map((key) => [key, MAX_STAT])) as typeof base.stats,
        life: Object.fromEntries(LIFE_SKILLS.map((key) => [key, lifeExpAt(Math.max(key === "woodcutting" ? 4 : 0, ITEMS[item].equip?.needs?.[key] ?? 0))])) as typeof base.life,
        equipment: { ...emptyEquipment(), weapon: "wood-axe", shield: "wooden-shield" },
        worn: { weapon: { q: 2, by: "アルノルト", dur: 7 }, shield: { q: 1, by: "ゴットフリート" } },
        bag: emptyBag().map((_slot, index) => (index === 0 ? held : hasSpace && index === 23 ? null : { item: "dagger", count: 1, ...markFor("dagger") })),
      })
      const store = durableStorage({ ...initialPlayerRecord(), player: initial }, 8)
      const actors = { current: new Player.class(store.state, {}) }
      const command = { type: "equip" as const, slot: 0, expectedStack: initial.bag[0]! }
      const before = structuredClone(store.saved.get("__void_durable_state"))
      if (!hasSpace) {
        expect(await actors.current.run(command)).toEqual({ ok: false, reason: "BAG_FULL" })
        expect(store.saved.get("__void_durable_state")).toEqual(before)
        return
      }
      store.failNextSave()
      await expect(actors.current.run(command)).rejects.toThrow("Storage unavailable")
      expect(store.saved.get("__void_durable_state")).toEqual(before)
      actors.current = new Player.class(store.state, {})
      const result = await actors.current.run(command)
      if (!result.ok) throw new Error(`${item}: ${result.reason}`)
      expect(result.events).toEqual([
        { type: "unequipped", item: "wood-axe", slot: "weapon" },
        { type: "unequipped", item: "wooden-shield", slot: "shield" },
        { type: "equipped", item, slot: "weapon" },
      ])
      expect(result.state.equipment).toEqual({ ...emptyEquipment(), weapon: item })
      expect(result.state.worn).toEqual({ weapon: markFor(item) })
      expect(result.state.bag).toEqual(
        initial.bag.map((stack, index) => (index === 0 ? { item: "wood-axe", count: 1, ...initial.worn.weapon } : index === 23 ? { item: "wooden-shield", count: 1, ...initial.worn.shield } : stack)),
      )
      const saved = structuredClone(store.saved.get("__void_durable_state"))
      actors.current = new Player.class(store.state, {})
      expect(await actors.current.run(command)).toEqual({ ok: false, reason: "ITEM_CHANGED" })
      expect(await actors.current.run({ type: "unequip", slot: "weapon", expectedStack: held })).toEqual({ ok: false, reason: "BAG_FULL" })
      expect(store.saved.get("__void_durable_state")).toEqual(saved)
    })
