import { expect, it } from "vitest"
import { REGEN_MS } from "#/world/core/player-rules"
import { nextRecoveryRedraw } from "#/world/parts/next-recovery-redraw"

const rest = { maxHp: 100, maxSp: 40 }

it("redraws just after the next tick when it is near, so a full rest shows at once", () => {
  // sat down at 0: the tick lands at REGEN_MS; one second before it, the redraw waits only that second
  expect(nextRecoveryRedraw({ hp: 10, hpAt: 1, sp: 40, spAt: 1 }, rest, REGEN_MS - 1000)).toBe(1031)
})

it("never waits more than a quarter tick, and does not wait on a full value", () => {
  expect(nextRecoveryRedraw({ hp: 10, hpAt: 1, sp: 40, spAt: 1 }, rest, 2)).toBe(REGEN_MS / 4)
  expect(nextRecoveryRedraw({ hp: 100, hpAt: 1, sp: 5, spAt: REGEN_MS - 500 }, rest, REGEN_MS)).toBe(REGEN_MS / 4)
})
