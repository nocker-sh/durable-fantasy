// The creatures on screen (core/monsters.ts): each is drawn where the clock puts it, hopping from
// rest to rest; what the server says of their hurts shows as a little bar, blows as numbers that
// float up, and a beaten slime bursts into little ones that scatter.
import type * as THREE from "three"
import { MONSTER_KINDS, SPAWNS, MonsterMotion, type Spawn } from "../core/monsters.ts"
import { hareBody, slimeBody } from "./fields"
import { isFree, walkH, type V2 } from "./world"

export interface MonsterView {
  spawn: Spawn
  motion: MonsterMotion
  body: THREE.Group
  pos: V2
  /** Cached terrain height at pos; invalidated when the creature moves. */
  groundHeight?: number
  hp: number
  back: number
  /** the burst of little slimes, while it plays */
  burst: { bits: THREE.Group[]; until: number } | null
  label: HTMLDivElement
  hpBar: HTMLElement
  hpWidth?: number
}

export function makeMonsters(root: THREE.Group, map: string): MonsterView[] {
  return SPAWNS.filter((s) => s.map === map).map((spawn) => {
    const kind = MONSTER_KINDS[spawn.kind]
    const body = kind.look === "slime" ? slimeBody(kind.color ?? 0x8ac06a) : hareBody(kind.color)
    body.scale.setScalar(kind.size ?? 1)
    body.userData.monster = spawn.id
    root.add(body)
    const label = document.createElement("div")
    label.className = "gx-nameplate gx-nameplate--npc"
    label.innerHTML = `<span>${kind.name}</span><span class="gx-hp"><span></span></span>`
    return { spawn, motion: new MonsterMotion(spawn, isFree), body, pos: [0, 0] as V2, hp: kind.hp, back: 0, burst: null, label, hpBar: label.querySelector<HTMLElement>(".gx-hp > span")! }
  })
}

/** The rendered percentage changes on damage and recovery, not on every animation frame. */
export function updateMonsterHealth(m: MonsterView) {
  const width = Math.round((m.hp / MONSTER_KINDS[m.spawn.kind].hp) * 100)
  if (m.hpWidth === width) return
  m.hpBar.style.width = `${width}%`
  m.hpWidth = width
}

/** Move each to where the clock puts it, hop it, hide it while it is off recovering. */
/** `yaw`: where the camera looks from; a creature sitting still turns its face that way. */
export function updateMonsters(list: MonsterView[], root: THREE.Group, now: number, yaw = 0, dt = 1 / 30) {
  for (const m of list) {
    const away = m.back > now || m.hp === 0
    m.body.visible = !away
    // Motion is clock-based: hidden creatures can catch up directly when they return.
    if (away && !m.burst) continue
    const at = m.motion.at(now)
    if (m.pos[0] !== at.x || m.pos[1] !== at.z) m.groundHeight = undefined
    m.pos[0] = at.x
    m.pos[1] = at.z
    if ((!away || m.burst) && m.groundHeight === undefined) m.groundHeight = walkH(at.x, at.z)
    if (!away) {
      // shuffling: small hops; sitting: a slow quiver, each to its own beat
      const beat = now / 700 + m.body.id
      const hop = at.moving ? Math.abs(Math.sin(now / 220)) * 0.09 : 0
      const squash = at.moving ? 1 - Math.sin(now / 110) * 0.07 : 1 + Math.sin(beat) * 0.035
      m.body.position.set(at.x, m.groundHeight! + 0.06 + hop, at.z)
      if (MONSTER_KINDS[m.spawn.kind].look === "slime") {
        const sz = MONSTER_KINDS[m.spawn.kind].size ?? 1
        m.body.scale.set(sz / Math.sqrt(squash), sz * squash, sz / Math.sqrt(squash))
      }
      if (at.moving) {
        const ahead = m.motion.at(now + 200)
        m.body.rotation.y = Math.atan2(ahead.x - at.x, ahead.z - at.z)
      } else {
        const d = Math.atan2(Math.sin(yaw - m.body.rotation.y), Math.cos(yaw - m.body.rotation.y))
        m.body.rotation.y += d * (1 - 0.92 ** (dt * 30))
      }
    }
    if (m.burst) {
      const k = 1 - (m.burst.until - now) / 1200
      m.burst.bits.forEach((b, i) => {
        const a = (i / m.burst!.bits.length) * Math.PI * 2
        b.position.set(m.pos[0] + Math.cos(a) * k * 1.6, m.groundHeight! + 0.05 + Math.sin(k * Math.PI) * 0.4, m.pos[1] + Math.sin(a) * k * 1.6)
        b.scale.setScalar(0.45 * (1 - k * 0.5))
      })
      if (now >= m.burst.until) {
        clearBurst(m)
      }
    }
  }
}

/** Burst meshes own their geometry and materials, but borrow the shared slime texture. */
function clearBurst(m: MonsterView) {
  const effect = m.burst
  m.burst = null
  if (!effect) return
  for (const bit of effect.bits) {
    bit.removeFromParent()
    bit.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) material.dispose()
    })
  }
}

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

/** A free spot within reach of the creature, on the side we come from. */
export function standBy(m: MonsterView, from: V2, reach: number): V2 | null {
  const ang = Math.atan2(from[1] - m.pos[1], from[0] - m.pos[0])
  for (let k = 0; k < 8; k++) {
    const a = ang + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Math.PI / 4)
    const p: V2 = [m.pos[0] + Math.cos(a) * reach * 0.7, m.pos[1] + Math.sin(a) * reach * 0.7]
    if (isFree(p[0], p[1])) return p
  }
  return null
}
