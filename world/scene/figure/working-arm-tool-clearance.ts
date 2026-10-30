import { twoBoneJointSpeedBound } from "#/lib/engine/two-bone-joint-speed-bound"
import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import { type Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { lerpVector3 as lerp3 } from "#/lib/engine/lerp-vector3"
import { subtractVector3 as sub } from "#/lib/engine/subtract-vector3"
import { projectToolFrame } from "#/world/town/project-tool-frame"
import type { WorkingToolGeometry } from "#/world/town/working-tool"
import { nativeWorkStrokeEndpoints } from "#/world/scene/figure/work-stroke"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { nativeArmMotionSpeed } from "#/world/scene/figure/native-arm-motion-speed"
import { createBodyContext } from "#/world/scene/figure/context"
import { armGripLengths } from "#/world/scene/figure/arm-grip-lengths"
import { solveArmGrip } from "#/world/scene/figure/solve-arm-grip"
import type { Look } from "#/world/scene/figure/look"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
const EPS = 1e-9,
  MAX_DEPTH = 12
const minProduct = (inputProps: { lo: number; hi: number; value: number; error: number }) => {
  const lo = inputProps.lo
  const hi = inputProps.hi
  const value = inputProps.value
  const error = inputProps.error
  return Math.min(lo * (value - error), lo * (value + error), hi * (value - error), hi * (value + error))
}
/** Handle contact is restricted to the palm side; finger contact surfaces remain unverified. */
export function certifyWorkingArmTool(inputProps: { look: Look; candidate: WorkPoseCandidate; grips: readonly [V3, V3]; axis: V3; tool: WorkingToolGeometry }) {
  const look = inputProps.look
  const candidate = inputProps.candidate
  const grips = inputProps.grips
  const axis = inputProps.axis
  const tool = inputProps.tool

  const poses = nativeWorkStrokeEndpoints({ look: look, candidate: candidate, grips: grips, axis: axis }),
    base = poses[0],
    shoulder = base.skeleton.p[`upperarm_${candidate.hand}`],
    metrics = armGripLengths(base.skeleton, candidate.hand),
    scale = createBodyContext(look, base.skeleton, null).S,
    a = poses[0].solution.grip,
    b = poses[1].solution.grip,
    inverse = ((4 - base.turn) % 4) as 0 | 1 | 2 | 3
  const local = (p: Point3): Point3 => {
      const xState = quarterTurnPoint(p[0], p[2], inverse),
        x = xState[0],
        z = xState[1]
      return [x, p[1], z]
    },
    axes: WorkingToolGeometry["axes"] = [local(tool.axes[0]), local(tool.axes[1]), local(tool.axes[2])]
  const blade = tool.parts.find((p) => p.part === "blade")?.bounds,
    handle = tool.parts.find((p) => p.part === "handle")?.bounds
  if (!blade || !handle || handle.bottom >= 0 || handle.top <= 0) throw new Error("Working grip is not within the handle")
  const palm = nativeArmSurfaces({ scale: scale, shoulder: shoulder, elbow: base.solution.elbow, wrist: base.solution.wrist }).palm,
    halfDiagonal = Math.hypot(Math.max(Math.abs(handle.x0), Math.abs(handle.x1)), Math.max(Math.abs(handle.z0), Math.abs(handle.z1)))
  if (Math.abs(palm.fromWrist - metrics.palm) + halfDiagonal >= palm.radius) throw new Error("Working handle does not fit the native palm core")
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
      solution = solveArmGrip({ skeleton: base.skeleton, side: candidate.hand, target: mid, pole: candidate.pole }),
      targetSpeed = Math.hypot(...sub(to, from))
    let clear = false
    if (speed !== undefined && solution) {
      const surfaces = nativeArmSurfaces({ scale: scale, shoulder: shoulder, elbow: solution.elbow, wrist: solution.wrist }),
        direction = projectToolFrame(axes, surfaces.direction),
        error = (speed + targetSpeed) / (metrics.forearm + metrics.palm) / 2 + 1e-10
      const plane =
        metrics.palm +
        minProduct({ lo: handle.x0, hi: handle.x1, value: direction[0], error: error }) +
        minProduct({ lo: handle.bottom, hi: handle.top, value: direction[1], error: error }) +
        minProduct({ lo: handle.z0, hi: handle.z1, value: direction[2], error: error })
      const point = (p: V3) => projectToolFrame(axes, sub(p, mid)),
        separate = (box: Cuboid, c: { a: V3; b: V3; r: number }, margin: number) => segmentCuboidDistance(box, point(c.a), point(c.b)) >= c.r + margin - EPS
      const armMargin = (nativeArmMotionSpeed({ scale: scale, forearm: metrics.forearm, palm: metrics.palm, elbowSpeed: speed, gripSpeed: targetSpeed }) + targetSpeed) / 2 + 1e-10,
        upperMargin = (speed + targetSpeed) / 2 + 1e-10
      clear = plane > EPS && separate(handle, surfaces.arm.capsuleBounds()[0], upperMargin) && [surfaces.arm, surfaces.cuff].every((s) => s.capsuleBounds().every((c) => separate(blade, c, armMargin)))
    }
    if (clear) {
      intervals++
      continue
    }
    if (depth === MAX_DEPTH) throw new Error(`Working arm/tool clearance remains unresolved in [${lo}, ${hi}]`)
    const middle = (lo + hi) / 2
    pending.push({ lo: middle, hi, depth: depth + 1 }, { lo, hi: middle, depth: depth + 1 })
  }
  return { intervals }
}
