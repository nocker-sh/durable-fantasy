import { afterEach, expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { Player } from "#/durable-objects/player"
import { emptyMarket } from "#/world/core/empty-market"
import { stockOf } from "#/world/core/stock-of"
import { seedStock } from "#/world/core/seed-stock"
import { restock } from "#/world/core/restock"
import { SHOPS } from "#/world/core/shops"
import type { ShopCommand } from "#/world/core/shop-receipt-types"
import type { ShopQuote } from "#/world/core/shop-receipt-types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { MarketRecord } from "#/world/server/market-record-types"
import { shopMaker } from "#/world/server/shop-maker"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const buy: ShopCommand = { type: "buy", shop: "fruit", item: "apple", count: 2 }
const sell: ShopCommand = { type: "sell", shop: "buyer", slot: 0, count: 2 }
const now = Date.UTC(2026, 9, 27, 0, 5)
async function fixture(gold = 100) {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  const location = { world: 1, map: "phanthiet", route: [[38, 80]], since: now, connection: "connection" }
  const playerStore = durableStorage({ ...initialPlayerRecord(), player: player({ gold, bag: bagWith(["herb", 3]) }), location }, 8)
  const market = { ...emptyMarket(now), since: now, stock: seedStock(SHOPS) }
  const marketStore = durableStorage({ market }, 0)
  let recipient = new Player.class(playerStore.state, {})
  let source = new Market.class(marketStore.state, {})
  const others = new Map<string, { store: ReturnType<typeof durableStorage>; actor: typeof recipient }>()
  await recipient.read()
  await source.look("fruit", null)
  let loseReply = false
  const receive = vi.fn(async (key: string, quote: ShopQuote) => {
    const result = await recipient.receiveShop(key, quote)
    if (loseReply) {
      loseReply = false
      throw Error("Response lost")
    }
    return result
  })
  const own = { read: () => recipient.read(), ownsConnection: (connection: string) => recipient.ownsConnection(connection), receiveShop: receive }
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    if (owner === "owner") return own as unknown as ReturnType<typeof Player.get>
    if (typeof owner !== "string") throw Error("Expected a player name")
    let other = others.get(owner)
    if (!other) {
      const store = durableStorage({ ...initialPlayerRecord(), player: player({ gold, bag: bagWith(["herb", 3]) }), location: { ...location, connection: "other-connection" } }, 8)
      other = { store, actor: new Player.class(store.state, {}) }
      others.set(owner, other)
    }
    return other.actor as unknown as ReturnType<typeof Player.get>
  })
  return {
    marketStore,
    playerStore,
    receive,
    get recipient() {
      return recipient
    },
    get source() {
      return source
    },
    loseNextReply: () => {
      loseReply = true
    },
    restart: () => {
      recipient = new Player.class(playerStore.state, {})
      source = new Market.class(marketStore.state, {})
      for (const other of others.values()) other.actor = new Player.class(other.store.state, {})
    },
    state: () => (marketStore.saved.get("__void_durable_state") as { value: MarketRecord }).value,
    begin: async (command = buy, seq = 1, connection = "connection") => {
      const request = await source.beginTrade({ owner: "owner", connection: connection, seq: seq, command: command, keepers: [...SHOPS[command.shop].keepers], toClose: null })
      if (!request.ok) throw Error(request.reason)
      return request.id
    },
  }
}

it.each([buy, sell])("saves one %s outcome and stock movement through repeated RPCs", async (command) => {
  const f = await fixture()
  const initial = stockOf(f.state().market, command.shop, command.type === "buy" ? command.item : "herb")
  const id = await f.begin(command)
  if (command.type === "sell") expect(stockOf(f.state().market, command.shop, "herb")).toBe(initial)
  const first = await f.source.finishTrade("owner", id)
  if (!first.ok) throw Error(first.reason)
  expect(await f.begin(command)).toBe(id)
  expect((await f.source.finishTrade("owner", id)).ok).toBe(true)
  const result = await f.recipient.read()
  expect(result.gold).toBe(first.state.gold)
  expect(result.bag).toEqual(first.state.bag)
  expect(stockOf(f.state().market, command.shop, command.type === "buy" ? command.item : "herb")).toBe(initial + (command.type === "buy" ? -2 : 2))
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
})

it.each(["reply", "source-save", "recipient-save"].flatMap((failure) => [buy, sell].map((command) => [failure, command] as const)))(
  "recovers %s during %j without repeating money, items or stock",
  async (failure, command) => {
    const f = await fixture()
    const initial = stockOf(f.state().market, command.shop, command.type === "buy" ? command.item : "herb")
    const id = await f.begin(command)
    if (failure === "reply") f.loseNextReply()
    if (failure === "source-save") f.marketStore.failNextSave()
    if (failure === "recipient-save") f.playerStore.failNextSave()
    await expect(f.source.finishTrade("owner", id)).rejects.toThrow()
    f.restart()
    await f.source.alarm()
    const result = await f.recipient.read()
    expect(stockOf(f.state().market, command.shop, command.type === "buy" ? command.item : "herb")).toBe(initial + (command.type === "buy" ? -2 : 2))
    expect(result.bag.find((slot) => slot?.item === (command.type === "buy" ? "apple" : "herb"))?.count).toBe(command.type === "buy" ? 2 : 1)
    expect(result.gold).toBe(command.type === "buy" ? 100 - f.state().jobs.owner.quote.unitPrice * 2 : 100 + f.state().jobs.owner.quote.unitPrice * 2)
    await f.source.alarm()
    expect((await f.source.finishTrade("owner", id)).ok).toBe(true)
    expect((await f.recipient.read()).gold).toBe(result.gold)
    expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
  },
)

it("never reserves stock or runs a player receipt when the initial request cannot be saved", async () => {
  const f = await fixture()
  const before = structuredClone(f.state().market)
  f.marketStore.failNextSave()
  await expect(f.begin()).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.source.alarm()
  expect(f.receive).not.toHaveBeenCalled()
  expect(f.state().market).toEqual(before)
})
it("returns reserved stock once after an explicit refusal, even when its reply is lost", async () => {
  const f = await fixture(0)
  const before = structuredClone(f.state().market)
  const id = await f.begin()
  f.loseNextReply()
  await expect(f.source.finishTrade("owner", id)).rejects.toThrow("Response lost")
  f.restart()
  await f.source.alarm()
  expect(f.state().market).toEqual(before)
  expect(await f.source.finishTrade("owner", id)).toEqual({ ok: false, reason: "NO_GOLD" })
  expect((await f.recipient.read()).gold).toBe(0)
})
it("refuses a changed selling slot and does not put unreceived goods into the shop", async () => {
  const f = await fixture()
  const before = structuredClone(f.state().market)
  const id = await f.begin(sell)
  expect((await f.recipient.run({ type: "move", from: 0, to: 1 })).ok).toBe(true)
  expect(await f.source.finishTrade("owner", id)).toEqual({ ok: false, reason: "EMPTY_SLOT" })
  expect(f.state().market).toEqual(before)
  expect((await f.recipient.read()).bag[1]?.count).toBe(3)
})
it("does not replace a pending request or accept an altered or stale replay", async () => {
  const f = await fixture()
  const id = await f.begin()
  expect(await f.source.beginTrade({ owner: "owner", connection: "connection", seq: 1, command: { ...buy, count: 3 }, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginTrade({ owner: "owner", connection: "connection", seq: 2, command: buy, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_READY" })
  await f.source.finishTrade("owner", id)
  const second = await f.begin(buy, 2)
  await f.source.finishTrade("owner", second)
  expect(await f.source.beginTrade({ owner: "owner", connection: "connection", seq: 1, command: buy, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginTrade({ owner: "owner", connection: "unknown", seq: 3, command: buy, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_READY" })
})
it("never returns a refused old batch into the next day's fresh shelf", async () => {
  const f = await fixture(0)
  const state = f.state()
  state.market.shelf.bakery = { "rye-bread": [0, 5, 0, 0] }
  f.restart()
  const command: ShopCommand = { type: "buy", shop: "bakery", item: "rye-bread", count: 1, q: 1 }
  const id = await f.begin(command)
  vi.advanceTimersByTime(86_400_000)
  const expected = restock(structuredClone(f.state().market), Date.now(), shopMaker)
  expect(await f.source.finishTrade("owner", id)).toEqual({ ok: false, reason: "NO_GOLD" })
  expect(f.state().market).toEqual(expected)
})

it("reserves the last goods before either buyer can pay", async () => {
  const f = await fixture()
  f.state().market.stock!.fruit.apple = 2
  f.restart()
  const id = await f.begin()
  expect(stockOf(f.state().market, "fruit", "apple")).toBe(0)
  expect(await f.source.beginTrade({ owner: "other", connection: "other-connection", seq: 1, command: buy, keepers: [], toClose: null })).toEqual({ ok: false, reason: "SOLD_OUT" })
  expect(f.receive).not.toHaveBeenCalled()
  expect((await f.source.finishTrade("owner", id)).ok).toBe(true)
  expect((await f.recipient.read()).bag.find((slot) => slot?.item === "apple")?.count).toBe(2)
})

it("reserves buying capacity without offering unpaid goods, then releases capacity on refusal", async () => {
  const f = await fixture()
  ;(f.state().market.stock!.buyer ??= {}).herb = 119
  f.restart()
  const command = { ...sell, count: 1 }
  const id = await f.begin(command)
  expect(stockOf(f.state().market, "buyer", "herb")).toBe(119)
  expect(await f.source.beginTrade({ owner: "other", connection: "other-connection", seq: 1, command: command, keepers: [], toClose: null })).toEqual({ ok: false, reason: "NOT_WANTED" })
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  expect((await f.recipient.prepareTrade(proposal)).ok).toBe(true)
  expect(await f.source.finishTrade("owner", id)).toEqual({ ok: false, reason: "NOT_READY" })
  expect(stockOf(f.state().market, "buyer", "herb")).toBe(119)
  const next = await f.source.beginTrade({ owner: "other", connection: "other-connection", seq: 2, command: command, keepers: [], toClose: null })
  if (!next.ok) throw Error(next.reason)
  expect((await f.source.finishTrade("other", next.id)).ok).toBe(true)
  expect(stockOf(f.state().market, "buyer", "herb")).toBe(120)
})

it("keeps recovering other customers while one receipt service is unavailable", async () => {
  const f = await fixture()
  await f.begin()
  const other = await f.source.beginTrade({ owner: "other", connection: "other-connection", seq: 1, command: buy, keepers: [], toClose: null })
  if (!other.ok) throw Error(other.reason)
  f.receive.mockRejectedValue(Error("Player unavailable"))
  await f.source.alarm()
  expect(f.state().jobs.owner.phase).toBe("pending")
  expect(f.state().jobs.other.phase).toBe("done")
})

it("uses the reserved shelf's timestamp when the day's first batch arrives during request persistence", async () => {
  const f = await fixture(0)
  f.state().market.shelf.bakery = { "rye-bread": [0, 5, 0, 0] }
  f.restart()
  const firstBatch = Date.UTC(2026, 9, 27, 18)
  const clock = vi
    .spyOn(Date, "now")
    .mockReturnValueOnce(firstBatch - 1)
    .mockReturnValue(firstBatch + 1)
  const id = await f.begin({ type: "buy", shop: "bakery", item: "rye-bread", count: 1, q: 1 })
  expect(f.state().jobs.owner.at).toBe(firstBatch - 1)
  const expected = restock(structuredClone(f.state().market), firstBatch + 1, shopMaker)
  expect(await f.source.finishTrade("owner", id)).toEqual({ ok: false, reason: "NO_GOLD" })
  expect(f.state().market).toEqual(expected)
  clock.mockRestore()
})

it.each([buy, sell])("recovers an alarm's failed final save for %j without repeating the player outcome", async (command) => {
  const f = await fixture()
  await f.begin(command)
  f.marketStore.failNextSave()
  await expect(f.source.alarm()).rejects.toThrow("Storage unavailable")
  const paid = await f.recipient.read()
  f.restart()
  await f.source.alarm()
  await f.source.alarm()
  expect((await f.recipient.read()).gold).toBe(paid.gold)
  expect((await f.recipient.read()).bag).toEqual(paid.bag)
  expect(f.state().jobs.owner.phase).toBe("done")
  expect((await f.recipient.deliveryUpdate(null)).revision).toBe(1)
})
it("refuses a sale whose displayed stack changed before market reservation", async () => {
  const f = await fixture()
  const before = structuredClone(f.state())
  const result = await f.source.beginTrade({ owner: "owner", connection: "connection", seq: 1, command: { ...sell, expectedStack: { item: "herb", count: 4 } }, keepers: [], toClose: null })
  expect(result).toEqual({ ok: false, reason: "ITEM_CHANGED" })
  expect(f.state()).toEqual(before)
  expect(f.receive).not.toHaveBeenCalled()
  expect((await f.recipient.read()).bag[0]).toMatchObject({ item: "herb", count: 3 })
})
it("rejects reusing a sale request number with a different selected stack", async () => {
  const f = await fixture(),
    command: ShopCommand = { ...sell, expectedStack: { item: "herb", count: 3 } }
  const id = await f.begin(command)
  expect(await f.source.beginTrade({ owner: "owner", connection: "connection", seq: 1, command: { ...command, expectedStack: { item: "herb", count: 2 } }, keepers: [], toClose: null })).toEqual({
    ok: false,
    reason: "NOT_READY",
  })
  expect(await f.source.finishTrade("owner", id)).toMatchObject({ ok: true })
})

it("rejects undeclared and inherited shop names before resolving a stock maker", () => {
  for (const shop of ["missing", "constructor", "toString", "__proto__"]) expect(() => shopMaker(shop, "apple")).toThrow(TypeError)
})
