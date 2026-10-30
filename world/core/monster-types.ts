import type { ItemId } from "#/world/core/items/catalog"
import type { MONSTER_KINDS } from "#/world/core/monsters"

export type MonsterKind = {
  name: string
  hp: number
  def: number
  flee: number
  /** how hard and how surely it strikes back when struck (0: it only runs) */
  atk: number
  hit: number
  exp: number
  drops: readonly { item: ItemId; chance: number }[]
  /** seconds before it is back after being beaten */
  respawn: number
  /** how it looks (scene) */
  look: "slime" | "hare"
  color?: number
  size?: number
}

export type Spawn = {
  id: string
  map: string
  kind: keyof typeof MONSTER_KINDS
  /** where it wanders, in tiles */ area: readonly [number, number, number, number]
}
