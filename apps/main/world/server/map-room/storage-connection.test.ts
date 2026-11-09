import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { handleStorage } from "#/world/server/map-room/handle-storage"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"
import { MAPS } from "#/world/maps"
import { npcCell } from "#/world/maps/npc-cell"
import { storageOpen } from "#/world/town/warehouse"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { jstMinutes } from "#/world/core/jst-minutes"
import type { Ctx } from "#/world/server/map-room/context"
import type { ServerMessage } from "#/world/protocol"
import type { Stack } from "#/world/core/bag-types"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const stacks: Stack[] = [
  { item: "log", count: 2 },
  { item: "wood-axe", count: 1, q: 2, by: "職人", dur: 3 },
]
for (const action of ["store", "retrieve"] as const)
  for (const interruption of ["handoff", "leave", "none"] as const)
    it.each(stacks)(`${action}: ${interruption} before the actual player operation cannot spend a former connection's $item`, async (stack) => {
      vi.useFakeTimers()
      const openMinute = Array.from({ length: 1440 }, (_entry, index) => index).find((minute) => storageOpen(minute))!
      expect(openMinute).toBeDefined()
      const now = Date.UTC(2026, 10, 7, 15) + openMinute * 60_000
      vi.setSystemTime(now)
      const minute = jstMinutes(now)
      expect(storageOpen(minute)).toBe(true)
      const map = Object.values(MAPS).find((entry) => npcCell(entry, STORAGE_KEEPER, minute))!
      expect(map).toBeDefined()
      const cell = npcCell(map, STORAGE_KEEPER, minute)!
      // Counter position, capacity and goods are local initial conditions; selection and persistence are real.
      const base = player()
      const initial = player({
        profileComplete: true,
        gold: 20,
        stats: { ...base.stats, str: 40 },
        ...(action === "store" ? { bag: [stack, ...base.bag.slice(1)] } : { storage: [stack, ...base.storage.slice(1)] }),
      })
      const store = durableStorage({ ...initialPlayerRecord(), player: initial, location: { world: 1, map: map.id, route: [cell], since: now, connection: "old" } }, 8)
      const actor = new Player.class(store.state, {})
      expect(await actor.ownsConnection("old")).toBe(true)
      let boundary: unknown
      // Only RPC delivery timing is replaced. Handoff, leave and the command execute on the native actor.
      vi.spyOn(Player, "get").mockReturnValue({
        run: async (...args: Parameters<typeof actor.run>) => {
          if (interruption === "handoff") expect((await actor.arrive({ world: 1, map: map.id, connection: "new" })).accepted).toBe(true)
          if (interruption === "leave") await actor.leave("old")
          boundary = structuredClone(store.saved.get("__void_durable_state"))
          return actor.run(...args)
        },
      } as unknown as ReturnType<typeof Player.get>)
      const send = vi.fn(async (_message: ServerMessage) => {})
      const context = {
        ctx: { connection: { id: "old", send } },
        key: { world: 1, map: map.id },
        map,
        me: { owner: "owner", player: mapPlayer("old", initial, [...cell]), route: [cell], since: now, said: [], engaged: null },
        save: vi.fn(),
      } as unknown as Ctx
      await handleStorage(context, { type: "storage", seq: 1, action, index: 0, count: 1, stack })
      const result = send.mock.calls[0][0]
      if (result.type !== "result") throw new Error("Storage did not reply")
      if (interruption === "none") {
        expect(result.result.ok).toBe(true)
        expect(store.saved.get("__void_durable_state")).not.toEqual(boundary)
      } else {
        expect(result.result).toEqual({ ok: false, reason: "NOT_READY" })
        expect(store.saved.get("__void_durable_state")).toEqual(boundary)
        expect(await actor.ownsConnection("old")).toBe(false)
        const restarted = new Player.class(store.state, {})
        const command = action === "store" ? ({ type: action, slot: 0, count: 1, expectedStack: stack } as const) : ({ type: action, index: 0, count: 1, expectedStack: stack } as const)
        for (const connection of ["old", ""]) {
          expect(await restarted.run(command, { connection })).toEqual({ ok: false, reason: "NOT_READY" })
          expect(store.saved.get("__void_durable_state")).toEqual(boundary)
        }
      }
    })
