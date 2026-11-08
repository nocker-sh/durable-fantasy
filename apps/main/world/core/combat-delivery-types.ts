import type { ServerCommand } from "#/world/core/commands"

export type CombatCommand = Extract<ServerCommand, { type: "loot" | "share" | "hurt" }>
export type CombatDelivery = {
  id: number
  command: CombatCommand
  life?: number
}
export type CombatEffect = {
  owner: string
  command: CombatCommand
  life?: number
}
