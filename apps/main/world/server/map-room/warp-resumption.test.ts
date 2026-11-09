import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { MAPS } from "#/world/maps"
import { isOpen } from "#/world/maps/is-open"
import { leadsTowardTown } from "#/world/maps/leads-toward-town"
import { handleWarp } from "#/world/server/map-room/handle-warp"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})
const roads = Object.entries(MAPS).flatMap((entry) => entry[1].warps.map((warp, index) => ({ map: entry[0], definition: entry[1], warp, index })))

for (const road of roads)
  for (const warm of [false, true])
    it(`${road.map}:${road.index} -> ${road.warp.to.map}, warm=${warm}: location and stamina commit together across failure and restart`, async () => {
      vi.useFakeTimers()
      vi.setSystemTime(1000)
      const tire = MAPS[road.warp.to.map]?.kind === "field" ? 4 : 0
      const cost = Math.ceil(tire * (warm ? 1 : 1.5))
      // Supplies, warmth and standing at this authored exit are local starting conditions.
      const initial = {
        ...initialPlayerRecord(),
        player: player({ stamina: cost, warmUntil: warm ? 1001 : 0, hpAt: 1000, spAt: 1000 }),
        location: { world: 1, map: road.map, route: [road.warp.at], since: 1000, connection: "old" },
      }
      const store = durableStorage(initial, 8)
      let actor = new Player.class(store.state, {})
      vi.spyOn(Player, "get").mockImplementation(() => actor as unknown as ReturnType<typeof Player.get>)
      const send = vi.fn(async (_message: ServerMessage) => {})
      const me: Presence = { owner: "owner", player: mapPlayer("old", initial.player, [...road.warp.at]), route: [[...road.warp.at]], since: 1000, said: [], engaged: null }
      const context = { me, map: road.definition, ctx: { connection: { id: "old", send } } }
      const message = { type: "warp" as const, warp: road.index }
      const record = () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value
      const before = structuredClone(store.saved.get("__void_durable_state"))
      if (!isOpen(road.warp.to.map)) {
        await handleWarp(context, message)
        expect(send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "warp", reason: "ROAD_CLOSED" })
        expect(store.saved.get("__void_durable_state")).toEqual(before)
        return
      }
      if (cost > 0) {
        const shortStore = durableStorage({ ...initial, player: { ...initial.player, stamina: cost - 1 } }, 8)
        actor = new Player.class(shortStore.state, {})
        const shortBefore = structuredClone(shortStore.saved.get("__void_durable_state"))
        await handleWarp(context, message)
        if (leadsTowardTown(road.map, road.warp.to.map)) {
          // a road nearer town takes what is left rather than leaving them out there
          expect(send).toHaveBeenCalledExactlyOnceWith({ type: "warped", map: road.warp.to.map, at: road.warp.to.at })
          expect((shortStore.saved.get("__void_durable_state") as { value: PlayerRecord }).value).toEqual({
            ...initial,
            player: { ...initial.player, stamina: 0, revision: initial.player.revision + 1 },
            deliveryRevision: initial.deliveryRevision + 1,
            location: { ...initial.location, map: road.warp.to.map, route: [road.warp.to.at], connection: null },
          })
        } else {
          expect(send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "warp", reason: "EXHAUSTED" })
          expect(shortStore.saved.get("__void_durable_state")).toEqual(shortBefore)
        }
        actor = new Player.class(store.state, {})
        send.mockClear()
      }
      store.failNextSave()
      await expect(handleWarp(context, message)).rejects.toThrow("Storage unavailable")
      expect(store.saved.get("__void_durable_state")).toEqual(before)
      expect(send).not.toHaveBeenCalled()
      send.mockRejectedValueOnce(Error("Response lost"))
      await expect(handleWarp(context, message)).rejects.toThrow("Response lost")
      expect(record()).toEqual({
        ...initial,
        player: tire > 0 ? { ...initial.player, stamina: initial.player.stamina - cost, revision: initial.player.revision + 1 } : initial.player,
        deliveryRevision: initial.deliveryRevision + (tire > 0 ? 1 : 0),
        location: { ...initial.location, map: road.warp.to.map, route: [road.warp.to.at], connection: null },
      })
      expect(send).toHaveBeenCalledExactlyOnceWith({ type: "warped", map: road.warp.to.map, at: road.warp.to.at })
      const committed = structuredClone(store.saved.get("__void_durable_state"))
      await handleWarp(context, message)
      actor = new Player.class(store.state, {})
      await handleWarp(context, message)
      expect(send).toHaveBeenCalledTimes(1)
      expect(store.saved.get("__void_durable_state")).toEqual(committed)
      expect(await actor.arrive({ world: 1, map: road.warp.to.map, connection: "new" })).toEqual({ accepted: true, map: road.warp.to.map, at: road.warp.to.at })
      const arrived = structuredClone(record())
      expect(arrived).toEqual({ ...(committed as { value: PlayerRecord }).value, location: { ...(committed as { value: PlayerRecord }).value.location, connection: "new" } })
      expect(await actor.walk({ connection: "old", route: [[...road.warp.at]] })).toBe(false)
      expect(record()).toEqual(arrived)
      // No second travel is sent through the retired source room after reconnection.
      await handleWarp(context, message)
      expect(record()).toEqual(arrived)
      expect(send).toHaveBeenCalledTimes(1)
    })
