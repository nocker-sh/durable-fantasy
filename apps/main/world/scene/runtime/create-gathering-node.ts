import { Group } from "three"
import { pines } from "#/world/scene/fields/pines"
import { stumps } from "#/world/scene/fields/stumps"
import { mushrooms } from "#/world/scene/fields/mushrooms"
import { bush } from "#/world/scene/construction/bush"
import { center } from "#/world/scene/runtime/center"
import { createFishingRipples } from "#/world/scene/runtime/create-fishing-ripples"
import type { NodeDef } from "#/world/core/gather-types"
import type { GatheringSpot } from "#/world/scene/runtime/gathering-types"

export function createGatheringNode(town: Group, node: NodeDef): GatheringSpot {
  const at = center(node.cell)
  const full = new Group()
  const spent = new Group()
  const one = (scale = 1) => [{ x: at[0], z: at[1], s: scale, r: node.cell[0] * 0.7 }]
  if (node.kind === "tree") {
    pines(full, one(1.2))
    stumps(spent, one(1))
  }
  if (node.kind === "herbs") bush({ root: full, x: at[0], z: at[1], s: 0.3, kind: "leaf2", flowers: false })
  if (node.kind === "flowers") bush({ root: full, x: at[0], z: at[1], s: 0.3, kind: "leaf", flowers: true })
  if (node.kind === "mushrooms") mushrooms(full, [...one(1.6), { x: at[0] + 0.3, z: at[1] + 0.2, s: 1.3, r: 2 }])
  if (node.kind === "fish") createFishingRipples(full, at, node.cell[0])
  full.userData.node = node.id
  spent.visible = false
  town.add(full, spent)
  return { full, spent, at }
}
