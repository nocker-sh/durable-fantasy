import type { CraftSkill, ItemId } from "../items.ts"

export type StationKind = "hearth" | "workbench" | "loom" | "forge"

export interface Recipe {
  id: string
  skill: CraftSkill
  station: StationKind
  inputs: readonly { item: ItemId; count: number }[]
  output: { item: ItemId; count: number }
  /** the skill's level needed to try it (a milestone: 0, 2, 4, 8) */
  min: number
}

export const recipe = (id: string, skill: CraftSkill, station: StationKind, inputs: [ItemId, number][], output: [ItemId, number], min = 0): Recipe => ({
  id,
  skill,
  station,
  inputs: inputs.map(([item, count]) => ({ item, count })),
  output: { item: output[0], count: output[1] },
  min,
})
