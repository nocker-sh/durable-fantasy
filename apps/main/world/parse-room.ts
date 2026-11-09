import { WORLDS } from "#/world/channels"
import type { RoomKey } from "#/world/channels"
import { isChannel } from "#/world/is-channel"

/** Numbers are written without leading zeros, so each channel the directory counts has one room. */
export function parseRoom(name: string): RoomKey | null {
  const match = /^([1-9]\d{0,2})~([a-z0-9-]{1,40})~([1-9]\d{0,5})$/.exec(name)
  if (!match) return null
  const world = Number(match[1])
  const channel = Number(match[3])
  if (world < 1 || world > WORLDS || !isChannel(channel)) return null

  return { world, map: match[2], channel }
}
