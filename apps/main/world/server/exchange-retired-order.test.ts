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
// the rule an order is checked against changes between paying and placing (a symbol retired by a deploy)
const retired = vi.hoisted(() => ({ on: false }))
vi.mock("#/world/core/order-failure", async (load) => {
  const actual = await load<typeof import("#/world/core/order-failure")>()
  return { orderFailure: (intent: OrderIntent) => (retired.on ? "NOT_SELLABLE" : actual.orderFailure(intent)) }
})
afterEach(() => {
  retired.on = false
  vi.restoreAllMocks()
})

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
  const recipient = new Player.class(recipientStore.state, {})
  const source = new Exchange.class(exchangeStore.state, {})
  await recipient.read()
  await source.look("log", "owner")
  let loseReply = true
  vi.spyOn(Player, "get").mockReturnValue({
    holdOrder: async (id: number, intent: OrderIntent) => {
      const result = await recipient.holdOrder(id, intent)
      if (loseReply) {
        loseReply = false
        throw Error("Response lost")
      }
      return result
    },
    ownsConnection: (id: string) => recipient.ownsConnection(id),
    read: () => recipient.read(),
    receiveInbox: (claim: InboxClaim) => recipient.receiveInbox(claim),
    inboxReceipt: (id: number) => recipient.inboxReceipt(id),
  } as unknown as ReturnType<typeof Player.get>)
  return { source, recipient }
}

it.each([
  { side: "buy", symbol: "log", price: 10, qty: 2 },
  { side: "sell", symbol: "potion@1", price: 10, qty: 2, slot: 0 },
] as OrderIntent[])("gives the whole escrow back when a paid $side order can no longer be placed", async (intent) => {
  const f = await fixture()
  const begun = await f.source.beginOrder({ owner: "owner", connection: "connection", seq: 1, name: "売り手", intent })
  if (!begun.ok) throw Error(begun.reason)
  // paid, then the reply was lost before the order went up
  await expect(f.source.place("owner", begun.id)).rejects.toThrow("Response lost")
  retired.on = true
  await f.source.alarm()
  expect(await f.source.place("owner", begun.id)).toEqual({ ok: false, reason: "NOT_SELLABLE" })
  // nothing is left held: the inbox holds everything paid, listing fee included, and no order went up
  const view = await f.source.look(intent.symbol, "owner")
  expect(view.mine).toHaveLength(0)
  if (intent.side === "buy") expect(view.inbox).toEqual({ gold: 21, items: [] })
  else expect(view.inbox).toMatchObject({ gold: 1, items: [{ item: "potion", count: 2, q: 1, by: "イルムガルト" }] })
})
