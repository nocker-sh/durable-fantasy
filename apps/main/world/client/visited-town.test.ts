import { expect, it } from "vitest"
import { WORLDS } from "#/world/channels"
import { readVisitedTown } from "#/world/client/read-visited-town"
import { writeVisitedTown } from "#/world/client/write-visited-town"

function tab() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

it("brings a reload of the tab back to the town it was let into", () => {
  const storage = tab()
  expect(readVisitedTown(storage)).toBeNull()
  writeVisitedTown(storage, 3)
  expect(readVisitedTown(storage)).toBe(3)
  writeVisitedTown(storage, 1)
  expect(readVisitedTown(storage)).toBe(1)
})

it.each(["0", String(WORLDS + 1), "2.5", "town", ""])("starts at home for a kept town of %j", (kept) => {
  expect(readVisitedTown({ getItem: () => kept })).toBeNull()
})

it("starts at home when the tab cannot keep anything", () => {
  const blocked = () => {
    throw new Error("unavailable")
  }
  expect(readVisitedTown({ getItem: blocked })).toBeNull()
  expect(() => writeVisitedTown({ setItem: blocked }, 2)).not.toThrow()
})
