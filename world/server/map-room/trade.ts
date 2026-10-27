// The map room's handlers for face-to-face trades between players (core/trade.ts).
import { TRADE_CELLS, TRADE_LOTS, checkTrade, emptyOffer } from "../../core/trade.ts"
import type { Stack } from "../../core/bag.ts"
import { Player } from "../../../durable-objects/player.ts"
import { ITEMS } from "../../core/items.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { type TradeSide, presence, setTrade, showTrade, reachable, near } from "./presence.ts"

async function tradeAsk(roomCtx: Ctx, message: Message<"trade-ask">) {
  const { ctx, me, save } = roomCtx
  const them = ctx.room.getConnection(message.target)
  const other = them && presence(them)
  if (!me.player || !me.owner || me.trade?.open || me.down || me.engaged || !them || !other?.player || other.trade?.open || other.down || other.engaged || them.id === ctx.connection.id) {
    await ctx.connection.send({ type: "trade-closed", reason: "BUSY" })
    return
  }
  if (!near(me, reachable(other).at(-1)!, TRADE_CELLS)) {
    await ctx.connection.send({ type: "trade-closed", reason: "TOO_FAR" })
    return
  }
  save({ trade: { with: them.id, open: false, offer: emptyOffer(), shown: [], locked: false, done: false } })
  await them.send({ type: "trade-asked", from: ctx.connection.id, name: me.player.name })
  return
}

async function tradeAnswer(roomCtx: Ctx, message: Message<"trade-answer">) {
  const { ctx, me, save } = roomCtx
  const them = ctx.room.getConnection(message.from)
  const other = them && presence(them)
  if (!me.player || !them || other?.trade?.with !== ctx.connection.id || other.trade.open) return
  // An invitation does not reserve either player: they may move or become busy before answering.
  const target = reachable(other).at(-1)
  const reason = !message.yes
    ? "DECLINED"
    : !me.owner || !other.owner || other.closed || me.closed || me.trade?.open || me.down || other.down || me.engaged || other.engaged
      ? "BUSY"
      : !target || !near(me, target, TRADE_CELLS)
        ? "TOO_FAR"
        : null
  if (reason) {
    setTrade(them, undefined)
    await them.send({ type: "trade-closed", reason })
    // Do not close an unrelated trade the recipient has since opened.
    if (message.yes && !me.trade?.open) await ctx.connection.send({ type: "trade-closed", reason })
    return
  }
  const side = (w: string): TradeSide => ({ with: w, open: true, offer: emptyOffer(), shown: [], locked: false, done: false })
  // standing to trade: both stop where they are
  save({ trade: side(them.id), route: [reachable(me).at(-1)!], since: Date.now() })
  setTrade(them, side(ctx.connection.id), { route: [reachable(other).at(-1)!], since: Date.now() })
  await showTrade(ctx.connection, them)
  return
}

async function tradeOffer(roomCtx: Ctx, message: Message<"trade-offer">) {
  const { ctx, me, save } = roomCtx
  const them = me.trade?.open ? ctx.room.getConnection(me.trade.with) : undefined
  if (!me.owner || !me.trade || !them || me.trade.locked || me.trade.settling) return
  const data = await Player.get(me.owner).read()
  const lots = message.lots.slice(0, TRADE_LOTS)
  const shown: Stack[] = []
  for (const l of lots) {
    const s = data.bag[l.slot]
    if (!s || l.count > s.count || ITEMS[s.item].kind === "key") return
    shown.push({ ...s, count: l.count })
  }
  if (new Set(lots.map((l) => l.slot)).size !== lots.length || message.gold > data.gold) return
  // a changed offer unsettles both sides
  save({ trade: { ...me.trade, offer: { lots, gold: message.gold }, shown, locked: false, done: false } })
  const other = presence(them)
  if (other.trade) setTrade(them, { ...other.trade, locked: false, done: false })
  await showTrade(ctx.connection, them)
  return
}

async function tradeLockOrTradeGo(roomCtx: Ctx, message: Message<"trade-lock" | "trade-go">) {
  const { ctx, me, save } = roomCtx
  const them = me.trade?.open ? ctx.room.getConnection(me.trade.with) : undefined
  const other = them && presence(them)
  if (!me.owner || !me.trade || !them || !other?.trade || !other.owner || me.owner === other.owner || other.trade.with !== ctx.connection.id || me.trade.settling || other.trade.settling) return
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
    save({ trade: undefined })
    if (presence(them).trade?.with === ctx.connection.id) setTrade(them, undefined)
    await Promise.allSettled([ctx.connection.send({ type: "trade-closed", reason: reason ?? "DONE" }), them.send({ type: "trade-closed", reason: reason ?? "DONE" })])
  }
  let mayBePending = false
  try {
    const [a, b, recordA, recordB] = await Promise.all([pa.read(), pb.read(), pa.tradeStatus(), pb.tradeStatus()])
    if (recordA?.status === "prepared" || recordB?.status === "prepared") return finish("NOT_READY")
    const why = checkTrade(a, mine.offer, b, other.trade.offer, Date.now())
    if (why) return finish(why)
    const id = crypto.randomUUID()
    const local = { id, revision: (recordA?.proposal.revision ?? 0) + 1, offer: mine.offer, outgoing: mine.shown, incoming: other.trade.shown, gold: other.trade.offer.gold }
    const remote = { id, revision: (recordB?.proposal.revision ?? 0) + 1, offer: other.trade.offer, outgoing: other.trade.shown, incoming: mine.shown, gold: mine.offer.gold }
    mayBePending = true
    // All coordinator-to-peer calls follow the same owner ordering, preventing RPC wait cycles.
    const first = me.owner < other.owner
    const coordinator = first ? pa : pb
    const started = await coordinator.beginTrade(first ? other.owner : me.owner, first ? local : remote, first ? remote : local)
    if (!started.ok) return finish(started.reason)
    // Each call is a separate durable save boundary. Alarms continue these steps if a reply is lost.
    await coordinator.advanceTrade()
    const job = await coordinator.advanceTrade()
    if (!job?.finished) return finish("PENDING")
    if (job.reason) return finish(job.reason)
    const [stateA, stateB] = await Promise.all([pa.read(), pb.read()])
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

async function tradeCancel(roomCtx: Ctx, _message: Message<"trade-cancel">) {
  const { ctx, me, save } = roomCtx
  if (me.trade?.settling) return
  const them = me.trade ? ctx.room.getConnection(me.trade.with) : undefined
  save({ trade: undefined })
  if (them && presence(them).trade?.with === ctx.connection.id) {
    setTrade(them, undefined)
    await them.send({ type: "trade-closed", reason: "CANCELLED" })
  }
  await ctx.connection.send({ type: "trade-closed", reason: "CANCELLED" })
  return
}

export const HANDLERS: Handlers = {
  "trade-ask": tradeAsk,
  "trade-answer": tradeAnswer,
  "trade-offer": tradeOffer,
  "trade-lock": tradeLockOrTradeGo,
  "trade-go": tradeLockOrTradeGo,
  "trade-cancel": tradeCancel,
}
