import { getPouringPotPose } from "#/world/town/get-pouring-pot-pose"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = Omit<Parameters<typeof getPouringPotPose>[0], "lipAt"> & { gripAt: Point3 }

/** Rotate the whole vessel around its actual carrying grip instead of keeping the lip artificially pinned. */
export function getPouringPotHeldPose(props: Props): ReturnType<typeof getPouringPotPose> {
  if (!props.gripAt.every(Number.isFinite)) return new Error("Invalid held pot grip position")
  const zero = getPouringPotPose({ ...props, lipAt: [0, 0, 0] })
  if (zero instanceof Error) return zero
  const delta: Point3 = [props.gripAt[0] - zero.gripAt[0], props.gripAt[1] - zero.gripAt[1], props.gripAt[2] - zero.gripAt[2]]
  const at: Point3 = [zero.at[0] + delta[0], zero.at[1] + delta[1], zero.at[2] + delta[2]]

  return { at, rotation: zero.rotation, gripAt: [...props.gripAt] satisfies Point3, lipAt: delta }
}
