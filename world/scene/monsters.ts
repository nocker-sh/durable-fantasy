import type * as THREE from "three"
import { MonsterMotion } from "#/world/core/monster-motion"
import type { Spawn } from "#/world/core/monster-types"
import type { V2 } from "#/world/maps/layout"

export type MonsterView = {
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
