import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { assertEnvelopePlanDimensions } from "#/scripts/lib/assert-envelope-plan-dimensions"
import { readSetting } from "#/scripts/lib/read-setting"

const building = readSetting(readFileSync(new URL("../../.docs/settings/buildings/building-h-m5.md", import.meta.url), "utf8"))
const layout = { width: 4, depth: 5, cell_m: 0.5 }
const plan = { width: 4, depth: 5, cellM: 0.5 }

it("compares original cells and scale without modifying either source", () => {
  const source = { ...building, layout: Object.freeze(layout) }
  const snapshot = structuredClone(source)
  expect(() => assertEnvelopePlanDimensions(source, Object.freeze(plan))).not.toThrow()
  expect(source).toEqual(snapshot)
})

it.each([null, undefined, { ...layout, cell_m: "0.5" }, { ...layout, width: 4.5 }, { ...layout, depth: 0 }, { ...layout, cell_m: Number.MAX_VALUE }, { ...layout, width: 8, cell_m: 0.25 }])(
  "rejects missing, invalid or different source dimensions: %j",
  (invalid) => {
    expect(() => assertEnvelopePlanDimensions({ ...building, layout: invalid }, plan)).toThrow("Exterior dimensions disagree with authored layout")
  },
)

it("rejects a nonfinite plan dimension before projection", () => {
  expect(() => assertEnvelopePlanDimensions({ ...building, layout }, { ...plan, width: NaN })).toThrow("Exterior dimensions disagree with authored layout")
})
