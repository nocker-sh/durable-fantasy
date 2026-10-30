import { expect, it } from "vitest"
import { getBoxLidPlan } from "#/world/town/get-box-lid-plan"
import { workTableSections } from "#/world/town/work-table"
import { storageLidState } from "#/world/town/storage-lid-state"
import { getStoragePathError } from "#/world/town/get-storage-path-error"
import type { Point3 } from "../../lib/engine/cuboid-motion-types"
const parts = workTableSections({ surface: { height: 0.455, thickness: 0.025, legWidth: 0.04, legInset: 0.06, kneeClearance: 0.1 }, x: 2, z: 4.75, width: 1, depth: 0.5 })
const obstacles = parts.map((part) => ({ x0: part.x0, x1: part.x1, z0: part.z0, z1: part.z1, bottom: part.y0, top: part.y1 }))
const proposal = {
  handle: null,
  box: { x0: 1.5, x1: 2.5, y0: 0, y1: 0.48, z0: 4, z1: 4.5 },
  wall: 0.025,
  lid: 0.025,
  lift: 0.15,
  rest: [2, 0.455, 4.75] satisfies Point3,
  contents: [],
  support: obstacles[0],
  section: { bounds: { x0: 0.5, x1: 2.5, z0: 0.5, z1: 6 }, ceiling: 2.2, obstacles },
}

it("rests the whole same board on the actual table top and clears all four legs in both directions", () => {
  const before = JSON.stringify(proposal),
    plan = getBoxLidPlan(proposal)
  if (plan instanceof Error) throw plan
  const final = storageLidState(plan, 3).find((part) => part.part === "lid")
  expect(final).toMatchObject({ x0: proposal.support.x0, x1: proposal.support.x1, z0: proposal.support.z0, z1: proposal.support.z1, y0: proposal.support.top })
  expect(getStoragePathError({ parts: plan.cover, offsets: [...plan.offsets].reverse(), section: proposal.section, name: "Return lid" })).toBeNull()
  expect(storageLidState(plan, 0)).toEqual(plan.original)
  expect(JSON.stringify(proposal)).toBe(before)
})

it("rejects height-only, partial, displaced and invalid supports instead of a floating or overhanging rest", () => {
  const unsupported = getBoxLidPlan({ ...proposal, support: null })
  expect(unsupported).toBeInstanceOf(Error)
  if (!(unsupported instanceof Error)) throw new Error("Expected missing-support rejection")
  expect(unsupported.message).toContain("physical support")
  for (const support of [
    { ...proposal.support, x0: 1.6 },
    { ...proposal.support, z1: 4.9 },
    { ...proposal.support, top: 0.46 },
    { ...proposal.support, bottom: NaN },
  ])
    expect(getBoxLidPlan({ ...proposal, support })).toBeInstanceOf(Error)
  expect(getBoxLidPlan({ ...proposal, rest: [2, 0.455, 4.8] })).toBeInstanceOf(Error)
})

it("checks the table's legs and other obstacles along the complete lid path", () => {
  const post = { x0: 1.8, x1: 2, z0: 4.6, z1: 4.7, bottom: 0, top: 0.7 }
  expect(getBoxLidPlan({ ...proposal, section: { ...proposal.section, obstacles: [...obstacles, post] } })).toBeInstanceOf(Error)
  expect(getBoxLidPlan({ ...proposal, lift: 0.1, rest: [2, 0.7, 4.75], support: { ...proposal.support, bottom: 0.675, top: 0.7 } })).toBeInstanceOf(Error)
})

it("moves all real handle wood with the lid and detects a high obstruction that the bare board clears", () => {
  const needle = { x0: 1.559, x1: 1.561, z0: 4.245, z1: 4.255, bottom: 0.7, top: 0.71 }
  const section = { ...proposal.section, obstacles: [...obstacles, needle] }
  const plain = getBoxLidPlan({ ...proposal, section })
  if (plain instanceof Error) throw plain
  const handle = { axis: "z", span: 0.28, depth: 0.02, height: 0.14, thickness: 0.01, offset: [0, -0.44] } satisfies NonNullable<Parameters<typeof getBoxLidPlan>[0]["handle"]>
  const handled = getBoxLidPlan({ ...proposal, box: { ...proposal.box, y1: 0.62 }, handle, section })
  expect(handled).toBeInstanceOf(Error)
  const clear = getBoxLidPlan({ ...proposal, box: { ...proposal.box, y1: 0.62 }, handle })
  if (clear instanceof Error) throw clear
  expect(clear.cover.filter((part) => part.part === "lid-handle")).toHaveLength(3)
  expect(storageLidState(clear, 3).filter((part) => part.part !== "lid-handle")).toEqual(storageLidState(plain, 3))
})
