import { getNativeBackstepPose } from "#/world/scene/figure/get-native-backstep-pose"
type Props = Parameters<typeof getNativeBackstepPose>[0] & { cycle: number }

/** Carry each grounded endpoint into the next cycle; the initial settling drop happens once rather than accumulating. */
export function getNativeBackstepCyclePose(props: Props): ReturnType<typeof getNativeBackstepPose> {
  if (!Number.isSafeInteger(props.cycle) || props.cycle < 0 || props.cycle >= 16) return new Error("Backward step exceeds its cycle budget")
  const bases = [props.skeleton]
  for (const cycle of Array.from({ length: props.cycle }).keys()) {
    const endpoint = getNativeBackstepPose({ ...props, skeleton: bases[cycle], phase: 1, settlingDrop: cycle === 0 ? props.settlingDrop : 0 })
    if (endpoint instanceof Error) return endpoint
    bases.push(endpoint.skeleton)
  }

  return getNativeBackstepPose({ ...props, skeleton: bases[props.cycle], settlingDrop: props.cycle === 0 ? props.settlingDrop : 0 })
}
