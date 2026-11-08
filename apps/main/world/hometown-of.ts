import { WORLDS } from "#/world/channels"

/** Preserve the existing character iteration and unsigned hash used by saved hometowns. */
export function hometownOf(playerId: string): number {
  const hash = { value: 0 }
  for (const character of playerId) hash.value = (hash.value * 31 + character.charCodeAt(0)) >>> 0

  return (hash.value % WORLDS) + 1
}
