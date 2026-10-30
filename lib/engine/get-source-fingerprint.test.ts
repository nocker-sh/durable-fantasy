import { expect, it } from "vitest"
import { getSourceFingerprint } from "#/lib/engine/get-source-fingerprint"

it("sorts paths independently of insertion order without changing the source records", () => {
  const sources = { "b.ts": "world", "a.ts": "hello " }
  const snapshot = structuredClone(sources)
  expect(getSourceFingerprint(sources)).toBe(getSourceFingerprint({ "a.ts": "hello ", "b.ts": "world" }))
  expect(getSourceFingerprint({ "a.ts": "hello" })).toBe("m3bicr")
  expect(sources).toEqual(snapshot)
})

it("retains the empty source version and reacts to changed source content", () => {
  expect(getSourceFingerprint({})).toBe("ztntfp")
  expect(getSourceFingerprint({ "a.ts": "first" })).not.toBe(getSourceFingerprint({ "a.ts": "second" }))
})
