import { isItemId } from "#/world/core/items/is-item-id"
import type { MapPlayer } from "#/world/protocol"
import type { Look } from "#/world/scene/figure/look"
import { LOOKS } from "#/world/town/travellers"
import { heldOf } from "#/world/client/held-of"

export function remoteAvatar(p: MapPlayer) {
  const look = LOOKS[p.look]?.look ?? LOOKS[0].look
  return { name: p.name, look: { ...look, neck: p.neck as Look["neck"], neckRamp: p.neckRamp, neckStripe: p.neckStripe }, held: (p.weapon && isItemId(p.weapon) && heldOf(p.weapon)) || null }
}
