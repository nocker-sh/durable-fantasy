import { BONE_ORDER } from "#/world/scene/rig"
import type { Skel } from "#/world/scene/rig"
import { LEG_BONES } from "#/world/scene/figure/leg-bones"
type Props = Readonly<{ expected: Skel; actual: Skel }>

/** Match actual upper joints, rotations, rest geometry and both palm profiles, while allowing only the independently solved legs to vary. */
export function getNativeRigidUpperPoseMismatchError(props: Props): Error | null {
  const legs = new Set(LEG_BONES)
  for (const bone of BONE_ORDER) {
    const actual = [...props.actual.rest[bone]],
      expected = [...props.expected.rest[bone]]
    if (!legs.has(bone)) {
      actual.push(...props.actual.p[bone], ...props.actual.q[bone])
      expected.push(...props.expected.p[bone], ...props.expected.q[bone])
    }
    if (actual.some((value, index) => !Number.isFinite(value) || value !== expected[index])) return new Error("Native rigid upper reference changes its bones", { cause: { bone } })
  }
  for (const hand of ["l", "r"] satisfies ("l" | "r")[]) {
    const actual = props.actual.handGrips?.[hand],
      expected = props.expected.handGrips?.[hand]
    if (!actual && !expected) continue
    if (!actual || !expected) return new Error("Native rigid upper reference changes its palm contact")
    const values = [...actual.axis, ...actual.across, actual.halfWidth, actual.halfDepth],
      target = [...expected.axis, ...expected.across, expected.halfWidth, expected.halfDepth]
    if (values.some((value, index) => !Number.isFinite(value) || value !== target[index])) return new Error("Native rigid upper reference changes its palm contact")
  }

  return null
}
