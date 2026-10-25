// The map room's handlers for the exchange board (core/exchange.ts).
import { Player } from "../../../durable-objects/player.ts"
import { escrowFor, parseSymbol } from "../../core/exchange.ts"
import { BOARD_REACH, EXCHANGE_BOARD } from "../../town/boards.ts"
import { Exchange } from "../../../durable-objects/exchange.ts"
import type { Transition } from "../../core/apply.ts"
import type { Cell } from "../../protocol.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { near } from "./presence.ts"

async function exLookOrExPlaceExCancelExClaim(roomCtx: Ctx, message: Message<"ex-look" | "ex-place" | "ex-cancel" | "ex-claim">) {
  const { ctx, key, me } = roomCtx
  if (!me.player || !me.owner) return
  const owner = me.owner
  const answer = (result: Transition) => ("seq" in message ? ctx.connection.send({ type: "result", seq: message.seq, result }) : undefined)
  if (key.map !== EXCHANGE_BOARD.map || !near(me, EXCHANGE_BOARD.cell as Cell, BOARD_REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  const ex = Exchange.get("world")
  const player = Player.get(owner)
  let symbol = message.type === "ex-look" || message.type === "ex-place" ? message.symbol : ""
  if (message.type === "ex-place") {
    const sym = parseSymbol(message.symbol)
    if (!sym) return answer({ ok: false, reason: "NOT_SELLABLE" })
    const { gold, fee } = escrowFor(message.side, message.price, message.qty)
    let by: string | undefined
    if (message.side === "sell") {
      const data = await player.read()
      const slot = message.slot !== undefined ? data.bag[message.slot] : null
      if (!slot || slot.item !== sym.item || slot.q !== sym.q) return answer({ ok: false, reason: "EMPTY_SLOT" })
      const held = await player.run({ type: "escrow-sell", slot: message.slot!, qty: message.qty, fee })
      if (!held.ok) return answer(held)
      by = slot.by
      await answer(held)
    } else {
      const held = await player.run({ type: "escrow-buy", gold })
      if (!held.ok) return answer(held)
      await answer(held)
    }
    await ex.place({ owner, name: me.player.name, side: message.side, symbol: message.symbol, price: message.price, qty: message.qty, market: message.market, by })
  }
  if (message.type === "ex-cancel") {
    if (!(await ex.cancel(owner, message.id))) return answer({ ok: false, reason: "NOT_READY" })
    await answer({ ok: true, state: await player.read(), events: [] })
  }
  if (message.type === "ex-claim") {
    const inbox = await ex.takeInbox(owner)
    const got = await player.run({ type: "receive", gold: inbox.gold, items: inbox.items })
    if (!got.ok) await ex.putBack(owner, inbox)
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
