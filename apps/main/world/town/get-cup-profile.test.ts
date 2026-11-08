import { expect, it } from "vitest"
import { getCupProfile } from "#/world/town/get-cup-profile"
const dimensions = { diameter: 0.085, height: 0.095, baseDiameter: 0.08, wall: 0.005, bottom: 0.01, handleGap: 0.03, handleRadius: 0.005, handleBottom: 0.025, handleTop: 0.075 }
it("embeds both handle roots in solid wall without entering the hollow", () => {
  const profile = getCupProfile(dimensions)
  if (profile instanceof Error) throw profile
  const slope = (dimensions.diameter - dimensions.baseDiameter) / (2 * dimensions.height)
  for (const root of [profile.handle[0].from, profile.handle[2].to]) {
    const innerMaximum = dimensions.baseDiameter / 2 + slope * (root[1] + dimensions.handleRadius) - dimensions.wall
    const outerMinimum = dimensions.baseDiameter / 2 + slope * (root[1] - dimensions.handleRadius)
    expect(root[0] - dimensions.handleRadius - profile.centre[0]).toBeGreaterThan(innerMaximum)
    expect(root[0] - dimensions.handleRadius - profile.centre[0]).toBeLessThan(outerMinimum)
  }
  expect(profile.handle[1].from).toEqual(profile.handle[0].to)
  expect(profile.handle[2].from).toEqual(profile.handle[1].to)
})
it("refuses handles through the base or mouth and a body without usable hollow", () => {
  for (const change of [{ handleBottom: 0.01 }, { handleTop: 0.095 }, { handleRadius: 0.03 }, { wall: 0.05 }, { bottom: 0.1 }, { handleGap: NaN }])
    expect(getCupProfile({ ...dimensions, ...change })).toBeInstanceOf(Error)
})
