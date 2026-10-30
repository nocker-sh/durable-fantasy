import { sameStack } from "#/world/core/same-stack"
import type { Command, ServerCommand } from "#/world/core/commands"
import type { PlayerState } from "#/world/core/player-types"
/** A delayed inventory operation must still refer to the goods grabbed, including wear and quantity. */
export function inventorySelectionMatches(state: PlayerState, command: Command | ServerCommand): boolean {
  if (command.type !== "move" && command.type !== "equip" && command.type !== "unequip" && command.type !== "use" && command.type !== "sell") return true
  if (command.type === "move" && command.expectedTarget !== undefined && !sameStack(state.bag[command.to], command.expectedTarget)) return false
  if (!command.expectedStack) return true
  if (command.type === "unequip") {
    const item = state.equipment[command.slot]

    return sameStack(item ? { item, count: 1, ...state.worn[command.slot] } : null, command.expectedStack)
  }

  return sameStack(state.bag[command.type === "move" ? command.from : command.slot], command.expectedStack)
}
