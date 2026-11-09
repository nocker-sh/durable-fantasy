import { expect, it } from "vitest"
import { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import { getPouringPotLayout } from "#/world/town/get-pouring-pot-layout"
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

const station = () =>
  ({
    profile: fixture(),
    stove: { x0: 2, z0: 3, x1: 3, z1: 4 },
    plate: { x0: 2.1, z0: 3.1, x1: 2.3, z1: 3.3, bottom: 0.79, top: 0.8 },
    masonry: [{ x0: 2.5, z0: 3.5, x1: 3, z1: 4, bottom: 0, top: 0.8 }],
    shaft: { x0: 2.8, z0: 3, x1: 3, z1: 3.3 },
    heating: [0.2, 0.2],
    resting: [0.7, 0.7],
    restArea: [0.5, 0.5, 0.5, 0.5],
  }) satisfies Parameters<typeof getPouringPotLayout>[0]

it("supports the whole base while the lip and carrying bridge extend beyond the plate", () => {
  const props = station(),
    result = getPouringPotLayout(props)
  if (result instanceof Error) throw result
  expect(result.heated.x0).toBeLessThan(props.plate.x0)
  expect(result.heated.z0).toBeLessThan(props.plate.z0)
  expect(result.heated.z1).toBeGreaterThan(props.plate.z1)
  expect(result.heating).toEqual([2.2, 0.8, 3.2])
})

it("refuses an unsupported base and any whole-vessel overhang outside the stove", () => {
  const props = station()
  expect(getPouringPotLayout({ ...props, plate: { ...props.plate, x1: 2.28 } })).toBeInstanceOf(Error)
  expect(getPouringPotLayout({ ...props, stove: { ...props.stove, x1: 2.29 } })).toBeInstanceOf(Error)
})

it("preserves complete-object clearance from the chimney and reserved resting area", () => {
  const props = station()
  expect(getPouringPotLayout({ ...props, shaft: { x0: 2.1, x1: 2.3, z0: 3.34, z1: 3.4 } })).toEqual(new Error("Pouring pot stations conflict with the lid or chimney"))
  expect(getPouringPotLayout({ ...props, resting: [0.2, 0.52], restArea: [0.05, 0.34, 0.4, 0.5], masonry: [{ x0: 2, x1: 2.5, z0: 3.3, z1: 4, bottom: 0, top: 0.8 }] })).toEqual(
    new Error("Pouring pot stations conflict with the lid or chimney"),
  )
})

it("accepts continuous coplanar masonry across a seam and rejects gaps or lower support", () => {
  const props = station(),
    left = { x0: 2.5, z0: 3.5, x1: 2.75, z1: 4, bottom: 0, top: 0.8 },
    right = { x0: 2.75, z0: 3.5, x1: 3, z1: 4, bottom: 0, top: 0.8 }
  for (const masonry of [
    [left, right],
    [right, left],
  ])
    expect(getPouringPotLayout({ ...props, masonry })).not.toBeInstanceOf(Error)
  expect(getPouringPotLayout({ ...props, masonry: [left, { ...right, x0: 2.750001 }] })).toEqual(new Error("Hot-pot rest area has no continuous masonry support"))
  expect(getPouringPotLayout({ ...props, masonry: [left, { ...right, top: 0.79 }] })).toEqual(new Error("Hot-pot rest area has no continuous masonry support"))
})

it("rejects masonry with no finite positive solid beneath its supporting face", () => {
  const props = station(),
    masonry = props.masonry[0]
  for (const vertical of [
    { bottom: 0.8, top: 0.8 },
    { bottom: 0.9, top: 0.8 },
    { bottom: NaN, top: 0.8 },
    { bottom: -Infinity, top: 0.8 },
    { bottom: 0, top: Infinity },
  ])
    expect(getPouringPotLayout({ ...props, masonry: [{ ...masonry, ...vertical }] })).toEqual(new Error("Invalid pouring pot support geometry"))
})
