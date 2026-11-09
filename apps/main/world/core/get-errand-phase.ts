import { countItem } from "#/world/core/count-item"
import type { Bag } from "#/world/core/bag-types"
import type { Errand, ErrandProgress } from "#/world/core/errand-types"

type Props = { errand: Errand; done: boolean; bag: Bag; name: string }

/** 材料が揃ったことと、実際に受け渡したことを区別する。 */
export function getErrandPhase(props: Props): ErrandProgress {
  if (props.done) return "done"
  if (props.errand.kind === "deliver" && props.errand.to === props.name) return "ready"
  if (props.errand.kind === "bring" && countItem(props.bag, props.errand.wants.item) >= props.errand.wants.count) return "ready"

  return "taken"
}
