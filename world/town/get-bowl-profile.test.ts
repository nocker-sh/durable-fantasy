import { expect, it } from "vitest"
import { getBowlProfile } from "#/world/town/get-bowl-profile"

const bowl = { diameter: 0.16, height: 0.06, baseDiameter: 0.08, wall: 0.006, bottom: 0.006 }
it("keeps a flat base, an open rim and usable capacity inside the measured outer bounds", () => {
  const profile = getBowlProfile(bowl)
  if (profile instanceof Error) throw profile

  expect(profile.floorContactRadius).toBe(0.04)
  expect(profile.rimContactRadius).toBeCloseTo(0.077)
  expect(profile.rimContactRadius).toBeGreaterThan(profile.innerProfile[0][0])
  expect(profile.outerProfile[0]).toEqual([0, 0])
  expect(profile.outerProfile[1]).toEqual([0.04, 0])
  expect(profile.innerProfile.at(-1)).toEqual([0, 0.006])
  expect(profile.innerProfile[0][0]).toBeLessThan(profile.outerProfile.at(-1)![0])
  expect(profile.capacity).toBeGreaterThan(0.0005)
  expect(profile.capacity).toBeLessThan(0.0006)
})
it.each([{ wall: 0.04 }, { bottom: 0.06 }, { baseDiameter: 0.2 }, { height: 0 }, { diameter: Infinity }, { bottom: NaN }])("rejects bowls without a valid base or hollow: %j", (change) => {
  expect(getBowlProfile({ ...bowl, ...change })).toBeInstanceOf(Error)
})
