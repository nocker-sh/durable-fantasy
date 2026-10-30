import { expect, it } from "vitest"
import { getCarryStepDirection, type CarryStepDirection } from "#/world/town/get-carry-step-direction"
const headings: ReadonlyArray<{ turn: number; directions: ReadonlyArray<readonly [CarryStepDirection, number, number]> }> = [
  {
    turn: 0,
    directions: [
      ["forward", 0, 1],
      ["backward", 0, -1],
      ["side_left", 1, 0],
      ["side_right", -1, 0],
    ],
  },
  {
    turn: 1,
    directions: [
      ["forward", -1, 0],
      ["backward", 1, 0],
      ["side_left", 0, 1],
      ["side_right", 0, -1],
    ],
  },
  {
    turn: 2,
    directions: [
      ["forward", 0, -1],
      ["backward", 0, 1],
      ["side_left", -1, 0],
      ["side_right", 1, 0],
    ],
  },
  {
    turn: 3,
    directions: [
      ["forward", 1, 0],
      ["backward", -1, 0],
      ["side_left", 0, -1],
      ["side_right", 0, 1],
    ],
  },
]
it.each(headings)("uses carrier-local directions for turn $turn", (heading) => {
  for (const direction of heading.directions) expect(getCarryStepDirection({ from: [4.8, 6.25], to: [4.8 + direction[1] * 1.5, 6.25 + direction[2] * 1.5], turn: heading.turn })).toBe(direction[0])
})
it("does not invent a gait for zero, diagonal, nonfinite or invalid facing input", () => {
  expect(getCarryStepDirection({ from: [0, 0], to: [0, 0], turn: 0 })).toEqual(new Error("Carry step has no movement"))
  expect(getCarryStepDirection({ from: [0, 0], to: [1, 1], turn: 0 })).toEqual(new Error("Diagonal carry step needs an authored gait"))
  expect(getCarryStepDirection({ from: [0, 0], to: [NaN, 1], turn: 0 })).toEqual(new Error("Invalid carry step geometry"))
  expect(getCarryStepDirection({ from: [0, 0], to: [0, 1], turn: 4 })).toEqual(new Error("Invalid carry step geometry"))
})
