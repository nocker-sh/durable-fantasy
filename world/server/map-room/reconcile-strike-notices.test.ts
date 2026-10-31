import { afterEach, expect, it, vi } from "vitest"
import { reconcileStrikeNotices } from "#/world/server/map-room/reconcile-strike-notices"
import { player } from "#/world/test/player"
import type { Player } from "#/durable-objects/player"
import type { CombatNotice, StrikeResult } from "#/world/server/wild-coordinator"

const read = vi.hoisted(() => vi.fn<ReturnType<typeof Player.get>["read"]>())
vi.mock("#/durable-objects/player", () => ({ Player: { get: () => ({ read }) } }))
afterEach(() => vi.resetAllMocks())
const strike: StrikeResult = { refused: false, beaten: false, hp: 1, back: 0 }

it("uses the last own delivery even if an earlier one differs", async () => {
  const notices: CombatNotice[] = [
    { owner: "owner", result: { ok: false, reason: "FALLEN" } },
    { owner: "owner", result: { ok: true, state: player(), events: [] } },
  ]
  const result = await reconcileStrikeNotices("owner", notices, { ...strike, beaten: true })
  expect(result.own).toBe(notices[1].result)
  expect(result.notices).toBe(notices)
  expect(read).not.toHaveBeenCalled()
})

it.each(["miss", "none"])("does not read current state for a nonlethal strike with counter %s", async (counter) => {
  const result = await reconcileStrikeNotices("owner", [], { ...strike, ...(counter === "miss" ? { counter: { kind: "miss" } } : {}) })
  expect(result.own).toBeUndefined()
  expect(read).not.toHaveBeenCalled()
})

it("reconciles an already delivered retaliation without replaying events or mutating the queue", async () => {
  const saved = player({ hp: 0 })
  read.mockResolvedValue(saved)
  const notices: CombatNotice[] = [{ owner: "friend", result: { ok: true, state: player(), events: [] } }]
  const result = await reconcileStrikeNotices("owner", notices, { ...strike, counter: { kind: "hit", damage: 1 } })
  expect(read).toHaveBeenCalledOnce()
  expect(result.own).toEqual({ ok: true, state: saved, events: [] })
  expect(result.notices).toEqual([...notices, { owner: "owner", result: result.own }])
  expect(notices).toHaveLength(1)
})

it("propagates an authoritative read failure", async () => {
  read.mockRejectedValue(Error("Read failed"))
  await expect(reconcileStrikeNotices("owner", [], { ...strike, beaten: true })).rejects.toThrow("Read failed")
})
