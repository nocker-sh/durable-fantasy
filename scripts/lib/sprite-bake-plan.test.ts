import { expect, it } from "vitest"
import { createSpriteBakePlan } from "./create-sprite-bake-plan"
import { getSpriteBakeResumeError } from "./get-sprite-bake-resume-error"
import { getSpriteBakeJobs } from "./get-sprite-bake-jobs"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"

const manifest = () =>
  ({
    rendererVersion: 6,
    frame: [80, 96],
    residents: [
      { name: "アントン", key: "a", anims: { idle: 2, look: 4 } },
      { name: "ベルタ", key: "b", anims: { idle: 2, look: 4 } },
    ],
  }) satisfies SpriteManifest

it("owns an immutable input snapshot and plans every animation in eight directions", () => {
  const source = manifest()
  const plan = createSpriteBakePlan({ source, previous: null, only: null })
  if (plan instanceof Error) throw plan
  source.frame[0] = 81
  source.residents[0].key = "changed"
  source.residents[0].anims.idle = 9
  expect(plan.source.frame).toEqual([80, 96])
  expect(plan.output.frame).toEqual([80, 96])
  expect(Object.isFrozen(plan.selected)).toBe(true)
  expect(plan.source.residents[0].key).toBe("a")
  expect(plan.source.residents[0].anims.idle).toBe(2)
  expect(Object.isFrozen(plan.source.residents[0].anims)).toBe(true)
  expect(plan.selected).toEqual([0, 1])
  expect(getSpriteBakeJobs(plan)).toHaveLength(32)
  expect(
    getSpriteBakeJobs(plan)
      .filter((job) => job.resident === 1 && job.anim === "look")
      .map((job) => job.view),
  ).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
})

it("updates only generated residents and retains the ungenerated look and animation metadata", () => {
  const source = manifest()
  const previous = manifest()
  source.residents[0].key = "new-a"
  source.residents[1].key = "new-b"
  previous.residents[1].anims.idle = 7
  const plan = createSpriteBakePlan({ source, previous, only: ["アントン"] })
  if (plan instanceof Error) throw plan
  expect(plan.selected).toEqual([0])
  expect(plan.output.residents[0].key).toBe("new-a")
  expect(plan.output.residents[1]).toEqual(previous.residents[1])
  expect(plan.output.residents[1]).not.toBe(previous.residents[1])
  expect(getSpriteBakeJobs(plan).every((job) => job.resident === 0)).toBe(true)
})

it.each([{ only: [] }, { only: ["不明"] }, { only: ["アントン", "アントン"] }])("rejects an invalid selection before any output: %j", (input) => {
  expect(createSpriteBakePlan({ source: manifest(), previous: manifest(), only: input.only })).toBeInstanceOf(Error)
})

it("requires the same renderer, dimensions and resident indices for partial output", () => {
  const source = manifest()
  const previous = manifest()
  expect(createSpriteBakePlan({ source, previous: null, only: ["アントン"] })).toBeInstanceOf(Error)
  expect(createSpriteBakePlan({ source, previous: { ...previous, rendererVersion: 5 }, only: ["アントン"] })).toBeInstanceOf(Error)
  expect(createSpriteBakePlan({ source, previous: { ...previous, frame: [81, 96] }, only: ["アントン"] })).toBeInstanceOf(Error)
  expect(createSpriteBakePlan({ source, previous: { ...previous, residents: [...previous.residents].reverse() }, only: ["アントン"] })).toBeInstanceOf(Error)
})

it("rejects a source without a renderer version", () => {
  const source = manifest()
  expect(createSpriteBakePlan({ source: { frame: source.frame, residents: source.residents }, previous: null, only: null })).toBeInstanceOf(Error)
})

it("resumes only the exact pending inputs while ignoring animation dictionary order", () => {
  const plan = createSpriteBakePlan({ source: manifest(), previous: null, only: null })
  if (plan instanceof Error) throw plan
  const reordered = { ...plan, source: { ...plan.source, residents: plan.source.residents.map((resident) => ({ ...resident, anims: { look: 4, idle: 2 } })) } }
  expect(getSpriteBakeResumeError(plan, reordered)).toBeNull()
  for (const stored of [
    null,
    { ...plan, format: 2 },
    { ...plan, selected: [1] },
    { ...plan, scope: "selected" },
    { ...plan, source: { ...plan.source, rendererVersion: 5 } },
    { ...plan, source: { ...plan.source, frame: [81, 96] } },
    { ...plan, source: { ...plan.source, residents: [...plan.source.residents].reverse() } },
    { ...plan, output: { ...plan.output, residents: [] } },
  ]) {
    expect(getSpriteBakeResumeError(plan, stored)).toBeInstanceOf(Error)
  }
  const changed = manifest()
  changed.residents[0].key = "new-a"
  const other = createSpriteBakePlan({ source: changed, previous: null, only: null })
  if (other instanceof Error) throw other
  expect(getSpriteBakeResumeError(other, plan)).toBeInstanceOf(Error)
  changed.residents[0].key = "a"
  changed.residents[0].anims.look = 5
  const differentLength = createSpriteBakePlan({ source: changed, previous: null, only: null })
  if (differentLength instanceof Error) throw differentLength
  expect(getSpriteBakeResumeError(differentLength, plan)).toBeInstanceOf(Error)
})
