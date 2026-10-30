import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { readSetting } from "#/scripts/lib/read-setting"
import { getStockLockOperationsError } from "#/scripts/lib/get-stock-lock-operations-error"
import { getStockLockOperationGeometry } from "#/scripts/lib/get-stock-lock-operation-geometry"
import { getStockLockWalkingError } from "#/scripts/lib/get-stock-lock-walking-error"
import { getStockLockPanelError } from "#/scripts/lib/get-stock-lock-panel-error"
import { getStockLockVisitPhases } from "#/scripts/lib/get-stock-lock-visit-phases"
import { getStockLockMotionEpisode } from "#/scripts/lib/get-stock-lock-motion-episode"
import { getStockLockPhaseEndpoints } from "#/scripts/lib/get-stock-lock-phase-endpoints"
import { getStockLockCycle } from "#/world/town/get-stock-lock-cycle"
import { townAnimalSpawns } from "#/world/town/animals"

function fixture() {
  return stockLockSchema.parse(readSetting(readFileSync(".docs/settings/facilities/facility-square-pasture.md", "utf8")).stock_lock)
}

it("joins the authored approach, rotation and retreat to actual body endpoints and the shared anchors without mutation", () => {
  const plan = fixture(),
    before = JSON.stringify(plan)
  expect(getStockLockOperationsError(plan)).toBeNull()
  const outer = getStockLockOperationGeometry(plan, plan.gates[0])
  if (outer instanceof Error) throw outer
  expect(outer.routes[0].points[outer.routes[0].points.length - 1]).toEqual(outer.pushPoints[0])
  expect(outer.routes[1].points[0]).toEqual(outer.pushPoints[outer.pushPoints.length - 1])
  expect(outer.routes[1].points[outer.routes[1].points.length - 1]).toEqual(plan.walking.hub_m)
  expect(outer.routes[2].points[outer.routes[2].points.length - 1]).toEqual(outer.pullPoints[1])
  expect(outer.routes[3].points[0]).toEqual(outer.pullPoints[0])
  expect(JSON.stringify(plan)).toBe(before)
})

it("does not accept two sampled endpoints for a push whose intermediate body enters the moving panel", () => {
  const plan = fixture(),
    poses = plan.operations.push_poses
  plan.operations.push_poses = [poses[0], poses[poses.length - 1]]
  expect(getStockLockOperationsError(plan)?.message).toContain("intersects the moving panel")
})

it("keeps the handle reachable throughout the push and pull instead of only at their endpoints", () => {
  const plan = fixture()
  plan.operations.push_poses[2].body_m[1] = -1
  expect(getStockLockOperationsError(plan)?.message).toContain("handle is out of reach")
  const pull = fixture()
  pull.operations.pull_arc.orbit_radius_m = 3
  expect(getStockLockOperationsError(pull)?.message).toContain("handle is out of reach")
})

it("does not reduce the body clearance around the fitted leaf to make a small pull orbit pass", () => {
  const plan = fixture()
  plan.operations.pull_arc.orbit_radius_m = 1.7
  expect(getStockLockOperationsError(plan)?.message).toContain("body enters the leaf's swept area")
})

it("retains the closed gate while approaching a push and the open gate while returning to its handle", () => {
  const plan = fixture()
  plan.operations.gate_paths[0].push_approach_via_m = [[1, 2.2]]
  expect(getStockLockOperationsError(plan)?.message).toContain("outer closed panel")
  const returning = fixture()
  returning.operations.gate_paths[0].pull_approach_via_m = [[0.7, 0.8]]
  expect(getStockLockOperationsError(returning)?.message).toContain("outer open panel")
})

it("requires supported floor for the arc even when the static panels and walking paths fit", () => {
  const plan = fixture()
  plan.pasture_side.rect_m[3] = 3.2
  expect(getStockLockPanelError(plan)).toBeNull()
  expect(getStockLockWalkingError(plan)).toBeNull()
  expect(getStockLockOperationsError(plan)?.message).toContain("arc crosses unsupported floor")
})

it("requires every gate operation to have a reviewed motion and both route assignments", () => {
  const plan = fixture(),
    opening = plan.events.find((event) => event.kind === "gate" && event.action === "open")
  if (!opening || opening.kind !== "gate") throw new Error("Missing opening")
  opening.motion = undefined
  expect(getStockLockOperationsError(plan)?.message).toContain("unreviewed operator crossing or gate motion")
  const missing = fixture()
  missing.operations.gate_paths[1].gate = "outer"
  expect(getStockLockOperationsError(missing)?.message).toContain("paths or arc are incomplete")
})

it("does not retreat to the anchor before operating a detached latch step", () => {
  const plan = fixture(),
    closing = plan.events.findIndex((event) => event.kind === "gate" && event.action === "close")
  plan.events.splice(closing + 1, 0, { kind: "inspect_empty" })
  expect(getStockLockOperationsError(plan)?.message).toContain("closing must adjoin its latch step")
})

it("compiles the entire visit continuously and assigns every logical action once at its actual phase", () => {
  const plan = fixture(),
    before = JSON.stringify(plan),
    phases = getStockLockVisitPhases(plan)
  if (phases instanceof Error) throw phases
  const indices = phases.flatMap((phase) => {
    if (phase.kind === "walk") return []
    return [phase.event_index]
  })
  expect(indices).toEqual([...plan.events.keys()])
  expect(phases).toHaveLength(34)
  for (const index of phases.keys()) if (index > 0) expect(getStockLockPhaseEndpoints(phases[index]).from).toEqual(getStockLockPhaseEndpoints(phases[index - 1]).to)
  expect(JSON.stringify(plan)).toBe(before)
})

it("backs out along the actual push poses in reverse and latches before retreating", () => {
  const plan = fixture(),
    closing = plan.events.findIndex((event) => event.kind === "gate" && event.motion === "back_out_close"),
    phases = getStockLockMotionEpisode(plan, closing)
  if (phases instanceof Error) throw phases
  const push = phases.find((phase) => phase.kind === "push")
  if (!push || push.kind !== "push") throw new Error("Missing backing-out poses")
  expect(push.poses[0].angle_deg).toBe(90)
  expect(push.poses[push.poses.length - 1].angle_deg).toBe(0)
  expect(phases[2].kind).toBe("latch")
  expect(phases[3].kind).toBe("walk")
  expect(getStockLockPhaseEndpoints(phases[2]).from).toEqual(getStockLockPhaseEndpoints(push).to)
})

it("does not confuse a logically secured sheep-recovery sequence with reviewed shared body motion", () => {
  const plan = fixture(),
    first = plan.events.find((event) => event.kind === "gate" && event.gate === "inner" && event.motion === "pull_close"),
    second = plan.events.find((event) => event.kind === "gate" && event.gate === "inner" && event.motion === "pull_open")
  if (!first || first.kind !== "gate" || !second || second.kind !== "gate") throw new Error("Missing inner operations")
  first.stock_crossings = [{ id: "sheep-1", to: "vestibule" }]
  second.stock_crossings = [{ id: "sheep-1", to: "pasture" }]
  const ids = townAnimalSpawns("phanthiet")
    .filter((animal) => animal.kind === "sheep")
    .map((animal) => animal.id)
  expect(getStockLockCycle(ids, plan.events)).not.toBeInstanceOf(Error)
  expect(getStockLockOperationsError(plan)?.message).toContain("does not certify shared animal motion")
})
