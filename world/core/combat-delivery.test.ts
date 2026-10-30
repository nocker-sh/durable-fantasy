import { expect, it } from "vitest"
import { receiveCombat } from "#/world/core/receive-combat"
import type { CombatDelivery } from "#/world/core/combat-delivery-types"
import { player } from "#/world/test/player"

const reward: CombatDelivery = { id: 2, command: { type: "loot", monster: "slime", exp: 9, items: ["jelly"] } }
it("acknowledges one reward and replays without overwriting later player changes or events", () => {
  const original = player()
  const first = receiveCombat({ player: original, previous: undefined, delivery: reward, now: 1000, reserved: false, life: 0 })
  if (!first.result.ok) throw Error(first.result.reason)
  const later = { ...first.result.state, gold: 3 }
  expect(receiveCombat({ player: later, previous: first.receipt, delivery: reward, now: 2000, reserved: true, life: 0 })).toEqual({ result: { ok: true, state: later, events: [] } })
  expect(later.exp).toBe(original.exp + 9)
  expect(later.bag.filter((slot) => slot?.item === "jelly")).toHaveLength(1)
  expect(original.exp).toBe(0)
  expect(
    receiveCombat({
      player: later,
      previous: first.receipt,
      delivery: { ...reward, command: { ...reward.command, type: "loot", monster: "slime", exp: 10, items: ["jelly"] } },
      now: 2000,
      reserved: false,
      life: 0,
    }).result,
  ).toEqual({
    ok: false,
    reason: "NOT_READY",
  })
  expect(receiveCombat({ player: later, previous: first.receipt, delivery: { ...reward, id: 1 }, now: 2000, reserved: false, life: 0 }).result).toEqual({ ok: false, reason: "NOT_READY" })
})
it("defers earned rewards during a trade or fall, rather than marking them received or reviving the player", () => {
  expect(receiveCombat({ player: player(), previous: undefined, delivery: reward, now: 1000, reserved: true, life: 0 })).toEqual({ result: { ok: false, reason: "NOT_READY" } })
  const fallen = player({ hp: 0 })
  expect(receiveCombat({ player: fallen, previous: undefined, delivery: reward, now: 1000, reserved: false, life: 0 })).toEqual({ result: { ok: false, reason: "FALLEN" } })
  expect(fallen.hp).toBe(0)
})
it("cannot apply an old retaliation to a revived player or replay it after another fall", () => {
  const hurt: CombatDelivery = { id: 1, command: { type: "hurt", amount: 50, by: "スライム" }, life: 0 }
  const fallen = player({ hp: 0 })
  const received = receiveCombat({ player: fallen, previous: undefined, delivery: hurt, now: 1000, reserved: false, life: 0 })
  expect(received).toMatchObject({ result: { ok: true, state: { hp: 0 }, events: [] }, receipt: hurt })
  const revived = player({ hp: 10 })
  expect(receiveCombat({ player: revived, previous: received.receipt, delivery: hurt, now: 2000, reserved: false, life: 1 }).result).toEqual({ ok: true, state: revived, events: [] })
  expect(receiveCombat({ player: revived, previous: undefined, delivery: hurt, now: 2000, reserved: false, life: 1 })).toEqual({ result: { ok: true, state: revived, events: [] }, receipt: hurt })
  expect(receiveCombat({ player: revived, previous: received.receipt, delivery: { ...hurt, life: 1 }, now: 2000, reserved: false, life: 1 }).result).toEqual({ ok: false, reason: "NOT_READY" })
})
