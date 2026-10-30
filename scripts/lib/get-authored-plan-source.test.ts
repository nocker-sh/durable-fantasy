import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, it } from "vitest"
import generated from "#/world/town/floorplan/authored/h-m5"
import { getAuthoredPlanSource } from "#/scripts/lib/get-authored-plan-source"

it("emits the canonical generated source with its direct type import and existing formatting", () => {
  const file = new URL("../../world/town/floorplan/authored/h-m5.ts", import.meta.url)
  expect(getAuthoredPlanSource({ plan: generated, filePath: fileURLToPath(file) })).toBe(readFileSync(file, "utf8"))
}, 15000)
