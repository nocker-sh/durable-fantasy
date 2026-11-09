import { poseSkel } from "#/world/scene/pose-skel"
import type { Skel } from "#/world/scene/rig"
import type { Look } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"
import { ANIMS } from "#/world/scene/figure/animation"
import { proportions } from "#/world/scene/figure/helpers/animation/proportions"

export function skelFor(L: Look, a: Anim, f: number): Skel {
  const A = ANIMS[a]
  const t = (A.t0 ?? 0) + ((A.t1 ?? 1) - (A.t0 ?? 0)) * (f / A.n)
  return poseSkel(A.clip, { t, still: A.still, seatY: A.seatY }, proportions(L))
}
