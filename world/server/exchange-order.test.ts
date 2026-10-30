import { afterEach, expect, it, vi } from "vitest"
import { Exchange } from "#/durable-objects/exchange"
import { Player } from "#/durable-objects/player"
import { emptyExchange } from "#/world/core/empty-exchange"
import { emptyClaims } from "#/world/core/empty-claims"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import { emptyBag } from "#/world/core/empty-bag"
import type { OrderIntent } from "#/world/core/exchange-types"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => vi.restoreAllMocks())
const buy: OrderIntent = { side: "buy", symbol: "log", price: 10, qty: 2 }
const sell: OrderIntent = { side: "sell", symbol: "potion@1", price: 10, qty: 2, slot: 0 }

async function fixture() {
  const bag = [...emptyBag()]
  bag[0] = { item: "potion", count: 3, q: 1, by: "イルムガルト" }
  const recipientStore = durableStorage(
    {
      player: player({ gold: 100, bag }),
      credential: "test-credential",
      location: { world: 1, map: "phanthiet", route: [[38, 80]], since: Date.now(), connection: "connection" },
      trade: null,
      tradeJob: null,
      exchangeReceipt: null,
    },
    3,
  )
  const exchangeStore = durableStorage({ ex: emptyExchange(), delivery: emptyClaims() }, 1)
  let recipient = new Player.class(recipientStore.state, {})
  let source = new Exchange.class(exchangeStore.state, {})
  await recipient.read()
  await source.look("log", "owner")
  let loseReply = false
  const hold = vi.fn(async (id: number, intent: OrderIntent) => {
    const result = await recipient.holdOrder(id, intent)
    if (loseReply) {
      loseReply = false
      throw Error("Response lost")
    }
    return result
  })
  vi.spyOn(Player, "get").mockReturnValue({
    holdOrder: hold,
    ownsConnection: (id: string) => recipient.ownsConnection(id),
    read: () => recipient.read(),
    receiveInbox: (claim: InboxClaim) => recipient.receiveInbox(claim),
    inboxReceipt: (id: number) => recipient.inboxReceipt(id),
  } as unknown as ReturnType<typeof Player.get>)
  return {
    recipientStore,
    exchangeStore,
    hold,
    get source() {
      return source
    },
    get recipient() {
      return recipient
    },
    loseNextReply: () => {
      loseReply = true
    },
    restart: () => {
      recipient = new Player.class(recipientStore.state, {})
      source = new Exchange.class(exchangeStore.state, {})
    },
    begin: async (intent = buy, seq = 1, connection = "connection") => {
      const result = await source.beginOrder({ owner: "owner", connection: connection, seq: seq, name: "売り手", intent: intent })
      if (!result.ok) throw Error(result.reason)
      return result.id
    },
  }
}

it.each([buy, sell])("registers %s once, keeping the escrow and maker across repeated requests", async (intent) => {
  const f = await fixture()
  const id = await f.begin(intent)
  expect((await f.source.place("owner", id)).ok).toBe(true)
  expect(await f.begin(intent)).toBe(id)
  expect((await f.source.place("owner", id)).ok).toBe(true)
  const view = await f.source.look(intent.symbol, "owner")
  expect(view.mine).toHaveLength(1)
  expect(view.mine[0]).toMatchObject({ side: intent.side, left: 2, price: 10, ...(intent.side === "sell" ? { by: "イルムガルト" } : {}) })
  const p = await f.recipient.read()
  expect(p.gold).toBe(intent.side === "buy" ? 79 : 99)
  expect(p.bag[0]).toMatchObject({ count: intent.side === "buy" ? 3 : 1, by: "イルムガルト" })
})

it.each(["reply", "source-save", "escrow-save"].flatMap((failure) => [buy, sell].map((intent) => [failure, intent] as const)))(
  "recovers a failed %s across restart without repeating escrow or registration: %j",
  async (failure, intent) => {
    const f = await fixture()
    const id = await f.begin(intent)
    if (failure === "reply") f.loseNextReply()
    if (failure === "source-save") f.exchangeStore.failNextSave()
    if (failure === "escrow-save") f.recipientStore.failNextSave()
    await expect(f.source.place("owner", id)).rejects.toThrow()
    f.restart()
    await f.source.alarm()
    const gold = intent.side === "buy" ? 79 : 99
    expect((await f.source.look(intent.symbol, "owner")).mine).toHaveLength(1)
    expect((await f.recipient.read()).gold).toBe(gold)
    await f.source.alarm()
    expect((await f.source.place("owner", id)).ok).toBe(true)
    expect((await f.recipient.read()).gold).toBe(gold)
    expect((await f.recipient.read()).bag[0]).toMatchObject({ count: intent.side === "buy" ? 3 : 1, by: "イルムガルト" })
    expect(f.exchangeStore.saved.get("__void_durable_state")).toMatchObject({ value: { ex: { fees: 1 } } })
  },
)

it("never takes payment for a request whose initial save failed", async () => {
  const f = await fixture()
  f.exchangeStore.failNextSave()
  await expect(f.begin()).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.source.alarm()
  expect(f.hold).not.toHaveBeenCalled()
  expect((await f.recipient.read()).gold).toBe(100)
})

it("rejects altered and stale requests, and does not replace an unfinished request", async () => {
  const f = await fixture()
  const id = await f.begin()
  expect(await f.source.beginOrder({ owner: "owner", connection: "connection", seq: 1, name: "売り手", intent: { ...buy, qty: 3 } })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginOrder({ owner: "owner", connection: "connection", seq: 2, name: "売り手", intent: buy })).toEqual({ ok: false, reason: "NOT_READY" })
  await f.source.place("owner", id)
  const next = await f.begin(buy, 2)
  await f.source.place("owner", next)
  expect(await f.source.beginOrder({ owner: "owner", connection: "connection", seq: 1, name: "売り手", intent: buy })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(await f.source.beginOrder({ owner: "owner", connection: "old-connection", seq: 3, name: "売り手", intent: buy })).toEqual({ ok: false, reason: "NOT_READY" })
  expect((await f.recipient.read()).gold).toBe(58)
  expect((await f.source.look("log", "owner")).mine).toHaveLength(2)
  await f.recipient.arrive({ world: 1, map: "phanthiet", connection: "new-connection" })
  const reconnected = await f.begin(buy, 1, "new-connection")
  await f.source.place("owner", reconnected)
  expect(await f.source.beginOrder({ owner: "owner", connection: "connection", seq: 3, name: "売り手", intent: buy })).toEqual({ ok: false, reason: "NOT_READY" })
  expect((await f.recipient.read()).gold).toBe(37)
})

it("validates the selling slot inside the player's debit and persists a refusal", async () => {
  const f = await fixture()
  const id = await f.begin({ ...sell, symbol: "potion@2" })
  expect(await f.source.place("owner", id)).toEqual({ ok: false, reason: "EMPTY_SLOT" })
  expect(await f.source.place("owner", id)).toEqual({ ok: false, reason: "EMPTY_SLOT" })
  expect(f.hold).toHaveBeenCalledOnce()
  expect((await f.recipient.read()).gold).toBe(100)
  expect((await f.source.look("potion@2", "owner")).mine).toHaveLength(0)
})

it("keeps listing fees, traded goods and collected proceeds consistent through matching", async () => {
  const f = await fixture()
  const first = await f.begin(sell)
  await f.source.place("owner", first)
  const second = await f.begin({ side: "buy", symbol: "potion@1", price: 10, qty: 2 }, 2)
  await f.source.place("owner", second)
  const claim = await f.source.reserveInbox("owner")
  expect((await f.source.deliverInbox("owner", claim.id)).ok).toBe(true)
  expect((await f.recipient.read()).gold).toBe(97)
  expect((await f.recipient.read()).bag[0]).toMatchObject({ item: "potion", count: 3, by: "イルムガルト" })
  expect(f.exchangeStore.saved.get("__void_durable_state")).toMatchObject({ value: { ex: { fees: 3, orders: [] } } })
})

it("recognizes a prior escrow during a later reserved trade", async () => {
  const f = await fixture()
  const id = await f.begin(sell)
  const held = await f.recipient.holdOrder(id, sell)
  expect(held.ok).toBe(true)
  expect((await f.recipient.prepareTrade({ id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 })).ok).toBe(true)
  expect((await f.source.place("owner", id)).ok).toBe(true)
  expect((await f.recipient.read()).gold).toBe(99)
  expect((await f.source.look("potion@1", "owner")).mine).toHaveLength(1)
})

it("keeps the paid maker even if the original selling slot changes before recovery", async () => {
  const f = await fixture()
  const id = await f.begin(sell)
  f.loseNextReply()
  await expect(f.source.place("owner", id)).rejects.toThrow("Response lost")
  expect((await f.recipient.run({ type: "move", from: 0, to: 1 })).ok).toBe(true)
  f.restart()
  await f.source.alarm()
  expect((await f.source.look("potion@1", "owner")).mine[0]).toMatchObject({ by: "イルムガルト", left: 2 })
  expect((await f.recipient.read()).bag[1]).toMatchObject({ count: 1, by: "イルムガルト" })
  expect((await f.recipient.read()).gold).toBe(99)
})
