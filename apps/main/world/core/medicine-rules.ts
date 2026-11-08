// game-system.md §3.6: medicine shares one wait, so it cannot be poured down in the middle of a fight.

/** the key in `PlayerState.ready` that holds when the next medicine may be taken */
export const MEDICINE_KEY = "medicine"

/** how long after one medicine the next one can be taken (herbs, potions and salves alike) */
export const MEDICINE_WAIT_MS = 10_000
