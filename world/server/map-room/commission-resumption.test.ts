import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { COMMISSIONS } from "#/world/core/commissions"
import type { Commission } from "#/world/core/commission-types"
import { ITEMS } from "#/world/core/items/catalog"
import { addItem } from "#/world/core/add-item"
import { countItem } from "#/world/core/count-item"
import { emptyBag } from "#/world/core/empty-bag"
import { FRIEND } from "#/world/core/friendship-rules"
import { jstMinutes } from "#/world/core/jst-minutes"
import { MAPS, TALK_CELLS } from "#/world/maps/index"
import { npcCell } from "#/world/maps/npc-cell"
import { cellDistance } from "#/world/maps/cell-distance"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"
import type { Cell, MapDefinition } from "#/world/maps/types"
import type { ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { handleCommission } from "#/world/server/map-room/handle-commission"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Ctx } from "#/world/server/map-room/context"
import { durableStorage } from "#/world/test/durable-storage"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

type Meeting = { map: MapDefinition; now: number; at: Cell }
function meeting(job: Commission, from: number): Meeting {
  for (let step = 0; step < 192; step++) {
    const now = from + step * 15 * 60_000
    for (const map of Object.values(MAPS)) {
      const npc = npcCell(map, job.craftsman, jstMinutes(now))
      if (!npc) continue
      const region = getWalkableRegion(map, map.spawn[1] * map.size + map.spawn[0], new Uint8Array(map.size * map.size))
      const at = [...region].map((key): Cell => [key % map.size, Math.floor(key / map.size)]).find((cell) => cellDistance(cell, npc) <= TALK_CELLS + 1)
      if (at) return { map, now, at }
    }
  }
  throw new Error(`${job.id}: no accessible meeting in the authored schedule`)
}

function fixture(job: Commission) {
  vi.useFakeTimers()
  vi.spyOn(Math, "random").mockReturnValue(0.5)
  const ask = meeting(job, Date.parse("2026-11-01T21:00:00Z"))
  vi.setSystemTime(ask.now)
  const initial = initialPlayerRecord()
  let bag = emptyBag()
  for (const input of job.inputs) {
    const next = addItem({ bag, item: input.item, count: input.count })
    if (!next) throw new Error(`${job.id}: initial materials do not fit`)
    bag = next
  }
  // Materials, fee, strength and local room entry are starting conditions, not earned routes.
  initial.player = { ...initial.player, profileComplete: true, gold: job.fee, bag, stats: { ...initial.player.stats, str: 20 } }
  initial.location = { world: 1, map: ask.map.id, route: [[...ask.at]], since: ask.now, connection: "initial" }
  const store = durableStorage(initial, 8)
  let actor = new Player.class(store.state, {})
  let connection = "initial"
  let number = 0
  let beforeRun: (() => Promise<void> | void) | null = null
  let lastRead: unknown
  const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  const snapshot = () => structuredClone(store.saved.get("__void_durable_state"))
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    expect(owner).toBe("owner")
    return {
      read: async () => {
        const result = await actor.read()
        lastRead = snapshot()
        return result
      },
      run: async (...args: Parameters<typeof actor.run>) => {
        const delivery = beforeRun
        beforeRun = null
        await delivery?.()
        return actor.run(...args)
      },
    } as unknown as ReturnType<typeof Player.get>
  })
  return {
    ask,
    store,
    record,
    snapshot,
    get actor() {
      return actor
    },
    get lastRead() {
      return lastRead
    },
    restart: () => {
      actor = new Player.class(store.state, {})
    },
    beforeNextRun: (delivery: () => Promise<void> | void) => {
      beforeRun = delivery
    },
    async room(place: Meeting) {
      vi.setSystemTime(place.now)
      expect(await actor.travel({ connection, map: place.map.id, at: [...place.at] })).toBe(true)
      connection = `connection-${++number}`
      expect((await actor.arrive({ world: 1, map: place.map.id, connection })).accepted).toBe(true)
      const send = vi.fn(async (_message: ServerMessage) => {})
      const context = {
        ctx: { connection: { id: connection, send } },
        key: { world: 1, map: place.map.id },
        map: place.map,
        me: { owner: "owner", player: mapPlayer(connection, record().player, [...place.at]), route: [[...place.at]], since: place.now, said: [], engaged: null },
      } as unknown as Ctx
      return {
        context,
        send,
        order: () => handleCommission(context, { type: "order", seq: 1, commission: job.id }),
        collect: (orders: typeof initial.player.orders) => handleCommission(context, { type: "collect", seq: 2, index: 0, orders: [...orders] }),
        reply: () => {
          const message = send.mock.calls.at(-1)?.[0]
          if (message?.type !== "result") throw new Error("Commission did not reply")
          return message.result
        },
      }
    },
  }
}

it.each(COMMISSIONS.flatMap((job) => [false, true].map((restart) => ({ job, restart }))))(
  "$job.id / restart=$restart: native counter, storage failures and lost replies preserve payment and deliver once",
  async (scenario) => {
    const job = scenario.job
    const f = fixture(job)
    const elsewhere = Object.values(MAPS).find((map) => !npcCell(map, job.craftsman, jstMinutes(f.ask.now)))!
    const absent = await f.room({ map: elsewhere, now: f.ask.now, at: elsewhere.spawn })
    const untouched = f.snapshot()
    await absent.order()
    expect(absent.reply()).toEqual({ ok: false, reason: "TOO_FAR" })
    expect(f.snapshot()).toEqual(untouched)
    const ask = await f.room(f.ask)
    const readyToOrder = f.snapshot()
    f.store.failNextSave()
    await expect(ask.order()).rejects.toThrow("Storage unavailable")
    expect(ask.send).not.toHaveBeenCalled()
    expect(f.snapshot()).toEqual(readyToOrder)
    if (scenario.restart) f.restart()
    await ask.order()
    expect(ask.reply().ok).toBe(true)
    expect(f.record().player.gold).toBe(0)
    expect(f.record().player.bag.every((slot) => slot === null)).toBe(true)
    const orders = structuredClone(f.record().player.orders)
    expect(orders).toHaveLength(1)
    expect(orders[0]).toMatchObject({ commission: job.id, readyAt: f.ask.now + job.minutes * 60_000 })
    const paid = structuredClone(f.record().player)
    await ask.collect(orders)
    expect(ask.reply()).toEqual({ ok: false, reason: "NOT_DONE" })
    expect(f.record().player).toEqual({ ...paid, revision: paid.revision + 1 })
    expect(f.snapshot()).toEqual(f.lastRead)
    const hand = await f.room(meeting(job, orders[0].readyAt))
    // The native read before collection legitimately publishes recovery/revision.
    // Fail only the command's subsequent save and compare with the post-read envelope.
    let beforeCommit: unknown
    f.beforeNextRun(() => {
      beforeCommit = f.snapshot()
      f.store.failNextSave()
    })
    await expect(hand.collect(orders)).rejects.toThrow("Storage unavailable")
    expect(hand.send).not.toHaveBeenCalled()
    expect(beforeCommit).toBeDefined()
    expect(f.snapshot()).toEqual(beforeCommit)
    if (scenario.restart) f.restart()
    hand.send.mockRejectedValueOnce(new Error("reply lost"))
    await expect(hand.collect(orders)).rejects.toThrow("reply lost")
    expect(hand.reply().ok).toBe(true)
    const delivered = structuredClone(f.record().player)
    expect(delivered.gold).toBe(0)
    expect(delivered.orders).toEqual([])
    expect(countItem(delivered.bag, job.output.item)).toBe(job.output.count)
    expect(delivered.bag.every((slot) => slot === null || slot.item === job.output.item)).toBe(true)
    expect(delivered.friends).toEqual({ [job.craftsman]: FRIEND.commission })
    for (const slot of delivered.bag.filter((slot) => slot !== null)) {
      expect(slot.q).toBe(ITEMS[job.output.item].made ? orders[0].q : undefined)
      expect(slot.by).toBe(ITEMS[job.output.item].made ? job.craftsman : undefined)
    }
    f.restart()
    await hand.collect(orders)
    expect(hand.reply()).toEqual({ ok: false, reason: "ORDER_CHANGED" })
    expect(f.record().player).toEqual({ ...delivered, revision: delivered.revision + 1 })
    expect(f.snapshot()).toEqual(f.lastRead)
  },
)

for (const action of ["order", "collect"] as const)
  for (const interruption of ["handoff", "leave"] as const)
    it.each(COMMISSIONS)(`$id: native ${action} cannot commit after ${interruption} before RPC delivery`, async (job) => {
      const f = fixture(job)
      let room = await f.room(f.ask)
      if (action === "collect") {
        await room.order()
        expect(room.reply().ok).toBe(true)
        room = await f.room(meeting(job, f.record().player.orders[0].readyAt))
      }
      const orders = structuredClone(f.record().player.orders)
      const request = () => (action === "order" ? room.order() : room.collect(orders))
      const connection = room.context.ctx.connection.id
      expect(await f.actor.ownsConnection(connection)).toBe(true)
      let boundary: unknown
      f.beforeNextRun(async () => {
        if (interruption === "handoff") expect((await f.actor.arrive({ world: 1, map: room.context.map.id, connection: "replacement" })).accepted).toBe(true)
        else await f.actor.leave(connection)
        boundary = f.snapshot()
      })
      await request()
      expect(room.reply()).toEqual({ ok: false, reason: "NOT_READY" })
      expect(boundary).toBeDefined()
      expect(f.snapshot()).toEqual(boundary)
      expect(await f.actor.ownsConnection(connection)).toBe(false)
      f.restart()
      const beforeRetry = structuredClone(f.record().player)
      await request()
      expect(room.reply()).toEqual({ ok: false, reason: "NOT_READY" })
      if (action === "collect") {
        expect(f.record().player).toEqual({ ...beforeRetry, revision: beforeRetry.revision + 1 })
        expect(f.snapshot()).toEqual(f.lastRead)
      } else expect(f.snapshot()).toEqual(boundary)
    })
