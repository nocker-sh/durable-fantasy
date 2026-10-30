import type { ShopDefinition } from "#/world/core/shop-types"
import { sameStack } from "#/world/core/same-stack"
import { commandSchema } from "#/world/core/commands"
import { ITEMS } from "#/world/core/items/catalog"
import { sellable } from "#/world/core/items/sellable"
import { batched } from "#/world/core/batched"
import { priceNow } from "#/world/core/price-now"
import { take } from "#/world/core/take"
import { buyingPrice } from "#/world/core/buying-price"
import { moveStock } from "#/world/core/move-stock"
import { stockPrice } from "#/world/core/stock-price"
import { wantsMore } from "#/world/core/wants-more"
import { SHOPS } from "#/world/core/shops"
import { sameShopCommand } from "#/world/core/same-shop-command"
import type { ShopCommand, ShopQuote } from "#/world/core/shop-receipt-types"
import type { Transition } from "#/world/core/transition"
import { currentMarket } from "#/world/server/current-market"
import { shopMaker } from "#/world/server/shop-maker"
import type { MarketContext, ShopPlayers } from "#/world/server/market-coordinator"

type Props = {
  context: MarketContext
  players: ShopPlayers
  owner: string
  connection: string
  seq: number
  command: ShopCommand
  keepers: string[]
  toClose: number | null
}

export async function beginShopTrade(props: Props): Promise<{ ok: true; id: number } | Extract<Transition, { ok: false }>> {
  if (!props.owner || !props.connection || !Number.isSafeInteger(props.seq) || props.seq < 0 || !commandSchema.safeParse(props.command).success) return { ok: false, reason: "NOT_READY" }
  const previous = props.context.state.jobs[props.owner]
  if (previous?.connection === props.connection && props.seq <= previous.seq)
    return props.seq === previous.seq && sameShopCommand(props.command, previous.command) ? { ok: true, id: previous.id } : { ok: false, reason: "NOT_READY" }
  if (previous?.phase === "pending" || !(await props.players(props.owner).ownsConnection(props.connection))) return { ok: false, reason: "NOT_READY" }
  const id = props.context.state.serial + 1
  if (!Number.isSafeInteger(id)) throw new Error("Shop trade IDs exhausted")
  const market = currentMarket(props.context.state)
  const quote: { value: ShopQuote | null } = { value: null }
  if (props.command.type === "buy") {
    const shop: ShopDefinition = SHOPS[props.command.shop]
    if (!shop.stock.includes(props.command.item)) return { ok: false, reason: "NOT_SOLD_HERE" }
    const by = ITEMS[props.command.item].made ? shopMaker(props.command.shop, props.command.item) : undefined
    const unitPrice = batched(props.command.shop, props.command.item)
      ? priceNow({ item: props.command.item, q: props.command.q ?? 1, by: by, toClose: props.toClose, isBatched: true })
      : stockPrice({ state: market, shop: props.command.shop, item: props.command.item, q: props.command.q ?? 1, by: by })
    const taken = take({ state: market, shop: props.command.shop, item: props.command.item, q: props.command.q ?? 1, count: props.command.count, price: unitPrice, expected: props.command.price })
    if (!taken.ok) return taken
    props.context.state.market = taken.state
    quote.value = { ...props.command, id, unitPrice, keepers: [...props.keepers] }
  } else {
    const stack = (await props.players(props.owner).read()).bag[props.command.slot]
    if (props.command.expectedStack && !sameStack(stack, props.command.expectedStack)) return { ok: false, reason: "ITEM_CHANGED" }
    if (!stack) return { ok: false, reason: "EMPTY_SLOT" }
    if (!sellable(stack.item)) return { ok: false, reason: "NOT_SELLABLE" }
    if (stack.count < props.command.count) return { ok: false, reason: "NOT_ENOUGH" }
    // Capacity and quotes include reserved sales, but unpaid goods are never offered to buyers.
    const reserved = { market }
    for (const job of Object.values(props.context.state.jobs)) {
      if (job.phase === "pending" && job.quote.type === "sell" && job.quote.shop === props.command.shop && job.quote.stack.item === stack.item)
        reserved.market = moveStock({ state: reserved.market, shop: props.command.shop, item: stack.item, delta: job.quote.count })
    }
    if (!wantsMore({ state: reserved.market, shop: props.command.shop, item: stack.item, count: props.command.count })) return { ok: false, reason: "NOT_WANTED" }
    const shop: ShopDefinition = SHOPS[props.command.shop]
    const rate = shop.rates?.[ITEMS[stack.item].kind] ?? 1
    quote.value = {
      ...props.command,
      id,
      unitPrice: buyingPrice({ state: reserved.market, shop: props.command.shop, item: stack.item, rate: rate }),
      keepers: [...props.keepers],
      stack: structuredClone(stack),
    }
  }
  props.context.state.serial = id
  props.context.state.jobs[props.owner] = { id, connection: props.connection, seq: props.seq, command: structuredClone(props.command), quote: quote.value, at: market.at, phase: "pending" }
  await props.context.setAlarm(Date.now() + 100)
  return { ok: true, id }
}
