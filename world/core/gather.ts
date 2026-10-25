// Gathering (economy.md §1): wood in the forest, herbs and flowers in the meadow, mushrooms under
// the pines, fish off the beach and from the river. Each spot is shared by everyone in the town and
// runs out, coming back with time (nature.ts). Gathering wears the tool, tires you, and brings
// experience in the skill (core/life.ts). Pure: the server rolls the dice and passes them in.
import type { GatherSkill, ItemId } from "./items.ts"
import { lifeYield } from "./life.ts"

export interface Yield {
  item: ItemId
  weight: number
  /** the skill's level needed before it can turn up */ level?: number
}

export interface NodeDef {
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

export const REACH = 3
/** Stamina one go costs (the cold outside adds half again unless you are warm). */
export const GATHER_STAMINA = 1

const tree = (map: string, n: number, cell: [number, number]): NodeDef => ({
  id: `${map}-tree-${n}`,
  map,
  cell,
  kind: "tree",
  skill: "woodcutting",
  needsTool: true,
  max: 4,
  regen: 45,
  yields: [
    { item: "log", weight: 8 },
    { item: "firewood", weight: 3 },
    { item: "feather", weight: 1, level: 2 },
    ...(map === "deep-forest"
      ? [
          { item: "black-oak-heart" as ItemId, weight: 2, level: 16 },
          { item: "amber-resin" as ItemId, weight: 1, level: 32 },
        ]
      : []),
  ],
})
const mushrooms = (map: string, n: number, cell: [number, number]): NodeDef => ({
  id: `${map}-mushrooms-${n}`,
  map,
  cell,
  kind: "mushrooms",
  skill: "foraging",
  needsTool: false,
  max: 3,
  regen: 40,
  yields: [
    { item: "mushroom", weight: 10 },
    { item: "blue-herb", weight: 1, level: 4 },
    ...(map === "deep-forest"
      ? [
          { item: "frost-lily" as ItemId, weight: 2, level: 16 },
          { item: "crystal-moss" as ItemId, weight: 1, level: 32 },
        ]
      : []),
  ],
})
const herbs = (map: string, n: number, cell: [number, number]): NodeDef => ({
  id: `${map}-herbs-${n}`,
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
})
const flowers = (map: string, n: number, cell: [number, number]): NodeDef => ({
  id: `${map}-flowers-${n}`,
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
})
const fish = (map: string, n: number, cell: [number, number], river: boolean): NodeDef => ({
  id: `${map}-fish-${n}`,
  map,
  cell,
  kind: "fish",
  skill: "fishing",
  needsTool: true,
  max: 5,
  regen: 25,
  yields: river
    ? [
        { item: "trout", weight: 10 },
        { item: "rusty-scrap", weight: 1, level: 2 },
        { item: "winter-char", weight: 3, level: 16 },
        { item: "engine-core", weight: 1, level: 32 },
        { item: "elder-scale", weight: 0.5, level: 64 },
      ]
    : [
        { item: "sea-fish", weight: 10 },
        { item: "trout", weight: 1 },
      ],
})

/** Every gathering spot. Cells sit beside the road so you can walk up to them (maps.test.ts). */
export const NODES: readonly NodeDef[] = [
  herbs("south-meadow", 1, [30, 66]),
  herbs("south-meadow", 2, [66, 72]),
  herbs("south-meadow", 3, [24, 70]),
  flowers("south-meadow", 1, [58, 60]),
  flowers("south-meadow", 2, [40, 62]),
  tree("forest-edge", 1, [40, 38]),
  tree("forest-edge", 2, [54, 34]),
  tree("forest-edge", 3, [62, 50]),
  mushrooms("forest-edge", 1, [44, 54]),
  tree("deep-forest", 1, [40, 70]),
  tree("deep-forest", 2, [54, 58]),
  tree("deep-forest", 3, [38, 40]),
  mushrooms("deep-forest", 1, [52, 74]),
  mushrooms("deep-forest", 2, [42, 52]),
  mushrooms("deep-forest", 3, [54, 30]),
  fish("net-sheds", 1, [66, 56], false),
  fish("net-sheds", 2, [68, 66], false),
  // the river by the bridge in town, where scrap from the war turns up off the bottom
  fish("phanthiet", 1, [59, 46], true),
]

export const nodeOf = (id: string) => NODES.find((n) => n.id === id)

/**
 * What a life skill at 64 gathers at the foot of the world tree, which is not on the map yet
 * (economy.md §2.1). Defined so the trade has a shape; nothing gathers there in v0.1.
 */
export const LATER_SPOTS: readonly { item: ItemId; skill: GatherSkill; level: number; where: string }[] = [
  { item: "world-branch", skill: "woodcutting", level: 64, where: "世界樹のふもと" },
  { item: "root-dew", skill: "foraging", level: 64, where: "世界樹のふもと（根が地表に出たところ）" },
]

/** What a go brings: the item (chosen by `roll`), how many, among what the skill's level allows. */
export function yieldOf(node: NodeDef, level: number, power: number, roll: number): { item: ItemId; count: number } {
  const open = node.yields.filter((y) => (y.level ?? 0) <= level)
  const total = open.reduce((a, y) => a + y.weight, 0)
  let r = roll * total
  let item = open[0].item
  for (const y of open) {
    if (r < y.weight) {
      item = y.item
      break
    }
    r -= y.weight
  }
  // more with practice (one more at level 4 and at 8) and a chance more with a good tool
  const count = lifeYield(level) + (power > 1 && (roll * 7919) % 1 < power - 1 ? 1 : 0)
  return { item, count }
}
