import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { stockLockWaitingSchema } from "#/scripts/lib/stock-lock-waiting-schema"
import { getStockLockSiteGeometry } from "#/scripts/lib/get-stock-lock-site-geometry"
import { getStockLockWaitingCircles } from "#/scripts/lib/get-stock-lock-waiting-circles"
import { getStockLockWaitingError } from "#/scripts/lib/get-stock-lock-waiting-error"
import { townAnimalSpawns } from "#/world/town/animals"
import { getSheepBodyRadius } from "#/world/town/get-sheep-body-radius"
import { VILLAGE } from "#/world/maps/layout"
import { TILE_M } from "#/world/town/fit"

function fixture() {
  const document = readSetting(readFileSync(".docs/settings/facilities/facility-square-pasture.md", "utf8")),
    plan = stockLockSchema.parse(document.stock_lock),
    site = stockLockSiteSchema.parse(document.stock_lock_site)
  const geometry = getStockLockSiteGeometry({ plan, site, metresPerTile: TILE_M })
  if (geometry instanceof Error) throw geometry
  const native = VILLAGE.pasture,
    pasture: readonly [number, number, number, number] = [native.x0, native.z0, native.x1, native.z1]
  const animals = townAnimalSpawns("phanthiet").filter((animal) => animal.kind === "sheep")

  return { site, geometry, animals, props: { site, geometry, pasture, map: "map-phanthiet", metresPerTile: TILE_M } }
}

it("places every actual sheep together outside all caretaker reservations without changing definitions or pretending the visit is implemented", () => {
  const source = fixture(),
    before = JSON.stringify(source)
  expect(getStockLockWaitingError(source.props)).toBeNull()
  const circles = getStockLockWaitingCircles({ waiting: source.site.waiting, animals: source.animals, origin: [source.props.pasture[0], source.props.pasture[1]], metresPerTile: TILE_M })
  if (circles instanceof Error) throw circles
  expect(circles.map((circle) => circle.animal).sort()).toEqual(source.animals.map((animal) => animal.id).sort())
  for (const circle of circles) expect(circle.radius).toBe(getSheepBodyRadius(source.animals.find((animal) => animal.id === circle.animal)!.scale))
  expect(source.site.stock_motion_status).toBe("unreviewed")
  expect(source.site.waiting.arrival_status).toBe("unreviewed")
  expect(source.site.waiting.behaviour_status).toBe("unreviewed")
  expect(JSON.stringify(source)).toBe(before)
})

it("does not omit, duplicate or substitute a sheep to make the arrangement fit", () => {
  const source = fixture(),
    assignments = source.site.waiting.assignments
  source.site.waiting.assignments = assignments.slice(1)
  expect(getStockLockWaitingError(source.props)?.message).toContain("every sheep exactly once")
  source.site.waiting.assignments = assignments.map((assignment) => ({ ...assignment }))
  source.site.waiting.assignments[0].animal = assignments[1].animal
  expect(getStockLockWaitingError(source.props)?.message).toContain("every sheep exactly once")
  source.site.waiting.assignments[0].animal = "unknown-sheep"
  expect(getStockLockWaitingError(source.props)?.message).toContain("unknown sheep")
  expect(getStockLockWaitingError({ ...source.props, map: "map-phanthiet-market" })?.message).toContain("every sheep exactly once")
})

it("requires bodies, not just distinct centre points, to remain separate", () => {
  const source = fixture()
  source.site.waiting.assignments[1].point_m = [1.2, 5.8]
  expect(getStockLockWaitingError(source.props)?.message).toContain("bodies overlap")
})

it("keeps the grazing head inside the fence even where a wool-only radius would fit", () => {
  const source = fixture(),
    waiting = source.site.waiting
  waiting.assignments[0].point_m = [0.75, 5.8]
  source.site.waiting = stockLockWaitingSchema.parse({ ...waiting, assignments: waiting.assignments.map((assignment) => ({ ...assignment, radius_m: 0.01 })) })
  expect(getStockLockWaitingError(source.props)?.message).toContain("body leaves the pasture")
})

it("rejects a body beside an operating floor and a centre in the grazing corner assigned to the vestibule", () => {
  const source = fixture()
  source.site.waiting.assignments[0].point_m = [5.2, 4.8]
  expect(getStockLockWaitingError(source.props)?.message).toContain("body enters a caretaker reservation")
  source.site.waiting.assignments[0].point_m = [1.1, 2.2]
  expect(getStockLockWaitingError(source.props)?.message).toContain("body enters a caretaker reservation")
})

it("keeps the declared spacing and rejects malformed frames instead of treating them as empty space", () => {
  const source = fixture()
  source.site.waiting.clearance_m = 1
  expect(getStockLockWaitingError(source.props)).toBeInstanceOf(Error)
  expect(getStockLockWaitingCircles({ waiting: source.site.waiting, animals: source.animals, origin: [0, 0], metresPerTile: 0 })).toBeInstanceOf(Error)
  expect(stockLockSiteSchema.safeParse({ ...source.site, waiting: undefined }).success).toBe(false)
  expect(stockLockWaitingSchema.safeParse({ ...source.site.waiting, arrival_status: "complete" }).success).toBe(false)
})
