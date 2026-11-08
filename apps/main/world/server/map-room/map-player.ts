import { wornNeck } from "#/world/core/worn-neck"
import type { PlayerState } from "#/world/core/player-types"
import type { Cell, MapPlayer } from "#/world/protocol"

export const mapPlayer = (id: string, data: PlayerState, at: Cell): MapPlayer => ({ id, name: data.name, look: data.look, ...wornNeck(data), weapon: data.equipment.weapon, at })
