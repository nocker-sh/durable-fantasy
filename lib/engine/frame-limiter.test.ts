import { expect, it } from "vitest"
import { FrameLimiter } from "#/lib/engine/frame-limiter"

it("renders each 60 Hz frame despite small timestamp rounding errors", () => {
  const limiter = new FrameLimiter(60)
  for (let i = 0; i < 600; i++) expect(limiter.ready((i * 1000) / 60 + (i % 2 ? -0.05 : 0.05))).toBe(true)
})

it.each([120, 144, 240])("caps a %i Hz display at 60 frames per second", (refresh) => {
  const limiter = new FrameLimiter(60)
  let frames = 0
  for (let i = 0; i < refresh * 10; i++) if (limiter.ready((i * 1000) / refresh)) frames++
  expect(frames).toBe(600)
})

it("skips missed frames after a stall and recovers from a clock reset", () => {
  const limiter = new FrameLimiter(60)
  expect(limiter.ready(0)).toBe(true)
  expect(limiter.ready(10000)).toBe(true)
  expect(limiter.ready(10000.01)).toBe(false)
  expect(limiter.ready(10000 + 1000 / 60)).toBe(true)
  expect(limiter.ready(0)).toBe(true)
  expect(limiter.ready(1)).toBe(false)
  expect(limiter.ready(NaN)).toBe(false)
})
