import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getEnvelopeSource } from "#/scripts/lib/get-envelope-source"

function fixture() {
  return readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h-m5.md", import.meta.url), "utf8"))
}

it("reads typed exterior inputs without rewriting additional document metadata", () => {
  const building = { ...fixture(), extra: { value: "keep" } }
  const before = JSON.stringify(building)
  const source = getEnvelopeSource(building)
  expect(source.entry_steps).toHaveLength(1)
  expect(source.site_plan.origin).toHaveLength(2)
  expect(JSON.stringify(building)).toBe(before)
})

it("rejects incomplete or invalid coordinate and material metadata", () => {
  const building = fixture()
  const source = getEnvelopeSource(building)
  for (const invalid of [
    { site_plan: { origin: [NaN, 0], rotation_quarters: 0 } },
    { site_plan: { origin: [0, 0], rotation_quarters: 4 } },
    { foundation: { ...source.foundation, floor_thickness_m: 0 } },
    { roof_section: { ...source.roof_section, material: "unknown" } },
    { entry_steps: [] },
    { entry_steps: [source.entry_steps[0], source.entry_steps[0]] },
  ])
    expect(() => getEnvelopeSource({ ...building, ...invalid })).toThrow("Exterior needs a valid site")
})
