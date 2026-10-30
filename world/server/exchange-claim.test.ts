import { afterEach, expect, it, vi } from "vitest"
import { Exchange } from "../../durable-objects/exchange"
import { Player } from "../../durable-objects/player"
import { emptyExchange } from "#/world/core/empty-exchange"
import { place } from "#/world/core/place"
import type { ExchangeState, Inbox } from "#/world/core/exchange-types"

import { emptyBag } from "#/world/core/empty-bag"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import { durableStorage as storage } from "../test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => vi.restoreAllMocks())

const goods: Inbox = { gold: 7, items: [{ item: "potion", count: 1, q: 1 }] }
async function fixture(full = false) {
  const p = player({ gold: 10, bag: full ? emptyBag().map(() => ({ item: "log" as const, count: 99 })) : emptyBag() })
  const recipientStore = storage({ player: p, credential: "test-credential", location: null, trade: null, tradeJob: null }, 2)
  const exchangeStore = storage({ ex: { ...emptyExchange(), inbox: { owner: structuredClone(goods) } } }, 0)
  let recipient = new Player.class(recipientStore.state, {})
  let source = new Exchange.class(exchangeStore.state, {})
  await recipient.read()
  await source.look("log", "owner")
  let loseReply = false
  const receive = vi.fn(async (claim: InboxClaim) => {
    const result = await recipient.receiveInbox(claim)
    if (loseReply) {
      loseReply = false
      throw Error("Response lost")
    }
    return result
  })
  vi.spyOn(Player, "get").mockReturnValue({ receiveInbox: receive, inboxReceipt: (id: number) => recipient.inboxReceipt(id) } as unknown as ReturnType<typeof Player.get>)
  return {
    recipientStore,
    exchangeStore,
    receive,
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
  }
}

it("migrates existing data without changing inventory, identity, or inbox contents", async () => {
  const f = await fixture()
  expect(await f.recipient.authenticate("test-credential")).toBe(true)
  expect((await f.source.look("log", "owner")).inbox).toEqual(goods)
  expect(f.recipientStore.saved.get("__void_durable_state")).toMatchObject({ version: 8, value: { exchangeReceipt: null, trade: null, tradeJob: null } })
  expect(f.exchangeStore.saved.get("__void_durable_state")).toMatchObject({ version: 2, value: { delivery: { claimSerial: 0, claims: {} } } })
})

it("does not remove the inbox if reserving it cannot be saved", async () => {
  const f = await fixture()
  f.exchangeStore.failNextSave()
  await expect(f.source.reserveInbox("owner")).rejects.toThrow("Storage unavailable")
  f.restart()
  expect((await f.source.look("log", "owner")).inbox).toEqual(goods)
  expect(f.receive).not.toHaveBeenCalled()
})

it.each(["reply", "source-save", "recipient-save"])("recovers a failed %s after restart without losing or duplicating goods", async (failure) => {
  const f = await fixture()
  const claim = await f.source.reserveInbox("owner")
  if (failure === "reply") f.loseNextReply()
  if (failure === "source-save") f.exchangeStore.failNextSave()
  if (failure === "recipient-save") f.recipientStore.failNextSave()
  await expect(f.source.deliverInbox("owner", claim.id)).rejects.toThrow()
  expect(f.exchangeStore.alarms).toHaveBeenCalled()
  f.restart()
  await f.source.alarm()
  const received = await f.recipient.read()
  expect(received.gold).toBe(17)
  expect(received.bag.filter(Boolean)).toEqual(goods.items)
  expect((await f.source.look("log", "owner")).inbox).toEqual({ gold: 0, items: [] })
  await f.source.alarm()
  const repeated = await f.source.deliverInbox("owner", claim.id)
  expect(repeated.ok).toBe(true)
  expect((await f.recipient.read()).gold).toBe(17)
})

it("returns a refused collection to the inbox and stops retrying it", async () => {
  const f = await fixture(true)
  const claim = await f.source.reserveInbox("owner")
  expect(await f.source.deliverInbox("owner", claim.id)).toEqual({ ok: false, reason: "BAG_FULL" })
  expect((await f.source.look("log", "owner")).inbox).toEqual(goods)
  expect((await f.recipient.read()).gold).toBe(10)
  await f.source.alarm()
  expect(f.receive).toHaveBeenCalledOnce()
})

it("keeps newly arriving proceeds separate from a pending claim", async () => {
  const f = await fixture()
  const claim = await f.source.reserveInbox("owner")
  expect(await f.source.reserveInbox("owner")).toEqual(claim)
  // Another completed matching operation is saved while this reservation remains pending.
  const saved = structuredClone(f.exchangeStore.saved.get("__void_durable_state")) as { value: { ex: ExchangeState } }
  saved.value.ex = place(saved.value.ex, { owner: "owner", name: "売り手", side: "sell", symbol: "log", price: 10, qty: 1 }, Date.now()).state
  saved.value.ex = place(saved.value.ex, { owner: "buyer", name: "買い手", side: "buy", symbol: "log", price: 10, qty: 1 }, Date.now()).state
  f.exchangeStore.saved.set("__void_durable_state", saved)
  f.restart()
  await f.source.deliverInbox("owner", claim.id)
  expect((await f.recipient.read()).gold).toBe(17)
  expect((await f.source.look("log", "owner")).inbox.gold).toBe(9)
  const next = await f.source.reserveInbox("owner")
  expect(next.id).toBeGreaterThan(claim.id)
  await f.source.deliverInbox("owner", next.id)
  expect((await f.recipient.read()).gold).toBe(26)
  expect(await f.recipient.receiveInbox(claim)).toEqual({ ok: false, reason: "NOT_READY" })
})

it("recognizes a previously saved receipt even while a later face-to-face trade is reserved", async () => {
  const f = await fixture()
  const claim = await f.source.reserveInbox("owner")
  expect((await f.recipient.receiveInbox(claim)).ok).toBe(true)
  const proposal = { id: "trade", revision: 1, offer: { lots: [], gold: 0 }, outgoing: [], incoming: [], gold: 0 }
  expect((await f.recipient.prepareTrade(proposal)).ok).toBe(true)
  expect((await f.source.deliverInbox("owner", claim.id)).ok).toBe(true)
  expect((await f.source.look("log", "owner")).inbox).toEqual({ gold: 0, items: [] })
  expect((await f.recipient.read()).gold).toBe(17)
})

it("bounds recovery batches and does not let one unavailable recipient starve later claims", async () => {
  const claims = Object.fromEntries(Array.from({ length: 21 }, (_, i) => [`owner-${i}`, { id: i + 1, inbox: structuredClone(goods) }]))
  const store = storage({ ex: emptyExchange(), delivery: { claimSerial: 21, claims } }, 1)
  const source = new Exchange.class(store.state, {})
  const receive = vi.fn(async (claim: InboxClaim) => {
    if (claim.id === 1) throw Error("Recipient unavailable")
    return { ok: true as const, state: player(), events: [] }
  })
  vi.spyOn(Player, "get").mockReturnValue({ receiveInbox: receive } as unknown as ReturnType<typeof Player.get>)
  await source.alarm()
  expect(receive).toHaveBeenCalledTimes(20)
  await source.alarm()
  expect(receive).toHaveBeenCalledTimes(22)
  expect(receive).toHaveBeenCalledWith(claims["owner-20"])
  expect(store.saved.get("__void_durable_state")).toMatchObject({ value: { delivery: { claims: { "owner-0": claims["owner-0"] } } } })
})

it("can replay an alarm after its final source save fails", async () => {
  const f = await fixture()
  const claim = await f.source.reserveInbox("owner")
  f.exchangeStore.failNextSave()
  await expect(f.source.alarm()).rejects.toThrow("Storage unavailable")
  f.restart()
  await f.source.alarm()
  expect((await f.recipient.read()).gold).toBe(17)
  expect((await f.recipient.read()).bag.filter(Boolean)).toEqual(goods.items)
  expect((await f.source.deliverInbox("owner", claim.id)).ok).toBe(true)
})
