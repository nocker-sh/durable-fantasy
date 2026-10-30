export type CarryGaitPlayback = "forward" | "reverse"
type Props = { phase: number; frameCount: number; playback: CarryGaitPlayback }
/** Reverse the same cyclic poses without negative indices or a new clip; contact and speed are separate constraints. */
export function getCarryGaitFrame(props: Props): number | Error {
  if (!Number.isSafeInteger(props.phase) || !Number.isSafeInteger(props.frameCount) || props.frameCount < 2 || (props.playback !== "forward" && props.playback !== "reverse"))
    return new Error("Invalid carry gait phase")
  const offset = props.phase % props.frameCount
  if (offset === 0) return 0
  const frame = offset < 0 ? offset + props.frameCount : offset
  if (props.playback === "forward") return frame
  return props.frameCount - frame
}
