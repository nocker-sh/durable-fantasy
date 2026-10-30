import type { Anim } from "#/world/scene/figure/animation"
import { ANIMS } from "#/world/scene/figure/animation"

export const blinks = (a: Anim, f: number) => {
  const b = ANIMS[a].blink
  return b === true || !!b?.includes(f)
}
