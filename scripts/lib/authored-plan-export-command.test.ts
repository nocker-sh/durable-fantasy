import { runLocalVp } from "#/scripts/lib/run-local-vp"
import { existsSync, statSync } from "node:fs"
import { expect, it } from "vitest"

const run = (args: readonly string[]) => runLocalVp({ args: ["exec", "bun", "scripts/export-authored-plans.ts", ...args] })
it("rejects an unknown requested building instead of silently exporting the hall", () => {
  const before = statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs,
    command = run(["building-not-indexed"])
  expect(command.status).not.toBe(0)
  expect(command.stdout).not.toContain("Unchanged h-m5")
  expect(statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs).toBe(before)
}, 15000)
it("does not export an incomplete proposal by reusing the hall's metadata", () => {
  const command = run(["building-bakery"])
  expect(command.status).not.toBe(0)
  expect(command.stdout).not.toContain("h-m5")
  expect(existsSync("apps/main/world/town/floorplan/authored/bakery.ts")).toBe(false)
}, 15000)
it.each([{ args: [] }, { args: ["building-h-m5"] }])(
  "preserves canonical output and its timestamp for %j",
  (input) => {
    const before = statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs,
      command = run(input.args)
    expect(command.status).toBe(0)
    expect(command.stdout).toContain("Unchanged h-m5: 4 rooms")
    expect(statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs).toBe(before)
  },
  15000,
)
it("validates every selected building before reporting or writing a successful export", () => {
  const before = statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs,
    command = run(["building-h-m5", "building-bakery"])
  expect(command.status).not.toBe(0)
  expect(command.stdout).not.toContain("Unchanged")
  expect(command.stdout).not.toContain("Exported")
  expect(statSync("apps/main/world/town/floorplan/authored/h-m5.ts").mtimeMs).toBe(before)
  expect(existsSync("apps/main/world/town/floorplan/authored/bakery.ts")).toBe(false)
}, 15000)
