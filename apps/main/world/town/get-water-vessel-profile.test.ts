import { expect, it } from "vitest"
import { getWaterVesselProfile } from "#/world/town/get-water-vessel-profile"
import { getWaterVesselParts } from "#/world/town/get-water-vessel-parts"
const dimensions = () => ({
  diameter: 0.228,
  height: 0.264,
  innerDiameter: 0.22,
  usableDepth: 0.24,
  base: 0.008,
  lid: 0.006,
  knobHeight: 0.01,
  knobRadius: 0.018,
  handles: { gap: 0.065, openingHeight: 0.18, radius: 0.01, centreHeight: 0.13 },
})
it("fits the closed cavity, base, lid and knob and connects two loops without entering the cavity", () => {
  const profile = getWaterVesselProfile(dimensions())
  if (profile instanceof Error) throw profile
  const parts = getWaterVesselParts(profile)
  expect(parts).toHaveLength(10)
  expect(profile.capacityLitres).toBeGreaterThan(6)
  expect(profile.halfWidth * 2).toBeLessThan(0.5)
  for (const part of parts) {
    if (part.kind !== "capsule") continue
    expect(Math.min(Math.abs(part.from[0]), Math.abs(part.to[0])) - part.radius).toBeGreaterThanOrEqual(profile.innerRadius)
    expect(Math.min(part.from[1], part.to[1]) - part.radius).toBeGreaterThan(profile.base)
    expect(Math.max(part.from[1], part.to[1]) + part.radius).toBeLessThan(profile.rim)
  }
})
it("rejects a copied cavity depth that leaves no space for the lid knob and loops that cross the rim", () => {
  expect(getWaterVesselProfile({ ...dimensions(), usableDepth: 0.25 })).toBeInstanceOf(Error)
  expect(getWaterVesselProfile({ ...dimensions(), handles: { ...dimensions().handles, centreHeight: 0.2 } })).toBeInstanceOf(Error)
  expect(getWaterVesselProfile({ ...dimensions(), innerDiameter: 0.3 })).toBeInstanceOf(Error)
  expect(getWaterVesselProfile({ ...dimensions(), knobHeight: NaN })).toBeInstanceOf(Error)
})
