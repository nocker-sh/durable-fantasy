import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { ashReceivingSchema } from "#/scripts/lib/ash-receiving-schema"
import { readSetting } from "#/scripts/lib/read-setting"
import { getAshStepPlanError } from "#/scripts/lib/get-ash-step-plan-error"
const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h-m5-1.md", import.meta.url), "utf8"))
const receiving = ashReceivingSchema.parse(room.furniture?.find((furniture) => furniture.hearth_maintenance)?.hearth_maintenance?.ash_receiver?.receiving)
it("describes the actual corridor without pretending its assigned gait candidates are adopted", () => {
  expect(getAshStepPlanError({ receiving, turn: 3 })).toBeNull()
  expect(receiving.transport_candidate.gait_review.step_plan.map((step) => step.direction)).toEqual(["backward", "side_left", "forward", "side_left"])
  expect(receiving.transport_candidate.gait_review.step_plan.filter((step) => step.animation === null)).toHaveLength(0)
  expect(receiving.transport_candidate.status).toBe("unverified")
})
it("rejects missing steps, stale directions and a forward clip on a retreat", () => {
  const transport = receiving.transport_candidate,
    review = transport.gait_review,
    steps = review.step_plan
  expect(getAshStepPlanError({ receiving: { ...receiving, transport_candidate: { ...transport, gait_review: { ...review, step_plan: steps.slice(1) } } }, turn: 3 })).toEqual(
    new Error("Carry step plan does not cover its corridor"),
  )
  expect(
    getAshStepPlanError({
      receiving: { ...receiving, transport_candidate: { ...transport, gait_review: { ...review, step_plan: [{ ...steps[0], direction: "forward" }, ...steps.slice(1)] } } },
      turn: 3,
    }),
  ).toEqual(new Error("Carry step 0 disagrees with its movement direction"))
  expect(
    getAshStepPlanError({
      receiving: { ...receiving, transport_candidate: { ...transport, gait_review: { ...review, step_plan: [{ ...steps[0], animation: "carry", playback: "forward" }, ...steps.slice(1)] } } },
      turn: 3,
    }),
  ).toEqual(new Error("Carry step 0 cannot use a forward gait"))
})
it("rejects changing the facing or introducing a diagonal without an authored gait", () => {
  expect(getAshStepPlanError({ receiving, turn: 2 })).toEqual(new Error("Carry step 0 disagrees with its movement direction"))
  const transport = receiving.transport_candidate,
    path = transport.body_path_m
  expect(getAshStepPlanError({ receiving: { ...receiving, transport_candidate: { ...transport, body_path_m: [path[0], [path[1][0], path[1][1] + 0.2], ...path.slice(2)] } }, turn: 3 })).toEqual(
    new Error("Diagonal carry step needs an authored gait"),
  )
})
it("does not reverse a forward step or substitute reversed forward walking for a sidestep", () => {
  const transport = receiving.transport_candidate,
    review = transport.gait_review
  for (const index of [1, 2]) {
    const step_plan = review.step_plan.map((step, i) => (i === index ? { ...step, animation: "carry", playback: "reverse" } : step))
    const parsed = ashReceivingSchema.parse({ ...receiving, transport_candidate: { ...transport, gait_review: { ...review, step_plan } } })
    expect(getAshStepPlanError({ receiving: parsed, turn: 3 })).toEqual(new Error(`Carry step ${index} cannot use a reverse gait`))
  }
})
it("does not attach playback to an unassigned animation", () => {
  const transport = receiving.transport_candidate,
    review = transport.gait_review
  expect(
    ashReceivingSchema.safeParse({ ...receiving, transport_candidate: { ...transport, gait_review: { ...review, step_plan: [{ direction: "side_left", animation: null, playback: "reverse" }] } } })
      .success,
  ).toBe(false)
})
it("does not assign procedural side-stepping without dimensions or to a forward segment", () => {
  const transport = receiving.transport_candidate,
    review = transport.gait_review
  expect(getAshStepPlanError({ receiving: { ...receiving, transport_candidate: { ...transport, gait_review: { ...review, side_step: null } } }, turn: 3 })).toEqual(
    new Error("Carry step 1 lacks a valid authored side-step"),
  )
  const parsed = ashReceivingSchema.parse({
    ...receiving,
    transport_candidate: { ...transport, gait_review: { ...review, step_plan: review.step_plan.map((step, index) => (index === 2 ? { ...step, animation: "side_step", playback: null } : step)) } },
  })
  expect(getAshStepPlanError({ receiving: parsed, turn: 3 })).toEqual(new Error("Carry step 2 lacks a valid authored side-step"))
})
