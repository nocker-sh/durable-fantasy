import { expect, it } from "vitest"
import { getPouringPotObstacleError } from "#/world/scene/figure/get-pouring-pot-obstacle-error"
type Props = Parameters<typeof getPouringPotObstacleError>[0]
const box = { x0: -1, x1: 1, bottom: -1, top: 1, z0: -1, z1: 1 }
const fields: Props["fields"] = [{ min: [4, 4, 4], max: [5, 5, 5], value: () => 0, lipschitz: 1 }]
const bar: Props["parts"]["bars"][number] = { part: "grip", material: "wood", innerRadius: 0.005, from: [4, 4, 4], to: [5, 4, 4], radius: 0.02 }

it("requires both the filled body and every handle section to clear the obstacle", () => {
  expect(getPouringPotObstacleError({ box, fields, parts: { body: box, bars: [bar] } })).toBeNull()
  expect(getPouringPotObstacleError({ box, fields: [{ min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5], value: () => 0, lipschitz: 1 }], parts: { body: box, bars: [bar] } })).toBeInstanceOf(Error)
  const crossing: typeof bar = { ...bar, from: [-2, 0, 0], to: [2, 0, 0] }
  expect(getPouringPotObstacleError({ box, fields, parts: { body: box, bars: [bar, crossing] } })).toBeInstanceOf(Error)
})

it("does not certify missing components or nonfinite handle geometry", () => {
  expect(getPouringPotObstacleError({ box, fields: [], parts: { body: box, bars: [bar] } })).toBeInstanceOf(Error)
  expect(getPouringPotObstacleError({ box, fields, parts: { body: box, bars: [] } })).toBeInstanceOf(Error)
  for (const invalid of [NaN, Infinity, -Infinity]) {
    expect(getPouringPotObstacleError({ box, fields, parts: { body: box, bars: [{ ...bar, radius: invalid }] } })).toBeInstanceOf(Error)
    expect(getPouringPotObstacleError({ box, fields, parts: { body: box, bars: [{ ...bar, from: [invalid, 4, 4] }] } })).toBeInstanceOf(Error)
  }
})
