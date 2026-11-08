import { expect, it } from "vitest"
import { pacePlayer } from "#/world/server/pace-player"

it("lets each kind through once per gap and does not count refused attempts", () => {
  const record: { paces?: Partial<Record<"ask" | "shout", number>> } = {}
  expect(pacePlayer(record, { kind: "shout", gap: 30_000 }, 100_000)).toBe(true)
  expect(pacePlayer(record, { kind: "shout", gap: 30_000 }, 120_000)).toBe(false)
  expect(pacePlayer(record, { kind: "ask", gap: 5_000 }, 120_000)).toBe(true)
  expect(pacePlayer(record, { kind: "shout", gap: 30_000 }, 130_000)).toBe(true)
  expect(record.paces).toEqual({ shout: 130_000, ask: 120_000 })
})
