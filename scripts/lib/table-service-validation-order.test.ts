import { readFileSync } from "node:fs"
import { beforeEach, expect, it, vi } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getPlaceReachError } from "#/scripts/lib/get-place-reach-error"
import { auditPlaceSettings } from "#/scripts/lib/audit-place-settings"
import { tablePlaceSettingsSchema } from "#/scripts/lib/table-place-settings-schema"

vi.mock("#/scripts/lib/get-place-reach-error", () => ({ getPlaceReachError: vi.fn(() => null) }))
const read = (path: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${path}.md`, import.meta.url), "utf8"))
const fixture = () => {
  const room = read("rooms/room-h1-1")
  const documents = new Map([room, read("rooms/room-h1-2"), read("residents/resident-ヴィルヘルム"), read("residents/resident-ゾフィー")].map((document) => [document.id, document]))
  return { room, documents }
}
beforeEach(() => vi.mocked(getPlaceReachError).mockClear())
it("rejects malformed tea before calculating the valid meal's native motion", () => {
  const f = fixture()
  f.room.tea_place_settings = { status: "proposed" }
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Invalid tabletop place settings")
  expect(getPlaceReachError).not.toHaveBeenCalled()
})
it("rejects the wrong service group before calculating any native motion", () => {
  const f = fixture()
  f.room.tea_place_settings = f.room.meal_place_settings
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tea service must use the complete cup group")
  expect(getPlaceReachError).not.toHaveBeenCalled()
})
it("retains every valid service and its complete motion input", () => {
  const f = fixture()
  const before = structuredClone([...f.documents])
  expect(auditPlaceSettings(f.room, f.documents)).toEqual([])
  expect(getPlaceReachError).toHaveBeenCalledTimes(2)
  expect(getPlaceReachError).toHaveBeenNthCalledWith(1, f.room, tablePlaceSettingsSchema.parse(f.room.meal_place_settings), f.documents)
  expect(getPlaceReachError).toHaveBeenNthCalledWith(2, f.room, tablePlaceSettingsSchema.parse(f.room.tea_place_settings), f.documents)
  expect([...f.documents]).toEqual(before)
})
it("rejects a premature completion claim before calculating native motion", () => {
  const f = fixture()
  f.room.design_gate = "通過"
  expect(auditPlaceSettings(f.room, f.documents)).toContain("room-h1-1: Tabletop serving operation remains proposed")
  expect(getPlaceReachError).not.toHaveBeenCalled()
})
