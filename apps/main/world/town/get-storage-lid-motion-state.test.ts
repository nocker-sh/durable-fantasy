import { expect, it } from "vitest"
import { storageLidPlan } from "#/world/town/storage-lid-plan"
import { storageLidState } from "#/world/town/storage-lid-state"
import { getStorageLidMotionState } from "#/world/town/get-storage-lid-motion-state"
const plan = storageLidPlan({
  withdrawn: { x0: 1.5, x1: 2.5, y0: 0, y1: 0.62, z0: 4, z1: 4.5 },
  wall: 0.025,
  lid: 0.025,
  handle: { axis: "z", span: 0.28, depth: 0.02, height: 0.14, thickness: 0.01, offset: [0, -0.44] },
  lift: 0.05,
  rest: [2, 0.455, 4.75],
})

it("joins every exact endpoint with the same fixed body and rigid cover parts", () => {
  const before = JSON.stringify(plan)
  for (const segment of [0, 1, 2])
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      const state = getStorageLidMotionState({ plan, segment, progress })
      if (state instanceof Error) throw state
      expect(state.parts.filter((part) => part.part !== "lid" && part.part !== "lid-handle")).toEqual(plan.body)
      if (progress === 0) expect(state.parts).toEqual(storageLidState(plan, segment))
      if (progress === 1) expect(state.parts).toEqual(storageLidState(plan, segment + 1))
      const cover = state.parts.filter((part) => part.part === "lid" || part.part === "lid-handle")
      for (const index of cover.keys())
        for (const axis of ["x", "y", "z"] satisfies ("x" | "y" | "z")[])
          expect(cover[index][`${axis}1`] - cover[index][`${axis}0`]).toBeCloseTo(plan.cover[index][`${axis}1`] - plan.cover[index][`${axis}0`], 12)
    }
  expect(JSON.stringify(plan)).toBe(before)
})

it("rejects out-of-range and nonfinite progress without returning disconnected parts", () => {
  for (const segment of [-1, 3, 0.5, NaN]) expect(getStorageLidMotionState({ plan, segment, progress: 0.5 })).toBeInstanceOf(Error)
  for (const progress of [-0.1, 1.1, NaN, Infinity]) expect(getStorageLidMotionState({ plan, segment: 0, progress })).toBeInstanceOf(Error)
})
