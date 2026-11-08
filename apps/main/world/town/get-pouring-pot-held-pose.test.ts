import { expect, it } from "vitest"
import { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import { getPouringPotHeldPose } from "#/world/town/get-pouring-pot-held-pose"
import { getPouringPotTiltPose } from "#/world/town/get-pouring-pot-tilt-pose"
import { getPosedPotBottom } from "#/world/town/get-posed-pot-bottom"
const fixture = () => {
  const profile = getPouringPotProfile({
    diameter: 0.2,
    height: 0.18,
    baseDiameter: 0.18,
    wall: 0.004,
    bottom: 0.008,
    fillLine: 0.12,
    lipStart: 0.13,
    lipLength: 0.04,
    lipHalfAngle: Math.PI / 6,
    bailHeight: 0.36,
    bailForward: 0.06,
    bailSpan: 0.34,
    bailRadius: 0.008,
    gripLength: 0.22,
    gripRadius: 0.016,
    lidRadius: 0.097,
    lidThickness: 0.004,
    knobHeight: 0.025,
    knobRadius: 0.018,
  })
  if (profile instanceof Error) throw profile
  return profile
}
it("holds the real offset grip fixed while the body and lip rotate around it", () => {
  const profile = fixture(),
    upright = getPouringPotHeldPose({ profile, gripAt: [1, 1.5, 2], heading: 0, tilt: 0 }),
    tilted = getPouringPotHeldPose({ profile, gripAt: [1, 1.5, 2], heading: 0, tilt: Math.PI / 2 })
  if (upright instanceof Error) throw upright
  if (tilted instanceof Error) throw tilted
  expect(upright.gripAt).toEqual([1, 1.5, 2])
  expect(tilted.gripAt).toEqual(upright.gripAt)
  expect(upright.at).toEqual([expect.closeTo(0.94, 12), expect.closeTo(1.14, 12), 2])
  expect(tilted.at).toEqual([expect.closeTo(0.64, 12), expect.closeTo(1.56, 12), 2])
  expect(upright.lipAt).toEqual([expect.closeTo(1.08, 12), expect.closeTo(1.32, 12), 2])
  expect(tilted.lipAt).toEqual([expect.closeTo(0.82, 12), expect.closeTo(1.42, 12), 2])
  expect(getPouringPotHeldPose({ profile, gripAt: [NaN, 1, 2], heading: 0, tilt: 0 })).toBeInstanceOf(Error)
})
it("raises the entire vessel over the clearance plane and rejects invalid tilt paths", () => {
  const profile = fixture(),
    finalTilt = (Math.PI * 5) / 12,
    finalPose = getPouringPotPose({ profile, lipAt: [0, 0.9, 0], heading: -Math.PI / 2, tilt: finalTilt })
  if (finalPose instanceof Error) throw finalPose
  const props = { profile, finalPose, heading: -Math.PI / 2, finalTilt, backset: 0.1, clearancePlane: getPosedPotBottom({ profile, pose: finalPose }) }
  for (const phase of [0, 0.1, 0.3, 0.5, 0.7, 1]) {
    const pose = getPouringPotTiltPose({ ...props, tilt: finalTilt * phase })
    if (pose instanceof Error) throw pose
    expect(getPosedPotBottom({ profile, pose })).toBeCloseTo(props.clearancePlane, 12)
    if (phase === 1) for (const axis of [0, 1, 2]) expect(pose.at[axis]).toBeCloseTo(finalPose.at[axis], 12)
  }
  for (const invalid of [{ finalTilt: 0 }, { backset: -0.1 }, { clearancePlane: NaN }, { tilt: -1 }, { tilt: finalTilt + 0.01 }])
    expect(getPouringPotTiltPose({ ...props, tilt: 0, ...invalid })).toBeInstanceOf(Error)
})

it("keeps a forward grip inside the complete outer bounds and refuses bars below the base", () => {
  const profile = fixture(),
    wide = getPouringPotProfile({ ...profile.dimensions, bailForward: 0.1, bailHeight: 0.5, bailSpan: 0.5, gripRadius: 0.09 })
  if (wide instanceof Error) throw wide
  expect(wide.max[0]).toBeCloseTo(0.19, 12)
  expect(wide.width).toBeCloseTo(0.29, 12)
  expect(
    getPouringPotProfile({ ...profile.dimensions, diameter: 0.2, baseDiameter: 0.2, height: 0.02, bottom: 0.001, fillLine: 0.01, lipStart: 0.015, bailRadius: 0.016, gripRadius: 0.02 }),
  ).toBeInstanceOf(Error)
})
