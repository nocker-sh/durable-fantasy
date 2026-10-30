const MAX_FRAME_PIXELS = 65536
type Props = { width: number; height: number; originX: number; originY: number; padding: number }
/** Extend the transparent viewport and its anchor together, preserving the original pixel scale. */
export function getPaddedFrameLayout(props: Props) {
  if (![props.width, props.height, props.padding].every(Number.isSafeInteger) || props.width <= 0 || props.height <= 0 || props.padding < 0 || ![props.originX, props.originY].every(Number.isFinite))
    return new Error("Invalid padded frame layout")
  const width = props.width + props.padding * 2,
    height = props.height + props.padding * 2
  if (!Number.isSafeInteger(width * height) || width * height > MAX_FRAME_PIXELS) return new Error("Padded frame exceeds its pixel budget")
  return { width, height, originX: props.originX + props.padding, originY: props.originY + props.padding, padding: props.padding }
}
