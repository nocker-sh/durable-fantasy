import { readFileSync } from "node:fs"
import { expect, it, vi } from "vitest"
import * as calculator from "#/scripts/lib/calculate-front-access-handle-plan"
import { createFrontAccessPlanFrame } from "#/scripts/lib/create-front-access-plan-frame"
import { getFrontAccessHandlePlan } from "#/scripts/lib/get-front-access-handle-plan"
import { getFrontAccessStorageError } from "#/scripts/lib/get-front-access-storage-error"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
const fixture = () => {
  const room = readSetting(readFileSync(".docs/settings/rooms/room-h1-3.md", "utf8"))
  const building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0] }
}
it("shares one fixed plan across the complete review without changing any source or skipping sample checks", () => {
  const source = fixture()
  const before = JSON.stringify(source)
  const spy = vi.spyOn(calculator, "calculateFrontAccessHandlePlan")
  try {
    expect(getFrontAccessStorageError(source)).toBeNull()
    expect(spy).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(source)).toBe(before)
  } finally {
    spy.mockRestore()
  }
})
it("validates lazily, rejects another source and never shares a plan between review invocations", () => {
  const source = fixture()
  const spy = vi.spyOn(calculator, "calculateFrontAccessHandlePlan")
  try {
    const prepared = createFrontAccessPlanFrame(source)
    expect(spy).not.toHaveBeenCalled()
    const first = getFrontAccessHandlePlan({ ...source, prepared })
    expect(first).not.toBeInstanceOf(Error)
    expect(getFrontAccessHandlePlan({ ...source, prepared })).toBe(first)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(getFrontAccessHandlePlan({ ...source, slot: { ...source.slot }, prepared })).toEqual(new Error("Prepared cabinet plan belongs to different source documents"))
    expect(getFrontAccessHandlePlan({ ...source, prepared: createFrontAccessPlanFrame(source) })).not.toBe(first)
    expect(spy).toHaveBeenCalledTimes(2)
  } finally {
    spy.mockRestore()
  }
})
