import { afterEach, expect, it, vi } from "vitest"
import { player } from "#/world/test/player"
import { mapPlayer } from "#/world/server/map-room/map-player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Player } from "#/durable-objects/player"
import type { PlayerCommandContext } from "#/world/server/map-room/player-command-types"
import type { ServerMessage } from "#/world/protocol"
const run = vi.hoisted(() => vi.fn<ReturnType<typeof Player.get>["run"]>())
vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ run }) } }))
import { handlePlayerCommand } from "#/world/server/map-room/handle-player-command"
afterEach(() => {
  vi.restoreAllMocks()
  run.mockReset()
})
function fixture() {
  const p = player({ sitting: false })
  const me: Presence = { owner: "owner", player: mapPlayer("connection", p, [0, 0]), route: [[0, 0]], since: 1000, said: [], engaged: null }
  const save = vi.fn((patch: Partial<Presence>) => Object.assign(me, patch))
  const send = vi.fn(async (_message: ServerMessage) => {}),
    broadcast = vi.fn(async () => {})
  const context: PlayerCommandContext = { ctx: { connection: { id: "connection", send }, room: { broadcast } }, map: { id: "phanthiet" }, me, save }
  return { p, me, save, send, broadcast, context }
}
it("keeps the confirmed sitting state when notifying the client fails", async () => {
  const f = fixture()
  run.mockResolvedValue({ ok: true, state: { ...f.p, sitting: true }, events: [{ type: "sat" }] })
  f.send.mockRejectedValue(Error("Socket unavailable"))
  vi.spyOn(console, "warn").mockImplementation(() => {})
  await handlePlayerCommand(f.context, { type: "command", seq: 1, command: { type: "sit" } })
  expect(f.me.sitting).toBe(true)
  expect(f.save).toHaveBeenCalledExactlyOnceWith({ sitting: true })
})
it("updates the saved profile and ready status even if its result notice is lost", async () => {
  const f = fixture()
  f.me.ready = false
  const p = { ...f.p, profileComplete: true, name: "エルナ" }
  run.mockResolvedValue({ ok: true, state: p, events: [] })
  f.send.mockRejectedValue(Error("Socket unavailable"))
  vi.spyOn(console, "warn").mockImplementation(() => {})
  await handlePlayerCommand(f.context, { type: "command", seq: 1, command: { type: "profile", name: p.name, look: p.look, neck: p.neck, neckRamp: "cBlue" } })
  expect(f.me.ready).toBe(true)
  expect(f.me.player?.name).toBe("エルナ")
  expect(f.broadcast).toHaveBeenCalledOnce()
})
it("does not change room state or send success when the player save fails", async () => {
  const f = fixture()
  run.mockRejectedValue(Error("Storage unavailable"))
  await expect(handlePlayerCommand(f.context, { type: "command", seq: 1, command: { type: "sit" } })).rejects.toThrow("Storage unavailable")
  expect(f.save).not.toHaveBeenCalled()
  expect(f.send).not.toHaveBeenCalled()
})
it("does not change the sitting state when the player refuses the command", async () => {
  const f = fixture()
  run.mockResolvedValue({ ok: false, reason: "NOT_READY" })
  await handlePlayerCommand(f.context, { type: "command", seq: 1, command: { type: "sit" } })
  expect(f.save).not.toHaveBeenCalled()
  expect(f.send).toHaveBeenCalledExactlyOnceWith({ type: "result", seq: 1, result: { ok: false, reason: "NOT_READY" } })
})
