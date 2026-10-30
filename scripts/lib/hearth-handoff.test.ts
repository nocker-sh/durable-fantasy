import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditHearthHandoff } from "./hearth-handoff"
function fixture(id: string) {
  const read = (kind: string, name: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${name}.md`, import.meta.url), "utf8"))
  const building = read("buildings", `building-${id}`),
    documents = new Map((building.rooms as string[]).map((name) => [name, read("rooms", name)])),
    room = documents.get(`room-${id}-1`)!,
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!
  return { room, building, documents, op, check: () => auditHearthHandoff(room, building, documents) }
}
it("connects the actual carried tool to the working grip clear of masonry in both rooms", () => {
  for (const id of ["h10", "h-m5"]) expect(fixture(id).check()).toEqual([])
})
it("rejects the direct lateral change of grip which passes the upright tool through the carrier", () => {
  for (const id of ["h10", "h-m5"]) {
    const f = fixture(id)
    f.op.handoff!.steps.splice(1, 1)
    expect(f.check().some((s) => s.includes("Handoff tool crosses its carrier"))).toBe(true)
  }
})
it("rejects changing grip while rotating and a rotation through the hearth lintel", () => {
  const f = fixture("h-m5"),
    steps = f.op.handoff!.steps
  steps[3].grip_m[0] += 0.1
  expect(f.check().some((s) => s.includes("fixed grip and body"))).toBe(true)
  steps[3].grip_m[0] -= 0.1
  for (const p of steps.slice(0, 5)) {
    p.grip_m[1] = 1.1
    p.grip_m[2] -= 0.95
    p.body_m = [5, 2.15]
  }
  expect(f.check()).toContain("H: step 5: Handoff tool crosses masonry, a wall or furniture")
})
it("requires the final tool to meet the actual firebox height and grip", () => {
  const f = fixture("h10")
  f.op.handoff!.steps.at(-1)!.grip_m[1] += 0.1
  expect(f.check()).toContain("F: Handoff does not join the working grip")
})
