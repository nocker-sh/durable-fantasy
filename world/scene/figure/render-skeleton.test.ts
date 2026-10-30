import { expect, it } from "vitest"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
import { PixelBuffer as PixBuf } from "../../../lib/graphics/pixel-buffer"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { blinks } from "#/world/scene/figure/helpers/animation/blinks"
import { FW, FH } from "#/world/scene/figure/render"
import { renderFrame } from "#/world/scene/figure/render-frame"
import { renderSkeletonFrame } from "#/world/scene/figure/render-skeleton-frame"
it("preserves the native pixels when drawing the same baked skeleton through the explicit pose renderer", () => {
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((r) => r.name === "エーリヒ")]
  for (const [anim, frame, view] of [
    ["idle", 4, 0],
    ["scrub", 0, 5],
    ["idle", 0, 2],
  ] as const) {
    const original = new PixBuf(FW, FH),
      explicit = new PixBuf(FW, FH)
    renderFrame({ L: look, anim: anim, f: frame, view: view, item: null, out: original, ox: 0, oy: 0 })
    renderSkeletonFrame({ L: look, skeleton: skelFor(look, anim, frame), view: view, item: null, out: explicit, ox: 0, oy: 0, options: blinks(anim, frame) })
    expect(explicit.data).toEqual(original.data)
  }
})
