// Villager sprite frames for any baked clip, rendered on demand and cached per
// look/item/clip/view/frame. Frames are drawn by sprite workers; the main thread only shows them.
import { ANIMS, type Look, type Anim, type Item } from "./figure"
import { clipDur } from "./rig"
import { readyFrame, spriteFrame } from "./sprite-pool"

const FPS = 8 // frames per second of a baked clip, as in the village

/** Register a clip as an anim the renderer can draw (pelvis pinned, so root motion stays in place). */
function ensure(clip: string, seatY?: number): Anim {
  const key = (seatY ? `${clip}@${seatY}` : clip) as Anim
  if (!ANIMS[key]) ANIMS[key] = { clip, n: Math.max(2, Math.round(clipDur(clip) * FPS)), still: true, seatY }
  return key
}

export const frameCount = (clip: string, seatY?: number) => ANIMS[ensure(clip, seatY)].n
export const clipSeconds = (clip: string) => clipDur(clip)
/** Frame index of a clip that has been playing for t seconds (looping). */
export function frameAt(clip: string, t: number, seatY?: number) {
  const n = frameCount(clip, seatY),
    d = clipDur(clip)
  return Math.floor(((t % d) / d) * n) % n
}

export class SpriteCache {
  private looks = new Map<string, [Look, Item]>()

  /** id names a character (player, a resident) so several looks can share the cache. */
  setLook(id: string, look: Look, item: Item) {
    this.looks.set(id, [look, item])
  }

  /**
   * The frame, or while it is still being drawn by a worker the nearest frame of the same clip
   * and view, then the standing frame of that view; null when there is nothing yet.
   */
  get(id: string, clip: string, view: number, f: number, seatY?: number): ImageBitmap | null {
    const entry = this.looks.get(id)
    if (!entry) return null
    const [look, item] = entry
    const anim = ensure(clip, seatY)
    const data = spriteFrame(look, item, anim, view, f, 400)
    if (data) return data
    const n = frameCount(clip, seatY)
    for (let k = 1; k < n; k++) {
      const near = readyFrame(look, item, anim, view, (f + k) % n) ?? readyFrame(look, item, anim, view, (f - k + n) % n)
      if (near) return near
    }
    const idle = ensure("Idle_A")
    for (let k = 0; k < frameCount("Idle_A"); k++) {
      const stand = readyFrame(look, item, idle, view, k)
      if (stand) return stand
    }
    spriteFrame(look, item, idle, view, 0, 300)
    return null
  }

  /** Ask for a clip: every frame of the first view now, the first frame of the other views after. */
  warm(id: string, clip: string, views: number[], seatY?: number) {
    const entry = this.looks.get(id)
    if (!entry) return
    const [look, item] = entry
    const anim = ensure(clip, seatY)
    const n = frameCount(clip, seatY)
    for (let f = 0; f < n; f++) spriteFrame(look, item, anim, views[0], f, 200 - f)
    for (const v of views.slice(1)) spriteFrame(look, item, anim, v, 0, -100)
  }
}
