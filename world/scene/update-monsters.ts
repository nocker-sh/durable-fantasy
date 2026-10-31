import { SLIME_MOVING_SQUASH, SLIME_RESTING_SQUASH } from "#/world/core/monster-body-shapes"
import type * as THREE from "three"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { walkH } from "#/world/scene/walk-h"
import type { MonsterView } from "#/world/scene/monsters"
import { clearBurst } from "#/world/scene/helpers/monsters/clear-burst"

/** Move each to where the clock puts it, hop it, hide it while it is off recovering. */
/** `yaw`: where the camera looks from; a creature sitting still turns its face that way. */
type Props = {
  list: ReadonlyArray<MonsterView>
  root: THREE.Group
  now: number
  yaw?: number
  dt?: number
}

export function updateMonsters(props: Props) {
  const yaw = props.yaw === undefined ? 0 : props.yaw
  const dt = props.dt === undefined ? 1 / 30 : props.dt

  for (const m of props.list) {
    const away = m.back > props.now || m.hp === 0
    m.body.visible = !away
    // Motion is clock-based: hidden creatures can catch up directly when they return.
    if (away && !m.burst) continue
    const at = m.motion.at(props.now)
    if (m.pos[0] !== at.x || m.pos[1] !== at.z) m.groundHeight = undefined
    m.pos[0] = at.x
    m.pos[1] = at.z
    if ((!away || m.burst) && m.groundHeight === undefined) m.groundHeight = walkH(at.x, at.z)
    if (!away) {
      // shuffling: small hops; sitting: a slow quiver, each to its own beat
      const beat = props.now / 700 + m.body.id
      const hop = at.moving ? Math.abs(Math.sin(props.now / 220)) * 0.09 : 0
      const squash = at.moving ? 1 - Math.sin(props.now / 110) * SLIME_MOVING_SQUASH : 1 + Math.sin(beat) * SLIME_RESTING_SQUASH
      m.body.position.set(at.x, m.groundHeight! + 0.06 + hop, at.z)
      if (MONSTER_KINDS[m.spawn.kind].look === "slime") {
        const sz = MONSTER_KINDS[m.spawn.kind].size ?? 1
        m.body.scale.set(sz / Math.sqrt(squash), sz * squash, sz / Math.sqrt(squash))
      }
      if (at.moving) {
        const ahead = m.motion.at(props.now + 200)
        m.body.rotation.y = Math.atan2(ahead.x - at.x, ahead.z - at.z)
      } else {
        const d = Math.atan2(Math.sin(yaw - m.body.rotation.y), Math.cos(yaw - m.body.rotation.y))
        m.body.rotation.y += d * (1 - 0.92 ** (dt * 30))
      }
    }
    if (m.burst) {
      const k = 1 - (m.burst.until - props.now) / 1200
      m.burst.bits.forEach((b, i) => {
        const a = (i / m.burst!.bits.length) * Math.PI * 2
        b.position.set(m.pos[0] + Math.cos(a) * k * 1.6, m.groundHeight! + 0.05 + Math.sin(k * Math.PI) * 0.4, m.pos[1] + Math.sin(a) * k * 1.6)
        b.scale.setScalar(0.45 * (1 - k * 0.5))
      })
      if (props.now >= m.burst.until) {
        clearBurst(m)
      }
    }
  }
}
