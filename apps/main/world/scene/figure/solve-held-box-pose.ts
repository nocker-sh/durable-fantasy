import { getBoxArmClearanceError } from "#/world/scene/figure/get-box-arm-clearance-error"
import { toCarrierLocalPoint } from "#/world/scene/figure/to-carrier-local-point"
import { nativeArmSurfaces } from "#/world/scene/figure/native-arm-surfaces"
import { createBodyContext } from "#/world/scene/figure/context"
import { getBoxCoreClearanceError } from "#/world/scene/figure/get-box-core-clearance-error"
import { buildBody } from "#/world/scene/figure/body"
import { groundFootwear } from "#/world/scene/figure/footing"
import { workPoseTurn } from "#/world/scene/figure/work-pose-turn"
import { solveBimanualGrip } from "#/world/scene/figure/solve-bimanual-grip"
import { getBoxSideGrips } from "#/world/town/get-box-side-grips"
import type { Look } from "#/world/scene/figure/look"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { Skel } from "#/world/scene/rig"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = {
  look: Look
  skeleton: Skel
  parts: ReadonlyArray<StorageBoxPart>
  height: number
  candidate: { body_m: readonly [number, number]; facing: "n" | "s" | "e" | "w"; poles: Record<"l" | "r", Point3> }
}
/** Preserve the supplied native posture and bone lengths while reaching both box anchors; contact, balance and the movement between postures remain separate. */
export function solveHeldBoxPose(props: Props) {
  const skeleton = props.skeleton,
    turn = workPoseTurn(props.candidate.facing)
  const rootY = groundFootwear(buildBody(props.look, skeleton, null).footwear).rootY
  const scale = createBodyContext(props.look, skeleton, null).S
  const palm = nativeArmSurfaces({ scale: scale, shoulder: skeleton.p.upperarm_l, elbow: skeleton.p.lowerarm_l, wrist: skeleton.p.hand_l }).palm
  const grips = getBoxSideGrips({ parts: props.parts, height: props.height, turn, palmRadius: palm.radius })
  if (grips instanceof Error) return grips

  const solved = solveBimanualGrip({
    skeleton,
    grips: { l: toCarrierLocalPoint({ point: grips.l, body: props.candidate.body_m, rootY, turn }), r: toCarrierLocalPoint({ point: grips.r, body: props.candidate.body_m, rootY, turn }) },
    poles: props.candidate.poles,
  })
  if (solved instanceof Error) return solved
  const coreError = getBoxCoreClearanceError({ look: props.look, skeleton: solved.skeleton, rootY, turn, body: props.candidate.body_m, parts: props.parts, height: props.height })
  if (coreError) return coreError
  const armError = getBoxArmClearanceError({ look: props.look, skeleton: solved.skeleton, rootY, turn, body: props.candidate.body_m, parts: props.parts, height: props.height })
  if (armError) return armError
  return { ...solved, rootY, turn, grips }
}
