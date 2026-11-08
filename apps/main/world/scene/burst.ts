import type * as THREE from "three"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { slimeBody } from "#/world/scene/fields/slime-body"
import type { MonsterView } from "#/world/scene/monsters"
import { clearBurst } from "#/world/scene/helpers/monsters/clear-burst"

/** The creature was beaten: a slime bursts into little ones that run off; a hare just bolts. */
export function burst(m: MonsterView, root: THREE.Group, now: number) {
  const kind = MONSTER_KINDS[m.spawn.kind]
  if (kind.look !== "slime") return
  clearBurst(m)
  const bits = [0, 1, 2, 3].map(() => {
    const b = slimeBody(kind.color ?? 0x8ac06a)
    root.add(b)
    return b
  })
  m.burst = { bits, until: now + 1200 }
}
