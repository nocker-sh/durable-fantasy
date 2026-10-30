import { readFileSync } from "node:fs"
import { afterEach, expect, it, vi } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import * as frames from "#/scripts/lib/get-front-access-handle-step-frame"
import { getFrontAccessHandleStepCycleError } from "#/scripts/lib/get-front-access-handle-step-cycle-error"
const fixture = () => {
  const room = readSetting(readFileSync(".docs/settings/rooms/room-h1-3.md", "utf8"))
  const building = readSetting(readFileSync(".docs/settings/buildings/building-h1.md", "utf8"))
  return { room, building, slot: personalStorageSchema.parse(room.personal_storage)[0], leaf: "north", cycle: 0, samples: 8 } satisfies Parameters<typeof getFrontAccessHandleStepCycleError>[0]
}
afterEach(() => vi.restoreAllMocks())

it("prepares independent support anchors once per cycle while checking every sample", () => {
  const props = fixture(),
    before = JSON.stringify(props),
    spy = vi.spyOn(frames, "getFrontAccessHandleStepFrame")
  expect(getFrontAccessHandleStepCycleError(props)).toBeNull()
  expect(spy).toHaveBeenCalledTimes(11)
  const first = spy.mock.results[0],
    anchor = spy.mock.results[1]
  expect(first?.type).toBe("return")
  expect(anchor?.type).toBe("return")
  expect(first?.value).not.toBe(anchor?.value)
  for (const phase of [0, 0.5]) expect(spy.mock.calls.filter((call) => call[0].phase === phase)).toHaveLength(2)
  expect(getFrontAccessHandleStepCycleError({ ...props, cycle: 1 })).toBeNull()
  expect(spy).toHaveBeenCalledTimes(22)
  expect(JSON.stringify(props)).toBe(before)
})

it("still rejects a displaced shoe at a later sample", () => {
  const compute = frames.getFrontAccessHandleStepFrame
  const spy = vi.spyOn(frames, "getFrontAccessHandleStepFrame").mockImplementation((props) => {
    const frame = compute(props)
    if (frame instanceof Error || props.phase !== 0.75) return frame
    return { ...frame, posed: { ...frame.posed, rootY: frame.posed.rootY + 0.05 } }
  })
  expect(getFrontAccessHandleStepCycleError(fixture())).toBeInstanceOf(Error)
  expect(spy.mock.calls.some((call) => call[0].phase === 0.75)).toBe(true)
})

it("rejects invalid sample counts before evaluating frames", () => {
  const spy = vi.spyOn(frames, "getFrontAccessHandleStepFrame")
  for (const samples of [0, 1, 2.5, 129, NaN]) expect(getFrontAccessHandleStepCycleError({ ...fixture(), samples })).toEqual(new Error("Invalid raised-handle step sampling"))
  expect(spy).not.toHaveBeenCalled()
})
