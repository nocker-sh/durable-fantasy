import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameProvider } from "#/components/game/game-provider"
import { ShopSellPanel } from "#/components/hud/shop-sell-panel"
import { shopTakes } from "#/world/core/shop-takes"
import { bagWith } from "#/world/test/bag-with"
import type { Bag } from "#/world/core/bag-types"
import { ShopWindow } from "#/components/hud/shop-window"
import type { GameSession } from "#/world/client/game-session"
import { countItem } from "#/world/core/count-item"
import { REASON_TEXT } from "#/world/core/commands"
import { emptyMarket } from "#/world/core/empty-market"
import { ITEMS } from "#/world/core/items/catalog"
import { moveStock } from "#/world/core/move-stock"
import { seedStock } from "#/world/core/seed-stock"
import type { ShopCommand } from "#/world/core/shop-receipt-types"
import { SHOPS } from "#/world/core/shops"
import type { ShopId, ShopDefinition } from "#/world/core/shop-types"
import type { ItemId } from "#/world/core/items/catalog"
import { stockOf } from "#/world/core/stock-of"
import { stockPrice } from "#/world/core/stock-price"
import { batched } from "#/world/core/batched"
import { priceNow } from "#/world/core/price-now"
import { restock } from "#/world/core/restock"
import { shopMaker } from "#/world/server/shop-maker"
import type { Transition } from "#/world/core/transition"
import { Game } from "#/world/game"
import type { ClientMessage } from "#/world/protocol"
import { beginShopTrade } from "#/world/server/begin-shop-trade"
import { finishShopTrade } from "#/world/server/finish-shop-trade"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { MarketContext, ShopPlayers } from "#/world/server/market-coordinator"
import { receivePlayerShop } from "#/world/server/receive-player-shop"
import { shopBuying } from "#/world/server/shop-buying"
import { shopOffers } from "#/world/server/shop-offers"
import { player } from "#/world/test/player"

// Canvas encoding is a browser boundary; the real game, hooks, shop window and transaction rules run below.
vi.mock("#/world/art/icons/to-url", () => ({ toUrl: () => "data:image/png;base64," }))
const drawn = vi.hoisted(() => ({ buy: [] as (() => void)[], sell: null as null | { click: () => void; disabled: boolean } }))
vi.mock("#/components/game/button", async (original) => {
  const actual = await original<typeof import("#/components/game/button")>()
  return {
    ...actual,
    Button: (props: Parameters<typeof actual.Button>[0]) => {
      if (props.children === "買う" && props.onClick) drawn.buy.push(() => props.onClick!({} as never))
      if (props.children === "売る" && props.onClick) drawn.sell = { click: () => props.onClick!({} as never), disabled: !!props.disabled }
      return createElement(actual.Button, props)
    },
  }
})
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  drawn.buy = []
  drawn.sell = null
})

type Props = { gold: number; stock: number; shop?: ShopId; item?: ItemId; bag?: Bag }

function fixture(props: Props) {
  const shop = props.shop ?? "fruit"
  const item = props.item ?? "apple"
  vi.useFakeTimers()
  const now = Date.UTC(2026, 10, 7, 12)
  vi.setSystemTime(now)
  const record = { ...initialPlayerRecord(), player: player({ gold: props.gold, profileComplete: true, ...(props.bag ? { bag: props.bag } : {}) }) }
  const initial = restock({ ...emptyMarket(now - 86400000), since: now, stock: seedStock(SHOPS) }, now, shopMaker)
  // A shop accepts sales up to three times target stock, so both a full shelf and a nearly empty one are supported states.
  const market = moveStock({ state: initial, shop: shop, item: item, delta: props.stock - stockOf(initial, shop, item) })
  const context: MarketContext = { state: { market, serial: 0, jobs: {} }, id: { toString: () => "market" }, setAlarm: async () => {} }
  const players: ShopPlayers = () => ({
    read: async () => record.player,
    ownsConnection: async (connection) => connection === "connection",
    receiveShop: async (source, quote) => receivePlayerShop({ record, source, quote, now }),
  })
  const offers = shopOffers(context.state, shop, null)
  const buying = shopBuying(context.state, shop, [])
  const offer = offers.find((entry) => entry.item === item && (props.bag || entry.left !== 0))!
  if (!offer) throw new Error(`${shop}/${item}: no native offer available`)
  const by = ITEMS[item].made ? shopMaker(shop, item) : undefined
  expect(offer.price).toBe(batched(shop, item) ? priceNow({ item, q: offer.q, by, toClose: null, isBatched: true }) : stockPrice({ state: context.state.market, shop, item, q: offer.q, by }))
  const game = new Game()
  game.state.set((state) => ({ ...state, player: record.player, shop: shop, stock: { shop: shop, offers, ...buying }, online: "online" }))
  const session = (game as unknown as { session: GameSession }).session
  session.others.welcome("connection", [])
  const transmitted: { result: Promise<Transition> | null } = { result: null }
  async function purchase(command: ShopCommand, seq = 1): Promise<Transition> {
    const request = await beginShopTrade({ context, players, owner: "owner", connection: "connection", seq, command, keepers: SHOPS[command.shop].keepers, toClose: null })
    return request.ok ? finishShopTrade({ context, players, owner: "owner", id: request.id }) : request
  }
  const send = vi.fn((message: ClientMessage) => {
    if (message.type !== "command" || (message.command.type !== "buy" && message.command.type !== "sell")) return
    transmitted.result = purchase(message.command, message.seq).then((result) => {
      session.waiting.get(message.seq)?.(result)
      return result
    })
  })
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  const publish = (nextShop: ShopId) =>
    game.state.set((state) => ({ ...state, shop: nextShop, stock: { shop: nextShop, offers: shopOffers(context.state, nextShop, null), ...shopBuying(context.state, nextShop, []) } }))
  return { game, record, context, offer, send, transmitted, purchase, publish, session }
}

function appleBuyButton(game: Game): string {
  const html = renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(ShopWindow) }))
  const row = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].find((match) => match[1].includes(`aria-label="${ITEMS.apple.name}"`))
  if (!row) throw new Error("The real shop window did not render the apple offer")
  const button = [...row[1].matchAll(/<button\b([^>]*)>[\s\S]*?<\/button>/g)].find((match) => match[0].includes(">買う<"))
  if (!button) throw new Error("The apple offer has no buy button")
  return button[1]
}

it.each([
  { label: "discounted stock with exactly enough gold", stock: 80, gold: 2, price: 2, affordable: true },
  { label: "scarce stock with only the list price in hand", stock: 1, gold: 3, price: 4, affordable: false },
  { label: "scarce stock with exactly enough gold", stock: 1, gold: 4, price: 4, affordable: true },
  { label: "ordinary stock at the unchanged list price", stock: 40, gold: 3, price: 3, affordable: true },
])("keeps the displayed button, send-time preview and actual purchase aligned: $label", async (scenario) => {
  const f = fixture(scenario)
  expect(f.offer.price).toBe(scenario.price)
  const button = appleBuyButton(f.game)
  expect(/(?:^|\s)disabled(?:=|\s|$)/.test(button)).toBe(!scenario.affordable)
  const command = { type: "buy", shop: "fruit", item: "apple", count: 1, price: f.offer.price } as const
  expect(f.game.preview(command)).toBe(scenario.affordable ? null : "NO_GOLD")
  const before = structuredClone(f.record.player)
  if (!scenario.affordable) {
    expect(await f.purchase(command)).toEqual({ ok: false, reason: "NO_GOLD" })
    expect(f.record.player).toEqual(before)
    expect(stockOf(f.context.state.market, "fruit", "apple")).toBe(scenario.stock)
    return
  }
  f.game.buy({ item: "apple", count: 1, price: f.offer.price })
  expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ type: "command", command }))
  if (!f.transmitted.result) throw new Error("The real client preview blocked the displayed affordable purchase")
  const result = await f.transmitted.result
  expect(result.ok).toBe(true)
  await Promise.resolve()
  expect(f.record.player.gold).toBe(scenario.gold - scenario.price)
  expect(countItem(f.record.player.bag, "apple")).toBe(countItem(before.bag, "apple") + 1)
  expect(stockOf(f.context.state.market, "fruit", "apple")).toBe(scenario.stock - 1)
  expect(f.game.state.get().player).toEqual(f.record.player)
})

it("gives a refused purchase its reason where the keyboard and a screen reader reach it (ui.md §3.6)", () => {
  const f = fixture({ stock: 1, gold: 3 })
  expect(appleBuyButton(f.game)).toContain(`aria-description="${REASON_TEXT.NO_GOLD}"`)
  const html = renderToStaticMarkup(createElement(GameProvider, { game: f.game, children: createElement(ShopWindow) }))
  const row = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].find((match) => match[1].includes(`aria-label="${ITEMS.apple.name}"`))![1]
  expect(row).toMatch(/<span[^>]*tabindex="0"[^>]*><button[^>]*disabled=""[^>]*>買う<\/button><\/span>/)
})

it("keeps market price verification authoritative when a client quote is cheaper than the shelf", async () => {
  const f = fixture({ stock: 1, gold: 4 })
  const before = structuredClone(f.record.player)
  expect(await f.purchase({ type: "buy", shop: "fruit", item: "apple", count: 1, price: 1 })).toEqual({ ok: false, reason: "PRICE_CHANGED" })
  expect(f.record.player).toEqual(before)
  expect(stockOf(f.context.state.market, "fruit", "apple")).toBe(1)
})

const shops: Readonly<Record<ShopId, ShopDefinition>> = SHOPS
const shared = (Object.keys(shops) as ShopId[]).flatMap((from) =>
  (Object.keys(shops) as ShopId[]).flatMap((to) => (from === to ? [] : shops[from].stock.filter((item) => shops[to].stock.includes(item)).map((item) => ({ from, to, item })))),
)
if (!shared.length) throw new Error("No canonical shared shop offers")
function buyClick(game: Game, item: ItemId) {
  drawn.buy = []
  renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(ShopWindow) }))
  const offers = game.state.get().stock!.offers
  expect(drawn.buy).toHaveLength(offers.length)
  const index = offers.findIndex((offer) => offer.item === item && offer.left !== 0)
  expect(index).toBeGreaterThanOrEqual(0)
  return drawn.buy[index]
}

it.each(shared)("$from -> $to / $item: an old rendered purchase cannot buy from another shop", async (entry) => {
  const f = fixture({ shop: entry.from, item: entry.item, gold: 100000, stock: 40 })
  const click = buyClick(f.game, entry.item)
  f.publish(entry.to)
  const before = structuredClone(f.record.player)
  const market = structuredClone(f.context.state)
  click()
  if (f.transmitted.result) await f.transmitted.result
  expect(f.send).not.toHaveBeenCalled()
  expect(f.record.player).toEqual(before)
  expect(f.context.state).toEqual(market)
  expect(f.game.state.get().player).toEqual(before)
  // A freshly rendered offer still buys from the selected shop through the native transaction.
  buyClick(f.game, entry.item)()
  expect(f.send).toHaveBeenCalledWith(expect.objectContaining({ type: "command", command: expect.objectContaining({ type: "buy", shop: entry.to, item: entry.item }) }))
  if (!f.transmitted.result) throw new Error("The current native offer did not send a purchase")
  expect((await f.transmitted.result).ok).toBe(true)
  expect(f.game.state.get().player).toEqual(f.record.player)
})

for (const change of ["shop", "connection"] as const)
  it.each(shared)(`$from -> $to / $item: an old purchase reply cannot refresh after ${change} changes`, async (entry) => {
    const f = fixture({ shop: entry.from, item: entry.item, gold: 100000, stock: 40 })
    buyClick(f.game, entry.item)()
    expect(f.transmitted.result).not.toBeNull()
    const client = f.game.state.get().player
    const replacement = vi.fn()
    if (change === "shop") f.publish(entry.to)
    else f.session.socket = { send: replacement } as unknown as VoidSocket<"/map/:mapId">
    const stock = f.game.state.get().stock
    expect((await f.transmitted.result!).ok).toBe(true)
    await Promise.resolve()
    await Promise.resolve()
    if (change === "connection") expect(f.game.state.get().player).toBe(client)
    else expect(f.game.state.get().player).toEqual(f.record.player)
    expect(f.game.state.get().shop).toBe(change === "shop" ? entry.to : entry.from)
    expect(f.game.state.get().stock).toBe(stock)
    expect(replacement).not.toHaveBeenCalled()
    expect(f.send.mock.calls.filter((call) => call[0].type === "look")).toEqual([])
  })

const sales = shared.filter((entry) => shopTakes(entry.from, entry.item) && shopTakes(entry.to, entry.item))
if (!sales.length) throw new Error("No canonical shared buyback offers")
function sellClick(game: Game, onPick: (slot: number | null) => void = () => {}) {
  drawn.sell = null
  renderToStaticMarkup(createElement(GameProvider, { game, children: createElement(ShopSellPanel, { picked: 0, onPick }) }))
  const button = drawn.sell as null | { click: () => void; disabled: boolean }
  if (!button) throw new Error("The native sell panel did not render its button")
  expect(button.disabled).toBe(false)
  return button.click
}
it.each(sales)("$from -> $to / $item: a retired sell button cannot sell at another counter", async (entry) => {
  const f = fixture({ shop: entry.from, item: entry.item, gold: 0, stock: 0, bag: bagWith([entry.item, 1]) })
  const picked = vi.fn()
  const click = sellClick(f.game, picked)
  f.publish(entry.to)
  const before = structuredClone(f.record.player)
  const market = structuredClone(f.context.state)
  click()
  if (f.transmitted.result) await f.transmitted.result
  expect(f.send).not.toHaveBeenCalled()
  expect(f.record.player).toEqual(before)
  expect(f.context.state).toEqual(market)
  expect(picked).not.toHaveBeenCalled()
  sellClick(f.game, picked)()
  expect(picked).toHaveBeenCalledExactlyOnceWith(null)
  if (!f.transmitted.result) throw new Error("The current native sale did not send")
  expect((await f.transmitted.result).ok).toBe(true)
  expect(countItem(f.record.player.bag, entry.item)).toBe(0)
  expect(f.game.state.get().player).toEqual(f.record.player)
})
for (const change of ["shop", "connection"] as const)
  it.each(sales)(`$from -> $to / $item: an old sale reply cannot refresh after ${change} changes`, async (entry) => {
    const f = fixture({ shop: entry.from, item: entry.item, gold: 0, stock: 0, bag: bagWith([entry.item, 1]) })
    sellClick(f.game)()
    expect(f.transmitted.result).not.toBeNull()
    const client = f.game.state.get().player
    const replacement = vi.fn()
    if (change === "shop") f.publish(entry.to)
    else f.session.socket = { send: replacement } as unknown as VoidSocket<"/map/:mapId">
    const stock = f.game.state.get().stock
    expect((await f.transmitted.result!).ok).toBe(true)
    await Promise.resolve()
    await Promise.resolve()
    expect(countItem(f.record.player.bag, entry.item)).toBe(0)
    if (change === "connection") expect(f.game.state.get().player).toBe(client)
    else expect(f.game.state.get().player).toEqual(f.record.player)
    expect(f.game.state.get().stock).toBe(stock)
    expect(replacement).not.toHaveBeenCalled()
    expect(f.send.mock.calls.filter((call) => call[0].type === "look")).toEqual([])
  })

it("tells a screen reader why a slot the shop will not buy cannot be picked (ui.md §3.6)", () => {
  const f = fixture({ stock: 1, gold: 0, bag: bagWith(["log", 1]) })
  expect(shopTakes("fruit", "log")).toBe(false)
  const html = renderToStaticMarkup(createElement(GameProvider, { game: f.game, children: createElement(ShopSellPanel, { picked: null, onPick: vi.fn() }) }))
  expect(html).toContain(`aria-description="${REASON_TEXT.NOT_WANTED}"`)
})
