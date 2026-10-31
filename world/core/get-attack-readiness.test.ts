import { expect, it } from "vitest"
import { getAttackReadiness } from "#/world/core/get-attack-readiness"
import { derive } from "#/world/core/derive"
import { player } from "#/world/test/player"
import { FIGHT_STAMINA } from "#/world/core/monsters"

it("checks persisted death before rejecting an invalid offensive action", () => {
  expect(getAttackReadiness({ player: player({ hp: 0 }), art: "sit", now: 1000 })).toEqual({ kind: "refused", reason: "FALLEN" })
})

it.each(["sit", "mend"] satisfies Array<"sit" | "mend">)("ignores the non-offensive skill %s before checking stamina", (art) => {
  expect(getAttackReadiness({ player: player({ stamina: 0 }), art, now: 1000 })).toEqual({ kind: "ignore" })
})

it("keeps the attack interval boundary and checks it before stamina", () => {
  const hunter = player({ stamina: 0 })
  const boundary = 1000 + derive(hunter).attackDelay * 0.85
  expect(getAttackReadiness({ player: hunter, struck: 1000, now: boundary - 1 })).toEqual({ kind: "ignore" })
  expect(getAttackReadiness({ player: hunter, struck: 1000, now: boundary })).toEqual({ kind: "refused", reason: "EXHAUSTED" })
})

it("leaves an offensive skill's own wait and payment to the authoritative strike", () => {
  const hunter = player({ stamina: FIGHT_STAMINA })
  const before = structuredClone(hunter)
  expect(getAttackReadiness({ player: hunter, struck: 1000, art: "lunge", now: 1001 })).toMatchObject({ kind: "ready", art: { kind: "strike" } })
  expect(getAttackReadiness({ player: hunter, struck: 1000, now: 1001 })).toEqual({ kind: "ignore" })
  expect(hunter).toEqual(before)
})
