import { expect, it } from "vitest"
import { getGroundBoxLidPlan } from "#/world/town/get-ground-box-lid-plan"
import { storageLidState } from "#/world/town/storage-lid-state"
import { getStoragePathError } from "#/world/town/get-storage-path-error"
import { cuboidTranslationHits } from "../../lib/engine/cuboid-translation-hits"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
const box = { x0: 1.5, x1: 2.5, y0: 0, y1: 0.48, z0: 4, z1: 4.5 }
const contents: readonly LayoutBox[] = [{ id: "clothing", origin: [0.015, 0, 0.015], size: [0.4, 0.16, 0.4] }]
const rest: Point3 = [2, 0, 5.05]
const proposal = { box, wall: 0.025, lid: 0.025, lift: 0.15, rest, contents, section: { bounds: { x0: 0.5, x1: 2.5, z0: 0.5, z1: 6 }, ceiling: 2.2, obstacles: [] } }

it("keeps the chest and contents fixed while the same whole lid travels to a floor rest and returns", () => {
  const before = JSON.stringify(proposal),
    plan = getGroundBoxLidPlan(proposal)
  if (plan instanceof Error) throw plan
  const closed = storageLidState(plan, 0),
    opened = storageLidState(plan, 3)
  expect(opened.filter((part) => part.part !== "lid")).toEqual(closed.filter((part) => part.part !== "lid"))
  expect(opened.find((part) => part.part === "lid")).toMatchObject({ x0: 1.5, x1: 2.5, y0: 0, z0: 4.8, z1: 5.3 })
  expect(plan.cover).toHaveLength(1)
  expect(getStoragePathError({ parts: plan.cover, offsets: [...plan.offsets].reverse(), section: proposal.section, name: "Return lid" })).toBeNull()
  expect(storageLidState(plan, 0)).toEqual(plan.original)
  expect(JSON.stringify(proposal)).toBe(before)
})

it("rejects an obstacle hit only between clear endpoints", () => {
  const plan = getGroundBoxLidPlan(proposal)
  if (plan instanceof Error) throw plan
  const obstacle = { x0: 1.8, x1: 2.2, z0: 4.63, z1: 4.67, bottom: 0.61, top: 0.62 }
  for (const offset of plan.offsets)
    for (const part of plan.cover)
      expect(cuboidTranslationHits({ relative: { x0: part.x0, x1: part.x1, bottom: part.y0, top: part.y1, z0: part.z0, z1: part.z1 }, from: offset, to: offset, obstacle: obstacle })).toBe(false)
  expect(getGroundBoxLidPlan({ ...proposal, section: { ...proposal.section, obstacles: [obstacle] } })).toEqual(new Error("Storage lid movement intersects an obstacle"))
})

it("rejects false supports, impossible contents, invalid lifts and an obstructed floor rest", () => {
  expect(getGroundBoxLidPlan({ ...proposal, box: { ...box, y0: 0.1 } })).toBeInstanceOf(Error)
  expect(getGroundBoxLidPlan({ ...proposal, rest: [2, 0.1, 5.05] })).toBeInstanceOf(Error)
  expect(getGroundBoxLidPlan({ ...proposal, contents: [{ ...contents[0], size: [1, 0.2, 0.4] }] })).toBeInstanceOf(Error)
  for (const lift of [0, -0.1, NaN, Infinity]) expect(getGroundBoxLidPlan({ ...proposal, lift })).toBeInstanceOf(Error)
  expect(getGroundBoxLidPlan({ ...proposal, section: { ...proposal.section, ceiling: 0.6 } })).toBeInstanceOf(Error)
  expect(getGroundBoxLidPlan({ ...proposal, section: { ...proposal.section, obstacles: [{ x0: 1.8, x1: 2, z0: 5, z1: 5.2, bottom: 0, top: 0.1 }] } })).toBeInstanceOf(Error)
})
