import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockWalkingError } from "#/scripts/lib/get-stock-lock-walking-error"
import { getStockLockWalkingPathError } from "#/scripts/lib/get-stock-lock-walking-path-error"
import { getStockLockBodyObstacles } from "#/scripts/lib/get-stock-lock-body-obstacles"
import { getStockLockPanelError } from "#/scripts/lib/get-stock-lock-panel-error"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"

function fixture() {
  return stockLockSchema.parse(readSetting(readFileSync(".docs/settings/facilities/facility-square-pasture.md", "utf8")).stock_lock)
}

it("connects both authored gates to one body-sized waiting floor and supports the reverse walk without mutation", () => {
  const plan = fixture(),
    before = JSON.stringify(plan)
  expect(getStockLockWalkingError(plan)).toBeNull()
  for (const path of plan.walking.paths) expect(getStockLockWalkingPathError(plan, { ...path, points_m: [...path.points_m].reverse() })).toBeNull()
  expect(JSON.stringify(plan)).toBe(before)
})

it("keeps the shared body radius and fits the whole circle rather than only its centre into the hub", () => {
  const plan = fixture()
  expect(stockLockSchema.safeParse({ ...plan, walking: { ...plan.walking, body_radius_m: 0.2 } }).success).toBe(false)
  plan.walking.hub_m[1] = 1
  expect(getStockLockWalkingError(plan)?.message).toContain("body does not fit its hub")
})

it("rejects routes that skip the shared hub or cover just one gate twice", () => {
  const plan = fixture()
  plan.walking.paths[0].points_m[plan.walking.paths[0].points_m.length - 1] = [3.3, 1]
  expect(getStockLockWalkingError(plan)?.message).toContain("does not meet its shared hub")
  plan.walking.paths[1].gate = "outer"
  expect(getStockLockWalkingError(plan)?.message).toContain("unique paths")
})

it("does not invent outside floor or shorten the pasture reservation merely because the panels fit", () => {
  const plan = fixture()
  plan.walking.outside_side.rect_m = [-1.4, 0, 1.5, 4.4]
  expect(getStockLockWalkingError(plan)?.message).toContain("attached outside floor")
  plan.walking.outside_side.rect_m = [-0.2, 0, 0.2, 4.4]
  expect(getStockLockWalkingError(plan)?.message).toContain("blocked grid cell")
  plan.walking.outside_side.rect_m = [-1.4, 0, 1.4, 4.4]
  plan.pasture_side.rect_m[2] = 1.8
  expect(getStockLockPanelError(plan)).toBeNull()
  expect(getStockLockWalkingError(plan)?.message).toContain("blocked grid cell")
})

it("detects an open leaf between clear endpoint circles instead of testing only the waypoints", () => {
  const plan = fixture(),
    path = plan.walking.paths[0],
    obstacles = getStockLockBodyObstacles(plan, "outer", "open")
  if (obstacles instanceof Error) throw obstacles
  const panel = obstacles.find((obstacle) => obstacle.name === "outer open panel")
  if (!panel) throw new Error("Missing held-open panel")
  for (const point of [
    [0.7, 2.2],
    [0.7, 0.8],
  ])
    expect(pointRectDistance(point[0], point[1], panel.bounds)).toBeGreaterThan(plan.walking.body_radius_m)
  path.points_m = [
    [-0.8, 2.2],
    [0.7, 2.2],
    [0.7, 0.8],
    [3.3, 0.8],
  ]
  expect(getStockLockWalkingError(plan)?.message).toContain("outer open panel")
})

it("retains the peer's closed gate instead of opening both doorways to make a path pass", () => {
  const plan = fixture()
  plan.walking.paths[0].points_m = [
    [-0.8, 2.2],
    [5.5, 2.2],
    [3.3, 2.2],
    [3.3, 0.8],
  ]
  expect(getStockLockWalkingError(plan)?.message).toContain("inner closed panel")
})

it("includes the frame even when the body's circle remains inside the nominal doorway cells", () => {
  const plan = fixture()
  plan.walking.paths[0].points_m = [
    [-0.8, 1.83],
    [3.3, 1.83],
    [3.3, 0.8],
  ]
  expect(getStockLockWalkingError(plan)?.message).toContain("outer frame")
})

it("requires entire bodies outside the enclosure at the outer and pasture endpoints and rejects duplicate points", () => {
  const plan = fixture()
  plan.walking.paths[0].points_m[0] = [-0.2, 2.2]
  expect(getStockLockWalkingError(plan)?.message).toContain("wholly outside")
  plan.walking.paths[0].points_m[0] = [-0.8, 2.2]
  plan.walking.paths[1].points_m[plan.walking.paths[1].points_m.length - 1] = [4.6, 2.2]
  expect(getStockLockWalkingError(plan)?.message).toContain("wholly in pasture")
  plan.walking.paths[1].points_m[plan.walking.paths[1].points_m.length - 1] = [6.5, 2.2]
  plan.walking.paths[0].points_m.splice(1, 0, [...plan.walking.paths[0].points_m[0]])
  expect(getStockLockWalkingError(plan)?.message).toContain("repeats a point")
})
