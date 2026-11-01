// Parties (game-system.md §10): up to twelve travelling together. The leader asks, the other agrees.
// Experience from a creature is each one's own, or shared evenly among those of the party in earshot
// of the one who beat it and within a few levels of them, with a little added for each one sharing.
// Members see each other's HP and where they are. Pure; the party Durable Object keeps it.

export const PARTY_MAX = 12

/** how far apart in level a member may be and still take a share */
export const SHARE_LEVELS = 5

/** what an even share adds to the whole for each member sharing beyond the one who beat it */
export const PARTY_BONUS = 0.1
