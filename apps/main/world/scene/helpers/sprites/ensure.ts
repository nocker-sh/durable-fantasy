const FPS = 8
import { ANIMS } from "#/world/scene/figure/animation"
import type { Anim } from "#/world/scene/figure/animation"
import { clipDur } from "#/world/scene/clip-dur"

// frames per second of a baked clip, as in the village

/** Register a clip as an anim the renderer can draw (pelvis pinned, so root motion stays in place). */
export function ensure(clip: string, seatY?: number): Anim {
  const key = (seatY ? `${clip}@${seatY}` : clip) as Anim
  if (!ANIMS[key]) ANIMS[key] = { clip, n: Math.max(2, Math.round(clipDur(clip) * FPS)), still: true, seatY }
  return key
}
