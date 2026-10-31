import { Player } from "#/durable-objects/player"
import type { CombatNotice, StrikeResult } from "#/world/server/wild-coordinator"
import type { Transition } from "#/world/core/transition"

/** アラームが先に配送した討伐・反撃は、イベントを再演せず現在の保存状態で補う。 */
export async function reconcileStrikeNotices(owner: string, notices: CombatNotice[], strike: StrikeResult) {
  const own = notices.filter((notice) => notice.owner === owner).at(-1)?.result
  if (own || !(strike.beaten || (strike.counter && strike.counter.kind !== "miss"))) return { own, notices }
  const result: Transition = { ok: true, state: await Player.get(owner).read(), events: [] }
  return { own: result, notices: [...notices, { owner, result }] }
}
