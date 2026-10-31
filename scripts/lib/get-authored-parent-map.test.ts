import { expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { readSetting } from "#/scripts/lib/read-setting"
import { getAuthoredParentMap } from "#/scripts/lib/get-authored-parent-map"

const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h-m5.md", import.meta.url), "utf8"))
const map = readSetting(readFileSync(new URL("../../.docs/settings/maps/map-phanthiet-market.md", import.meta.url), "utf8"))
it("uses the map document's explicit runtime ID rather than its setting ID", () => {
  const source = { ...map, map_id: "runtime-map-with-a-different-name" },
    original = structuredClone(source)
  expect(getAuthoredParentMap(building, source)).toBe("runtime-map-with-a-different-name")
  expect(source).toEqual(original)
})
it.each([
  { ...map, id: "different" },
  { ...map, kind: "rooms" },
  { ...map, map_id: undefined },
])("rejects a mismatched or unknown parent map: %j", (source) => {
  expect(() => getAuthoredParentMap(building, source)).toThrow("Building exterior map reference is inconsistent")
})
