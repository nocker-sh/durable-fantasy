// Parallel towns and channels (game-system.md §1.1). The world comes in several parallel towns —
// each player belongs to one, their hometown, and can visit a friend's — and within a town every
// map has as many channels as it needs, each one map room of at most CHANNEL_CAP players (a few
// more when a party or friend follows someone in). Channels open when needed and close when empty.

/** How many parallel towns there are; a new player is given one of them as their hometown. */
export const WORLDS = 8
/** Players in one channel of one map, and the room left for those joining a party or a friend. */
export const CHANNEL_CAP = 32
export const CHANNEL_SLACK = 4

export type RoomKey = {
  world: number
  map: string
  channel: number
}
