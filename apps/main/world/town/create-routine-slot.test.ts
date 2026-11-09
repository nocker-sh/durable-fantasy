import { expect, it } from "vitest"
import { createRoutineSlot } from "#/world/town/create-routine-slot"

it.each([
  ["00:00", 0],
  ["7:05", 425],
  ["23:59", 1439],
] as const)("reads the complete clock value %s", (text, minute) => {
  expect(createRoutineSlot({ from: text, where: "home", doing: "眠る" })).toEqual({ from: minute, where: "home", doing: "眠る" })
})

it.each(["", "24:00", "12:60", "-1:00", "12:30:00", "12:", "12:3", "12:30x", " 12:30", "Infinity:00"])("rejects invalid authored time %j", (from) => {
  expect(() => createRoutineSlot({ from, where: "home", doing: "眠る" })).toThrow(RangeError)
})

it("preserves the activity and place without changing the authored input", () => {
  const activity = { kind: "records" } as const
  const where = { map: "hall", cell: [1, 2] } as const
  const authored = { from: "20:30", where, doing: "帳面をつける", activity }
  const slot = createRoutineSlot(authored)
  expect(slot.from).toBe(1230)
  expect(slot.activity).toBe(activity)
  expect(slot.where).toBe(where)
  expect(authored.from).toBe("20:30")
})
