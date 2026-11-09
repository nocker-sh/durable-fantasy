import { addItem } from "#/world/core/add-item"
import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { ERRANDS } from "#/world/core/errands"
import type { Errand } from "#/world/core/errand-types"
import { DAY_TURNS } from "#/world/core/clock-rules"
import { dayOf } from "#/world/core/day-of"
import { countItem } from "#/world/core/count-item"
import { FRIEND } from "#/world/core/friendship-rules"
import { jstMinutes } from "#/world/core/jst-minutes"
import { canAskErrand } from "#/world/maps/can-ask-errand"
import { MAPS, TALK_CELLS } from "#/world/maps/index"
import { npcCell } from "#/world/maps/npc-cell"
import { cellDistance } from "#/world/maps/cell-distance"
import { getWalkableRegion } from "#/world/maps/get-walkable-region"
import { walkable } from "#/world/maps/walkable"
import type { Cell } from "#/world/maps/types"
import type { ServerMessage } from "#/world/protocol"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { handleErrand } from "#/world/server/map-room/handle-errand"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Ctx } from "#/world/server/map-room/context"
import { bagWith } from "#/world/test/bag-with"
import { durableStorage } from "#/world/test/durable-storage"
import { errandMeetings } from "#/world/test/errand-meetings"
import type { ErrandMeeting } from "#/world/test/errand-meetings"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const plans = new Map(ERRANDS.map((errand) => [errand.id, errandMeetings(errand)]))

function standing(meeting: ErrandMeeting): Cell {
  const map = meeting.map
  expect(walkable(map, map.spawn)).toBe(true)
  const npc = npcCell(map, meeting.name, jstMinutes(meeting.now))
  if (!npc) return map.spawn
  const region = getWalkableRegion(map, map.spawn[1] * map.size + map.spawn[0], new Uint8Array(map.size * map.size))
  const cell = [...region].map((key): Cell => [key % map.size, Math.floor(key / map.size)]).find((at) => cellDistance(at, npc) <= TALK_CELLS + 1)
  if (!cell) throw new Error(`${meeting.name}: no walkable conversation position from ${map.id}'s spawn`)
  return cell
}

function fixture(errand: Errand, short = false) {
  vi.useFakeTimers()
  const plan = plans.get(errand.id)!
  vi.setSystemTime(plan.ask.now)
  const initial = initialPlayerRecord()
  // a lost thing is held only while it is sought, so no spare of it is carried
  const count = errand.kind === "bring" ? errand.wants.count + (short ? -1 : errand.find ? 0 : 1) : 0
  initial.player = { ...initial.player, profileComplete: true, ...(errand.kind === "bring" ? { bag: count > 0 ? bagWith([errand.wants.item, count]) : bagWith() } : {}) }
  initial.location = { world: 1, map: plan.ask.map.id, route: [[...standing(plan.ask)]], since: plan.ask.now, connection: "initial" }
  const store = durableStorage(initial, 8)
  let actor = new Player.class(store.state, {})
  let connection = "initial"
  let number = 0
  let beforeRun: (() => Promise<void>) | null = null
  const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
  vi.spyOn(Player, "get").mockImplementation((owner: unknown) => {
    expect(owner).toBe("owner")
    return {
      run: async (...args: Parameters<typeof actor.run>) => {
        const delivery = beforeRun
        beforeRun = null
        if (delivery) await delivery()
        return actor.run(...args)
      },
    } as unknown as ReturnType<typeof Player.get>
  })
  return {
    plan,
    initial,
    store,
    record,
    get actor() {
      return actor
    },
    snapshot: () => structuredClone(store.saved.get("__void_durable_state")),
    restart: () => {
      actor = new Player.class(store.state, {})
    },
    beforeNextCommand: (delivery: () => Promise<void>) => {
      beforeRun = delivery
    },
    async room(meeting: ErrandMeeting) {
      vi.setSystemTime(meeting.now)
      const at = standing(meeting)
      // Entry positions are local conditions. Real travel/arrival preserve connection ownership;
      // this does not claim a physical walking route between the two residents.
      expect(await actor.travel({ connection, map: meeting.map.id, at: [...at] })).toBe(true)
      connection = `connection-${++number}`
      expect((await actor.arrive({ world: 1, map: meeting.map.id, connection })).accepted).toBe(true)
      const send = vi.fn(async (_message: ServerMessage) => {})
      const context = {
        ctx: { connection: { id: connection, send } },
        key: { world: 1, map: meeting.map.id },
        map: meeting.map,
        me: { owner: "owner", player: mapPlayer(connection, record().player, [...at]), route: [[...at]], since: meeting.now, said: [], engaged: null },
      } as unknown as Ctx
      return {
        context,
        send,
        request: (action: "take" | "hand") => handleErrand(context, { type: "errand", seq: 1, action, errand: errand.id, resident: meeting.name }),
        reply: () => {
          const message = send.mock.calls.at(-1)?.[0]
          if (message?.type !== "result") throw new Error("Errand did not reply")
          return message.result
        },
      }
    },
  }
}

it.each(ERRANDS.flatMap((errand) => [false, true].map((restart) => ({ errand, restart }))))(
  "$errand.id / restart=$restart: native resident admission, storage failures and lost replies cannot duplicate the reward",
  async (scenario) => {
    const errand = scenario.errand
    const f = fixture(errand)
    const elsewhere = Object.values(MAPS).find((map) => map.id !== f.plan.ask.map.id)!
    expect(npcCell(elsewhere, errand.from, jstMinutes(f.plan.ask.now))).toBeNull()
    const absent = await f.room({ ...f.plan.ask, map: elsewhere })
    const away = f.snapshot()
    await absent.request("take")
    expect(absent.reply()).toEqual({ ok: false, reason: "TOO_FAR" })
    expect(f.snapshot()).toEqual(away)
    const ask = await f.room(f.plan.ask)
    const untouched = f.snapshot()
    await ask.request("hand")
    expect(ask.reply()).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(f.snapshot()).toEqual(untouched)
    ask.send.mockClear()
    f.store.failNextSave()
    await expect(ask.request("take")).rejects.toThrow("Storage unavailable")
    expect(ask.send).not.toHaveBeenCalled()
    expect(f.snapshot()).toEqual(untouched)
    if (scenario.restart) f.restart()
    await ask.request("take")
    expect(ask.reply().ok).toBe(true)
    expect(f.record().player.errands).toEqual([{ id: errand.id, day: dayOf(f.plan.ask.now), done: false }])
    expect(f.record().player.gold).toBe(f.initial.player.gold)
    // a letter to deliver comes into the bag with the errand
    expect(f.record().player.bag).toEqual(errand.kind === "deliver" && errand.carry ? addItem({ bag: f.initial.player.bag, item: errand.carry, count: 1 }) : f.initial.player.bag)
    expect(f.record().player.friends).toEqual({})
    const accepted = f.snapshot()
    await ask.request("take")
    expect(ask.reply()).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(f.snapshot()).toEqual(accepted)
    const hand = await f.room(f.plan.hand)
    const ready = f.snapshot()
    f.store.failNextSave()
    await expect(hand.request("hand")).rejects.toThrow("Storage unavailable")
    expect(hand.send).not.toHaveBeenCalled()
    expect(f.snapshot()).toEqual(ready)
    if (scenario.restart) f.restart()
    hand.send.mockRejectedValueOnce(new Error("reply lost"))
    await expect(hand.request("hand")).rejects.toThrow("reply lost")
    expect(hand.reply().ok).toBe(true)
    const done = f.record().player
    expect(done.gold).toBe(f.initial.player.gold + errand.gold)
    expect(done.errands).toEqual([{ id: errand.id, day: dayOf(f.plan.hand.now), done: true }])
    expect(done.friends).toEqual(errand.kind === "bring" ? { [errand.from]: FRIEND.bring } : { [errand.from]: FRIEND.deliver, [errand.to]: FRIEND.received })
    if (errand.kind === "bring") expect(done.bag).toEqual(errand.find ? bagWith() : bagWith([errand.wants.item, 1]))
    else expect(done.bag).toEqual(f.initial.player.bag)
    const paid = f.snapshot()
    f.restart()
    await hand.request("hand")
    expect(hand.reply()).toEqual({ ok: false, reason: "NO_ERRAND" })
    expect(f.snapshot()).toEqual(paid)
  },
)

// the first minute of each planned ask's errand day at which the asker is at their place but no longer asks it
const unasked = ERRANDS.flatMap((errand) => {
  const ask = plans.get(errand.id)!.ask
  const start = ask.now - ((jstMinutes(ask.now) - DAY_TURNS + 1440) % 1440) * 60_000
  for (let since = 0; since < 1440; since++) {
    const now = start + since * 60_000
    const map = Object.values(MAPS).find((candidate) => npcCell(candidate, errand.from, jstMinutes(now)))
    if (map && !canAskErrand(errand, jstMinutes(now))) return [{ errand, meeting: { map, now, name: errand.from } }]
  }
  return []
})

it("finds hours the asker is out but no longer asks, for a muffler Wilhelm cannot get tonight and parcels for someone beside the asker", () => {
  expect(unasked.map((entry) => `${entry.errand.id} ${jstMinutes(entry.meeting.now)}`)).toEqual(
    expect.arrayContaining(["magdalena-muffler 1230", "jakob-fish 360", "matthias-wool 1020", "theo-parcel 930"]),
  )
})

it.each(unasked)("$errand.id: the room refuses to take it at an hour the asker no longer asks it, and saves nothing", async (scenario) => {
  const f = fixture(scenario.errand)
  const late = await f.room(scenario.meeting)
  const before = f.snapshot()
  await late.request("take")
  expect(late.reply()).toEqual({ ok: false, reason: "NO_ERRAND" })
  expect(f.snapshot()).toEqual(before)
})

it.each(ERRANDS.filter((errand) => errand.kind === "bring"))("$id: one missing material cannot be handed over, including after a restart", async (errand) => {
  if (errand.kind !== "bring") throw new Error("Missing-material cases require a bring errand")
  const f = fixture(errand, true)
  const ask = await f.room(f.plan.ask)
  await ask.request("take")
  expect(ask.reply().ok).toBe(true)
  const hand = await f.room(f.plan.hand)
  const ready = f.snapshot()
  expect(countItem(f.record().player.bag, errand.wants.item)).toBe(errand.wants.count - 1)
  for (let attempt = 0; attempt < 2; attempt++) {
    await hand.request("hand")
    expect(hand.reply()).toEqual({ ok: false, reason: "NOT_ENOUGH" })
    expect(f.snapshot()).toEqual(ready)
    f.restart()
  }
})

for (const action of ["take", "hand"] as const)
  for (const interruption of ["handoff", "leave"] as const)
    it.each(ERRANDS)(`$id: native ${action} cannot commit after ${interruption} before RPC delivery`, async (errand) => {
      const f = fixture(errand)
      let room = await f.room(f.plan.ask)
      if (action === "hand") {
        await room.request("take")
        expect(room.reply().ok).toBe(true)
        room = await f.room(f.plan.hand)
      }
      const connection = room.context.ctx.connection.id
      expect(await f.actor.ownsConnection(connection)).toBe(true)
      let boundary: unknown
      f.beforeNextCommand(async () => {
        if (interruption === "handoff") expect((await f.actor.arrive({ world: 1, map: room.context.map.id, connection: "replacement" })).accepted).toBe(true)
        else await f.actor.leave(connection)
        boundary = f.snapshot()
      })
      await room.request(action)
      expect(room.reply()).toEqual({ ok: false, reason: "NOT_READY" })
      expect(f.snapshot()).toEqual(boundary)
      expect(await f.actor.ownsConnection(connection)).toBe(false)
      f.restart()
      await room.request(action)
      expect(room.reply()).toEqual({ ok: false, reason: "NOT_READY" })
      expect(f.snapshot()).toEqual(boundary)
    })
