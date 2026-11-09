import { buildBody } from "#/world/scene/figure/body"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
type Props = Readonly<{ look: Look; skeleton: Skel; rootY: number; offsets: Exclude<ReturnType<typeof getSideStepOffsets>, Error> }>

/** Both actual shoe capsules follow their declared clearance; releasing a knee never permits its clothed surface below the floor. */
export function getNativeLowStepGroundError(props: Props): Error | null {
  const body = buildBody(props.look, props.skeleton, null)

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const shoe = body.footwear[side],
      knee = body.knees[side],
      height = Math.min(shoe.a[1], shoe.b[1]) - shoe.r + props.rootY
    if (!Number.isFinite(height) || Math.abs(height - props.offsets[side][1]) > 1e-9) return new Error("Native low-step shoe leaves its declared floor clearance")
    if (!knee || !Number.isFinite(knee.c[1] + props.rootY - knee.r) || knee.c[1] + props.rootY - knee.r < -1e-9) return new Error("Native low-step knee enters the floor")
  }

  return null
}
