import { twoBoneJointSpeedBound } from "../../../lib/engine/two-bone-joint-speed-bound"
import { quarterTurnPoint } from "../../../lib/engine/quarter-turn-point"
import { segmentCuboidDistance } from "../../../lib/engine/segment-cuboid-distance"
import { cuboidTranslationHits } from "../../../lib/engine/cuboid-translation-hits"
import { translatedCuboid } from "../../../lib/engine/translated-cuboid"
import { type Point3 } from "../../../lib/engine/cuboid-motion-types"
import type { Cuboid } from "../../../lib/engine/cuboid-subtraction"
import type { Rectangle } from "../../../lib/engine/rectangle-subtraction"
import { type Vector3Tuple as V3 } from "../../../lib/engine/vector3-types"
import { lerpVector3 as lerp3 } from "../../../lib/engine/lerp-vector3"
import { subtractVector3 as sub } from "../../../lib/engine/subtract-vector3"
import { nativeWorkStrokeEndpoints } from "./work-stroke"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
import { createBodyContext } from "./context"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
import type { Look } from "./look"
const EPS = 1e-9,
  MAX_DEPTH = 12
export type StrokeRoom = {
  bounds: Rectangle
  ceiling: number
  obstacles: readonly Cuboid[]
}
/** Certificates cover every time in each interval. Unresolved bounds never fall back to sampled success. */
export function certifyWorkStrokeRoom(inputProps: { look: Look; candidate: WorkPoseCandidate; grips: readonly [V3, V3]; axis: V3; tool: Cuboid; room: StrokeRoom }) {
  const look = inputProps.look
  const candidate = inputProps.candidate
  const grips = inputProps.grips
  const axis = inputProps.axis
  const tool = inputProps.tool
  const room = inputProps.room

  const poses = nativeWorkStrokeEndpoints({ look: look, candidate: candidate, grips: grips, axis: axis }),
    base = poses[0],
    shoulder = base.skeleton.p[`upperarm_${candidate.hand}`],
    metrics = armGripLengths(base.skeleton, candidate.hand),
    scale = createBodyContext(look, base.skeleton, null).S
  const a = poses[0].solution.grip,
    b = poses[1].solution.grip,
    world = (p: V3): Point3 => {
      const xState = quarterTurnPoint(p[0], p[2], base.turn),
        x = xState[0],
        z = xState[1]
      return [x + candidate.body_m[0], p[1] + base.rootY, z + candidate.body_m[1]]
    }
  const inside = (box: Cuboid) =>
    box.x0 >= room.bounds.x0 - EPS && box.x1 <= room.bounds.x1 + EPS && box.z0 >= room.bounds.z0 - EPS && box.z1 <= room.bounds.z1 + EPS && box.bottom >= -EPS && box.top <= room.ceiling + EPS
  if (!grips.every((p) => inside(translatedCuboid(tool, p))) || room.obstacles.some((o) => cuboidTranslationHits({ relative: tool, from: grips[0], to: grips[1], obstacle: o, tolerance: EPS })))
    throw new Error("Working tool crosses its room section")
  const pending = [{ lo: 0, hi: 1, depth: 0 }]
  let intervals = 0
  while (pending.length) {
    const loSource = pending.pop()!,
      lo = loSource.lo,
      hi = loSource.hi,
      depth = loSource.depth,
      from = lerp3(a, b, lo),
      to = lerp3(a, b, hi),
      mid = lerp3(a, b, (lo + hi) / 2),
      speed = twoBoneJointSpeedBound({ root: shoulder, from: from, to: to, upper: metrics.upper, lower: metrics.forearm + metrics.palm, pole: candidate.pole }),
      solution = solveArmGrip({ skeleton: base.skeleton, side: candidate.hand, target: mid, pole: candidate.pole })
    let clear = false
    if (speed !== undefined && solution) {
      const margin = nativeArmMotionSpeed({ scale: scale, forearm: metrics.forearm, palm: metrics.palm, elbowSpeed: speed, gripSpeed: Math.hypot(...sub(to, from)) }) / 2 + 1e-10,
        surfaces = nativeArmSurfaces({ scale: scale, shoulder: shoulder, elbow: solution.elbow, wrist: solution.wrist })
      clear = [surfaces.arm, surfaces.cuff].every((surface) =>
        surface.capsuleBounds().every((c) => {
          const p = world(c.a),
            q = world(c.b),
            radius = c.r + margin,
            box = {
              x0: Math.min(p[0], q[0]) - radius,
              x1: Math.max(p[0], q[0]) + radius,
              bottom: Math.min(p[1], q[1]) - radius,
              top: Math.max(p[1], q[1]) + radius,
              z0: Math.min(p[2], q[2]) - radius,
              z1: Math.max(p[2], q[2]) + radius,
            }
          return inside(box) && room.obstacles.every((o) => segmentCuboidDistance(o, p, q) >= radius - EPS)
        }),
      )
    }
    if (clear) {
      intervals++
      continue
    }
    if (depth === MAX_DEPTH) throw new Error(`Working arm room clearance remains unresolved in [${lo}, ${hi}]`)
    const middle = (lo + hi) / 2
    pending.push({ lo: middle, hi, depth: depth + 1 }, { lo, hi: middle, depth: depth + 1 })
  }
  return { intervals }
}
