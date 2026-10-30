import { expect, it } from "vitest"
import { getAshReceivingParts } from "#/scripts/lib/get-ash-receiving-parts"
import type { ShelfItem } from "#/world/town/shelf"
const box: ShelfItem = {
  id: "ash",
  kind: "box",
  boxMaterial: "iron",
  board: 0,
  across: 0,
  fromBack: 0,
  width: 0.32,
  depth: 0.28,
  height: 0.26,
  wall: 0.0015,
  lid: 0.0015,
  lidHandle: { span: 0.08, depth: 0.018, height: 0.04, thickness: 0.003 },
}
const receiving = {
  method: "lift_transfer",
  position_m: [5.5, 1.9],
  status: "unverified",
  grip_candidate: { body_m: [0, 0], facing: "e", poles: { l: [-1, -1, 0], r: [1, -1, 0] }, status: "unverified" },
  transport_candidate: {
    status: "unverified",
    model: "fixed_pose_translation",
    gait_review: { animation: "carry", scope: "rendered_phases", status: "unverified", side_step: null, step_plan: [{ direction: "side_left", animation: null, playback: null }] },
    body_path_m: [
      [0, 0],
      [0, 1],
    ],
  },
  approach: {
    state: "empty",
    transition: "unverified",
    poses: [
      [0, 0],
      [0, 1],
    ],
  },
}
it("opens the actual stored box on the floor without leaving a second lid at the receiving position", () => {
  const parts = getAshReceivingParts({ box, front: "w", receiving })
  if (parts instanceof Error) throw parts
  expect(parts).toHaveLength(5)
  expect(parts.map((part) => part.part)).toEqual(["bottom", "side", "side", "side", "side"])
  expect(Math.min(...parts.map((part) => part.y0))).toBe(0)
  expect(Math.max(...parts.map((part) => part.y1))).toBeCloseTo(box.height - box.lidHandle!.height - box.lid!, 12)
  expect(Math.max(...parts.map((part) => part.x1)) - Math.min(...parts.map((part) => part.x0))).toBeCloseTo(box.depth, 12)
})
it("does not accept direct raking, a completed operation or nonfinite placement", () => {
  for (const placement of [
    { ...receiving, method: "rake" },
    { ...receiving, status: "verified" },
    { ...receiving, position_m: [NaN, 1.9] },
  ])
    expect(getAshReceivingParts({ box, front: "w", receiving: placement })).toEqual(new Error("Ash receiver needs an unverified lifted-transfer placement"))
})

it("reports invalid physical box dimensions through the same placement boundary", () => {
  expect(getAshReceivingParts({ box: { ...box, width: -0.32 }, front: "w", receiving })).toBeInstanceOf(Error)
})
