/** A creature's fight: who holds it, when they last struck, and how its own blows are timed. */
export type Fight = {
  player: string
  /** First accepted strike; optional for saves made before combat positions were published. */
  started?: number
  at: number
  /** the holder's party, whose members may strike it too (game-system.md §8) */
  party?: string
  /** when its next blow falls due (game-system.md §8 叩き返し) */
  next?: number
}

export type WildState = {
  hp: Record<string, number>
  back: Record<string, number>
  /** who is fighting it, and when they last struck */
  by: Record<string, Fight>
}

/** `counters`: how many of the creature's own blows fell due by this strike (none once beaten). */
export type HitResult = { state: WildState; hp: number; beaten: boolean; counters: number } & ({ refused: true; reason: "TAKEN" | "TARGET_GONE" } | { refused: false; reason?: never })

export type CreatureHealth = { hp: number; back: number; combat?: { at: number; until: number } }
export type WildSnapshot = { revision: number; monsters: Record<string, CreatureHealth> }
