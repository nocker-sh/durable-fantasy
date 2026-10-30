import { certifyLinearInterval } from "#/lib/engine/certify-linear-interval"
import { canClearWorkForearmInterval } from "#/world/scene/figure/can-clear-work-forearm-interval"
import { nativeWorkStrokeEndpoints } from "#/world/scene/figure/work-stroke"
import type { Vector3Tuple as V3 } from "#/lib/engine/vector3-types"
import type { Look } from "#/world/scene/figure/look"
import type { WorkPoseCandidate } from "#/world/scene/figure/work-pose"

/** Legacy throwing boundary; forearm, hand and cuff only, excluding the shoulder attachment and upper arm. */
export function certifyForearmBody(inputProps: { look: Look; candidate: WorkPoseCandidate; grips: readonly [V3, V3]; axis: V3 }) {
  const look = inputProps.look
  const candidate = inputProps.candidate
  const grips = inputProps.grips
  const axis = inputProps.axis

  if (candidate.hand === "l" && look.shield) throw new Error("Working-arm shield motion requires a separate clearance certificate")
  const poses = nativeWorkStrokeEndpoints({ look: look, candidate: candidate, grips: grips, axis: axis }),
    base = poses[0]
  const moving = new Set(base.body.armParts[candidate.hand]),
    fixed = base.body.prims.filter((primitive) => !moving.has(primitive))
  const certificate = certifyLinearInterval({
    from: poses[0].solution.grip,
    to: poses[1].solution.grip,
    canClear: (from, to) => canClearWorkForearmInterval({ look, skeleton: base.skeleton, hand: candidate.hand, pole: candidate.pole, fixed, from: [...from], to: [...to] }),
  })
  if (certificate instanceof Error) throw new Error("Working forearm/body clearance remains unresolved", { cause: certificate })

  return { intervals: certificate.intervals.length, primitives: fixed.length }
}
