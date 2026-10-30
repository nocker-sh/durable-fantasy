import type { z } from "zod"
import type { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { getStockLockGateGeometry } from "#/scripts/lib/get-stock-lock-gate-geometry"
import { getStockLockBodyPoint } from "#/scripts/lib/get-stock-lock-body-point"
type Plan = z.infer<typeof stockLockSchema>

/** Join every operation to the same waiting/outside/pasture anchors; via points cannot omit or replace an operation endpoint. */
export function getStockLockOperationGeometry(plan: Plan, gate: Plan["gates"][number]) {
  const geometry = getStockLockGateGeometry(plan, gate),
    paths = plan.operations.gate_paths.find((path) => path.gate === gate.id),
    outer = plan.walking.paths.find((path) => path.gate === "outer"),
    inner = plan.walking.paths.find((path) => path.gate === "inner")
  if (geometry instanceof Error) return geometry
  if (!paths || !outer || !inner) return new Error("Stock gate operation has no matching paths")
  const anchors = { outward: outer.points_m[0], inward: plan.walking.hub_m }
  if (gate.id === "inner") {
    anchors.outward = plan.walking.hub_m
    anchors.inward = inner.points_m[inner.points_m.length - 1]
  }
  const swing = geometry.swing,
    push = { body_radius_m: plan.walking.body_radius_m, poses: plan.operations.push_poses },
    pull = { ...plan.operations.pull_arc, body_radius_m: plan.walking.body_radius_m }
  const pushPoints = push.poses.map((pose) => getStockLockBodyPoint(swing, pose.body_m)),
    angles = [pull.start_deg, pull.end_deg]
  const pullPoints = angles.map((angle) => getStockLockBodyPoint(swing, [pull.orbit_radius_m * Math.cos((angle * Math.PI) / 180), pull.orbit_radius_m * Math.sin((angle * Math.PI) / 180)]))

  return {
    swing,
    push,
    pull,
    pushPoints,
    pullPoints,
    routes: [
      { name: "push approach", pose: "closed", points: [anchors.outward, ...paths.push_approach_via_m, pushPoints[0]] },
      { name: "push retreat", pose: "open", points: [pushPoints[pushPoints.length - 1], ...paths.push_retreat_via_m, anchors.inward] },
      { name: "pull approach", pose: "open", points: [anchors.inward, ...paths.pull_approach_via_m, pullPoints[1]] },
      { name: "pull retreat", pose: "closed", points: [pullPoints[0], ...paths.pull_retreat_via_m, anchors.inward] },
    ] satisfies ReadonlyArray<{ name: string; pose: "open" | "closed"; points: ReadonlyArray<readonly [number, number]> }>,
  }
}
