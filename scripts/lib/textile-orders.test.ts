import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { getSleepingTextileOrdersError } from "#/scripts/lib/get-sleeping-textile-orders-error"
import { auditSleepingMaterials } from "#/scripts/lib/audit-sleeping-materials"
import { auditTextileOrders } from "#/scripts/lib/audit-textile-orders"

function fixture(number = 3) {
  const rooms = [1, 3, 4].map((floor) => readSetting(readFileSync(`.docs/settings/rooms/room-h1-${floor}.md`, "utf8"))),
    room = rooms.find((candidate) => candidate.id === `room-h1-${number}`)
  if (!room) throw new Error("Missing actual target room")
  const residents = ["ヴィルヘルム", "ゾフィー", "ゴットフリート", "ヨーゼフ", "ベルタ", "マグダレーナ", "マティアス"].map((name) =>
    readSetting(readFileSync(`.docs/settings/residents/resident-${name}.md`, "utf8")),
  )
  const workplace = readSetting(readFileSync(".docs/settings/rooms/room-h-c2-weaving.md", "utf8"))
  const preparation = readSetting(readFileSync(".docs/settings/facilities/facility-h7-wool-preparation.md", "utf8")),
    sourceWater = readSetting(readFileSync(".docs/settings/facilities/facility-square-well.md", "utf8"))
  const documents = new Map([...rooms, workplace, preparation, sourceWater, ...residents].map((document) => [document.id, document])),
    weaver = documents.get("resident-ベルタ")
  if (!weaver) throw new Error("Missing actual weaver")
  const orders = textileOrdersSchema.parse(weaver.textile_orders)
  weaver.textile_orders = orders
  return { room, documents, weaver, orders }
}

it("connects both sleepers' proposed wool, weaving and finishing handoffs without changing authored stock", () => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      before = JSON.stringify([...source.documents])
    expect(getSleepingTextileOrdersError(source)).toBeNull()
    expect(auditSleepingMaterials(source.room, source.documents)).toEqual([])
    expect(auditTextileOrders(source.documents)).toEqual([])
    expect(JSON.stringify([...source.documents])).toBe(before)
  }
})

it("rejects an extra orphan even when both required handoff chains still pass", () => {
  const source = fixture()
  source.orders.push({ ...source.orders[0], id: `${source.orders[0].id}:orphan`, room: "room-h1-1" })
  expect(getSleepingTextileOrdersError(source)).toBeNull()
  expect(auditTextileOrders(source.documents)).toContain("resident-ベルタ: textile-orders: Textile order has no matching cutting plan")
})

it("rejects duplicate declarations and an order copied to a different supplier", () => {
  const source = fixture(),
    shepherd = source.documents.get("resident-マティアス")
  if (!shepherd) throw new Error("Missing actual shepherd")
  const orders = textileOrdersSchema.parse(shepherd.textile_orders)
  shepherd.textile_orders = [...orders, source.orders[0]]
  const errors = auditTextileOrders(source.documents)
  expect(errors).toContain(`resident-マティアス: textile-orders: Duplicate order ${source.orders[0].id}`)
  expect(errors).toContain("resident-マティアス: textile-orders: Textile order does not match its supplier and cloth allocation")
})

it("rejects a missing or duplicated stage, the wrong beneficiary and a handoff to the wrong next worker", () => {
  const missing = fixture()
  missing.weaver.textile_orders = missing.orders.slice(1)
  expect(getSleepingTextileOrdersError(missing)).toBeInstanceOf(Error)
  expect(auditSleepingMaterials(missing.room, missing.documents)).toContain("sleeping-materials: Blanket supply handoff is missing, duplicated or misdirected")
  const duplicate = fixture()
  duplicate.orders.push(duplicate.orders[0])
  expect(getSleepingTextileOrdersError(duplicate)).toBeInstanceOf(Error)
  const foreign = fixture()
  foreign.orders[0].beneficiary = "resident-ゾフィー"
  expect(getSleepingTextileOrdersError(foreign)).toBeInstanceOf(Error)
  const skipped = fixture()
  skipped.orders[0].recipient = "resident-ヴィルヘルム"
  expect(getSleepingTextileOrdersError(skipped)).toBeInstanceOf(Error)
})

it("does not accept a fulfilled delivery or missing unresolved work as a proposed order", () => {
  const source = fixture()
  expect(textileOrdersSchema.safeParse([{ ...source.orders[0], status: "delivered" }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...source.orders[0], pending: [] }]).success).toBe(false)
})

it("requires pillow cover weaving independently of an otherwise complete blanket chain", () => {
  const source = fixture()
  source.weaver.textile_orders = source.orders.filter((order) => order.cloth !== "bed-h1-3-1:pillow:cover-cloth")
  expect(auditSleepingMaterials(source.room, source.documents)).toContain("sleeping-materials: Pillow cover supply handoff is missing, duplicated or misdirected")
})

it("registers four independent cloths with all sixteen proposed processes", () => {
  const source = fixture(),
    orders = [...source.documents.values()].flatMap((document) => {
      if (document.textile_orders === undefined) return []
      return textileOrdersSchema.parse(document.textile_orders)
    })
  expect(orders).toHaveLength(16)
  expect(new Set(orders.map((order) => order.id)).size).toBe(16)
  expect(new Set(orders.map((order) => order.cloth))).toEqual(
    new Set(["storage-h1-3-1:blanket-cloth", "storage-h1-4-1:blanket-cloth", "bed-h1-3-1:pillow:cover-cloth", "bed-h1-4-1:pillow:cover-cloth"]),
  )
  expect(auditTextileOrders(source.documents)).toEqual([])
})

it.each([
  { name: "マティアス", stage: "wool" },
  { name: "ベルタ", stage: "weave" },
  { name: "マグダレーナ", stage: "finish" },
])("requires the $stage stage for each sleeper's pillow cloth", (stage) => {
  for (const number of [3, 4]) {
    const source = fixture(number),
      supplier = source.documents.get(`resident-${stage.name}`)
    if (!supplier) throw new Error("Missing actual supplier")
    const cloth = `bed-h1-${number}-1:pillow:cover-cloth`,
      orders = textileOrdersSchema.parse(supplier.textile_orders)
    expect(orders.filter((order) => order.cloth === cloth && order.stage === stage.stage)).toHaveLength(1)
    supplier.textile_orders = orders.filter((order) => order.cloth !== cloth)
    expect(getSleepingTextileOrdersError(source)).toEqual(new Error("Pillow cover supply handoff is missing, duplicated or misdirected"))
  }
})

it("rejects pillow orders that borrow blanket cloth, change the beneficiary or bypass the next worker", () => {
  for (const field of ["cloth", "beneficiary", "recipient"] satisfies readonly ("cloth" | "beneficiary" | "recipient")[]) {
    const source = fixture(),
      order = source.orders.find((order) => order.cloth === "bed-h1-3-1:pillow:cover-cloth")
    if (!order) throw new Error("Missing actual pillow weaving allocation")
    const replacements = { cloth: "storage-h1-3-1:blanket-cloth", beneficiary: "resident-ゾフィー", recipient: "resident-ヴィルヘルム" }
    order[field] = replacements[field]
    expect(getSleepingTextileOrdersError(source)).toBeInstanceOf(Error)
    expect(auditTextileOrders(source.documents)).toContain("resident-ベルタ: textile-orders: Textile order does not match its supplier and cloth allocation")
  }
})

it("rejects extra orphan pillow cloth and duplicates even with every required chain intact", () => {
  const source = fixture(),
    order = source.orders.find((order) => order.cloth === "bed-h1-3-1:pillow:cover-cloth")
  if (!order) throw new Error("Missing actual pillow weaving allocation")
  source.orders.push({ ...order, id: `${order.id}:orphan`, room: "room-h1-1" })
  expect(getSleepingTextileOrdersError(source)).toBeNull()
  expect(auditTextileOrders(source.documents)).toContain("resident-ベルタ: textile-orders: Textile order has no matching cutting plan")
  source.orders.pop()
  source.orders.push({ ...order })
  expect(auditTextileOrders(source.documents)).toContain(`resident-ベルタ: textile-orders: Duplicate order ${order.id}`)
  expect(getSleepingTextileOrdersError(source)).toBeInstanceOf(Error)
})

it("does not substitute complete wool, weaving and finishing declarations for the missing spinning process", () => {
  const source = fixture()
  source.weaver.textile_orders = source.orders.filter((order) => !order.id.endsWith(":spin"))
  expect(getSleepingTextileOrdersError(source)).toBeInstanceOf(Error)
})

it("requires the separate spinning wheel, its work face and the proposed communal user", () => {
  for (const condition of ["loom", "no-access", "no-work-face", "no-user", "other-town", "missing-towns"]) {
    const source = fixture(),
      room = source.documents.get("room-h-c2-weaving"),
      order = source.orders.find((order) => order.stage === "spin")
    if (!room || !order?.workplace) throw new Error("Missing real spinning workplace")
    const wheel = room.furniture?.find((piece) => piece.symbol === "S")
    if (!wheel) throw new Error("Missing real spinning wheel")
    if (condition === "loom") order.workplace.furniture = "L"
    if (condition === "no-access") wheel.access = []
    if (condition === "no-work-face") wheel.use_space = []
    if (condition === "no-user") room.users = []
    if (condition === "other-town") room.town = "town-hue"
    if (condition === "missing-towns") {
      room.town = undefined
      source.weaver.town = undefined
    }
    expect(getSleepingTextileOrdersError(source)).toBeInstanceOf(Error)
    expect(auditTextileOrders(source.documents).length).toBeGreaterThan(0)
  }
})

it("requires a spinning site in the schema and does not attach one to a different stage", () => {
  const source = fixture(),
    spin = source.orders.find((order) => order.stage === "spin")
  if (!spin) throw new Error("Missing actual spinning allocation")
  expect(textileOrdersSchema.safeParse([{ ...spin, workplace: undefined }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...spin, stage: "weave" }]).success).toBe(false)
  expect(textileOrdersSchema.safeParse([{ ...spin, workplace: { room: "room-h-c2-weaving", furniture: "SS" } }]).success).toBe(false)
})
