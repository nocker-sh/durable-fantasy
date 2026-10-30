import { afterEach, expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { Player } from "#/durable-objects/player"
import { emptyMarket } from "#/world/core/empty-market"
import { seedStock } from "#/world/core/seed-stock"
import { SHOPS } from "#/world/core/shops"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { MarketRecord } from "#/world/server/market-record-types"
import type { ShopCommand } from "#/world/core/shop-receipt-types"
import { player } from "#/world/test/player"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const policy = vi.hoisted(() => ({ open: true }))
vi.mock("#/world/maps/npc-cell", () => ({ npcCell: () => [0, 0] }))
vi.mock("#/world/maps/shop-open", () => ({ shopOpen: () => policy.open }))
vi.mock("#/world/maps/minutes-to-close", () => ({ minutesToClose: () => null }))
import { HANDLERS } from "#/world/server/map-room/work"
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  policy.open = true
})
function fixture() {
  vi.useFakeTimers()
  const now = Date.UTC(2026, 9, 27, 0, 5)
  vi.setSystemTime(now)
  const p = player({ profileComplete: true, gold: 100, bag: bagWith(["herb", 3]) })
  const pc = durableStorage({ ...initialPlayerRecord(), player: p, location: { world: 1, map: "phanthiet", route: [[0, 0]], since: now, connection: "connection" } }, 8)
  const stock = { ...emptyMarket(now), since: now, stock: seedStock(SHOPS) }
  const marketStore = durableStorage({ market: stock, serial: 0, jobs: {} }, 1)
  const actor = new Player.class(pc.state, {})
  const market = new Market.class(marketStore.state, {})
  vi.spyOn(Player, "get").mockReturnValue(actor as unknown as ReturnType<typeof Player.get>)
  vi.spyOn(Market, "get").mockReturnValue(market as unknown as ReturnType<typeof Market.get>)
  const send = vi.fn(async (_message: ServerMessage) => {})
  const me: Presence = { owner: "owner", player: mapPlayer("connection", p, [0, 0]), route: [[0, 0]], since: now, said: [], engaged: null, ready: true }
  const context = {
    ctx: { connection: { id: "connection", send }, room: { broadcast: vi.fn(async () => {}) } },
    map: {},
    me,
    save: (patch: Partial<Presence>) => Object.assign(me, patch),
  } as unknown as Ctx
  return { actor, context, send, marketStore, stock }
}
it.each<ShopCommand>([
  { type: "buy", shop: "fruit", item: "apple", count: 2 },
  { type: "sell", shop: "buyer", slot: 0, count: 2 },
])("completes %j through the durable market request and player receipt", async (command) => {
  const f = fixture()
  await HANDLERS.command!(f.context, { type: "command", seq: 7, command })
  const result = f.send.mock.calls[0][0]
  expect(result.type).toBe("result")
  if (result.type !== "result" || !result.result.ok) throw Error("Shop trade failed")
  expect(result.seq).toBe(7)
  const record = (f.marketStore.saved.get("__void_durable_state") as { value: MarketRecord }).value
  expect(record.jobs.owner.phase).toBe("done")
  expect(record.jobs.owner.command).toEqual(command)
  expect(record.jobs.owner.quote.keepers).toEqual(SHOPS[command.shop].keepers)
  const p = await f.actor.read()
  expect(p.bag.find((slot) => slot?.item === (command.type === "buy" ? "apple" : "herb"))?.count).toBe(command.type === "buy" ? 2 : 1)
  expect(p.gold).toBe(result.result.state.gold)
  expect((await f.actor.deliveryUpdate(null)).revision).toBe(1)
})
it("rejects a closed shop before creating a reservation or changing inventory", async () => {
  const f = fixture()
  policy.open = false
  await HANDLERS.command!(f.context, { type: "command", seq: 7, command: { type: "buy", shop: "fruit", item: "apple", count: 2 } })
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 7, result: { ok: false, reason: "CLOSED" } })
  expect(f.marketStore.saved.get("__void_durable_state")).toEqual({ __voidDurableState: true, version: 1, value: { market: f.stock, serial: 0, jobs: {} } })
  expect((await f.actor.read()).gold).toBe(100)
})
