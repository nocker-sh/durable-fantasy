import type { CraftSkill } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"

export type StationKind = "hearth" | "workbench" | "loom" | "forge"

export type Recipe = {
  id: string
  skill: CraftSkill
  station: StationKind
  inputs: readonly { item: ItemId; count: number }[]
  output: { item: ItemId; count: number }
  /** the skill's level needed to try it (a milestone: 0, 2, 4, 8) */
  min: number
}

export const recipe = (inputProps: { id: string; skill: CraftSkill; station: StationKind; inputs: [ItemId, number][]; output: [ItemId, number]; min?: number }): Recipe => {
  const id = inputProps.id
  const skill = inputProps.skill
  const station = inputProps.station
  const inputs = inputProps.inputs
  const output = inputProps.output
  const min = inputProps.min === undefined ? 0 : inputProps.min
  return {
    id,
    skill,
    station,
    inputs: inputs.map((entry) => {
      const item = entry[0]
      const count = entry[1]
      return { item, count }
    }),
    output: { item: output[0], count: output[1] },
    min,
  }
}
