import type { NodeDef } from "#/world/core/gather-types"

/** 道具がなくても始められる、草原の薬草の採集場所を作る。 */
export function herbNode(map: string, index: number, cell: readonly [number, number]): NodeDef {
  return {
    id: `${map}-herbs-${index}`,
    map,
    cell,
    kind: "herbs",
    skill: "foraging",
    needsTool: false,
    max: 3,
    regen: 30,
    yields: [
      { item: "herb", weight: 10 },
      { item: "blue-herb", weight: 2, level: 2 },
    ],
  }
}
