import { CHANNEL_CAP, CHANNEL_SLACK } from "#/world/channels"

type Options = { want?: number; friend?: number }

/** Prefer the requested channel, then a friend's slack, then the fullest open channel and lowest free one. */
export function chooseChannel(counts: Readonly<Record<number, number>>, options: Options = {}): number {
  const room = (channel: number, slack = 0) => (counts[channel] ?? 0) < CHANNEL_CAP + slack
  if (options.want && room(options.want)) return options.want
  if (options.friend && room(options.friend, CHANNEL_SLACK)) return options.friend
  const open = Object.keys(counts)
    .map(Number)
    .filter((channel) => (counts[channel] ?? 0) > 0 && room(channel))
    .sort((first, second) => (counts[second] ?? 0) - (counts[first] ?? 0) || first - second)
  if (open.length) return open[0]

  const next = { channel: 1 }
  while (counts[next.channel]) next.channel++

  return next.channel
}
