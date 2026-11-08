import { afterEach, expect, it, vi } from "vitest"
import { Exchange } from "#/durable-objects/exchange"
import { Player } from "#/durable-objects/player"
import { ITEMS, type ItemId } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { sellable } from "#/world/core/items/sellable"
import { QUALITIES, type Quality } from "#/world/core/items/kinds"
import { fullDurability } from "#/world/core/full-durability"
import { emptyBag } from "#/world/core/empty-bag"
import { MAX_STAT } from "#/world/core/growth-rules"
import type { Stack } from "#/world/core/bag-types"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { PlayerRecord } from "#/world/server/player-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { initialExchangeRecord } from "#/world/server/exchange-record"
import type { ExchangeRecord } from "#/world/server/exchange-record"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

type Failure = "reply" | "source-save" | "player-save" | null
type Owner = "seller" | "buyer"
const read = <T>(store: ReturnType<typeof durableStorage>) => structuredClone((store.saved.get("__void_durable_state") as { value: T }).value)

type Case = { item: ItemId; q: Quality | undefined; symbol: string }
const symbols = ITEM_IDS.flatMap<Case>((item) => (ITEMS[item].made ? QUALITIES.map((_, q) => ({ item, q: q as Quality, symbol: `${item}@${q}` })) : [{ item, q: undefined, symbol: item }]))

async function exercise(entry: (typeof symbols)[number], failure: Failure) {
  const base = player()
  const dur = fullDurability(entry.item, entry.q ?? 1)
  const stack: Stack = { item: entry.item, count: 1, ...(entry.q !== undefined ? { q: entry.q, by: "テスト" } : {}), ...(dur !== undefined ? { dur } : {}) }
  // Stock, money, strength and a current connection are explicit initial conditions.
  const initialSeller = player({ gold: 10000, stats: { ...base.stats, str: MAX_STAT }, bag: [stack, ...emptyBag(23)] })
  const initialBuyer = player({ gold: 10000, stats: { ...base.stats, str: MAX_STAT }, bag: emptyBag(24) })
  const stores = {
    seller: durableStorage({ ...initialPlayerRecord(), player: initialSeller, location: { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "seller-connection" } }, 8),
    buyer: durableStorage({ ...initialPlayerRecord(), player: initialBuyer, location: { world: 1, map: "phanthiet", route: [[38, 80]], since: 1000, connection: "buyer-connection" } }, 8),
  }
  const sourceStore = durableStorage(initialExchangeRecord(), 2)
  let source = new Exchange.class(sourceStore.state, {})
  let players = { seller: new Player.class(stores.seller.state, {}), buyer: new Player.class(stores.buyer.state, {}) }
  const publications = { seller: 0, buyer: 0 }
  let lostReply: "hold" | "receive" | null = null
  const lookup = vi.spyOn(Player, "get").mockImplementation((id: unknown) => {
    if (id !== "seller" && id !== "buyer") throw new Error("Unexpected exchange participant")
    const owner = id
    return {
      ownsConnection: (connection: string) => players[owner].ownsConnection(connection),
      read: async () => {
        const result = await players[owner].read()
        publications[owner]++
        return result
      },
      holdOrder: async (id: number, intent: OrderIntent) => {
        const result = await players[owner].holdOrder(id, intent)
        if (result.ok) publications[owner]++
        if (lostReply === "hold") {
          lostReply = null
          throw new Error("Response lost")
        }
        return result
      },
      receiveInbox: async (claim: InboxClaim) => {
        const result = await players[owner].receiveInbox(claim)
        if (result.ok) publications[owner]++
        if (lostReply === "receive") {
          lostReply = null
          throw new Error("Response lost")
        }
        return result
      },
      inboxReceipt: (id: number) => players[owner].inboxReceipt(id),
    } as unknown as ReturnType<typeof Player.get>
  })
  function restart() {
    source = new Exchange.class(sourceStore.state, {})
    players = { seller: new Player.class(stores.seller.state, {}), buyer: new Player.class(stores.buyer.state, {}) }
  }
  async function begin(owner: Owner) {
    return source.beginOrder({
      owner,
      connection: `${owner}-connection`,
      seq: 1,
      name: owner,
      intent: { side: owner === "seller" ? "sell" : "buy", symbol: entry.symbol, price: 100, qty: 1, ...(owner === "seller" ? { slot: 0 } : {}) },
    })
  }
  try {
    const before = structuredClone(sourceStore.saved.get("__void_durable_state"))
    const sellerBefore = structuredClone(stores.seller.saved.get("__void_durable_state"))
    const started = await begin("seller")
    if (!sellable(entry.item)) {
      expect(started).toEqual({ ok: false, reason: "NOT_SELLABLE" })
      expect(sourceStore.saved.get("__void_durable_state")).toEqual(before)
      expect(stores.seller.saved.get("__void_durable_state")).toEqual(sellerBefore)
      return null
    }
    expect(started.ok).toBe(true)
    if (!started.ok) throw new Error(started.reason)
    const pending = structuredClone(sourceStore.saved.get("__void_durable_state"))
    if (failure === "reply") lostReply = "hold"
    if (failure === "source-save") sourceStore.failNextSave()
    if (failure === "player-save") stores.seller.failNextSave()
    if (failure) {
      await expect(source.place("seller", started.id)).rejects.toThrow()
      expect(sourceStore.saved.get("__void_durable_state")).toEqual(pending)
      if (failure === "player-save") expect(stores.seller.saved.get("__void_durable_state")).toEqual(sellerBefore)
      restart()
      await source.alarm()
    } else expect((await source.place("seller", started.id)).ok).toBe(true)
    expect(await begin("seller")).toEqual(started)
    expect((await source.place("seller", started.id)).ok).toBe(true)
    const bought = await begin("buyer")
    expect(bought.ok).toBe(true)
    if (!bought.ok) throw new Error(bought.reason)
    expect((await source.place("buyer", bought.id)).ok).toBe(true)
    expect((await source.place("buyer", bought.id)).ok).toBe(true)
    expect(read<ExchangeRecord>(sourceStore).ex.orders).toEqual([])
    for (const owner of ["seller", "buyer"] as const) {
      const claim = await source.reserveInbox(owner)
      expect(owner === "buyer" ? claim.inbox.items : claim.inbox.gold).toEqual(owner === "buyer" ? [stack] : 97)
      const pending = structuredClone(sourceStore.saved.get("__void_durable_state"))
      const recipientBefore = structuredClone(stores[owner].saved.get("__void_durable_state"))
      if (failure === "reply") lostReply = "receive"
      if (failure === "source-save") sourceStore.failNextSave()
      if (failure === "player-save") stores[owner].failNextSave()
      if (failure) {
        await expect(source.deliverInbox(owner, claim.id)).rejects.toThrow()
        expect(sourceStore.saved.get("__void_durable_state")).toEqual(pending)
        if (failure === "player-save") expect(stores[owner].saved.get("__void_durable_state")).toEqual(recipientBefore)
        restart()
        await source.alarm()
      } else expect((await source.deliverInbox(owner, claim.id)).ok).toBe(true)
      const receipt = read<PlayerRecord>(stores[owner]).exchangeReceipt
      expect(receipt).toEqual(claim)
      const completed = structuredClone(stores[owner].saved.get("__void_durable_state"))
      const replay = await source.deliverInbox(owner, claim.id)
      expect(replay.ok).toBe(true)
      if (replay.ok) expect(replay.events).toEqual([])
      expect(stores[owner].saved.get("__void_durable_state")).toEqual(completed)
    }
    const seller = read<PlayerRecord>(stores.seller)
    const buyer = read<PlayerRecord>(stores.buyer)
    const exchange = read<ExchangeRecord>(sourceStore)
    expect(seller.player.bag).toEqual(emptyBag(24))
    expect(buyer.player.bag).toEqual([stack, ...emptyBag(23)])
    expect(seller.player.gold).toBe(10096)
    expect(buyer.player.gold).toBe(9899)
    expect(seller.player.gold + buyer.player.gold + exchange.ex.fees).toBe(20000)
    expect(exchange.delivery.claims).toEqual({})
    expect(exchange.requests.jobs.seller.phase).toBe("done")
    expect(exchange.requests.jobs.buyer.phase).toBe("done")
    expect(publications).toEqual({ seller: failure && failure !== "player-save" ? 5 : 3, buyer: failure && failure !== "player-save" ? 4 : 3 })
    for (const owner of ["seller", "buyer"] as const) {
      const record = owner === "seller" ? seller : buyer
      expect(record.player.revision).toBe(publications[owner])
      expect(record.deliveryRevision).toBe(2)
    }
    const stable = structuredClone(sourceStore.saved.get("__void_durable_state"))
    restart()
    await source.alarm()
    await source.alarm()
    expect(sourceStore.saved.get("__void_durable_state")).toEqual(stable)
    expect(read<PlayerRecord>(stores.seller)).toEqual(seller)
    expect(read<PlayerRecord>(stores.buyer)).toEqual(buyer)
    return { seller, buyer, exchange }
  } finally {
    lookup.mockRestore()
  }
}

for (const entry of symbols)
  it(`${entry.symbol}: matching and both deliveries survive failed writes and lost replies`, async () => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    const baseline = await exercise(entry, null)
    for (const failure of ["reply", "source-save", "player-save"] as const) {
      const actual = await exercise(entry, failure)
      if (!baseline || !actual) {
        expect(actual).toBe(baseline)
        continue
      }
      const extra = failure === "player-save" ? { seller: 0, buyer: 0 } : { seller: 2, buyer: 1 }
      expect(actual).toEqual({
        ...baseline,
        seller: { ...baseline.seller, player: { ...baseline.seller.player, revision: baseline.seller.player.revision + extra.seller } },
        buyer: { ...baseline.buyer, player: { ...baseline.buyer.player, revision: baseline.buyer.player.revision + extra.buyer } },
      })
    }
  })
