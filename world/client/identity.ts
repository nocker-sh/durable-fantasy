import type { ItemId } from "../core/items.ts"
import { wornNeck, type PlayerState } from "../core/player.ts"
import type { MapPlayer } from "../protocol.ts"
import type { Item, Look } from "../scene/index.ts"
import { LOOKS } from "../town/travellers.ts"

const STORAGE = "durable-fantasy"
const HELD: Partial<Record<ItemId, Item>> = { dagger: "sword", "short-sword": "sword", "hand-axe": "axe", spear: "spear", mace: "mace" }

export function loadPlayerId(): string {
  const key = `${STORAGE}/player`
  let id = localStorage.getItem(key)
  if (!id || !/^[0-9a-f-]{36}$/.test(id)) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export function playerAvatar(player: PlayerState) {
  const weapon = player.equipment.weapon
  return { name: player.name, look: { ...LOOKS[player.look].look, neckStripe: undefined, ...wornNeck(player) }, held: (weapon && HELD[weapon]) || null }
}

export function remoteAvatar(p: MapPlayer) {
  const look = LOOKS[p.look]?.look ?? LOOKS[0].look
  return { name: p.name, look: { ...look, neck: p.neck as Look["neck"], neckRamp: p.neckRamp, neckStripe: p.neckStripe }, held: (p.weapon && HELD[p.weapon]) || null }
}

export { STORAGE }
