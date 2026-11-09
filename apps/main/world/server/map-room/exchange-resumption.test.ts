import { afterEach, expect, it, vi } from "vitest"
import { Exchange } from "#/durable-objects/exchange"
import { Player } from "#/durable-objects/player"
import { ITEMS } from "#/world/core/items/catalog"
import { ITEM_IDS } from "#/world/core/items/item-ids"
import { sellable } from "#/world/core/items/sellable"
import { QUALITIES, type Quality } from "#/world/core/items/kinds"
import { fullDurability } from "#/world/core/full-durability"
import { emptyBag } from "#/world/core/empty-bag"
import type { Stack } from "#/world/core/bag-types"
import type { InboxClaim } from "#/world/core/exchange-claim-types"
import type { PlayerRecord } from "#/world/server/player-record"
import type { ExchangeRecord } from "#/world/server/exchange-record"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { initialExchangeRecord } from "#/world/server/exchange-record"
import { handleExchangeRequest } from "#/world/server/map-room/handle-exchange-request"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Message } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"
import { EXCHANGE_BOARD, BOARD_REACH } from "#/world/town/boards"
import { MAPS } from "#/world/maps/index"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"
import { cellDistance } from "#/world/maps/cell-distance"
import type { Cell } from "#/world/maps/types"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

type Owner = "seller" | "buyer"
type Failure = "reply" | "source-save" | "player-save"
type Operation = "order" | "claim"
const map = MAPS[EXCHANGE_BOARD.map]
const region = getWalkableRegion(map, map.spawn[1] * map.size + map.spawn[0], new Uint8Array(map.size * map.size))
const standing = [...region].map((key): Cell => [key % map.size, Math.floor(key / map.size)]).find((at) => cellDistance(at, EXCHANGE_BOARD.cell) <= BOARD_REACH)
if (!standing) throw new Error("No walkable board position connected to the authored spawn")
const at: Cell = standing
const symbols = ITEM_IDS.flatMap((item) =>
  ITEMS[item].made ? QUALITIES.map((_, q) => ({ item, q: q as Quality | undefined, symbol: `${item}@${q}` })) : [{ item, q: undefined as Quality | undefined, symbol: item }],
)

for (const failure of ["reply", "source-save", "player-save"] as const)
  it.each(symbols)(`${failure}: $symbol survives native board admission, exchange/player restarts and request retries`, async (entry) => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const maximum = fullDurability(entry.item, entry.q ?? 1)
    const stack: Stack = { item: entry.item, count: 1, ...(entry.q !== undefined ? { q: entry.q, by: "テスト" } : {}), ...(maximum !== undefined ? { dur: maximum } : {}) }
    const makePlayer = (owner: Owner) => {
      const initial = initialPlayerRecord()
      initial.player = { ...initial.player, profileComplete: true, gold: 10000, stats: { ...initial.player.stats, str: 20 }, bag: owner === "seller" ? [stack, ...emptyBag(23)] : emptyBag() }
      initial.location = { world: 1, map: map.id, route: [[...at]], since: 0, connection: owner }
      return durableStorage(initial, 8)
    }
    // Starting stock, funds, strength and a nearby room position are explicit local conditions.
    const stores = { seller: makePlayer("seller"), buyer: makePlayer("buyer") }
    const sourceStore = durableStorage(initialExchangeRecord(), 3)
    let source = new Exchange.class(sourceStore.state, {})
    let actors = { seller: new Player.class(stores.seller.state, {}), buyer: new Player.class(stores.buyer.state, {}) }
    const record = (owner: Owner) => (stores[owner].saved.get("__void_durable_state") as { value: PlayerRecord }).value
    const exchange = () => (sourceStore.saved.get("__void_durable_state") as { value: ExchangeRecord }).value
    let fault: { owner: Owner; operation: Operation; failure: Failure } | null = null
    const takeFailure = (owner: Owner, operation: Operation, target: Failure) => {
      if (fault?.owner !== owner || fault.operation !== operation || fault.failure !== target) return false
      fault = null
      return true
    }
    vi.spyOn(Player, "get").mockImplementation((id: unknown) => {
      if (id !== "seller" && id !== "buyer") throw new Error("Unexpected player RPC target")
      const owner = id
      return {
        ownsConnection: (connection: string) => actors[owner].ownsConnection(connection),
        read: () => actors[owner].read(),
        holdOrder: async (...args: Parameters<typeof actors.seller.holdOrder>) => {
          if (takeFailure(owner, "order", "player-save")) stores[owner].failNextSave()
          return actors[owner].holdOrder(...args)
        },
        receiveInbox: async (claim: InboxClaim) => {
          if (takeFailure(owner, "claim", "player-save")) stores[owner].failNextSave()
          return actors[owner].receiveInbox(claim)
        },
        inboxReceipt: (id: number) => actors[owner].inboxReceipt(id),
      } as unknown as ReturnType<typeof Player.get>
    })
    vi.spyOn(Exchange, "get").mockImplementation((id: unknown) => {
      expect(id).toBe("world")
      return {
        beginOrder: async (input: Parameters<typeof source.beginOrder>[0]) => {
          const result = await source.beginOrder(input)
          if (result.ok && takeFailure(input.owner as Owner, "order", "source-save")) sourceStore.failNextSave()
          return result
        },
        place: (owner: string, id: number) => source.place(owner, id),
        look: (symbol: string, owner: string) => source.look(symbol, owner),
        reserveInbox: async (owner: string) => {
          const claim = await source.reserveInbox(owner)
          if (takeFailure(owner as Owner, "claim", "source-save")) sourceStore.failNextSave()
          return claim
        },
        deliverInbox: (owner: string, id: number) => source.deliverInbox(owner, id),
      } as unknown as ReturnType<typeof Exchange.get>
    })
    const sends = { seller: vi.fn(), buyer: vi.fn() }
    const request = (owner: Owner, message: Message<"ex-place" | "ex-claim">) =>
      handleExchangeRequest(
        {
          me: { owner, player: mapPlayer(owner, record(owner).player, [...at]), route: [[...at]], since: 0, said: [], engaged: null },
          key: { map: map.id },
          ctx: {
            connection: {
              id: owner,
              send: async (reply: ServerMessage) => {
                sends[owner](reply)
                if (reply.type === "result" && reply.result.ok && takeFailure(owner, message.type === "ex-place" ? "order" : "claim", "reply")) throw new Error("Reply lost")
              },
            },
          },
        },
        message,
      )
    const reply = (owner: Owner) => {
      const messages = sends[owner].mock.calls.map((call) => call[0] as ServerMessage)
      const result = messages.reverse().find((message) => message.type === "result")
      if (result?.type !== "result") throw new Error("Board did not reply")
      return result.result
    }
    const run = async (owner: Owner, message: Message<"ex-place" | "ex-claim">) => {
      fault = { owner, operation: message.type === "ex-place" ? "order" : "claim", failure }
      await expect(request(owner, message)).rejects.toThrow(failure === "reply" ? "Reply lost" : "Storage unavailable")
      expect(fault).toBeNull()
      source = new Exchange.class(sourceStore.state, {})
      actors = { seller: new Player.class(stores.seller.state, {}), buyer: new Player.class(stores.buyer.state, {}) }
      await source.alarm()
      const beforeRetry = structuredClone(record(owner).player)
      await request(owner, message)
      expect(reply(owner).ok).toBe(true)
      if (message.type === "ex-claim") expect(record(owner).player).toEqual({ ...beforeRetry, revision: beforeRetry.revision + 1 })
      else {
        const board = sends[owner].mock.calls.at(-1)?.[0] as ServerMessage | undefined
        if (board?.type !== "exchange") throw new Error("Successful placement did not publish its board")
        expect(board.symbol).toBe(entry.symbol)
        expect(board.view.inbox).toEqual(exchange().ex.inbox[owner] ?? { gold: 0, items: [] })
        expect(board.view.mine).toEqual(exchange().ex.orders.filter((order) => order.owner === owner))
      }
    }
    const sell = { type: "ex-place" as const, seq: 1, side: "sell" as const, symbol: entry.symbol, price: 100, qty: 1, slot: 0 }
    if (!sellable(entry.item)) {
      const original = [structuredClone(sourceStore.saved.get("__void_durable_state")), structuredClone(stores.seller.saved.get("__void_durable_state"))]
      await request("seller", sell)
      expect(reply("seller")).toEqual({ ok: false, reason: "NOT_SELLABLE" })
      expect([sourceStore.saved.get("__void_durable_state"), stores.seller.saved.get("__void_durable_state")]).toEqual(original)
      return
    }
    await run("seller", sell)
    expect(record("seller").player.gold).toBe(9999)
    expect(record("seller").player.bag).toEqual(emptyBag())
    await run("buyer", { type: "ex-place", seq: 1, side: "buy", symbol: entry.symbol, price: 100, qty: 1 })
    expect(exchange().ex.orders).toEqual([])
    for (const owner of ["seller", "buyer"] as const) await run(owner, { type: "ex-claim", seq: 2 })
    expect(record("seller").player.gold).toBe(10096)
    expect(record("buyer").player.gold).toBe(9899)
    expect(record("buyer").player.bag).toEqual([stack, ...emptyBag(23)])
    expect(record("seller").player.bag).toEqual(emptyBag())
    expect(record("seller").player.gold + record("buyer").player.gold + exchange().ex.fees).toBe(20000)
    expect(exchange().delivery.claims).toEqual({})
    const snapshot = () => [stores.seller.saved.get("__void_durable_state"), stores.buyer.saved.get("__void_durable_state"), sourceStore.saved.get("__void_durable_state")]
    const settled = structuredClone(snapshot())
    await source.alarm()
    expect(snapshot()).toEqual(settled)
    expect(exchange().ex.fees).toBe(5)
  })
