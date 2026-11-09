import { ANIMS } from "#/world/scene/figure/animation"
import { ensure } from "#/world/scene/helpers/sprites/ensure"

export const frameCount = (clip: string, seatY?: number) => ANIMS[ensure(clip, seatY)].n
