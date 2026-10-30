import { expect, it } from "vitest"
import { getStringHash } from "#/lib/engine/get-string-hash"

it.each([
  { source: "", hash: 2166136261 },
  { source: "a", hash: 3826002220 },
  { source: "hello", hash: 1335831723 },
])("keeps the established hash of $source", (input) => {
  expect(getStringHash(input.source)).toBe(input.hash)
})

it("hashes UTF-16 code units rather than dropping the low surrogate", () => {
  const pair = "\ud83d\ude00"
  const first = Math.imul(2166136261 ^ 0xd83d, 16777619)
  expect(getStringHash(pair)).toBe(Math.imul(first ^ 0xde00, 16777619) >>> 0)
  expect(getStringHash("\ud83d")).toBe(first >>> 0)
  expect(getStringHash("\ude00")).toBe(Math.imul(2166136261 ^ 0xde00, 16777619) >>> 0)
})
