import { CHANNELS } from "#/world/channels"

/** A channel a room can be named for: a whole number from 1 to CHANNELS. */
export function isChannel(channel: unknown): channel is number {
  return typeof channel === "number" && Number.isInteger(channel) && channel >= 1 && channel <= CHANNELS
}
