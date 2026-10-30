import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockReviewError } from "#/scripts/lib/get-stock-lock-review-error"
import { getStockLockLayoutError } from "#/scripts/lib/get-stock-lock-layout-error"

function fixture() {
  const text = readFileSync(".docs/settings/facilities/facility-square-pasture.md", "utf8"),
    facility = readSetting(text),
    operator = readSetting(readFileSync(".docs/settings/residents/resident-カール.md", "utf8"))
  const documents = new Map([facility, operator].map((document) => [document.id, document]))
  for (const name of ["ゴットフリート", "ギュンター"]) {
    const maker = readSetting(readFileSync(`.docs/settings/residents/resident-${name}.md`, "utf8"))
    documents.set(maker.id, maker)
  }

  return { text, facility, documents, plan: stockLockSchema.parse(facility.stock_lock) }
}

it("reviews the authored two-gate floor and caretaker cycle against the real town sheep inventory without mutation", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents])
  expect(getStockLockReviewError(source.facility, source.documents)).toBeNull()
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("keeps the prose grid identical to metadata rather than accepting a separate flattering diagram", () => {
  const source = fixture()
  expect(() => readSetting(source.text.replace("```stock-lock-grid\n#", "```stock-lock-grid\n."))).toThrow("Stock lock diagram disagrees")
})

it("rejects undeclared openings, a gate facing the wrong side and an undersized waiting floor", () => {
  const source = fixture(),
    rows = [...source.plan.layout.rows]
  rows[1] = `D${rows[1].slice(1)}`
  expect(getStockLockLayoutError({ ...source.plan, layout: { ...source.plan.layout, rows } })?.message).toContain("disagrees")
  expect(getStockLockLayoutError({ ...source.plan, gates: source.plan.gates.map((gate) => ({ ...gate, side: "east" })) })?.message).toContain("invalid side")
  expect(getStockLockLayoutError({ ...source.plan, zones: [{ symbol: "S", role: "operator_wait", rect: [14, 2, 1, 1] }] })?.message).toContain("lacks design width")
})

it("requires a local caretaker dependency and the source sheep inventory", () => {
  const source = fixture()
  source.documents.delete("resident-カール")
  expect(getStockLockReviewError(source.facility, source.documents)?.message).toContain("caretaker dependency")
  const unrelated = fixture()
  unrelated.facility.site = { map: "map-no-sheep" }
  expect(getStockLockReviewError(unrelated.facility, unrelated.documents)?.message).toContain("Invalid stock lock cycle")
})

it("does not accept a stock observation for an animal omitted from the source population", () => {
  const source = fixture()
  source.facility.stock_lock = { ...source.plan, events: [{ kind: "stock_move", id: "invented-sheep", to: "vestibule" }, ...source.plan.events] }
  expect(getStockLockReviewError(source.facility, source.documents)?.message).toContain("Unknown stock lock animal")
})

it("does not approve a completed facility from a proposed symbolic sequence", () => {
  const source = fixture()
  source.facility.design_gate = "通過"
  expect(getStockLockReviewError(source.facility, source.documents)?.message).toContain("Invalid proposed stock lock review")
})

it("requires both fabrication roles and local makers named in the facility's dependencies", () => {
  const source = fixture()
  source.documents.delete("resident-ギュンター")
  expect(getStockLockReviewError(source.facility, source.documents)?.message).toContain("local maker dependency")
  const missingRole = fixture()
  missingRole.plan.gates[0].leaf.makers[1].role = "timber"
  missingRole.facility.stock_lock = missingRole.plan
  expect(getStockLockReviewError(missingRole.facility, missingRole.documents)?.message).toContain("both timber and fittings")
})
