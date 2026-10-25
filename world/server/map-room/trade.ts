// The map room's handlers for face-to-face trades between players (core/trade.ts).
import { TRADE_CELLS, TRADE_LOTS, checkTrade, emptyOffer, takenOf } from "../../core/trade.ts"
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
  if (!message.yes || me.trade?.open || me.down) {
    setTrade(them, undefined)
    await them.send({ type: "trade-closed", reason: "DECLINED" })
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
  if (!me.owner || !me.trade || !them || me.trade.locked) return
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
  if (!me.owner || !me.trade || !them || !other?.trade || !other.owner) return
  if (message.type === "trade-lock") save({ trade: { ...me.trade, locked: true } })
  else if (me.trade.locked && other.trade.locked) save({ trade: { ...me.trade, done: true } })
  const mine = presence(ctx.connection).trade!
  if (!(mine.done && other.trade.done)) {
    await showTrade(ctx.connection, them)
    return
  }
  // both pressed exchange: check both can give and take, then take each side's goods and hand them over
  const pa = Player.get(me.owner),
    pb = Player.get(other.owner)
  const [a, b] = await Promise.all([pa.read(), pb.read()])
  const why = checkTrade(a, mine.offer, b, other.trade.offer, Date.now())
  const finish = async (reason: string | null) => {
    save({ trade: undefined })
    setTrade(them, undefined)
    await ctx.connection.send({ type: "trade-closed", reason: reason ?? "DONE" })
    await them.send({ type: "trade-closed", reason: reason ?? "DONE" })
  }
  if (why) return finish(why)
  const outA = await pa.run({ type: "trade-out", offer: mine.offer })
  if (!outA.ok) return finish(outA.reason)
  const outB = await pb.run({ type: "trade-out", offer: other.trade.offer })
  if (!outB.ok) {
    await pa.run({ type: "trade-in", stacks: takenOf(outA.events), gold: mine.offer.gold })
    return finish(outB.reason)
  }
  const inB = await pb.run({ type: "trade-in", stacks: takenOf(outA.events), gold: mine.offer.gold })
  const inA = inB.ok ? await pa.run({ type: "trade-in", stacks: takenOf(outB.events), gold: other.trade.offer.gold }) : inB
  if (!inB.ok || !inA.ok) {
    // checked above, so this should not happen: give each side back what was theirs
    if (inB.ok) await pb.run({ type: "trade-out", offer: { lots: [], gold: mine.offer.gold } })
    await pa.run({ type: "trade-in", stacks: takenOf(outA.events), gold: mine.offer.gold })
    await pb.run({ type: "trade-in", stacks: takenOf(outB.events), gold: other.trade.offer.gold })
    return finish(inB.ok ? (inA as { reason: string }).reason : inB.reason)
  }
  await ctx.connection.send({ type: "result", seq: -1, result: inA })
  await them.send({ type: "result", seq: -1, result: inB })
  return finish(null)
}

async function tradeCancel(roomCtx: Ctx, _message: Message<"trade-cancel">) {
  const { ctx, me, save } = roomCtx
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
