import { afterEach, expect, it, vi } from "vitest"
import { handleEngage } from "#/world/server/map-room/handle-engage"
import { newPlayer } from "#/world/core/new-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"
import type { npcCell } from "#/world/maps/npc-cell"

const npc = vi.hoisted(() => vi.fn<typeof npcCell>())
vi.mock("#/world/maps/npc-cell", () => ({ npcCell: npc }))
afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

function fixture() {
  npc.mockReturnValue([10, 10])
  const me: Presence = { owner: "owner", player: mapPlayer("connection", newPlayer(), [10, 10]), route: [[10, 10]], since: Date.now(), said: [], engaged: "resident" }
  const send = vi.fn(async (_message: ServerMessage) => {})
  const save = vi.fn((_patch: Partial<Presence>) => {})
  const room = { me, save, map: { id: "map" }, ctx: { connection: { send } } }
  return { me, send, save, room }
}

it("ends a conversation without needing a position or a resident lookup", async () => {
  const request = fixture()
  request.me.route = []
  await expect(handleEngage(request.room, { type: "engage", npc: null })).resolves.toBeUndefined()
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ engaged: null })
  expect(npc).not.toHaveBeenCalled()
  expect(request.send).not.toHaveBeenCalled()
})

it("stops at the current reachable cell before beginning a nearby conversation", async () => {
  vi.useFakeTimers()
  vi.setSystemTime(1000)
  const request = fixture()
  await handleEngage(request.room, { type: "engage", npc: "resident" })
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ engaged: "resident", route: [[10, 10]], since: 1000, player: { ...request.me.player, at: [10, 10] } })
})

it.each([null, [80, 80]])("rejects an absent or distant resident", async (cell) => {
  const request = fixture()
  if (cell === null) npc.mockReturnValue(null)
  else npc.mockReturnValue([cell[0], cell[1]])
  await handleEngage(request.room, { type: "engage", npc: "resident" })
  expect(request.send).toHaveBeenCalledExactlyOnceWith({ type: "refused", what: "engage" })
  expect(request.save).not.toHaveBeenCalled()
})
