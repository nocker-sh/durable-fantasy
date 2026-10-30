import { errandOf } from "#/world/core/errand-of"
import { todays } from "#/world/core/todays"
import { removeItem } from "#/world/core/remove-item"
import { getErrandFriendship } from "#/world/core/get-errand-friendship"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

/** 受渡しが成立した場合だけ材料・報酬・親しさと完了記録を一緒に更新する。 */
export function handErrand(state: PlayerState, command: Extract<ServerCommand, { type: "errand-hand" }>, now: number): Transition {
  const errand = errandOf(command.errand)
  const list = todays(state.errands, now)
  if (!errand || !list.some((taken) => taken.id === errand.id && !taken.done)) return reject("NO_ERRAND")
  if (command.to !== (errand.kind === "bring" ? errand.from : errand.to)) return reject("NO_ERRAND")
  const handed = { bag: state.bag }
  if (errand.kind === "bring") {
    const bag = removeItem({ bag: state.bag, item: errand.wants.item, count: errand.wants.count })
    if (!bag) return reject("NOT_ENOUGH")
    handed.bag = bag
  }
  const friendship = getErrandFriendship(state.friends, errand)

  return accept(
    { ...state, bag: handed.bag, gold: state.gold + errand.gold, friends: friendship.friends, errands: list.map((taken) => (taken.id === errand.id ? { ...taken, done: true } : taken)) },
    { type: "errand-done", errand: errand.id, gold: errand.gold, friends: friendship.changed },
  )
}
