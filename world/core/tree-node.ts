import type { NodeDef, Yield } from "#/world/core/gather-types"

/** 深い森の木だけに、将来の生活スキルの節目の成果を持たせる。 */
export function treeNode(map: string, index: number, cell: readonly [number, number]): NodeDef {
  const later: Yield[] = []
  if (map === "deep-forest") later.push({ item: "black-oak-heart", weight: 2, level: 16 }, { item: "amber-resin", weight: 1, level: 32 })

  return {
    id: `${map}-tree-${index}`,
    map,
    cell,
    kind: "tree",
    skill: "woodcutting",
    needsTool: true,
    max: 4,
    regen: 45,
    yields: [{ item: "log", weight: 8 }, { item: "firewood", weight: 3 }, { item: "feather", weight: 1, level: 2 }, ...later],
  }
}
