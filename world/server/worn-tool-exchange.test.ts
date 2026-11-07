import { afterEach, expect, it, vi } from "vitest"
import { Nature } from "#/durable-objects/nature"
import { Player } from "#/durable-objects/player"
import { Exchange } from "#/durable-objects/exchange"
import { NODES } from "#/world/core/gather"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { QUALITIES, type Quality } from "#/world/core/items/kinds"
import { fullDurability } from "#/world/core/full-durability"
import { exchangeReady } from "#/world/core/exchange-ready"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyNature } from "#/world/core/nature/empty-nature"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { initialExchangeRecord } from "#/world/server/exchange-record"
import type { PlayerRecord } from "#/world/server/player-record"
import type { ExchangeRecord } from "#/world/server/exchange-record"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const tools = ITEM_IDS.filter((id) => ITEMS[id].tool)
const read = <T>(store: ReturnType<typeof durableStorage>): T => structuredClone((store.saved.get("__void_durable_state") as { value: T }).value)

for (const id of tools)
  for (const q of QUALITIES.keys())
    it(`${id}@${q}: actual gathering wear prevents an unworn exchange listing after restart`, async () => {
      vi.useFakeTimers()
      vi.setSystemTime(1000)
      vi.spyOn(Math, "random").mockReturnValue(0.5)
      const node = NODES.find((entry) => entry.skill === ITEMS[id].tool!.skill)
      expect(node).toBeDefined()
      if (!node) throw Error(`${id}: no authored gathering site`)
      const dur = fullDurability(id, q as Quality)!
      expect(dur).toBeGreaterThan(1)
      // A fresh tool, supplies and standing at an existing site are local starting conditions.
      const stack = { item: id, count: 1, q: q as Quality, by: "道具の作り手", dur }
      const initial = {
        ...initialPlayerRecord(),
        player: player({ bag: [stack, ...emptyBag(23)], gold: 1000, hpAt: 1000, spAt: 1000, fullAt: 1000, warmUntil: 61_000 }),
        location: { world: 1, map: node.map, route: [node.cell], since: 1000, connection: "connection" },
      }
      const intent = { side: "sell" as const, symbol: `${id}@${q}`, price: 100, qty: 1, slot: 0 }
      expect(exchangeReady(stack)).toBe(true)
      const freshStore = durableStorage(structuredClone(initial), 8)
      const fresh = new Player.class(freshStore.state, {})
      expect((await fresh.holdOrder(1, intent)).ok).toBe(true)
      expect(read<PlayerRecord>(freshStore).player.bag[0]).toBeNull()

      const store = durableStorage(initial, 8)
      let actor = new Player.class(store.state, {})
      vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
        if (owner !== "owner") throw Error("Unexpected tool owner")
        return actor as unknown as ReturnType<typeof Player.get>
      })
      const natureStore = durableStorage({ nature: emptyNature() }, 0)
      const nature = new Nature.class(natureStore.state, {})
      const begun = await nature.beginGather({ owner: "owner", connection: "connection", seq: 1, node: node.id })
      expect(begun.ok).toBe(true)
      if (!begun.ok) throw Error(begun.reason)
      const gathered = await nature.finishGather("owner", begun.id)
      expect(gathered.ok).toBe(true)
      if (!gathered.ok) throw Error(gathered.reason)
      expect(gathered.events).toHaveLength(1)
      const worn = { ...stack, dur: dur - 1 }
      expect(gathered.state.bag[0]).toEqual(worn)
      expect(exchangeReady(worn)).toBe(false)
      actor = new Player.class(store.state, {})
      expect((await actor.read()).bag[0]).toEqual(worn)
      const playerBefore = structuredClone(store.saved.get("__void_durable_state"))
      const exchangeStore = durableStorage(initialExchangeRecord(), 2)
      let exchange = new Exchange.class(exchangeStore.state, {})
      const before = read<ExchangeRecord>(exchangeStore)
      const request = { owner: "owner", connection: "connection", seq: 1, name: "出品者", intent }
      const order = await exchange.beginOrder(request)
      expect(order.ok).toBe(true)
      if (!order.ok) throw Error(order.reason)
      expect(await exchange.place("owner", order.id)).toEqual({ ok: false, reason: "WORN_TOOL" })
      expect(store.saved.get("__void_durable_state")).toEqual(playerBefore)
      expect(read<ExchangeRecord>(exchangeStore).ex).toEqual(before.ex)
      expect(read<ExchangeRecord>(exchangeStore).requests.jobs.owner).toMatchObject({ id: order.id, phase: "refused", reason: "WORN_TOOL" })
      const refused = structuredClone(exchangeStore.saved.get("__void_durable_state"))
      actor = new Player.class(store.state, {})
      exchange = new Exchange.class(exchangeStore.state, {})
      expect(await exchange.beginOrder(request)).toEqual(order)
      expect(await exchange.place("owner", order.id)).toEqual({ ok: false, reason: "WORN_TOOL" })
      await exchange.alarm()
      expect(exchangeStore.saved.get("__void_durable_state")).toEqual(refused)
      expect(store.saved.get("__void_durable_state")).toEqual(playerBefore)
    })
