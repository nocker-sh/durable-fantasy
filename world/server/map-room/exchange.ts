// The map room's handlers for the exchange board (core/exchange.ts).
import { Player } from "#/durable-objects/player"
import { parseSymbol } from "#/world/core/parse-symbol"
import { BOARD_REACH, EXCHANGE_BOARD } from "#/world/town/boards"
import { Exchange } from "#/durable-objects/exchange"
import type { Transition } from "#/world/core/transition"
import type { Cell } from "#/world/protocol"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { near } from "#/world/server/map-room/near"

async function exLookOrExPlaceExCancelExClaim(roomCtx: Ctx, message: Message<"ex-look" | "ex-place" | "ex-cancel" | "ex-claim">) {
  const ctxSource = roomCtx,
    ctx = ctxSource.ctx,
    key = ctxSource.key,
    me = ctxSource.me
  if (!me.player || !me.owner) return
  const owner = me.owner
  const answer = (result: Transition) => ("seq" in message ? ctx.connection.send({ type: "result", seq: message.seq, result }) : undefined)
  if (key.map !== EXCHANGE_BOARD.map || !near(me, EXCHANGE_BOARD.cell as Cell, BOARD_REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  if ((message.type === "ex-look" || message.type === "ex-place") && !parseSymbol(message.symbol)) return answer({ ok: false, reason: "NOT_SELLABLE" })
  const ex = Exchange.get("world")
  const player = Player.get(owner)
  let symbol = message.type === "ex-look" || message.type === "ex-place" ? message.symbol : ""
  if (message.type === "ex-place") {
    const sideSource = message,
      side = sideSource.side,
      symbol = sideSource.symbol,
      price = sideSource.price,
      qty = sideSource.qty,
      market = sideSource.market,
      slot = sideSource.slot
    const begun = await ex.beginOrder({ owner: owner, connection: ctx.connection.id, seq: message.seq, name: me.player.name, intent: { side, symbol, price, qty, market, slot } })
    if (!begun.ok) return answer(begun)
    const result = await ex.place(owner, begun.id)
    await answer(result)
    if (!result.ok) return
  }
  if (message.type === "ex-cancel") {
    if (!(await ex.cancel(owner, message.id))) return answer({ ok: false, reason: "NOT_READY" })
    await answer({ ok: true, state: await player.read(), events: [] })
  }
  if (message.type === "ex-claim") {
    const claim = await ex.reserveInbox(owner)
    const got = await ex.deliverInbox(owner, claim.id)
    await answer(got)
  }
  if (!symbol) return
  await ctx.connection.send({ type: "exchange", symbol, view: await ex.look(symbol, owner) })
  return
}

export const HANDLERS: Handlers = {
  "ex-look": exLookOrExPlaceExCancelExClaim,
  "ex-place": exLookOrExPlaceExCancelExClaim,
  "ex-cancel": exLookOrExPlaceExCancelExClaim,
  "ex-claim": exLookOrExPlaceExCancelExClaim,
}
