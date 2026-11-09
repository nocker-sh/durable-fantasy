import { hasFutureErrands } from "#/world/core/has-future-errands"
import { errandOf } from "#/world/core/errand-of"
import { errandToday } from "#/world/core/errand-today"
import { todays } from "#/world/core/todays"
import { dayOf } from "#/world/core/day-of"
import { MAX_ERRANDS } from "#/world/core/errand-rules"
import { accept } from "#/world/core/accept"
import { addItem } from "#/world/core/add-item"
import { dropLapsedParcels } from "#/world/core/drop-lapsed-parcels"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

/** 当日の依頼元と重複・未完了数を確認してから引き受ける。 */
export function takeErrand(state: PlayerState, command: Extract<ServerCommand, { type: "errand-take" }>, now: number): Transition {
  if (hasFutureErrands(state.errands, now)) return reject("NO_ERRAND")
  const errand = errandOf(command.errand)
  const list = todays(state.errands, now)
  if (!errand || errand.from !== command.from || errandToday(errand.from, dayOf(now))?.id !== errand.id || list.some((taken) => taken.id === errand.id)) return reject("NO_ERRAND")
  if (list.filter((taken) => !taken.done).length >= MAX_ERRANDS) return reject("TOO_MANY_ERRANDS")

  const errands = [...list, { id: errand.id, day: dayOf(now), done: false }]
  // a letter to deliver is put in the bag, after any left from errands that have lapsed
  const cleared = dropLapsedParcels(state.bag, list)
  const bag = errand.kind === "deliver" && errand.carry ? addItem({ bag: cleared, item: errand.carry, count: 1 }) : cleared
  if (!bag) return reject("BAG_FULL")
  return accept({ ...state, bag: bag, errands: errands }, { type: "errand-taken", errand: errand.id })
}
