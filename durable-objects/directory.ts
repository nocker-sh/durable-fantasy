// How many players are in each channel of each map, for one parallel town (game-system.md §1.1).
// The map rooms tell it when someone arrives or leaves; players ask it which channel to join.
import { defineDurableState } from "void/durable"
import { CHANNEL_CAP, CHANNEL_SLACK } from "#/world/channels"
import { chooseChannel } from "#/world/choose-channel"

export const Directory = defineDurableState({
  initialState: { counts: {} as Record<string, Record<number, number>>, seen: {} as Record<string, number> },
  methods: {
    /** The channel to join on `map`: the one asked for, a friend's, the fullest with room, or a new one. */
    choose(context, input: { map: string; want?: number; friend?: number }): number {
      const map = input.map
      const want = input.want
      const friend = input.friend

      return chooseChannel(context.state.counts[map] ?? {}, { want, friend })
    },
    /** Every channel of a map and how many are in it. */
    channels(context, map: string): Record<number, number> {
      return context.state.counts[map] ?? {}
    },
    /** A player came into a channel; false when it is already over full (they are sent elsewhere). */
    arrive(context, input: { map: string; channel: number; following: boolean }): boolean {
      const map = input.map
      const channel = input.channel
      const following = input.following

      const row = (context.state.counts[map] ??= {})
      const n = row[channel] ?? 0
      if (n >= CHANNEL_CAP + (following ? CHANNEL_SLACK : 0)) return false
      row[channel] = n + 1
      context.state.seen[`${map}~${channel}`] = Date.now()
      return true
    },
    /** A player left; an empty channel is forgotten (its room keeps nothing once empty). */
    depart(context, map: string, channel: number) {
      const row = context.state.counts[map]
      if (!row?.[channel]) return
      row[channel]--
      if (row[channel] <= 0) delete row[channel]
    },
  },
})

export default Directory
