import { errandOf } from "#/world/core/errand-of"
import { errandToday } from "#/world/core/errand-today"
import { todays } from "#/world/core/todays"
import { dayOf } from "#/world/core/day-of"
import { MAX_ERRANDS } from "#/world/core/errand-rules"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Transition } from "#/world/core/transition"
import type { ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"

/** 当日の依頼元と重複・未完了数を確認してから引き受ける。 */
export function takeErrand(state: PlayerState, command: Extract<ServerCommand, { type: "errand-take" }>, now: number): Transition {
  const errand = errandOf(command.errand)
  const list = todays(state.errands, now)
  if (!errand || errand.from !== command.from || errandToday(errand.from, dayOf(now))?.id !== errand.id || list.some((taken) => taken.id === errand.id)) return reject("NO_ERRAND")
  if (list.filter((taken) => !taken.done).length >= MAX_ERRANDS) return reject("TOO_MANY_ERRANDS")

  return accept({ ...state, errands: [...list, { id: errand.id, day: dayOf(now), done: false }] }, { type: "errand-taken", errand: errand.id })
}
