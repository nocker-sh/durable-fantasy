import type { Primitive } from "#/lib/graphics/ray/primitive-types"
import { getPaddedFrameLayout } from "#/lib/graphics/get-padded-frame-layout"
import { PixelBuffer as PixBuf } from "../../../lib/graphics/pixel-buffer"
import { FW, FH, OX, OY } from "#/world/scene/figure/render"
import { renderSkeletonFrame } from "#/world/scene/figure/render-skeleton-frame"
import type { Look, Item } from "#/world/scene/figure/look"
import type { Skel } from "#/world/scene/rig"
type Props = { look: Look; skeleton: Skel; view: number; item: Item; padding: number; blink: boolean; extraPrimitives?: readonly Omit<Primitive, "id">[] }
/** Return the expanded image with its matching feet anchor; native sprite dimensions and placement stay separate. */
export function getPaddedPoseFrame(props: Props) {
  const layout = getPaddedFrameLayout({ width: FW, height: FH, originX: OX, originY: OY, padding: props.padding })
  if (layout instanceof Error) return layout
  const pixels = new PixBuf(layout.width, layout.height)
  const error = renderSkeletonFrame({
    L: props.look,
    skeleton: props.skeleton,
    view: props.view,
    item: props.item,
    out: pixels,
    ox: 0,
    oy: 0,
    options: { padding: props.padding, blink: props.blink, extraPrimitives: props.extraPrimitives },
  })
  if (error instanceof Error) return error
  return { pixels, anchor: { x: layout.originX, y: layout.originY } }
}
