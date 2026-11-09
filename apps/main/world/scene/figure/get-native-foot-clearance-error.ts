import { buildBody } from "#/world/scene/figure/body"
import type { Look } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
import type { getSideStepOffsets } from "#/world/town/get-side-step-offsets"
type Props = Readonly<{ look: Look; skeleton: Skel; rootY: number; offsets: Exclude<ReturnType<typeof getSideStepOffsets>, Error> }>

/** Check both full rendered shoe capsules against the intended floor clearance, including the shoe that has released support. */
export function getNativeFootClearanceError(props: Props): Error | null {
  const body = buildBody(props.look, props.skeleton, null)

  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const shoe = body.footwear[side],
      expected = props.offsets[side][1],
      actual = Math.min(shoe.a[1], shoe.b[1]) - shoe.r + props.rootY
    if (!Number.isFinite(expected) || expected < 0 || !Number.isFinite(actual) || Math.abs(actual - expected) > 1e-9) return new Error("Native shoe leaves its declared floor clearance")
  }

  return null
}
