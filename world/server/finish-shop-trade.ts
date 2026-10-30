import { batched } from "#/world/core/batched"
import { batchReplaced } from "#/world/core/batch-replaced"
import { giveBack } from "#/world/core/give-back"
import { moveStock } from "#/world/core/move-stock"
import type { Transition } from "#/world/core/transition"
import { currentMarket } from "#/world/server/current-market"
import type { MarketContext, ShopPlayers } from "#/world/server/market-coordinator"
import { RETRY_MS } from "#/world/server/market-coordinator"

type Props = {
  context: MarketContext
  players: ShopPlayers
  owner: string
  id: number
}

export async function finishShopTrade(props: Props): Promise<Transition> {
  const job = props.context.state.jobs[props.owner]
  if (!job || job.id !== props.id) return { ok: false, reason: "NOT_READY" }
  if (job.phase === "done") return props.players(props.owner).receiveShop(props.context.id.toString(), job.quote)
  await props.context.setAlarm(Date.now() + RETRY_MS)
  const result = await props.players(props.owner).receiveShop(props.context.id.toString(), job.quote)
  currentMarket(props.context.state)
  if (job.quote.type === "sell" && result.ok) props.context.state.market = moveStock({ state: props.context.state.market, shop: job.quote.shop, item: job.quote.stack.item, delta: job.quote.count })
  if (job.quote.type === "buy" && !result.ok) {
    const q = job.quote.q ?? 1
    if (!batched(job.quote.shop, job.quote.item)) props.context.state.market = moveStock({ state: props.context.state.market, shop: job.quote.shop, item: job.quote.item, delta: job.quote.count })
    else if (!batchReplaced({ shop: job.quote.shop, item: job.quote.item, reservedAt: job.at, now: Date.now() }))
      props.context.state.market = giveBack({ state: props.context.state.market, shop: job.quote.shop, item: job.quote.item, q: q, count: job.quote.count })
  }
  props.context.state.jobs[props.owner] = { ...job, phase: "done" }
  return result
}
