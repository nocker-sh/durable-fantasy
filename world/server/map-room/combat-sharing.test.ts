import { afterEach, expect, it, vi } from "vitest"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters"
import { monsterAt } from "#/world/core/monster-at"
import { hit } from "#/world/core/wild/hit"
import { emptyWild } from "#/world/core/wild/empty-wild"
import { Player } from "#/durable-objects/player"
import { Wild } from "#/durable-objects/wild"
import { Party } from "#/durable-objects/party"
import { player } from "#/world/test/player"
import { durableStorage } from "#/world/test/durable-storage"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { AttackRequestContext } from "#/world/server/map-room/attack-types"
import { handleAttack } from "#/world/server/map-room/handle-attack"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
vi.mock("#/world/maps/walkable", () => ({ walkable: () => true }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it.each(["fallen", "left", "removed", "closed", "duplicate", "eligible", "killer-left", "disconnected-recipient", "failed-broadcast", "disconnected-killer", "failed-share-save"])(
  "saves and delivers a party kill using authoritative eligibility: %s",
  async (scenario) => {
    vi.useFakeTimers()
    vi.setSystemTime(1000)
    vi.spyOn(Math, "random").mockReturnValue(0)
    vi.spyOn(console, "warn").mockImplementation(() => {})
    const spawn = SPAWNS.find((s) => s.kind === "slime")!
    const kind = MONSTER_KINDS[spawn.kind]
    const hunter = player({ party: scenario === "killer-left" ? null : "party" })
    const friend = player({ hp: scenario === "fallen" ? 0 : 10, party: scenario === "left" ? null : "party" })
    const hunterStore = durableStorage({ ...initialPlayerRecord(), player: hunter }, 6)
    const friendStore = durableStorage({ ...initialPlayerRecord(), player: friend }, 6)
    const hunterActor = new Player.class(hunterStore.state, {})
    const friendActor = new Player.class(friendStore.state, {})
    let failShare = scenario === "failed-share-save"
    const receiveFriend = vi.fn(async (...args: Parameters<typeof friendActor.receiveCombat>) => {
      if (failShare) {
        failShare = false
        friendStore.failNextSave()
      }
      return friendActor.receiveCombat(...args)
    })
    vi.spyOn(Player, "get").mockImplementation(
      (id: unknown) => (id === "hunter" ? hunterActor : { read: () => friendActor.read(), receiveCombat: receiveFriend }) as unknown as ReturnType<typeof Player.get>,
    )
    vi.spyOn(Party, "get").mockReturnValue({ view: async () => ({ mode: "even", members: [{ owner: "hunter" }, ...(scenario === "removed" ? [] : [{ owner: "friend" }])] }) } as unknown as ReturnType<
      typeof Party.get
    >)
    const sourceStore = durableStorage({ wild: hit({ state: emptyWild(), id: spawn.id, damage: kind.hp - 1, now: 1000, player: "hunter" }).state }, 0)
    let source = new Wild.class(sourceStore.state, {})
    vi.spyOn(Wild, "get").mockImplementation(() => source as unknown as ReturnType<typeof Wild.get>)
    const at = monsterAt(spawn, Date.now(), () => true)
    const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
    const connection = { state: { owner: "friend", party: "party", down: false, closed: scenario === "closed" }, send: vi.fn(async () => {}) }
    if (scenario === "disconnected-recipient") connection.send.mockRejectedValue(Error("Socket closed"))
    const duplicate = { ...connection, send: vi.fn(async () => {}) }
    const send = vi.fn(async () => {})
    const broadcast = vi.fn(async () => {})
    if (scenario === "disconnected-killer") send.mockRejectedValue(Error("Socket closed"))
    if (scenario === "failed-broadcast") broadcast.mockRejectedValue(Error("Socket closed"))
    const context: AttackRequestContext = {
      ctx: { params: { mapId: "field" }, connection: { send }, room: { broadcast, getConnections: () => (scenario === "duplicate" ? [connection, duplicate] : [connection]) } },
      key: { map: spawn.map },
      map: { size: 1, rows: ["."] },
      me: { owner: "hunter", party: "party", player: mapPlayer("connection", hunter, cell), route: [cell], since: 1000, said: [], engaged: null },
      save: vi.fn(),
      standUp: vi.fn(async () => true),
    }
    await handleAttack(context, { type: "attack", monster: spawn.id })
    const shared = ["eligible", "duplicate", "disconnected-recipient", "failed-broadcast", "disconnected-killer", "failed-share-save"].includes(scenario)
    expect((await hunterActor.read()).exp).toBe(hunter.exp + (shared ? kind.exp - Math.floor(kind.exp / 2) : kind.exp))
    expect((await hunterActor.read()).bag.some((slot) => slot?.item === "jelly")).toBe(true)
    expect((await friendActor.read()).exp).toBe(friend.exp + (shared && scenario !== "failed-share-save" ? Math.floor(kind.exp / 2) : 0))
    expect((await source.state(spawn.map))[spawn.id].hp).toBe(0)
    if (scenario === "failed-share-save") {
      expect(connection.send).not.toHaveBeenCalled()
      expect(sourceStore.saved.get("__void_durable_state")).toMatchObject({ value: { deliveries: { friend: [{ command: { type: "share", exp: Math.floor(kind.exp / 2) } }] } } })
      source = new Wild.class(sourceStore.state, {})
      await source.alarm()
      await source.alarm()
      expect((await friendActor.read()).exp).toBe(friend.exp + Math.floor(kind.exp / 2))
      expect((await hunterActor.read()).exp).toBe(hunter.exp + kind.exp - Math.floor(kind.exp / 2))
    } else if (shared) {
      expect(receiveFriend).toHaveBeenCalledOnce()
      expect(connection.send).toHaveBeenCalledOnce()
    } else {
      expect(receiveFriend).not.toHaveBeenCalled()
      expect(connection.send).not.toHaveBeenCalled()
    }
    expect(duplicate.send).not.toHaveBeenCalled()
  },
)
