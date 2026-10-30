import type { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { Look, Item } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { blinks } from "#/world/scene/figure/helpers/animation/blinks"
import { renderSkeletonFrame } from "#/world/scene/figure/render-skeleton-frame"

type Props = {
  L: Look
  anim: Anim
  f: number
  view: number
  item: Item
  out: PixBuf
  ox: number
  oy: number
}

export function renderFrame(props: Props) {
  return renderSkeletonFrame({
    L: props.L,
    skeleton: skelFor(props.L, props.anim, props.f),
    view: props.view,
    item: props.item,
    out: props.out,
    ox: props.ox,
    oy: props.oy,
    options: blinks(props.anim, props.f),
  })
}
