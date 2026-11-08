import { afterEach, expect, it, vi } from "vitest"
import { publishCommandPlayer } from "#/world/server/map-room/publish-command-player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import { player } from "#/world/test/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { ServerMessage } from "#/world/protocol"

afterEach(() => vi.restoreAllMocks())

function fixture() {
  const state = player({ profileComplete: true })
  const previous = mapPlayer("self", state, [3, 4])
  const me: Pick<Presence, "ready"> = { ready: true }
  const trace: string[] = []
  const save = vi.fn((patch: Partial<Presence>) => {
    trace.push("save")
    Object.assign(me, patch)
  })
  const broadcast = vi.fn(async (_message: ServerMessage, _excluded?: string[]) => {
    trace.push("broadcast")
  })
  const context = { me, save, ctx: { connection: { id: "self" }, room: { broadcast } } }
  return { state, previous, context, save, broadcast, trace }
}

it("does not announce an unchanged visible profile when only health changes", async () => {
  const request = fixture()
  await publishCommandPlayer({ context: request.context, player: request.previous, state: { ...request.state, hp: request.state.hp - 1 } })
  expect(request.save).not.toHaveBeenCalled()
  expect(request.broadcast).not.toHaveBeenCalled()
})

it("announces the initial ready profile even when its appearance is unchanged", async () => {
  const request = fixture()
  request.context.me.ready = false
  await publishCommandPlayer({ context: request.context, player: request.previous, state: request.state })
  expect(request.context.me.ready).toBe(true)
  expect(request.save).toHaveBeenCalledExactlyOnceWith({ player: request.previous, ready: true })
  expect(request.broadcast).toHaveBeenCalledExactlyOnceWith({ type: "joined", player: request.previous }, ["self"])
  expect(request.trace).toEqual(["save", "broadcast"])
})

it("retains the confirmed name before a lost broadcast and preserves the player's position", async () => {
  const request = fixture()
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
  request.broadcast.mockRejectedValueOnce(Error("Socket closed"))
  await publishCommandPlayer({ context: request.context, player: request.previous, state: { ...request.state, name: "エルナ" } })
  expect(request.save).toHaveBeenCalledWith({ player: { ...request.previous, name: "エルナ" }, ready: true })
  expect(request.previous.name).toBe(request.state.name)
  expect(warn).toHaveBeenCalledOnce()
})
