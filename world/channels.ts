// Parallel towns and channels (game-system.md §1.1). The world comes in several parallel towns —
// each player belongs to one, their hometown, and can visit a friend's — and within a town every
// map has as many channels as it needs, each one map room of at most CHANNEL_CAP players (a few
// more when a party or friend follows someone in). Channels open when needed and close when empty.

/** How many parallel towns there are; a new player is given one of them as their hometown. */
export const WORLDS = 8;
/** Players in one channel of one map, and the room left for those joining a party or a friend. */
export const CHANNEL_CAP = 32;
export const CHANNEL_SLACK = 4;

export interface RoomKey {
  world: number;
  map: string;
  channel: number;
}

/** The room's name: "3~phanthiet~1" (world 3, the square, channel 1). */
export const roomName = (k: RoomKey) => `${k.world}~${k.map}~${k.channel}`;

export function parseRoom(name: string): RoomKey | null {
  const m = /^(\d{1,3})~([a-z0-9-]{1,40})~(\d{1,3})$/.exec(name);
  if (!m) return null;
  const world = Number(m[1]),
    channel = Number(m[3]);
  if (world < 1 || world > WORLDS || channel < 1) return null;
  return { world, map: m[2], channel };
}

/** A player's hometown: the same every time for the same id. */
export function hometownOf(playerId: string): number {
  let h = 0;
  for (const c of playerId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return (h % WORLDS) + 1;
}

/** Pick a channel: the one asked for if it has room, else a friend's, else the fullest that still has room, else a new one. */
export function chooseChannel(counts: Readonly<Record<number, number>>, opts: { want?: number; friend?: number } = {}): number {
  const room = (ch: number, slack = 0) => (counts[ch] ?? 0) < CHANNEL_CAP + slack;
  if (opts.want && room(opts.want)) return opts.want;
  if (opts.friend && room(opts.friend, CHANNEL_SLACK)) return opts.friend;
  const open = Object.keys(counts)
    .map(Number)
    .filter((ch) => (counts[ch] ?? 0) > 0 && room(ch))
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || a - b);
  if (open.length) return open[0];
  // the lowest channel not in use (an empty one counts as free)
  for (let ch = 1; ; ch++) if (!counts[ch]) return ch;
}
