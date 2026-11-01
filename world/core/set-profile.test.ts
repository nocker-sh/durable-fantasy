import { expect, it } from "vitest"
import { apply } from "#/world/core/apply"
import { commandSchema } from "#/world/core/commands"
import { newPlayer } from "#/world/core/new-player"
import { RENAME_GAP_MS } from "#/world/core/player-rules"

const profile = (name: string) => ({ type: "profile" as const, name, look: 1, neck: "stole" as const, neckRamp: "cBlue" as const })
const DAY = 24 * 60 * 60_000

it("keeps resident and maker names for the residents", () => {
  for (const name of ["イルムガルト", "ベネディクト", "ギュンター", "ゲルダ"]) {
    expect(commandSchema.safeParse(profile(name)).success).toBe(false)
    expect(apply(newPlayer(), profile(name), { now: DAY })).toEqual({ ok: false, reason: "NAME_TAKEN" })
  }
  expect(commandSchema.safeParse(profile("ヴェルナ")).success).toBe(true)
})

it("lets looks change any time but a name only once in a while after creation", () => {
  const created = apply(newPlayer(), profile("ヴェルナ"), { now: DAY })
  if (!created.ok) throw Error(created.reason)
  expect(created.state.renamedAt).toBeUndefined()
  const renamed = apply(created.state, profile("ヴェルナ2"), { now: 2 * DAY })
  if (!renamed.ok) throw Error(renamed.reason)
  expect(renamed.state.renamedAt).toBe(2 * DAY)
  expect(apply(renamed.state, profile("ヴェルナ3"), { now: 3 * DAY })).toEqual({ ok: false, reason: "RENAME_WAIT" })
  const restyled = apply(renamed.state, { ...profile("ヴェルナ2"), look: 3 }, { now: 3 * DAY })
  expect(restyled.ok && restyled.state.look).toBe(3)
  expect(apply(renamed.state, profile("ヴェルナ3"), { now: 2 * DAY + RENAME_GAP_MS }).ok).toBe(true)
})

it("lets an old save that took a resident's name give it up at once", () => {
  const taken = { ...newPlayer("イルムガルト"), profileComplete: true, renamedAt: DAY }
  expect(apply(taken, profile("ヴェルナ"), { now: 2 * DAY }).ok).toBe(true)
})
