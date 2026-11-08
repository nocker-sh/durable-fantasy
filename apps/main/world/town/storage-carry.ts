import { rectangleTranslationHits } from "#/lib/engine/rectangle-translation-hits"
import { rectangleTurnRadius } from "#/lib/engine/rectangle-turn-radius"
import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import { pointRectDistance } from "#/lib/engine/point-rect-distance"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
export type StorageCarryPose = {
  body_m: readonly [number, number]
  turn: 0 | 1 | 2 | 3
}
type Rect = readonly [number, number, number, number]
const EPS = 1e-9
/** Whole translations and conservative full turns; the carrier and held object remain separate. */
export function certifyStorageCarry(inputProps: { relative: Rect; radius: number; poses: readonly StorageCarryPose[]; width: number; depth: number; obstacles: readonly Rect[]; name?: string }) {
  const relative = inputProps.relative
  const radius = inputProps.radius
  const poses = inputProps.poses
  const width = inputProps.width
  const depth = inputProps.depth
  const obstacles = inputProps.obstacles
  const name = inputProps.name === undefined ? "object" : inputProps.name

  if (![...relative, radius, width, depth].every(Number.isFinite) || radius <= 0 || width <= 0 || depth <= 0 || relative[0] >= relative[2] || relative[1] >= relative[3] || poses.length < 2)
    throw new Error("Invalid carry dimensions")
  if (pointRectDistance(0, 0, relative) < radius - EPS) throw new Error(`Carried ${name} intersects its carrier`)
  const turnRadius = Math.max(radius, rectangleTurnRadius(relative))
  for (let i = 1; i < poses.length; i++) {
    const a = poses[i - 1],
      b = poses[i],
      near = Math.hypot(a.body_m[0] - b.body_m[0], a.body_m[1] - b.body_m[1]) < EPS
    if (![...a.body_m, ...b.body_m].every(Number.isFinite) || ![a.turn, b.turn].every((t) => Number.isInteger(t) && t >= 0 && t <= 3)) throw new Error("Invalid carry pose")
    if (a.turn !== b.turn && !near) throw new Error("Carry must turn in place")
    if (a.turn === b.turn && near) throw new Error("Carry has an empty segment")
    for (const pose of [a, b]) {
      const load = quarterTurnRect({ bounds: { x0: relative[0], z0: relative[1], x1: relative[2], z1: relative[3] }, turn: pose.turn, origin: [pose.body_m[0], pose.body_m[1]] }),
        xState = pose.body_m,
        x = xState[0],
        z = xState[1],
        margin = a.turn !== b.turn ? turnRadius : radius
      if (x - margin < -EPS || z - margin < -EPS || x + margin > width + EPS || z + margin > depth + EPS || load.x0 < -EPS || load.z0 < -EPS || load.x1 > width + EPS || load.z1 > depth + EPS)
        throw new Error("Carry leaves its room")
    }
    const load = quarterTurnRect({ bounds: { x0: relative[0], z0: relative[1], x1: relative[2], z1: relative[3] }, turn: a.turn }),
      loadRect = [load.x0, load.z0, load.x1, load.z1] as const
    for (const rect of obstacles) {
      if (segmentRectDistance(rect, a.body_m, b.body_m) < radius - EPS) throw new Error("Carry body crosses a wall, door or furniture")
      if (a.turn !== b.turn) {
        if (pointRectDistance(...a.body_m, rect) < turnRadius - EPS) throw new Error("Carry turn strikes a wall, door or furniture")
      } else if (rectangleTranslationHits({ relative: loadRect, from: a.body_m, to: b.body_m, obstacle: rect, tolerance: EPS })) throw new Error(`Carried ${name} crosses a wall, door or furniture`)
    }
  }
  return { segments: poses.length - 1, turnRadius }
}
