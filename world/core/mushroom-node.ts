import type { NodeDef, Yield } from "#/world/core/gather-types"

/** 深い森のきのこ場では、高い節目の素材も同じ定義に持つ。 */
export function mushroomNode(map: string, index: number, cell: readonly [number, number]): NodeDef {
  const later: Yield[] = []
  if (map === "deep-forest") later.push({ item: "frost-lily", weight: 2, level: 16 }, { item: "crystal-moss", weight: 1, level: 32 })

  return {
    id: `${map}-mushrooms-${index}`,
    map,
    cell,
    kind: "mushrooms",
    skill: "foraging",
    needsTool: false,
    max: 3,
    regen: 40,
    yields: [{ item: "mushroom", weight: 10 }, { item: "blue-herb", weight: 1, level: 4 }, ...later],
  }
}
