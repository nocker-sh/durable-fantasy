import { afterEach, expect, it, vi } from "vitest"
import { Market } from "#/durable-objects/market"
import { Player } from "#/durable-objects/player"
import { SHOPS } from "#/world/core/shops"
import type { ShopId } from "#/world/core/shop-types"
import type { ItemId } from "#/world/core/items/catalog"
import { ITEMS } from "#/world/core/items/catalog"
import { jstMinutes } from "#/world/core/jst-minutes"
import { emptyMarket } from "#/world/core/empty-market"
import { emptyBag } from "#/world/core/empty-bag"
import { countItem } from "#/world/core/count-item"
import { MAPS, TALK_CELLS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import { keepersOnDuty } from "#/world/maps/keepers-on-duty"
import { RESIDENT_WORK_SPOTS } from "#/world/maps/resident-work-spots"
import { shopOpen } from "#/world/maps/shop-open"
import { minutesToClose } from "#/world/maps/minutes-to-close"
import { cellDistance } from "#/world/maps/cell-distance"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"
import type { Cell } from "#/world/maps/types"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { shopOffers } from "#/world/server/shop-offers"
import { shopMaker } from "#/world/server/shop-maker"
import type { MarketRecord } from "#/world/server/market-record-types"
import type { PlayerRecord } from "#/world/server/player-record"
import { handleShopLook } from "#/world/server/map-room/handle-shop-look"
import { handlePlayerCommand } from "#/world/server/map-room/handle-player-command"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function counter(shop: ShopId, item: ItemId) {
  const ids = new Set([
    SHOPS[shop].map,
    ...SHOPS[shop].keepers.flatMap((name) => {
      const work = RESIDENT_WORK_SPOTS.get(name)
      return work ? [work.map] : []
    }),
  ])
  const sites = [...ids].map((id) => {
    const map = MAPS[id]
    const region = [...getWalkableRegion(map, map.spawn[1] * map.size + map.spawn[0], new Uint8Array(map.size * map.size))].map((key): Cell => [key % map.size, Math.floor(key / map.size)])
    return { map, region }
  })
  const market = { market: emptyMarket(Date.parse("2026-11-01T15:00:00Z")) }
  for (let minute = 0; minute < 2880; minute += 15) {
    const now = Date.parse("2026-11-01T15:00:00Z") + minute * 60_000
    vi.setSystemTime(now)
    if (!shopOpen(shop, jstMinutes(now))) continue
    const offer = shopOffers(market, shop, minutesToClose(shop, jstMinutes(now))).find((row) => row.item === item && (row.left === null || row.left > 0))
    for (const site of sites) {
      const cells = keepersOnDuty(site.map, shop, jstMinutes(now)).map((keeper) => keeper.cell)
      const at = site.region.find((cell) => cells.some((npc) => cellDistance(cell, npc) <= TALK_CELLS + 1))
      if (at && offer) return { map: site.map, now, at, offer, market: structuredClone(market.market) }
    }
  }
  throw Error(`${shop}/${item}: no reachable stocked counter in the authored schedule`)
}

const cases = (Object.keys(SHOPS) as ShopId[]).flatMap((shop) => SHOPS[shop].stock.flatMap((item) => (["source-save", "player-save", "reply"] as const).map((failure) => ({ shop, item, failure }))))

it.each(cases)("$shop/$item/$failure: the native shop window and counter preserve one purchase after restart", async (scenario) => {
  vi.useFakeTimers()
  vi.spyOn(Math, "random").mockReturnValue(0.5)
  vi.spyOn(console, "warn").mockImplementation(() => {})
  const site = counter(scenario.shop, scenario.item)
  vi.setSystemTime(site.now)
  const fixture = () => {
    const initial = initialPlayerRecord()
    // Funds, strength, an empty bag and a standable counter position are local conditions.
    initial.player = { ...initial.player, profileComplete: true, gold: site.offer.price, bag: emptyBag(), stats: { ...initial.player.stats, str: 40 } }
    initial.location = { world: 1, map: site.map.id, route: [[...site.at]], since: site.now, connection: "connection" }
    const playerStore = durableStorage(initial, 8)
    const marketStore = durableStorage({ market: structuredClone(site.market), serial: 0, jobs: {} }, 1)
    const actors = { player: new Player.class(playerStore.state, {}), market: new Market.class(marketStore.state, {}) }
    const send = vi.fn(async (_message: ServerMessage) => {})
    const me: Presence = { owner: "owner", player: mapPlayer("connection", initial.player, [...site.at]), route: [[...site.at]], since: site.now, said: [], engaged: null, ready: true }
    const context = {
      ctx: { connection: { id: "connection", send }, room: { broadcast: vi.fn(async () => {}) } },
      key: { world: 1, map: site.map.id },
      map: site.map,
      me,
      save: (patch: Partial<Presence>) => Object.assign(me, patch),
    } as unknown as Ctx
    return { playerStore, marketStore, actors, send, context }
  }
  const control = fixture(),
    f = fixture()
  let active = control
  let failReceipt = false
  vi.spyOn(Player, "get").mockImplementation(
    () =>
      ({
        read: () => active.actors.player.read(),
        ownsConnection: (connection: string) => active.actors.player.ownsConnection(connection),
        receiveShop: (...args: Parameters<typeof active.actors.player.receiveShop>) => {
          if (failReceipt) {
            failReceipt = false
            active.playerStore.failNextSave()
          }
          return active.actors.player.receiveShop(...args)
        },
      }) as unknown as ReturnType<typeof Player.get>,
  )
  vi.spyOn(Market, "get").mockImplementation(() => active.actors.market as unknown as ReturnType<typeof Market.get>)
  const snapshot = (store: ReturnType<typeof durableStorage>) => structuredClone(store.saved.get("__void_durable_state"))
  const message = { type: "command" as const, seq: 1, command: { type: "buy" as const, shop: scenario.shop, item: scenario.item, q: site.offer.q, count: 1, price: site.offer.price } }
  for (const target of [control, f]) {
    active = target
    const elsewhere = Object.values(MAPS).find((map) => SHOPS[scenario.shop].keepers.every((name) => !npcCell(map, name, jstMinutes(site.now))))!
    target.context.map = elsewhere
    target.context.me.route = [[...elsewhere.spawn]]
    const marketBefore = snapshot(target.marketStore),
      playerBefore = snapshot(target.playerStore)
    await handlePlayerCommand(target.context, message)
    expect(target.send).toHaveBeenLastCalledWith({ type: "result", seq: 1, result: { ok: false, reason: "TOO_FAR" } })
    expect(snapshot(target.marketStore)).toEqual(marketBefore)
    expect(snapshot(target.playerStore)).toEqual(playerBefore)
    target.context.map = site.map
    target.context.me.route = [[...site.at]]
    await handleShopLook(target.context, { type: "look", shop: scenario.shop })
    const stock = target.send.mock.calls.at(-1)![0]
    if (stock.type !== "stock") throw Error("Missing native shop window")
    expect(stock.offers.find((row) => row.item === scenario.item && row.q === site.offer.q)).toEqual(site.offer)
    target.send.mockClear()
  }
  active = control
  await handlePlayerCommand(control.context, message)
  const result = control.send.mock.calls[0][0]
  if (result.type !== "result" || !result.result.ok) throw Error(`${scenario.shop}/${scenario.item}: native purchase was refused`)
  expect(result.result.state.gold).toBe(0)
  expect(countItem(result.result.state.bag, scenario.item)).toBe(1)
  const stack = result.result.state.bag.find((entry) => entry?.item === scenario.item)!
  if (ITEMS[scenario.item].made) expect(stack).toMatchObject({ q: site.offer.q, by: shopMaker(scenario.shop, scenario.item) })
  const after = await control.actors.market.look(scenario.shop, minutesToClose(scenario.shop, jstMinutes(site.now)))
  const remaining = after.find((row) => row.item === scenario.item && row.q === site.offer.q)
  // Exhausted non-ordinary batch qualities disappear from the real shop window.
  expect(remaining ? remaining.left : 0).toBe(site.offer.left === null ? null : site.offer.left - 1)
  const expectedMarket = snapshot(control.marketStore)
  const expectedPlayer = snapshot(control.playerStore) as { value: PlayerRecord }
  active = f
  const initialMarket = snapshot(f.marketStore),
    initialPlayer = snapshot(f.playerStore)
  if (scenario.failure === "source-save") f.marketStore.failNextSave()
  if (scenario.failure === "player-save") failReceipt = true
  if (scenario.failure === "reply") f.send.mockRejectedValueOnce(Error("Response lost"))
  if (scenario.failure === "reply") await handlePlayerCommand(f.context, message)
  else {
    await expect(handlePlayerCommand(f.context, message)).rejects.toThrow("Storage unavailable")
    expect(snapshot(f.playerStore)).toEqual(initialPlayer)
    expect(f.send).not.toHaveBeenCalled()
    if (scenario.failure === "source-save") expect(snapshot(f.marketStore)).toEqual(initialMarket)
    else expect((snapshot(f.marketStore) as { value: MarketRecord }).value.jobs.owner.phase).toBe("pending")
  }
  f.actors.player = new Player.class(f.playerStore.state, {})
  f.actors.market = new Market.class(f.marketStore.state, {})
  f.send.mockImplementation(async () => {})
  await handlePlayerCommand(f.context, message)
  if (scenario.failure === "reply") expectedPlayer.value.player = { ...expectedPlayer.value.player, revision: expectedPlayer.value.player.revision + 1 }
  expect(snapshot(f.marketStore)).toEqual(expectedMarket)
  expect(snapshot(f.playerStore)).toEqual(expectedPlayer)
  const completed = f.send.mock.calls.at(-1)![0]
  if (completed.type !== "result" || !completed.result.ok) throw Error("Purchase did not resume")
  expect(completed.result.events).toEqual(scenario.failure === "reply" ? [] : result.result.events)
  expect(completed.result.state).toEqual(expectedPlayer.value.player)
  await handlePlayerCommand(f.context, message)
  expectedPlayer.value.player = { ...expectedPlayer.value.player, revision: expectedPlayer.value.player.revision + 1 }
  expect(snapshot(f.marketStore)).toEqual(expectedMarket)
  expect(snapshot(f.playerStore)).toEqual(expectedPlayer)
  expect(f.send.mock.calls.at(-1)![0]).toMatchObject({ type: "result", result: { ok: true, events: [] } })
  const once = snapshot(f.playerStore)
  await f.actors.market.alarm()
  expect(snapshot(f.playerStore)).toEqual(once)
  expect(snapshot(f.marketStore)).toEqual(expectedMarket)
})
