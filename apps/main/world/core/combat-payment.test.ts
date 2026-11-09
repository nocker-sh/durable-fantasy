import { expect, it } from "vitest"
import { payStrike } from "#/world/core/combat-payment"
import { player } from "#/world/test/player"

function fighter() {
  const p = player()
  return player({ stats: { ...p.stats, str: 8 }, equipment: { ...p.equipment, weapon: "short-sword" }, sp: 20, spAt: 1000 })
}
it("replays a paid art even when a subsequent trade reserves the player", () => {
  const original = fighter()
  const first = payStrike({ player: original, previous: undefined, request: { id: 1, art: "lunge" }, context: { now: 1000, reserved: false, life: 0 } })
  if (!first.result.ok) throw Error(first.result.reason)
  const later = { ...first.result.state, gold: 3 }
  const replay = payStrike({ player: later, previous: first.receipt, request: { id: 1, art: "lunge" }, context: { now: 1000, reserved: true, life: 0 } })
  expect(replay).toEqual({ result: { ok: true, state: later, events: [] } })
  expect(later.sp).toBe(16)
  expect(original.sp).toBe(20)
  expect(payStrike({ player: later, previous: first.receipt, request: { id: 1, art: "ember" }, context: { now: 1000, reserved: false, life: 0 } }).result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(payStrike({ player: later, previous: first.receipt, request: { id: 0, art: "lunge" }, context: { now: 1000, reserved: false, life: 0 } }).result).toEqual({ ok: false, reason: "NOT_READY" })
})
it("keeps an explicit refusal final even if the player's condition later changes", () => {
  const original = fighter()
  const refused = payStrike({ player: original, previous: undefined, request: { id: 3, art: "lunge" }, context: { now: 1000, reserved: true, life: 0 } })
  expect(refused.result).toEqual({ ok: false, reason: "NOT_READY" })
  expect(payStrike({ player: original, previous: refused.receipt, request: { id: 3, art: "lunge" }, context: { now: 2000, reserved: false, life: 0 } })).toEqual({ result: refused.result })
  const next = payStrike({ player: original, previous: refused.receipt, request: { id: 4, art: "lunge" }, context: { now: 2000, reserved: false, life: 0 } })
  expect(next.result.ok && next.result.state.sp).toBe(16)
  expect(payStrike({ player: original, previous: next.receipt, request: { id: 3, art: "lunge" }, context: { now: 3000, reserved: false, life: 0 } }).result).toEqual({ ok: false, reason: "NOT_READY" })
})
it.each([-1, 0, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])("rejects invalid payment ID %s before changing SP or cooldowns", (id) => {
  const p = fighter()
  expect(payStrike({ player: p, previous: undefined, request: { id: id, art: "lunge" }, context: { now: 1000, reserved: false, life: 0 } })).toEqual({ result: { ok: false, reason: "NOT_READY" } })
  expect(p.sp).toBe(20)
  expect(p.ready).toEqual({})
})

it("records normal attacks without consuming SP, and binds both attack kinds to their original life", () => {
  for (const art of [undefined, "lunge"] as const) {
    const original = fighter()
    const refused = payStrike({ player: original, previous: undefined, request: { id: 1, art: art, life: 0 }, context: { now: 1000, reserved: false, life: 1 } })
    expect(refused.result).toEqual({ ok: false, reason: "NOT_READY" })
    const accepted = payStrike({ player: original, previous: undefined, request: { id: 2, art: art, life: 1 }, context: { now: 1000, reserved: false, life: 1 } })
    if (!accepted.result.ok) throw Error(accepted.result.reason)
    expect(accepted.result.state.sp).toBe(art ? 16 : 20)
    expect(payStrike({ player: accepted.result.state, previous: accepted.receipt, request: { id: 2, art: art, life: 0 }, context: { now: 1000, reserved: false, life: 1 } }).result).toEqual({
      ok: false,
      reason: "NOT_READY",
    })
    expect(payStrike({ player: accepted.result.state, previous: accepted.receipt, request: { id: 2, art: art, life: 1 }, context: { now: 1000, reserved: true, life: 2 } }).result).toEqual({
      ok: true,
      state: accepted.result.state,
      events: [],
    })
  }
})

it.each([undefined, "lunge"] as const)("refuses %s attacks from fallen or exhausted players before accepting a new request", (art) => {
  expect(payStrike({ player: fighter(), previous: undefined, request: { id: 1, art: art, life: 0 }, context: { now: 1000, reserved: true, life: 0 } }).result).toEqual({
    ok: false,
    reason: "NOT_READY",
  })
  expect(payStrike({ player: { ...fighter(), hp: 0 }, previous: undefined, request: { id: 1, art: art, life: 0 }, context: { now: 1000, reserved: false, life: 0 } }).result).toEqual({
    ok: false,
    reason: "FALLEN",
  })
  expect(payStrike({ player: { ...fighter(), stamina: 0 }, previous: undefined, request: { id: 1, art: art, life: 0 }, context: { now: 1000, reserved: false, life: 0 } }).result).toEqual({
    ok: false,
    reason: "EXHAUSTED",
  })
})

it("keeps an already paid legacy receipt valid when the source adds life metadata", () => {
  const paid = payStrike({ player: fighter(), previous: undefined, request: { id: 1, art: "lunge" }, context: { now: 1000, reserved: false, life: 0 } })
  if (!paid.result.ok) throw Error(paid.result.reason)
  expect(payStrike({ player: paid.result.state, previous: paid.receipt, request: { id: 1, art: "lunge", life: 0 }, context: { now: 1000, reserved: false, life: 1 } }).result).toEqual({
    ok: true,
    state: paid.result.state,
    events: [],
  })
})
