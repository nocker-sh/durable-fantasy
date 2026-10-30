import { LEG_BONES } from "#/world/scene/figure/leg-bones"
import type { Skel } from "#/world/scene/rig"
type Props<Upper extends Skel> = Readonly<{ upper: Upper; legs: Skel }>

/** Assemble only the solved leg bones; a certified upper pose and its palm profile cannot drift with gait phase. */
export function withNativeLegPose<Upper extends Skel>(props: Props<Upper>): Upper | Error {
  if (props.upper.rest !== props.legs.rest) return new Error("Native legs belong to a different rest skeleton")
  const upperPelvis = [...props.upper.p.pelvis, ...props.upper.q.pelvis],
    legPelvis = [...props.legs.p.pelvis, ...props.legs.q.pelvis]
  if (upperPelvis.some((value, index) => !Number.isFinite(value) || value !== legPelvis[index])) return new Error("Native leg pose has a different pelvic frame")
  const p = { ...props.upper.p },
    q = { ...props.upper.q }

  for (const bone of LEG_BONES) {
    p[bone] = [...props.legs.p[bone]]
    q[bone] = [...props.legs.q[bone]]
  }

  return { ...props.upper, p, q }
}
