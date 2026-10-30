import { expect, it } from "vitest"
import { getRestToRestProfile, REST_TO_REST_MAX_SPEED, REST_TO_REST_MAX_ACCELERATION } from "./get-rest-to-rest-profile"
it("rests exactly at both endpoints, including waiting outside the interval", () => {
  for (const time of [-1, 0]) expect(getRestToRestProfile(time)).toEqual({ position: 0, velocity: 0, acceleration: 0 })
  for (const time of [1, 2]) expect(getRestToRestProfile(time)).toEqual({ position: 1, velocity: 0, acceleration: 0 })
  expect(getRestToRestProfile(NaN)).toBeInstanceOf(Error)
})
it("matches its derivative bounds at their exact extrema", () => {
  const middle = getRestToRestProfile(0.5)
  if (middle instanceof Error) throw middle
  expect(middle.velocity).toBe(REST_TO_REST_MAX_SPEED)
  for (const time of [(3 - Math.sqrt(3)) / 6, (3 + Math.sqrt(3)) / 6]) {
    const profile = getRestToRestProfile(time)
    if (profile instanceof Error) throw profile
    expect(Math.abs(profile.acceleration)).toBeCloseTo(REST_TO_REST_MAX_ACCELERATION, 12)
  }
})
