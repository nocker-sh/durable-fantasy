import { WORLDS } from "#/world/channels"
import type { RoomKey } from "#/world/channels"

export function parseRoom(name: string): RoomKey | null {
  const match = /^(\d{1,3})~([a-z0-9-]{1,40})~(\d{1,3})$/.exec(name)
  if (!match) return null
  const world = Number(match[1])
  const channel = Number(match[3])
  if (world < 1 || world > WORLDS || channel < 1) return null

  return { world, map: match[2], channel }
}
