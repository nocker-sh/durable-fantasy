import { afterEach, expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { Player } from "#/durable-objects/player"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyMarket } from "#/world/core/empty-market"
import { fullDurability } from "#/world/core/full-durability"
import { seedStock } from "#/world/core/seed-stock"
import { stockOf } from "#/world/core/stock-of"
import { SHOPS } from "#/world/core/shops"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { MarketRecord } from "#/world/server/market-record-types"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const now = Date.UTC(2026, 9, 27, 0, 5)

/** Sell one axe with these uses left at the general store, through the market reservation and the player receipt. */
async function sellAxe(dur: number) {
  vi.useFakeTimers()
  vi.setSystemTime(now)
  const axe = { item: "wood-axe" as const, count: 1, q: 1 as const, by: "アルノルト", dur }
  const location = { world: 1, map: "phanthiet-market", route: [[10, 10]], since: now, connection: "connection" }
  const playerStore = durableStorage({ ...initialPlayerRecord(), player: player({ gold: 0, bag: [axe, ...emptyBag(23)] }), location }, 8)
  const marketStore = durableStorage({ market: { ...emptyMarket(now), since: now, stock: seedStock(SHOPS) } }, 0)
  const seller = new Player.class(playerStore.state, {})
  const market = new Market.class(marketStore.state, {})
  vi.spyOn(Player, "get").mockReturnValue(seller as unknown as ReturnType<typeof Player.get>)
  const record = () => (marketStore.saved.get("__void_durable_state") as { value: MarketRecord }).value
  await market.look("general", null)
  const shelf = stockOf(record().market, "general", "wood-axe")
  const command = { type: "sell" as const, shop: "general" as const, slot: 0, count: 1, expectedStack: axe }
  const begun = await market.beginTrade({ owner: "owner", connection: "connection", seq: 1, command, keepers: ["ヘレナ"], toClose: null })
  if (!begun.ok) throw Error(begun.reason)
  const unit = record().jobs.owner.quote.unitPrice
  const sold = await market.finishTrade("owner", begun.id)
  if (!sold.ok) throw Error(sold.reason)
  return { unit, gold: (await seller.read()).gold, shelf: stockOf(record().market, "general", "wood-axe") - shelf }
}

it("pays a worn axe at the counter only for the uses it has left", async () => {
  const full = fullDurability("wood-axe", 1)
  if (!full) throw Error("the axe has no durability")
  const unworn = await sellAxe(full)
  const half = await sellAxe(full / 2)
  const last = await sellAxe(1)
  expect(unworn.gold).toBe(unworn.unit)
  expect(half.gold).toBe(Math.floor(half.unit / 2))
  expect(last.gold).toBe(Math.max(1, Math.floor(last.unit / full)))
  expect(last.gold).toBeLessThan(half.gold)
  // the shelf counts tools, not their wear: the shop puts each back in order before selling it again
  expect([unworn.shelf, half.shelf, last.shelf]).toEqual([1, 1, 1])
})
