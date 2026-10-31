import { handleTradeCancel } from "#/world/server/map-room/handle-trade-cancel"
import { handleTradeAsk } from "#/world/server/map-room/handle-trade-ask"
import { sameTrade } from "#/world/server/map-room/same-trade"
import { handleTradeAnswer } from "#/world/server/map-room/handle-trade-answer"
// The map room's handlers for face-to-face trades between players (core/check-trade.ts).
import { checkTrade } from "#/world/core/check-trade"
import { Player } from "#/durable-objects/player"
import { handleTradeOffer } from "#/world/server/map-room/handle-trade-offer"
import type { Ctx, Handlers, Message } from "#/world/server/map-room/context"
import { presence } from "#/world/server/map-room/presence"
import { setTrade } from "#/world/server/map-room/set-trade"
import { showTrade } from "#/world/server/map-room/show-trade"

async function tradeLockOrTradeGo(roomCtx: Ctx, message: Message<"trade-lock" | "trade-go">) {
  const ctxSource4 = roomCtx,
    ctx = ctxSource4.ctx,
    save = ctxSource4.save
  const me = presence(ctx.connection)
  if (!sameTrade(me.trade, roomCtx.me.trade)) return
  const them = me.trade?.open ? ctx.room.getConnection(me.trade.with) : undefined
  const other = them && presence(them)
  if (
    !me.owner ||
    !me.trade ||
    !them ||
    !other?.trade ||
    !other.owner ||
    me.owner === other.owner ||
    other.trade.with !== ctx.connection.id ||
    other.trade.session !== me.trade.session ||
    me.trade.settling ||
    other.trade.settling
  )
    return
  if (message.type === "trade-lock") save({ trade: { ...me.trade, locked: true } })
  else if (me.trade.locked && other.trade.locked) save({ trade: { ...me.trade, done: true } })
  const mine = presence(ctx.connection).trade!
  if (!(mine.done && other.trade.done)) {
    await showTrade(ctx.connection, them)
    return
  }
  // Reserve the handshake before awaiting RPCs, so repeated confirmations cannot start two jobs.
  save({ trade: { ...mine, settling: true } })
  setTrade(them, { ...other.trade, settling: true })
  const pa = Player.get(me.owner),
    pb = Player.get(other.owner)
  const finish = async (reason: string | null) => {
    const notify: Promise<void>[] = []
    if (sameTrade(presence(ctx.connection).trade, mine)) {
      save({ trade: undefined })
      notify.push(ctx.connection.send({ type: "trade-closed", reason: reason ?? "DONE" }))
    }
    if (sameTrade(presence(them).trade, other.trade)) {
      setTrade(them, undefined)
      notify.push(them.send({ type: "trade-closed", reason: reason ?? "DONE" }))
    }
    await Promise.allSettled(notify)
  }
  let mayBePending = false
  try {
    const aState = await Promise.all([pa.read(), pb.read(), pa.tradeStatus(), pb.tradeStatus()]),
      a = aState[0],
      b = aState[1],
      recordA = aState[2],
      recordB = aState[3]
    if (recordA?.status === "prepared" || recordB?.status === "prepared") return finish("NOT_READY")
    const why = checkTrade({ playerA: a, offerA: mine.offer, playerB: b, offerB: other.trade.offer, now: Date.now() })
    if (why) return finish(why)
    const id = crypto.randomUUID()
    const local = { id, revision: (recordA?.proposal.revision ?? 0) + 1, offer: mine.offer, outgoing: mine.shown, incoming: other.trade.shown, gold: other.trade.offer.gold }
    const remote = { id, revision: (recordB?.proposal.revision ?? 0) + 1, offer: other.trade.offer, outgoing: other.trade.shown, incoming: mine.shown, gold: mine.offer.gold }
    mayBePending = true
    // All coordinator-to-peer calls follow the same owner ordering, preventing RPC wait cycles.
    const first = me.owner < other.owner
    const coordinator = first ? pa : pb
    const started = await coordinator.beginTrade({ peer: first ? other.owner : me.owner, local: first ? local : remote, remote: first ? remote : local })
    if (!started.ok) return finish(started.reason)
    // Each call is a separate durable save boundary. Alarms continue these steps if a reply is lost.
    await coordinator.advanceTrade()
    const job = await coordinator.advanceTrade()
    if (!job?.finished) return finish("PENDING")
    if (job.reason) return finish(job.reason)
    const stateAState = await Promise.all([pa.read(), pb.read()]),
      stateA = stateAState[0],
      stateB = stateAState[1]
    await Promise.allSettled([
      ctx.connection.send({ type: "result", seq: -1, result: { ok: true, state: stateA, events: [] } }),
      them.send({ type: "result", seq: -1, result: { ok: true, state: stateB, events: [] } }),
    ])
    return finish(null)
  } catch {
    // The reply may be lost after saving. Never compensate by inventing a reverse transfer:
    // the saved job and participant reservations decide what the recovery alarm must do.
    return finish(mayBePending ? "PENDING" : "NOT_READY")
  }
}

export const HANDLERS: Handlers = {
  "trade-ask": handleTradeAsk,
  "trade-answer": handleTradeAnswer,
  "trade-offer": handleTradeOffer,
  "trade-lock": tradeLockOrTradeGo,
  "trade-go": tradeLockOrTradeGo,
  "trade-cancel": handleTradeCancel,
}
