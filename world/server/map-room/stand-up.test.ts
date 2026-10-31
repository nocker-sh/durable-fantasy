import { afterEach, expect, it, vi } from "vitest"
import { player } from "#/world/test/player"
import type { Player } from "#/durable-objects/player"
import type { Presence } from "#/world/server/map-room/presence"
import type { Transition } from "#/world/core/transition"
const run = vi.hoisted(() => vi.fn<ReturnType<typeof Player.get>["run"]>())
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ run }) } }))
import { standUp } from "#/world/server/map-room/stand-up"
afterEach(() => {
  vi.restoreAllMocks()
  run.mockReset()
})
function fixture() {
  const save = vi.fn(),
    send = vi.fn(async () => {})
  const me: Pick<Presence, "owner" | "sitting"> = { owner: "owner", sitting: true }
  return { ctx: { connection: { send } }, me, save }
}
it("keeps posture unchanged while the player save is outstanding or failed", async () => {
  const f = fixture()
  const pending: { fail?: (error: Error) => void } = {}
  run.mockReturnValue(
    new Promise<Transition>((_resolve, reject) => {
      pending.fail = reject
    }),
  )
  const attempt = standUp(f)
  expect(f.save).not.toHaveBeenCalled()
  if (!pending.fail) throw Error("Expected an outstanding save")
  pending.fail(Error("Storage unavailable"))
  await expect(attempt).rejects.toThrow("Storage unavailable")
  expect(f.save).not.toHaveBeenCalled()
})
it("does not clear a seated presence after an explicit refusal", async () => {
  const f = fixture()
  run.mockResolvedValue({ ok: false, reason: "NOT_READY" })
  expect(await standUp(f)).toBe(false)
  expect(f.save).not.toHaveBeenCalled()
})
it("confirms the saved posture even if its notification fails", async () => {
  const f = fixture()
  run.mockResolvedValue({ ok: true, state: player({ sitting: false }), events: [{ type: "stood" }] })
  vi.spyOn(f.ctx.connection, "send").mockRejectedValue(Error("Socket unavailable"))
  vi.spyOn(console, "warn").mockImplementation(() => {})
  expect(await standUp(f)).toBe(true)
  expect(f.save).toHaveBeenCalledExactlyOnceWith({ sitting: false })
})
it("skips already standing players and refuses seated players without an owner", async () => {
  const f = fixture()
  f.me.sitting = false
  expect(await standUp(f)).toBe(true)
  f.me.sitting = true
  f.me.owner = null
  expect(await standUp(f)).toBe(false)
  expect(run).not.toHaveBeenCalled()
})

it("reflects the confirmed posture before sending the result", async () => {
  const f = fixture()
  const trace: string[] = []
  run.mockResolvedValue({ ok: true, state: player({ sitting: false }), events: [{ type: "stood" }] })
  f.save.mockImplementation(() => {
    trace.push("save")
  })
  f.ctx.connection.send.mockImplementation(async () => {
    trace.push("send")
  })
  expect(await standUp(f)).toBe(true)
  expect(trace).toEqual(["save", "send"])
})
