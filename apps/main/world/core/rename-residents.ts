import { currentResidentName } from "#/world/core/current-resident-name"
import { currentMakerName } from "#/world/core/current-maker-name"
import type { Bag } from "#/world/core/bag-types"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"

const renameKeys = <Value>(record: Readonly<Record<string, Value>>): Record<string, Value> => Object.fromEntries(Object.entries(record).map((entry) => [currentResidentName(entry[0]), entry[1]]))

const renameMakers = (bag: Bag): Bag => bag.map((stack) => (stack?.by === undefined ? stack : { ...stack, by: currentMakerName(stack.item, stack.by) }))

/** Carry a save over resident renames: friendship, the day's purchases, and the maker of what they hold that the resident makes. */
export function renameResidents(state: PlayerState): PlayerState {
  const worn = Object.fromEntries(
    Object.entries(state.worn).map((entry) => {
      const item = state.equipment[entry[0] as Slot]
      return [entry[0], entry[1]?.by === undefined || !item ? entry[1] : { ...entry[1], by: currentMakerName(item, entry[1].by) }]
    }),
  )
  return { ...state, friends: renameKeys(state.friends), boughtOn: renameKeys(state.boughtOn), bag: renameMakers(state.bag), storage: renameMakers(state.storage), worn }
}
