import type { ItemId } from "#/world/core/items/catalog"
import type { GatherSkill } from "#/world/core/items/kinds"

export type Yield = {
  item: ItemId
  weight: number
  /** the skill's level needed before it can turn up */ level?: number
}

export type NodeDef = {
  id: string
  map: string
  /** where it is: stand within REACH cells of it */
  cell: readonly [number, number]
  kind: "tree" | "herbs" | "flowers" | "mushrooms" | "fish"
  skill: GatherSkill
  /** a tool of the skill is needed (an axe for a tree, a rod for fish); otherwise it only helps */
  needsTool: boolean
  yields: readonly Yield[]
  /** how many times it can be gathered before it is spent, and minutes for one to come back */
  max: number
  regen: number
}
