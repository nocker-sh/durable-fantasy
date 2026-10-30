import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { getTextileWoolLotReview } from "#/scripts/lib/get-textile-wool-lot-review"
import { getWoolLotAllocationBudget } from "#/scripts/lib/get-wool-lot-allocation-budget"
import { getSleepingTextileOrdersError } from "#/scripts/lib/get-sleeping-textile-orders-error"
import { auditTextileOrders } from "#/scripts/lib/audit-textile-orders"

function fixture() {
  const read = (path: string) => readSetting(readFileSync(`.docs/settings/${path}.md`, "utf8")),
    rooms = [1, 3, 4].map((number) => read(`rooms/room-h1-${number}`)),
    workplace = read("rooms/room-h-c2-weaving")
  const residents = ["ヴィルヘルム", "ゾフィー", "ゴットフリート", "ヨーゼフ", "ベルタ", "マグダレーナ", "マティアス"].map((name) => read(`residents/resident-${name}`)),
    documents = new Map([...rooms, workplace, read("facilities/facility-h7-wool-preparation"), read("facilities/facility-square-well"), ...residents].map((document) => [document.id, document]))
  const supplier = documents.get("resident-マティアス"),
    room = documents.get("room-h1-3")
  if (!supplier || !room) throw new Error("Missing actual raw material source")
  const lots = textileWoolLotsSchema.parse(supplier.textile_wool_lots),
    orders = textileOrdersSchema.parse(supplier.textile_orders)
  supplier.textile_wool_lots = lots
  supplier.textile_orders = orders
  return { supplier, lot: lots[0], lots, orders, documents, room }
}

it("reserves all four distinct measured cloths from one finite proposed fleece pool without changing stock or documents", () => {
  const source = fixture(),
    before = JSON.stringify([...source.documents]),
    review = getTextileWoolLotReview(source)
  expect(review).toEqual({ reservedG: 10876, remainingG: 1124 })
  for (const allocation of source.lot.allocations) {
    const budget = getWoolLotAllocationBudget({ ...source, lotId: source.lot.id, allocation })
    if (budget instanceof Error) throw budget
    if (allocation.cloth.includes(":pillow:")) {
      expect(budget.cutG).toBe(345)
      expect(budget.offcutsG).toBe(155)
    } else {
      expect(budget.cutG).toBe(2204)
      expect(budget.offcutsG).toBe(316)
    }
  }
  expect(auditTextileOrders(source.documents)).toEqual([])
  expect(getSleepingTextileOrdersError(source)).toBeNull()
  expect(JSON.stringify([...source.documents])).toBe(before)
})

it("rejects combined overbooking even when every individual cloth fits the same raw budget", () => {
  const source = fixture()
  source.lot.dry_mass_g = 5000
  for (const allocation of source.lot.allocations) {
    const budget = getWoolLotAllocationBudget({ ...source, lotId: source.lot.id, allocation })
    if (budget instanceof Error) throw budget
    expect(budget.rawFleeceG).toBeLessThan(source.lot.dry_mass_g)
  }
  expect(getTextileWoolLotReview(source)).toEqual(new Error("Wool pool overallocates its proposed dry fleece"))
  expect(getSleepingTextileOrdersError(source)).toBeInstanceOf(Error)
  expect(auditTextileOrders(source.documents)).toContain("resident-マティアス: textile-wool: Wool pool overallocates its proposed dry fleece")
})

it("rejects duplicate and orphan pool allocations without removing the required order chain", () => {
  const source = fixture()
  source.lot.allocations.push({ ...source.lot.allocations[0] })
  expect(getTextileWoolLotReview(source)).toEqual(new Error("Wool pool duplicates a cloth allocation"))
  source.lot.allocations.pop()
  source.lot.allocations.push({ room: "room-h1-1", cloth: "unassigned-cloth" })
  expect(auditTextileOrders(source.documents)).toContain("resident-マティアス: textile-wool: Wool allocation has no measured textile cutting")
})

it("requires the wool order's matching pool and the beneficiary's own unique allocation", () => {
  const source = fixture()
  source.orders[0].raw_lot = "another-pool"
  expect(getSleepingTextileOrdersError(source)).toEqual(new Error("Textile wool order has no matching proposed pool"))
  source.orders[0].raw_lot = source.lot.id
  source.lot.allocations.shift()
  expect(getSleepingTextileOrdersError(source)).toEqual(new Error("Textile wool order lacks its unique pool allocation"))
})

it("rejects copying a pool to another supplier or declaring the same pool twice", () => {
  const source = fixture(),
    other = source.documents.get("resident-ベルタ")
  if (!other) throw new Error("Missing actual other supplier")
  other.textile_wool_lots = [source.lot]
  const errors = auditTextileOrders(source.documents)
  expect(errors.some((error) => error.includes(`Duplicate pool ${source.lot.id}`))).toBe(true)
  expect(errors).toContain("resident-ベルタ: textile-wool: Wool allocation belongs to another supplier or pool")
})

it("keeps unmeasured proposed raw pools and processes outside a supplier's completed design gate", () => {
  const source = fixture()
  source.supplier.design_gate = "通過"
  const errors = auditTextileOrders(source.documents)
  expect(errors).toContain("resident-マティアス: textile-wool: Proposed fleece pools remain unresolved")
  expect(errors).toContain("resident-マティアス: textile-orders: Proposed textile orders remain unresolved")
})

it("requires the raw pool only on wool orders and refuses claimed stock or invalid whole-gram capacity", () => {
  const source = fixture(),
    weaver = source.documents.get("resident-ベルタ")
  if (!weaver) throw new Error("Missing actual spinner")
  const spin = textileOrdersSchema.parse(weaver.textile_orders).find((order) => order.stage === "spin")
  if (!spin) throw new Error("Missing actual spinning process")
  expect(textileOrdersSchema.safeParse([{ ...source.orders[0], raw_lot: undefined }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...source.orders[0], supply_state: "unwashed_fleece" }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...source.orders[0], supply_state: undefined }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...spin, raw_lot: source.lot.id }]).success).toBe(false)
  expect(textileWoolLotsSchema.safeParse([{ ...source.lot, status: "in_stock" }]).success).toBe(false)
  for (const invalid of [0, -1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1]) expect(textileWoolLotsSchema.safeParse([{ ...source.lot, dry_mass_g: invalid }]).success).toBe(false)
})
