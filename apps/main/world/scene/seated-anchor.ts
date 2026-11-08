import { FRAMES } from "#/world/scene/figure/animation"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import type { Look } from "#/world/scene/figure/look"
const anchors = new WeakMap<Look, readonly (readonly [number, number])[]>()

/** Match the rendered strip frame, including the sitting clip's original horizontal root offset. */
export function seatedAnchor(look: Look, time: number): readonly [number, number] {
  const cached = anchors.get(look)
  const frames =
    cached ||
    Array.from({ length: FRAMES.sit }, (_, frame) => {
      const pelvis = skelFor(look, "sit", frame).p.pelvis
      return [pelvis[0], pelvis[2]] as const
    })
  if (!cached) anchors.set(look, frames)
  const frame = Math.floor(((((time / (Math.PI * 2)) % 1) + 1) % 1) * frames.length) % frames.length
  return frames[frame]
}
