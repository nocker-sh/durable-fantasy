import { OPEN_TOWNS } from "#/world/channels"

/** Spread players over the open towns by their ID (the same unsigned hash as before, so opening more towns keeps it stable). */
export function hometownOf(playerId: string): number {
  const hash = { value: 0 }
  for (const character of playerId) hash.value = (hash.value * 31 + character.charCodeAt(0)) >>> 0

  return (hash.value % OPEN_TOWNS) + 1
}
