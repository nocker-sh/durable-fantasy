import { getEyePortrait } from "#/dev/get-eye-portrait"
import type { Look, Item } from "#/world/scene/figure/look"
type Props = { look: Look; item: Item; view: number; scale: number }
/** Keep the existing crop and pixels while drawing the single frame this comparison needs. */
export function EyePortrait(props: Props) {
  return (
    <canvas
      style={{ width: 36 * props.scale, imageRendering: "pixelated" }}
      className="rounded bg-[#3a4a3a]"
      ref={(canvas) => {
        if (!canvas) return
        const portrait = getEyePortrait(props)
        canvas.width = portrait.w
        canvas.height = portrait.h
        canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(portrait.data), portrait.w, portrait.h), 0, 0)
      }}
    />
  )
}
