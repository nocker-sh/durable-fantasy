import { wornNeck } from "#/world/core/worn-neck"
import type { PlayerState } from "#/world/core/player-types"
import { LOOKS } from "#/world/town/travellers"
import { heldOf } from "#/world/client/held-of"

export function playerAvatar(player: PlayerState) {
  const weapon = player.equipment.weapon
  return { name: player.name, look: { ...LOOKS[player.look].look, neckStripe: undefined, ...wornNeck(player) }, held: (weapon && heldOf(weapon)) || null }
}
