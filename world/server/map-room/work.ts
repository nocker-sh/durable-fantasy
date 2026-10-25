// The map room's handlers for commands on the player's own data: shops, gathering, making, commissions, storage, errands.
import { STORAGE_KEEPER } from "../../core/storage.ts"
import { storageOpen } from "../../town/warehouse.ts"
import { Player } from "../../../durable-objects/player.ts"
import { shopOf } from "../../core/commands.ts"
import { SHOPS } from "../../core/shops.ts"
import { sellable, type ItemId } from "../../core/items.ts"
import { Market } from "../../../durable-objects/market.ts"
import { Nature } from "../../../durable-objects/nature.ts"
import { REACH, nodeOf } from "../../core/gather.ts"
import { stationAt } from "../../town/stations.ts"
import { commissionOf } from "../../core/commissions.ts"
import type { Transition } from "../../core/apply.ts"
import { TALK_CELLS, minutesToClose, npcCell, shopOpen } from "../../maps/index.ts"
import type { Cell } from "../../protocol.ts"
import type { Ctx, Handlers, Message } from "./context.ts"
import { TOWN, timeFor, mapPlayer, near } from "./presence.ts"

async function command(roomCtx: Ctx, message: Message<"command">) {
  const { ctx, map, me, save } = roomCtx
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
  // a purchase comes off the shared shelf first, at today's price (market Durable Object)
  const c = message.command
  let price: number | undefined
  if (c.type === "buy") {
    const taken = await Market.get(TOWN).take(c.shop, c.item, c.q ?? 1, c.count, c.price, minutesToClose(c.shop, timeFor(me)))
    if (!taken.ok) {
      await ctx.connection.send({ type: "result", seq: message.seq, result: { ok: false, reason: taken.reason } })
      return
    }
    price = taken.price
  }
  // a sale to the shop: its price now by its stock, and the stock goes up
  let sold: { item: ItemId; count: number } | null = null
  if (c.type === "sell") {
    const slot = (await Player.get(me.owner).read()).bag[c.slot]
    if (slot && sellable(slot.item)) {
      price = await Market.get(TOWN).sell(c.shop, slot.item, c.count)
      if (price === 0) {
        await ctx.connection.send({ type: "result", seq: message.seq, result: { ok: false, reason: "NOT_WANTED" } })
        return
      }
      sold = { item: slot.item, count: c.count }
    }
  }
  const result = await Player.get(me.owner).run(c, { ...(price !== undefined ? { price } : {}), ...(onDuty ? { keepers: onDuty } : {}) })
  if (!result.ok && c.type === "buy") await Market.get(TOWN).giveBack(c.shop, c.item, c.q ?? 1, c.count)
  if (!result.ok && sold && c.type === "sell") await Market.get(TOWN).unsell(c.shop, sold.item, sold.count)
  await ctx.connection.send({ type: "result", seq: message.seq, result })
  if (result.ok && (c.type === "sit" || c.type === "stand")) save({ sitting: c.type === "sit" })
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
      await ctx.room.broadcast({ type: "joined", player: next }, [ctx.connection.id])
    }
  }
  return
}

async function gather(roomCtx: Ctx, message: Message<"gather">) {
  const { ctx, key, me } = roomCtx
  if (!me.player || !me.owner || me.engaged) return
  const node = nodeOf(message.node)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!node || node.map !== key.map || !near(me, node.cell as Cell, REACH)) return answer({ ok: false, reason: "TOO_FAR" })
  // take a go from the town's spot first, then give it to the player; put it back if they cannot take it
  const nature = Nature.get(`town-${key.world}`)
  const left = await nature.take(node.id)
  if (left < 0) return answer({ ok: false, reason: "SPENT" })
  const result = await Player.get(me.owner).run({ type: "gather", node: node.id, roll: Math.random() })
  const now = result.ok ? left : await nature.give(node.id)
  await answer(result)
  await ctx.room.broadcast({ type: "nodes", left: { [node.id]: now } })
  return
}

async function craft(roomCtx: Ctx, message: Message<"craft">) {
  const { ctx, key, me } = roomCtx
  if (!me.player || !me.owner || me.engaged) return
  const station = stationAt(message.station)
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  if (!station || station.map !== key.map || !near(me, station.cell as Cell, REACH + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(await Player.get(me.owner).run({ type: "craft", recipe: message.recipe, station: station.id, roll: Math.random() }))
}

async function orderOrCollect(roomCtx: Ctx, message: Message<"order" | "collect">) {
  const { ctx, map, me } = roomCtx
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // the craftsman has to be at their counter, and we beside them
  const data = await Player.get(me.owner).read()
  const job = commissionOf(message.type === "order" ? message.commission : (data.orders[message.index]?.commission ?? ""))
  const cell = job && npcCell(map, job.craftsman, timeFor(me))
  if (!job || !cell || !near(me, cell as Cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(await Player.get(me.owner).run(message.type === "order" ? { type: "order", commission: job.id, roll: Math.random() } : { type: "collect", index: message.index }))
}

async function storage(roomCtx: Ctx, message: Message<"storage">) {
  const { ctx, map, me } = roomCtx
  if (!me.player || !me.owner) return
  const answer = (result: Transition) => ctx.connection.send({ type: "result", seq: message.seq, result })
  // Hilde has to be at her counter, and we beside her
  const cell = npcCell(map, STORAGE_KEEPER, timeFor(me))
  if (!storageOpen(timeFor(me))) return answer({ ok: false, reason: "CLOSED" })
  if (!cell || !near(me, cell as Cell, TALK_CELLS + 1)) return answer({ ok: false, reason: "TOO_FAR" })
  return answer(
    await Player.get(me.owner).run(message.action === "store" ? { type: "store", slot: message.index, count: message.count } : { type: "retrieve", index: message.index, count: message.count }),
  )
}

async function errand(roomCtx: Ctx, message: Message<"errand">) {
  const { ctx, map, me } = roomCtx
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
