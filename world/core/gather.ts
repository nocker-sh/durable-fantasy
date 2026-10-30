import { treeNode } from "#/world/core/tree-node"
import { mushroomNode } from "#/world/core/mushroom-node"
import { herbNode } from "#/world/core/herb-node"
import { flowerNode } from "#/world/core/flower-node"
import { fishNode } from "#/world/core/fish-node"
import type { GatherSkill } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import type { NodeDef } from "#/world/core/gather-types"

/** 採集場所の並びと座標は、マップと資源の共通の定義にする。 */
export const NODES: readonly NodeDef[] = [
  herbNode("south-meadow", 1, [30, 66]),
  herbNode("south-meadow", 2, [66, 72]),
  herbNode("south-meadow", 3, [24, 70]),
  flowerNode("south-meadow", 1, [58, 60]),
  flowerNode("south-meadow", 2, [40, 62]),
  treeNode("forest-edge", 1, [40, 38]),
  treeNode("forest-edge", 2, [54, 34]),
  treeNode("forest-edge", 3, [62, 50]),
  mushroomNode("forest-edge", 1, [44, 54]),
  treeNode("deep-forest", 1, [40, 70]),
  treeNode("deep-forest", 2, [54, 58]),
  treeNode("deep-forest", 3, [38, 40]),
  mushroomNode("deep-forest", 1, [52, 74]),
  mushroomNode("deep-forest", 2, [42, 52]),
  mushroomNode("deep-forest", 3, [54, 30]),
  fishNode({ map: "net-sheds", index: 1, cell: [66, 56], river: false }),
  fishNode({ map: "net-sheds", index: 2, cell: [68, 66], river: false }),
  // the river by the bridge in town, where scrap from the war turns up off the bottom
  fishNode({ map: "phanthiet", index: 1, cell: [59, 46], river: true }),
]

/**
 * What a life skill at 64 gathers at the foot of the world tree, which is not on the map yet
 * (economy.md §2.1). Defined so the trade has a shape; nothing gathers there in v0.1.
 */
export const LATER_SPOTS: readonly { item: ItemId; skill: GatherSkill; level: number; where: string }[] = [
  { item: "world-branch", skill: "woodcutting", level: 64, where: "世界樹のふもと" },
  { item: "root-dew", skill: "foraging", level: 64, where: "世界樹のふもと（根が地表に出たところ）" },
]
