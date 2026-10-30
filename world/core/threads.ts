// Friends (world.md "マフラー"): parting, two people may undo the end of their mufflers and swap a
// thread. With someone's thread you can follow it across into their world — their town — and your
// own muffler pulls you home again. Pure; the player Durable Object keeps the threads.
/** A thread you hold: whose (their name, and a mark that tells them apart without giving away who they are), and their town. */
export type Thread = {
  key: string
  name: string
  town: number
  at: number
}

export const MAX_THREADS = 50
