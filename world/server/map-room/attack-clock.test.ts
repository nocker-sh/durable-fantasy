import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { SPAWNS } from "#/world/core/monsters"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { monsterAt } from "#/world/core/monster-at"
import { MAPS } from "#/world/maps"
import { walkable } from "#/world/maps/walkable"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { standUp } from "#/world/server/map-room/stand-up"
import { handleAttack } from "#/world/server/map-room/handle-attack"
import type { AttackRequestContext } from "#/world/server/map-room/attack-types"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it.each([0, 1000].flatMap((epoch) => ([undefined, "lunge"] as const).flatMap((art) => [false, true].map((reconnected) => ({ epoch, art, reconnected })))))(
  "does not reserve or pay twice for $art from clock $epoch (reconnected: $reconnected)",
  async (scenario) => {
    const art = scenario.art
    vi.useFakeTimers()
    vi.setSystemTime(scenario.epoch)
    vi.spyOn(Math, "random").mockReturnValue(0.99999)
    const base = player()
    const hunter = player({ stats: { ...base.stats, str: 8 }, equipment: { ...base.equipment, weapon: "short-sword" }, sp: 20 })
    const playerStore = durableStorage({ player: hunter, credential: null, location: null }, 0)
    const wildStore = durableStorage({ wild: emptyWild() }, 0)
    const recipient = new Player.class(playerStore.state, {})
    const source = new Wild.class(wildStore.state, {})
    vi.spyOn(Player, "get").mockReturnValue(recipient as unknown as ReturnType<typeof Player.get>)
    vi.spyOn(Wild, "get").mockReturnValue(source as unknown as ReturnType<typeof Wild.get>)
    const reserve = vi.spyOn(source, "beginStrike")
    const spawn = SPAWNS.find((entry) => entry.kind === "slime")!
    const map = MAPS[spawn.map]
    const at = monsterAt(spawn, scenario.epoch, (x, z) => walkable(map, [Math.floor(x * 2), Math.floor(z * 2)]))
    const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
    // 身体・装備・開始位置は局所条件にする。地図・敵・命中・支払・保存・配送は実処理。
    const me: AttackRequestContext["me"] = { owner: "hunter", player: mapPlayer("connection", hunter, cell), route: [cell], since: scenario.epoch, said: [], engaged: null }
    const room: AttackRequestContext = {
      me,
      map,
      key: { map: spawn.map },
      save: (patch) => {
        Object.assign(me, patch)
      },
      standUp: () => standUp(room),
      ctx: { params: { mapId: spawn.map }, connection: { send: async () => {} }, room: { broadcast: async () => {}, getConnections: () => [] } },
    }
    const message = { type: "attack" as const, monster: spawn.id, ...(art ? { art } : {}) }
    await handleAttack(room, message)
    expect(me.struck).toBe(scenario.epoch)
    expect(reserve).toHaveBeenCalledOnce()
    const paid = await recipient.read()
    const savedWild = structuredClone(wildStore.saved.get("__void_durable_state"))
    const nextPresence = { ...me, struck: undefined, player: { ...me.player!, id: "reconnected" } }
    const nextRoom: AttackRequestContext = {
      ...room,
      me: nextPresence,
      save: (patch) => {
        Object.assign(nextPresence, patch)
      },
      standUp: () => standUp(nextRoom),
    }
    await handleAttack(scenario.reconnected ? nextRoom : room, message)
    expect(reserve).toHaveBeenCalledOnce()
    const after = await recipient.read()
    // readCombat と read はそれぞれ配信版を進める。資産・身体・待ち時間は全て保持する。
    expect(after.revision).toBe(paid.revision + 2)
    expect({ ...after, revision: paid.revision }).toEqual(paid)
    expect(wildStore.saved.get("__void_durable_state")).toEqual(savedWild)
  },
)
