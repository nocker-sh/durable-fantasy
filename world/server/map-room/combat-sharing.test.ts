import { afterEach, expect, it, vi } from "vitest"
import { MONSTER_KINDS, SPAWNS, monsterAt } from "../../core/monsters.ts"
import { player } from "../../test/helpers.ts"
import { mapPlayer } from "./presence.ts"
import type { Ctx } from "./context.ts"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
const mocks = vi.hoisted(() => ({ get: vi.fn(), view: vi.fn(), strike: vi.fn() }))
vi.mock("../../../durable-objects/player.ts", () => ({ Player: { get: mocks.get } }))
vi.mock("../../../durable-objects/wild.ts", () => ({ Wild: { get: () => ({ strike: mocks.strike }) } }))
vi.mock("../../../durable-objects/party.ts", () => ({ Party: { get: () => ({ view: mocks.view }) } }))
vi.mock("../../maps/index.ts", () => ({ walkable: () => true }))
import { HANDLERS } from "./combat.ts"

afterEach(() => vi.resetAllMocks())

it.each(["fallen", "left", "removed", "closed", "duplicate", "eligible", "killer-left"])("shares a kill using current player and party state: %s", async (scenario) => {
  const spawn = SPAWNS.find((s) => s.kind === "slime")!
  const hunter = player({ party: scenario === "killer-left" ? null : "party" })
  const friend = player({ hp: scenario === "fallen" ? 0 : 10, party: scenario === "left" ? null : "party" })
  const hunterRun = vi.fn(async () => ({ ok: true, state: hunter, events: [] }))
  const friendRun = vi.fn(async () => ({ ok: true, state: friend, events: [] }))
  mocks.get.mockImplementation((id) => (id === "hunter" ? { read: async () => hunter, run: hunterRun } : { read: async () => friend, run: friendRun }))
  mocks.view.mockResolvedValue({ mode: "even", members: [{ owner: "hunter" }, ...(scenario === "removed" ? [] : [{ owner: "friend" }])] })
  mocks.strike.mockResolvedValue({ refused: false, beaten: true, hp: 0, back: Date.now() + 10000 })
  const at = monsterAt(spawn, Date.now(), () => true)
  const cell: [number, number] = [Math.floor(at.x * 2), Math.floor(at.z * 2)]
  const connection = {
    state: { owner: "friend", party: "party", down: false, closed: scenario === "closed" },
    send: vi.fn(async () => {}),
  }
  const duplicate = { ...connection, send: vi.fn(async () => {}) }
  const context = {
    ctx: {
      params: { mapId: "field" },
      connection: { send: vi.fn(async () => {}) },
      room: { broadcast: vi.fn(async () => {}), getConnections: () => (scenario === "duplicate" ? [connection, duplicate] : [connection]) },
    },
    key: { map: spawn.map },
    map: {},
    me: { owner: "hunter", party: "party", player: mapPlayer("connection", hunter, cell), route: [cell], since: Date.now() },
    save: vi.fn(),
    standUp: vi.fn(async () => {}),
  } as unknown as Ctx
  await HANDLERS.attack!(context, { type: "attack", monster: spawn.id })
  const exp = MONSTER_KINDS[spawn.kind].exp
  const shared = scenario === "eligible" || scenario === "duplicate"
  expect(hunterRun).toHaveBeenCalledWith(expect.objectContaining({ type: "loot", exp: shared ? exp - Math.floor(exp / 2) : exp }))
  if (shared) {
    expect(friendRun).toHaveBeenCalledExactlyOnceWith({ type: "share", exp: Math.floor(exp / 2), monster: spawn.id })
    expect(connection.send).toHaveBeenCalledOnce()
    expect(duplicate.send).not.toHaveBeenCalled()
  } else {
    expect(friendRun).not.toHaveBeenCalled()
    expect(connection.send).not.toHaveBeenCalled()
  }
})
