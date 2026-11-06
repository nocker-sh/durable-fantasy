import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import type { VoidSocket } from "void/ws"
import { GameProvider } from "#/components/game/game-provider"
import { ShopWindow } from "#/components/hud/shop-window"
import type { GameSession } from "#/world/client/game-session"
import { countItem } from "#/world/core/count-item"
import { emptyMarket } from "#/world/core/empty-market"
import { ITEMS } from "#/world/core/items/catalog"
import { moveStock } from "#/world/core/move-stock"
import { seedStock } from "#/world/core/seed-stock"
import type { ShopCommand } from "#/world/core/shop-receipt-types"
import { SHOPS } from "#/world/core/shops"
import { stockOf } from "#/world/core/stock-of"
import { stockPrice } from "#/world/core/stock-price"
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
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

type Props = { gold: number; stock: number }

function fixture(props: Props) {
  vi.useFakeTimers()
  const now = Date.UTC(2026, 10, 7, 12)
  vi.setSystemTime(now)
  const record = { ...initialPlayerRecord(), player: player({ gold: props.gold, profileComplete: true }) }
  const initial = { ...emptyMarket(now), since: now, stock: seedStock(SHOPS) }
  // A shop accepts sales up to three times target stock, so both a full shelf and a nearly empty one are supported states.
  const market = moveStock({ state: initial, shop: "fruit", item: "apple", delta: props.stock - stockOf(initial, "fruit", "apple") })
  const context: MarketContext = { state: { market, serial: 0, jobs: {} }, id: { toString: () => "market" }, setAlarm: async () => {} }
  const players: ShopPlayers = () => ({
    read: async () => record.player,
    ownsConnection: async (connection) => connection === "connection",
    receiveShop: async (source, quote) => receivePlayerShop({ record, source, quote, now }),
  })
  const offers = shopOffers(context.state, "fruit", null)
  const buying = shopBuying(context.state, "fruit", [])
  const offer = offers.find((entry) => entry.item === "apple")!
  expect(offer.price).toBe(stockPrice({ state: context.state.market, shop: "fruit", item: "apple", q: 1, by: undefined }))
  const game = new Game()
  game.state.set((state) => ({ ...state, player: record.player, shop: "fruit", stock: { shop: "fruit", offers, ...buying }, online: "online" }))
  const session = (game as unknown as { session: GameSession }).session
  session.others.welcome("connection", [])
  const transmitted: { result: Promise<Transition> | null } = { result: null }
  async function purchase(command: ShopCommand, seq = 1): Promise<Transition> {
    const request = await beginShopTrade({ context, players, owner: "owner", connection: "connection", seq, command, keepers: ["オットー"], toClose: null })
    return request.ok ? finishShopTrade({ context, players, owner: "owner", id: request.id }) : request
  }
  const send = vi.fn((message: ClientMessage) => {
    if (message.type !== "command" || message.command.type !== "buy") return
    transmitted.result = purchase(message.command, message.seq).then((result) => {
      session.waiting.get(message.seq)?.(result)
      return result
    })
  })
  session.socket = { send } as unknown as VoidSocket<"/map/:mapId">
  return { game, record, context, offer, send, transmitted, purchase }
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

it("keeps market price verification authoritative when a client quote is cheaper than the shelf", async () => {
  const f = fixture({ stock: 1, gold: 4 })
  const before = structuredClone(f.record.player)
  expect(await f.purchase({ type: "buy", shop: "fruit", item: "apple", count: 1, price: 1 })).toEqual({ ok: false, reason: "PRICE_CHANGED" })
  expect(f.record.player).toEqual(before)
  expect(stockOf(f.context.state.market, "fruit", "apple")).toBe(1)
})
