import type { Stack, Bag } from "#/world/core/bag-types"
import type { Slot } from "#/world/core/items/kinds"
import type { PlayerState } from "#/world/core/player-types"
import type { GameEvent, Reason } from "#/world/core/commands"

export type EquipmentFailure = { ok: false; reason: Reason }
export type EquipmentSelection = { slot: Slot; stack: Stack; twoHanded: boolean }
export type SelectedEquipment = { ok: true; selection: EquipmentSelection } | EquipmentFailure
export type ReturnedEquipment = { ok: true; bag: Bag; worn: PlayerState["worn"]; events: GameEvent[] } | EquipmentFailure
