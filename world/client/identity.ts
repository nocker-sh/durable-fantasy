import { ITEMS, isItemId, type ItemIcon, type ItemId } from "../core/items.ts"
import { wornNeck, type PlayerState } from "../core/player.ts"
import type { MapPlayer } from "../protocol.ts"
import type { Item, Look } from "../scene/index.ts"
import { LOOKS } from "../town/travellers.ts"

const STORAGE = "durable-fantasy"
/** What a weapon looks like in the hand, by the shape its icon is drawn as. */
const HELD_BY_ICON: Partial<Record<ItemIcon, Item>> = {
  dagger: "sword",
  knife: "sword",
  machete: "sword",
  sword: "sword",
  longsword: "sword",
  greatsword: "greatsword",
  axe: "axe",
  spear: "spear",
  mace: "mace",
  flail: "mace",
  warhammer: "hammer",
  halberd: "halberd",
  estoc: "sword",
  falchion: "sword",
  bill: "halberd",
  pick: "hammer",
  staff: "staff",
}
const heldOf = (id: ItemId): Item => {
  const d = ITEMS[id]
  if (d.equip?.part !== "weapon") return null
  if (d.icon === "axe" && d.equip.twoHanded) return "battleaxe"
  return HELD_BY_ICON[d.icon] ?? null
}

let openingSession: Promise<string> | null = null

export function loadPlayerId(): Promise<string> {
  return (openingSession ??= (navigator.locks ? navigator.locks.request(`${STORAGE}/session`, openSession) : openSession()).finally(() => {
    openingSession = null
  }))
}

async function openSession(): Promise<string> {
  const key = `${STORAGE}/player`
  let legacyId = localStorage.getItem(key)
  if (!legacyId || !/^[0-9a-f-]{36}$/.test(legacyId)) {
    legacyId = crypto.randomUUID()
    localStorage.setItem(key, legacyId)
  }
  const proofKey = `${STORAGE}/session-proof`
  let proof = localStorage.getItem(proofKey)
  if (!proof || !/^[a-f0-9]{64}$/.test(proof)) {
    proof = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("")
    localStorage.setItem(proofKey, proof)
  }
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ legacyId, proof }),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error("Session could not be restored")
  const { id } = (await response.json()) as { id: string }
  localStorage.setItem(key, id)
  localStorage.removeItem(proofKey)
  return id
}

export function playerAvatar(player: PlayerState) {
  const weapon = player.equipment.weapon
  return { name: player.name, look: { ...LOOKS[player.look].look, neckStripe: undefined, ...wornNeck(player) }, held: (weapon && heldOf(weapon)) || null }
}

export function remoteAvatar(p: MapPlayer) {
  const look = LOOKS[p.look]?.look ?? LOOKS[0].look
  return { name: p.name, look: { ...look, neck: p.neck as Look["neck"], neckRamp: p.neckRamp, neckStripe: p.neckStripe }, held: (p.weapon && isItemId(p.weapon) && heldOf(p.weapon)) || null }
}

export { STORAGE }
