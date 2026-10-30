import { lifeYield } from "#/world/core/life-yield"
import type { NodeDef } from "#/world/core/gather-types"
import type { ItemId } from "#/world/core/items/catalog"

type Props = { node: NodeDef; level: number; power: number; roll: number }

/** 習熟で開いた成果を同じ重みと抽選値で選び、道具の追加分も同じ抽選から求める。 */
export function yieldOf(props: Props): { item: ItemId; count: number } {
  const open = props.node.yields.filter((yielded) => (yielded.level ?? 0) <= props.level)
  const total = open.reduce((sum, yielded) => sum + yielded.weight, 0)
  const draw = { remaining: props.roll * total, item: open[0].item }
  for (const yielded of open) {
    if (draw.remaining < yielded.weight) {
      draw.item = yielded.item
      break
    }
    draw.remaining -= yielded.weight
  }
  const count = lifeYield(props.level) + (props.power > 1 && (props.roll * 7919) % 1 < props.power - 1 ? 1 : 0)

  return { item: draw.item, count }
}
