import { afterEach, expect, it, vi } from "vitest"
import { Player } from "#/durable-objects/player"
import { initialPlayerRecord } from "#/world/server/initial-player-record"
import type { PlayerRecord } from "#/world/server/player-record"
import { durableStorage } from "#/world/test/durable-storage"
import { player } from "#/world/test/player"
import { derive } from "#/world/core/derive"

vi.mock("cloudflare:workers", () => ({ DurableObject: class {} }))
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function fixture(epoch: number) {
  vi.useFakeTimers()
  vi.setSystemTime(epoch)
  const base = player()
  const hunter = player({ stats: { ...base.stats, str: 8 }, equipment: { ...base.equipment, weapon: "short-sword" }, sp: 20, spAt: epoch })
  const store = durableStorage({ ...initialPlayerRecord(), player: hunter }, 8)
  return {
    store,
    hunter,
    actor: () => new Player.class(store.state, {}),
    record: () => (store.saved.get("__void_durable_state") as { value: PlayerRecord }).value,
    ready: epoch + Math.ceil(derive(hunter).attackDelay * 0.85),
  }
}

it.each([0, 1000].flatMap((epoch) => ([undefined, "lunge"] as const).map((art) => ({ epoch, art }))))("keeps $art attack spacing across restarts and source maps from $epoch", async (scenario) => {
  const f = fixture(scenario.epoch)
  const request = { source: "map-a", id: 1, art: scenario.art, life: 0 }
  expect((await f.actor().payStrike(request)).ok).toBe(true)
  const paid = structuredClone(f.record())
  expect((await f.actor().readCombat()).struck).toBe(scenario.epoch)
  const next = f.actor()
  const before = structuredClone(f.record().player)
  expect(await next.payStrike({ source: "map-b", id: 1, life: 0 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(f.record().player).toEqual(before)
  expect(f.record().struck).toBe(scenario.epoch)
  vi.setSystemTime(f.ready - 1)
  expect(await next.payStrike({ source: "map-b", id: 2, life: 0 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect(f.record().player).toEqual(before)
  vi.setSystemTime(f.ready)
  // A request already refused stays refused; a new request can now attack.
  expect(await next.payStrike({ source: "map-b", id: 2, life: 0 })).toEqual({ ok: false, reason: "NOT_READY" })
  expect((await next.payStrike({ source: "map-b", id: 3, life: 0 })).ok).toBe(true)
  expect(f.record().struck).toBe(f.ready)
  expect(f.record().player.sp).toBe(paid.player.sp)
  const body = structuredClone(f.record().player)
  vi.setSystemTime(f.ready + 1)
  expect((await next.payStrike(request)).ok).toBe(true)
  expect(f.record().struck).toBe(f.ready)
  expect({ ...f.record().player, revision: body.revision }).toEqual(body)
})

it("rolls back the accepted time with a failed payment save and accepts a retry", async () => {
  const f = fixture(0)
  const actor = f.actor()
  f.store.failNextSave()
  const request = { source: "map-a", id: 1, art: "lunge" as const, life: 0 }
  await expect(actor.payStrike(request)).rejects.toThrow("Storage unavailable")
  expect(f.record().struck).toBeUndefined()
  expect(f.record().combatPayments).toEqual({})
  expect(f.record().player).toEqual(f.hunter)
  expect((await actor.payStrike(request)).ok).toBe(true)
  expect(f.record().struck).toBe(0)
  expect(f.record().player.sp).toBe(16)
  const paid = structuredClone(f.record().player)
  expect((await f.actor().payStrike(request)).ok).toBe(true)
  expect(f.record().struck).toBe(0)
  expect({ ...f.record().player, revision: paid.revision }).toEqual(paid)
})

it("serializes simultaneous payments from different maps into one accepted swing", async () => {
  const f = fixture(0)
  const actor = f.actor()
  const results = await Promise.all([actor.payStrike({ source: "map-a", id: 1, life: 0 }), actor.payStrike({ source: "map-b", id: 1, life: 0 })])
  expect(results.filter((result) => result.ok)).toHaveLength(1)
  expect(results.filter((result) => !result.ok)).toEqual([{ ok: false, reason: "NOT_READY" }])
  expect(f.record().struck).toBe(0)
  expect(f.record().player.sp).toBe(f.hunter.sp)
  expect(Object.values(f.record().combatPayments).filter((receipt) => receipt.outcome.ok)).toHaveLength(1)
})
