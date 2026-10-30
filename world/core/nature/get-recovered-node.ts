import type { NodeDef } from "#/world/core/gather-types"
import type { NatureState } from "#/world/core/nature/types"

type Props = Readonly<{ node: Pick<NodeDef, "max" | "regen">; stored: Readonly<NatureState["nodes"][string]>; now: number }>

/** 時計が戻っても残量と回復の基点を巻き戻さず、完了した回復分だけを反映する。 */
export function getRecoveredNode(props: Props): NatureState["nodes"][string] {
  const period = props.node.regen * 60_000
  const recovered = Math.floor(Math.max(0, props.now - props.stored.at) / period)

  return { left: Math.min(props.node.max, props.stored.left + recovered), at: props.stored.at + recovered * period }
}
