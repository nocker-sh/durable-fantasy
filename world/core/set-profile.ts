import { RENAME_GAP_MS } from "#/world/core/player-rules"
import { reservedName } from "#/world/core/reserved-name"
import { accept } from "#/world/core/accept"
import { reject } from "#/world/core/reject"
import type { Command } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
import type { Transition } from "#/world/core/transition"

/**
 * 姿と首巻きはいつでも変えられる。名前は作成のあと、前に変えてから一定の日数が経たないと変えられない
 * （game-system.md §13）。住民の名前を名乗っていた古いセーブは、すぐに改められる。
 */
export function setProfile(state: PlayerState, command: Extract<Command, { type: "profile" }>, now: number): Transition {
  if (reservedName(command.name)) return reject("NAME_TAKEN")
  const renaming = state.profileComplete && command.name !== state.name
  if (renaming && !reservedName(state.name) && state.renamedAt !== undefined && now - state.renamedAt < RENAME_GAP_MS) return reject("RENAME_WAIT")
  return accept(
    { ...state, profileComplete: true, name: command.name, look: command.look, neck: command.neck, neckRamp: command.neckRamp, ...(renaming ? { renamedAt: now } : {}) },
    { type: "renamed", name: command.name },
  )
}
