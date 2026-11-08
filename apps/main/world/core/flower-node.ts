import type { NodeDef } from "#/world/core/gather-types"

/** 飾る花と薬草を同じ採集場所から得られるようにする。 */
export function flowerNode(map: string, index: number, cell: readonly [number, number]): NodeDef {
  return {
    id: `${map}-flowers-${index}`,
    map,
    cell,
    kind: "flowers",
    skill: "foraging",
    needsTool: false,
    max: 3,
    regen: 30,
    yields: [
      { item: "meadow-flower", weight: 10 },
      { item: "herb", weight: 2 },
    ],
  }
}
