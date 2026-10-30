import { withoutKeys } from "#/lib/engine/without-keys"
import { notifyClient } from "./notifications"
// The map room's handlers for commands on the player's own data: shops, gathering, making, commissions, storage, errands.
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { storageOpen } from "../../town/warehouse"
import { Player } from "../../../durable-objects/player"
import { shopOf } from "../../core/commands"
import { SHOPS } from "#/world/core/shops"
import { Market } from "../../../durable-objects/market"
import { Nature } from "../../../durable-objects/nature"
import { REACH } from "#/world/core/gather-rules"
import { nodeOf } from "#/world/core/node-of"
import { stationAt } from "../../town/stations"
import { commissionOf } from "#/world/core/commission-of"
import { sameCommissionOrders } from "#/world/core/same-commission-orders"
import type { Transition } from "#/world/core/transition"
import { TALK_CELLS } from "#/world/maps"
import { minutesToClose } from "#/world/maps/minutes-to-close"
import { npcCell } from "#/world/maps/npc-cell"
import { shopOpen } from "#/world/maps/shop-open"
import type { Cell } from "#/world/protocol"
import type { Ctx, Handlers, Message } from "./context"
import { TOWN } from "#/world/server/map-room/presence"
import { timeFor } from "#/world/server/map-room/time-for"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { near } from "#/world/server/map-room/near"

async function command(roomCtx: Ctx, message: Message<"command">) {
  const ctxSource = roomCtx,
    ctx = ctxSource.ctx,
    map = ctxSource.map,
    me = ctxSource.me,
    save = ctxSource.save
  if (!me.player || !me.owner) return
  const shop = shopOf(message.command)
  // who of the shop's keepers is at the counter now: only they get to know the player
  let onDuty: string[] | undefined
  if (shop) {
    // a shop is open while one of its keepers is at the counter (town/routines.ts)
    const present = SHOPS[shop].keepers.map((name) => ({ name, cell: npcCell(map, name, timeFor(me)) })).filter((k) => !!k.cell)
    onDuty = present.map((k) => k.name)
    const keepers = present.map((k) => k.cell as Cell)
    if (!shopOpen(shop, timeFor(me))) {
      await ctx.connection.send({ type: "result", seq: message.seq, result: { ok: false, reason: "CLOSED" } })
      return
    }
    if (!keepers.some((c) => near(me, c, TALK_CELLS + 1))) {
      await ctx.connection.send({ type: "result", seq: message.seq, result: { ok: false, reason: "TOO_FAR" } })
      return
    }
  }
  const c = message.command
  let result: Transition
  if (c.type === "buy" || c.type === "sell") {
    const market = Market.get(TOWN)
    const request = await market.beginTrade({ owner: me.owner, connection: ctx.connection.id, seq: message.seq, command: c, keepers: onDuty ?? [], toClose: minutesToClose(c.shop, timeFor(me)) })
    result = request.ok ? await market.finishTrade(me.owner, request.id) : request
  } else result = await Player.get(me.owner).run(c, onDuty ? { keepers: onDuty } : {})
  if (result.ok && (c.type === "sit" || c.type === "stand")) save({ sitting: result.state.sitting })
  await notifyClient(ctx.connection.send({ type: "result", seq: message.seq, result }))
  // others see the new name, looks or weapon
  if (result.ok) {
    const next = mapPlayer(me.player.id, result.state, me.player.at)
    if (
      me.ready === false ||
      next.name !== me.player.name ||
      next.look !== me.player.look ||
      next.neck !== me.player.neck ||
      next.neckRamp !== me.player.neckRamp ||
      next.neckStripe !== me.player.neckStripe ||
      next.weapon !== me.player.weapon
    ) {
      save({ player: next, ready: result.state.profileComplete })
      await notifyClient(ctx.room.broadcast({ type: "joined", player: next }, [ctx.connection.id]))
    }
  }
  return
}

async function gather(roomCtx: Ctx, message: Message<"gather">) {
  const ctxSource2 = roomCtx,
    ctx = ctxSource2.ctx,
    key = ctxSource2.key,
    me = ctxSource2.me
  if (!me.player || !me.owner || me.engaged) return
  const node = nodeOf(message.node)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!node || node.map !== key.map || !near(me, node.cell as Cell, REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  const nature = Nature.get(`town-${key.world}`)
  const request = await nature.beginGather({ owner: me.owner, connection: ctx.connection.id, seq: message.seq, node: node.id })
  if (!request.ok) return answer(request)
  const leftSource = await nature.finishGather(me.owner, request.id),
    left = leftSource.left,
    result = withoutKeys(leftSource, ["left"])
  await answer(result)
  if (left !== undefined) await ctx.room.broadcast({ type: "nodes", left: { [node.id]: left } })
  return
}

async function craft(roomCtx: Ctx, message: Message<"craft">) {
  const ctxSource3 = roomCtx,
    ctx = ctxSource3.ctx,
    key = ctxSource3.key,
    me = ctxSource3.me
  if (!me.player || !me.owner || me.engaged) return
  const station = stationAt(message.station)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!station || station.map !== key.map || !near(me, station.cell as Cell, REACH + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(await Player.get(me.owner).run({ type: "craft", recipe: message.recipe, station: station.id, roll: Math.random() }))
}

async function orderOrCollect(roomCtx: Ctx, message: Message<"order" | "collect">) {
  const ctxSource4 = roomCtx,
    ctx = ctxSource4.ctx,
    map = ctxSource4.map,
    me = ctxSource4.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // the craftsman has to be at their counter, and we beside them
  if (message.type === "collect") {
    const data = await Player.get(me.owner).read()
    if (!sameCommissionOrders(data.orders, message.orders)) return answer({ ok: false, reason: "ORDER_CHANGED" })
  }
  const job = commissionOf(message.type === "order" ? message.commission : (message.orders[message.index]?.commission ?? ""))
  const cell = job && npcCell(map, job.craftsman, timeFor(me))
  if (!job || !cell || !near(me, cell as Cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(message.type === "order" ? { type: "order", commission: job.id, roll: Math.random() } : { type: "collect", index: message.index, expectedOrders: message.orders }),
  )
}

async function storage(roomCtx: Ctx, message: Message<"storage">) {
  const ctxSource5 = roomCtx,
    ctx = ctxSource5.ctx,
    map = ctxSource5.map,
    me = ctxSource5.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // Hilde has to be at her counter, and we beside her
  const cell = npcCell(map, STORAGE_KEEPER, timeFor(me))
  if (!storageOpen(timeFor(me))) return answer({ ok: false, reason: "CLOSED" })
  if (!cell || !near(me, cell as Cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(
      message.action === "store"
        ? { type: "store", slot: message.index, count: message.count, expectedStack: message.stack }
        : { type: "retrieve", index: message.index, count: message.count, expectedStack: message.stack },
    ),
  )
}

async function errand(roomCtx: Ctx, message: Message<"errand">) {
  const ctxSource6 = roomCtx,
    ctx = ctxSource6.ctx,
    map = ctxSource6.map,
    me = ctxSource6.me
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // the resident has to be where they are at this hour, and we beside them
  const cell = npcCell(map, message.resident, timeFor(me))
  if (!cell || !near(me, cell as Cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(
      message.action === "take" ? { type: "errand-take", errand: message.errand, from: message.resident } : { type: "errand-hand", errand: message.errand, to: message.resident },
    ),
  )
}

export const HANDLERS: Handlers = {
  command: command,
  gather: gather,
  craft: craft,
  order: orderOrCollect,
  collect: orderOrCollect,
  storage: storage,
  errand: errand,
}
