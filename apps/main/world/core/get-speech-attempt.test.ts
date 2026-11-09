import { expect, it } from "vitest"
import { getSpeechAttempt } from "#/world/core/get-speech-attempt"

it("expires an attempt exactly at the window boundary without changing the input", () => {
  const said = [0, 1]
  expect(getSpeechAttempt(said, 1000)).toEqual({ said: [1, 1000], canSpeak: true })
  expect(said).toEqual([0, 1])
})

it("retains a rejected attempt so continuous attempts extend the wait", () => {
  const rejected = getSpeechAttempt([100, 200], 300)
  expect(rejected).toEqual({ said: [200, 300], canSpeak: false })
  expect(getSpeechAttempt(rejected.said, 1100)).toEqual({ said: [300, 1100], canSpeak: false })
})

it("only retains the most recent attempts during a burst", () => {
  expect(
    getSpeechAttempt(
      Array.from({ length: 10000 }, () => 500),
      500,
    ),
  ).toEqual({ said: [500, 500], canSpeak: false })
})
