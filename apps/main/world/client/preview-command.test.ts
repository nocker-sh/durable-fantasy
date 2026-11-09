import { afterEach, expect, it, vi } from "vitest"
import { previewCommand } from "#/world/client/preview-command"
import { apply } from "#/world/core/apply"
import { MEDICINE_WAIT_MS } from "#/world/core/medicine-rules"
import { bagWith } from "#/world/test/bag-with"
import { player } from "#/world/test/player"

afterEach(() => vi.useRealTimers())

const DOSE = 1_000_000

/** The server gave a potion at DOSE (its clock); the next medicine waits MEDICINE_WAIT_MS from then. */
function dosed() {
  const taken = apply(player({ hp: 1, hpAt: DOSE, sp: 0, spAt: DOSE, bag: bagWith(["red-potion", 3]) }), { type: "use-item", item: "red-potion" }, { now: DOSE })
  if (!taken.ok) throw Error(taken.reason)
  return taken.state
}

it("lets the next medicine go once the server's wait is over, though this device's clock is a minute slow", () => {
  const p = dosed()
  // the server is past the wait; this device still reads a time inside it
  vi.setSystemTime(DOSE + MEDICINE_WAIT_MS + 5_000 - 60_000)
  expect(previewCommand({ player: p, clockOffset: 0 }, { type: "use-item", item: "red-potion" })).toBe("MEDICINE_WAIT")
  expect(previewCommand({ player: p, clockOffset: 60_000 }, { type: "use-item", item: "red-potion" })).toBeNull()
})

it("keeps the wait while the server's is still running, though this device's clock is a minute fast", () => {
  const p = dosed()
  vi.setSystemTime(DOSE + 1_000 + 60_000)
  expect(previewCommand({ player: p, clockOffset: 0 }, { type: "use-item", item: "red-potion" })).toBeNull()
  expect(previewCommand({ player: p, clockOffset: -60_000 }, { type: "use-item", item: "red-potion" })).toBe("MEDICINE_WAIT")
})

it("refuses everything while no player has been received", () => {
  expect(previewCommand({ player: null, clockOffset: 0 }, { type: "use-item", item: "red-potion" })).toBe("OFFLINE")
})
