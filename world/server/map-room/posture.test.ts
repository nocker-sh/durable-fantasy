import { afterEach, expect, it, vi } from "vitest"
import { player } from "#/world/test/player"
import type { Ctx } from "#/world/server/map-room/context"
const run = vi.hoisted(() => vi.fn())
vi.mock("../../../durable-objects/player", () => ({ Player: { get: () => ({ run }) } }))
import { standUp } from "#/world/server/map-room/posture"
afterEach(() => {
  vi.restoreAllMocks()
  run.mockReset()
})
function fixture() {
  const save = vi.fn(),
    send = vi.fn(async () => {})
  return { ctx: { connection: { send } }, me: { owner: "owner", sitting: true }, save } as unknown as Pick<Ctx, "ctx" | "me" | "save"> & { save: typeof save }
}
it("keeps posture unchanged while the player save is outstanding or failed", async () => {
  const f = fixture()
  let fail!: (error: Error) => void
  run.mockReturnValue(
    new Promise((_resolve, reject) => {
      fail = reject
    }),
  )
  const attempt = standUp(f)
  expect(f.save).not.toHaveBeenCalled()
  fail(Error("Storage unavailable"))
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
