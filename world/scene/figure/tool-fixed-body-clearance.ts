import { cuboidTranslationHits } from "#/lib/engine/cuboid-translation-hits"
import { type Point3 } from "#/lib/engine/cuboid-motion-types"
import { segmentCuboidDistance } from "#/lib/engine/segment-cuboid-distance"
import { quarterTurnPoint } from "#/lib/engine/quarter-turn-point"
import { primitiveBounds } from "#/lib/graphics/ray/primitive-bounds"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import { projectToolFrame } from "#/world/town/project-tool-frame"
import type { WorkingToolGeometry } from "#/world/town/working-tool"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"
import type { nativeWorkPose } from "#/world/scene/figure/native-work-pose"
const EPS = 1e-9,
  MAX_DEPTH = 12
/** Fixed body parts, including the opposite arm. Moving working-arm and grip contact need separate checks. */
export function certifyToolFixedBody(inputProps: { base: ReturnType<typeof nativeWorkPose>; candidate: WorkPoseCandidate; grips: readonly [V3, V3]; tool: WorkingToolGeometry }) {
  const base = inputProps.base
  const candidate = inputProps.candidate
  const grips = inputProps.grips
  const tool = inputProps.tool

  const moving = new Set(base.body.armParts[candidate.hand]),
    fixed = base.body.prims.filter((p) => !moving.has(p))
  const project = (p: Point3) => projectToolFrame(tool.axes, p)
  const bodyPoint = (p: V3): Point3 => {
    const xState = quarterTurnPoint(p[0], p[2], base.turn),
      x = xState[0],
      z = xState[1]
    return project([x + candidate.body_m[0], p[1] + base.rootY, z + candidate.body_m[1]])
  }
  const a = project(grips[0]),
    b = project(grips[1]),
    relative = (p: Point3, t: Point3): Point3 => [p[0] - t[0], p[1] - t[1], p[2] - t[2]]
  const projectedBox = (bounds: ReturnType<typeof primitiveBounds>) => {
    const corners = [bounds.min[0], bounds.max[0]].flatMap((x) => [bounds.min[1], bounds.max[1]].flatMap((y) => [bounds.min[2], bounds.max[2]].map((z) => bodyPoint([x, y, z]))))
    return {
      x0: Math.min(...corners.map((p) => p[0])),
      x1: Math.max(...corners.map((p) => p[0])),
      bottom: Math.min(...corners.map((p) => p[1])),
      top: Math.max(...corners.map((p) => p[1])),
      z0: Math.min(...corners.map((p) => p[2])),
      z1: Math.max(...corners.map((p) => p[2])),
    }
  }
  for (const part of tool.parts)
    for (const p of fixed) {
      const box = projectedBox(primitiveBounds(p))
      if (!cuboidTranslationHits({ relative: part.bounds, from: a, to: b, obstacle: box, tolerance: EPS })) continue
      const cap = p.kind === "cap" || p.kind === "cone",
        centre = bodyPoint(cap ? ([(p.a[0] + p.b[0]) / 2, (p.a[1] + p.b[1]) / 2, (p.a[2] + p.b[2]) / 2] as V3) : p.a),
        radius = cap ? Math.hypot(...p.a.map((v, i) => v - p.b[i])) / 2 + Math.max(p.r, p.r2) : p.kind === "sph" ? p.r * Math.max(p.sx ?? 1, p.sy ?? 1, p.sz ?? 1) : p.r
      if (segmentCuboidDistance(part.bounds, relative(centre, a), relative(centre, b)) >= radius - EPS) continue
      const boxes = p.boxBounds?.()
      if (boxes && boxes.every((box) => !cuboidTranslationHits({ relative: part.bounds, from: a, to: b, obstacle: projectedBox(box), tolerance: EPS }))) continue
      const capsules = p.capsuleBounds?.() ?? (cap ? [{ a: p.a, b: p.b, r: Math.max(p.r, p.r2) }] : undefined)
      if (capsules) {
        const pending = [{ a, b, depth: 0 }]
        let clear = true
        while (pending.length) {
          const interval = pending.pop()!,
            middle: Point3 = [(interval.a[0] + interval.b[0]) / 2, (interval.a[1] + interval.b[1]) / 2, (interval.a[2] + interval.b[2]) / 2],
            margin = Math.hypot(...interval.a.map((v, i) => v - interval.b[i])) / 2
          if (capsules.every((c) => segmentCuboidDistance(part.bounds, relative(bodyPoint(c.a), middle), relative(bodyPoint(c.b), middle)) >= c.r + margin - EPS)) continue
          if (interval.depth === MAX_DEPTH) {
            clear = false
            break
          }
          pending.push({ a: middle, b: interval.b, depth: interval.depth + 1 }, { a: interval.a, b: middle, depth: interval.depth + 1 })
        }
        if (clear) continue
      }
      throw new Error(`Working ${part.part} fixed-body clearance remains unresolved at primitive ${p.id}`)
    }
  return { primitives: fixed.length, parts: tool.parts.length }
}
