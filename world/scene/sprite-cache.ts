import type { Look, Item } from "#/world/scene/figure/look"
import { readyFrame } from "#/world/scene/ready-frame"
import { spriteFrame } from "#/world/scene/sprite-frame"
import { ensure } from "#/world/scene/helpers/sprites/ensure"
import { frameCount } from "#/world/scene/frame-count"

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
  get(inputProps: { id: string; clip: string; view: number; f: number; seatY?: number }): ImageBitmap | null {
    const id = inputProps.id
    const clip = inputProps.clip
    const view = inputProps.view
    const f = inputProps.f
    const seatY = inputProps.seatY

    const entry = this.looks.get(id)
    if (!entry) return null
    const lookState = entry,
      look = lookState[0],
      item = lookState[1]
    const anim = ensure(clip, seatY)
    const data = spriteFrame({ look: look, item: item, anim: anim, view: view, f: f, urgency: 400 })
    if (data) return data
    const n = frameCount(clip, seatY)
    for (const k = { value: 1 }; k.value < n; k.value++) {
      const near = readyFrame({ look: look, item: item, anim: anim, view: view, f: (f + k.value) % n }) ?? readyFrame({ look: look, item: item, anim: anim, view: view, f: (f - k.value + n) % n })
      if (near) return near
    }
    const idle = ensure("Idle_A")
    for (const k = { value: 0 }; k.value < frameCount("Idle_A"); k.value++) {
      const stand = readyFrame({ look: look, item: item, anim: idle, view: view, f: k.value })
      if (stand) return stand
    }
    spriteFrame({ look: look, item: item, anim: idle, view: view, f: 0, urgency: 300 })
    return null
  }

  /** Ask for a clip: every frame of the first view now, the first frame of the other views after. */
  warm(inputProps: { id: string; clip: string; views: number[]; seatY?: number }) {
    const id = inputProps.id
    const clip = inputProps.clip
    const views = inputProps.views
    const seatY = inputProps.seatY

    const entry = this.looks.get(id)
    if (!entry) return
    const lookState2 = entry,
      look = lookState2[0],
      item = lookState2[1]
    const anim = ensure(clip, seatY)
    const n = frameCount(clip, seatY)
    for (const f = { value: 0 }; f.value < n; f.value++) spriteFrame({ look: look, item: item, anim: anim, view: views[0], f: f.value, urgency: 200 - f.value })
    for (const v of views.slice(1)) spriteFrame({ look: look, item: item, anim: anim, view: v, f: 0, urgency: -100 })
  }
}
