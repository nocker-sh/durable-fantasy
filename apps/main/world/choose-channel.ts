import { CHANNEL_CAP, CHANNEL_SLACK, CHANNELS } from "#/world/channels"
import { isChannel } from "#/world/is-channel"

type Options = { want?: number; friend?: number }

/**
 * Prefer the requested channel, then a friend's slack, then the fullest open channel and lowest free one.
 * A channel past CHANNELS is never chosen: no room has that name, and joining it would fail for ever.
 */
export function chooseChannel(counts: Readonly<Record<number, number>>, options: Options = {}): number {
  const room = (channel: number, slack = 0) => (counts[channel] ?? 0) < CHANNEL_CAP + slack
  if (isChannel(options.want) && room(options.want)) return options.want
  if (isChannel(options.friend) && room(options.friend, CHANNEL_SLACK)) return options.friend
  const open = Object.keys(counts)
    .map(Number)
    .filter((channel) => isChannel(channel) && (counts[channel] ?? 0) > 0 && room(channel))
    .sort((first, second) => (counts[second] ?? 0) - (counts[first] ?? 0) || first - second)
  if (open.length) return open[0]

  // the lowest free channel; with every one taken, the last (its room turns them away when full)
  const next = { channel: 1 }
  while (counts[next.channel] && next.channel < CHANNELS) next.channel++

  return next.channel
}
