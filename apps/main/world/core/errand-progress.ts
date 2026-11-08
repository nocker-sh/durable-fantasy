import { todays } from "#/world/core/todays"
import { errandOf } from "#/world/core/errand-of"
import { getErrandPhase } from "#/world/core/get-errand-phase"
import type { Bag } from "#/world/core/bag-types"
import type { Taken, ErrandProgress } from "#/world/core/errand-types"

/** 当日の依頼と当事者だけを会話の条件にし、ここでは完了させない。 */
export function errandProgress(player: { errands: readonly Taken[]; bag: Bag }, name: string, now: number): Record<string, ErrandProgress> {
  const progress: Record<string, ErrandProgress> = {}
  for (const taken of todays(player.errands, now)) {
    const errand = errandOf(taken.id)
    if (!errand || (errand.from !== name && (errand.kind !== "deliver" || errand.to !== name))) continue
    progress[taken.id] = getErrandPhase({ errand, done: taken.done, bag: player.bag, name })
  }
  return progress
}
