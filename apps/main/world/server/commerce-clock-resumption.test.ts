import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
import type { ItemId } from "#/world/core/items/catalog"
import type { Command, ServerCommand } from "#/world/core/commands"
import { STORAGE_KEEPER, STORE_FEE } from "#/world/core/storage/rules"
import { FRIEND } from "#/world/core/friendship-rules"
import { dayOf } from "#/world/core/day-of"
import { emptyBag } from "#/world/core/empty-bag"
import { countItem } from "#/world/core/count-item"
import { qualitiesOf } from "#/world/core/qualities-of"
import { makerAt } from "#/world/core/maker-at"
import { derive } from "#/world/core/derive"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const rollover = Date.parse("2026-11-07T06:00:00+09:00")
const day = 24 * 60 * 60_000
const scenarios: { kind: "buy" | "sell" | "store"; shop: ShopId | null; keeper: string; item: ItemId }[] = []
for (const shop of Object.keys(SHOPS) as ShopId[])
  for (const keeper of SHOPS[shop].keepers) {
    if (SHOPS[shop].kind === "buyer") scenarios.push({ kind: "sell", shop, keeper, item: "jelly" })
    else {
      const item = SHOPS[shop].stock[0]
      if (!item) throw Error(`${shop}: a commerce case needs authored stock`)
      scenarios.push({ kind: "buy", shop, keeper, item })
    }
  }
scenarios.push({ kind: "store", shop: null, keeper: STORAGE_KEEPER, item: "jelly" })

it.each(scenarios)("$kind/$shop/$keeper: failed saves and restarts preserve one credit per new day", async (scenario) => {
  vi.useFakeTimers()
  vi.setSystemTime(rollover - 1)
  const base = player()
  const other = scenarios.find((entry) => entry.keeper !== scenario.keeper)!.keeper
  // Counter access, goods, carrying stats and funds are local server conditions, not a travel route.
  const initial = player({ gold: 100_000, stats: { ...base.stats, str: 40 }, hpAt: rollover - 1, spAt: rollover - 1, friends: { [other]: 13 }, bag: [{ item: "jelly", count: 6 }, ...emptyBag(23)] })
  const healthy = { ...initial, hp: derive(initial).maxHp }
  const store = durableStorage({ ...initialPlayerRecord(), player: healthy }, 8)
  const actors = { current: new Player.class(store.state, {}) }
  let current = healthy
  const times = [rollover - 1, rollover, rollover - 1, rollover, rollover + day]
  const credits = [1, 2, 2, 2, 3]
  const stamped = [rollover - 1, rollover, rollover, rollover, rollover + day]
  for (const entry1 of times.entries()) {
    const index = entry1[0],
      now = entry1[1]

    vi.setSystemTime(now)
    const selected = current.bag[0]
    if (!selected) throw Error("Expected the selected local stock to remain available")
    const command: Command | ServerCommand =
      scenario.kind === "store"
        ? { type: "store", slot: 0, count: 1, expectedStack: structuredClone(selected) }
        : scenario.kind === "sell"
          ? { type: "sell", shop: scenario.shop!, slot: 0, count: 1, expectedStack: structuredClone(selected) }
          : { type: "buy", shop: scenario.shop!, item: scenario.item, count: 1, q: qualitiesOf(scenario.item, makerAt(scenario.shop!, scenario.item))[0] }
    const context = { keepers: [scenario.keeper] }
    const before = structuredClone(store.saved.get("__void_durable_state"))
    store.failNextSave()
    await expect(actors.current.run(command, context)).rejects.toThrow("Storage unavailable")
    expect(store.saved.get("__void_durable_state")).toEqual(before)
    const liveAfterFailure = await actors.current.read()
    expect(liveAfterFailure).toEqual({ ...current, hpAt: now, spAt: now, revision: current.revision + 1 })
    current = liveAfterFailure
    actors.current = new Player.class(store.state, {})
    const result = await actors.current.run(command, context)
    if (!result.ok) throw Error(`${scenario.shop}: ${result.reason}`)
    expect(result.state.friends).toEqual({ [other]: 13, [scenario.keeper]: credits[index] * FRIEND.bought })
    expect(result.state.boughtOn).toEqual({ [scenario.keeper]: dayOf(stamped[index]) })
    expect(countItem(result.state.bag, scenario.item)).toBe(countItem(current.bag, scenario.item) + (scenario.kind === "buy" ? 1 : -1))
    const event = result.events[0]
    expect(result.events).toHaveLength(1)
    if (scenario.kind === "buy") {
      if (event.type !== "bought") throw Error("Missing purchase result")
      expect(result.state.gold).toBe(current.gold - event.cost)
    } else if (scenario.kind === "sell") {
      if (event.type !== "sold") throw Error("Missing sale result")
      expect(result.state.gold).toBe(current.gold + event.gain)
    } else {
      expect(event).toMatchObject({ type: "stored", fee: STORE_FEE })
      expect(result.state.gold).toBe(current.gold - STORE_FEE)
      expect(countItem(result.state.storage, scenario.item)).toBe(index + 1)
    }
    actors.current = new Player.class(store.state, {})
    current = await actors.current.read()
    expect(current).toEqual({ ...result.state, revision: result.state.revision + 1 })
  }
})
