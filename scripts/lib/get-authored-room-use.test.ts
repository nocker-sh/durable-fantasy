import { expect, it } from "vitest"
import { getAuthoredRoomUse } from "#/scripts/lib/get-authored-room-use"

it("preserves authored room roles and maps sleeping rooms explicitly", () => {
  expect(getAuthoredRoomUse("共用")).toBe("共用")
  expect(getAuthoredRoomUse("作業")).toBe("作業場")
  expect(getAuthoredRoomUse("階段")).toBe("土間")
  expect(getAuthoredRoomUse("貯蔵")).toBe("貯蔵")
  expect(getAuthoredRoomUse("寝")).toBe("寝間")
  for (const unsupported of [null, undefined, 0, "", "unknown", "toString"]) expect(getAuthoredRoomUse(unsupported)).toBeInstanceOf(Error)
})
