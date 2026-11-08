import type { RoomKey } from "#/world/channels"

/** Keep the room's wire identity as world, map and channel separated by tildes. */
export function roomName(key: RoomKey): string {
  return `${key.world}~${key.map}~${key.channel}`
}
