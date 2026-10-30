export type WildState = {
  hp: Record<string, number>
  back: Record<string, number>
  /** who is fighting it, and when they last struck */
  by: Record<string, { player: string; at: number }>
}

export type HitResult = { state: WildState; hp: number; beaten: boolean } & ({ refused: true; reason: "TAKEN" | "TARGET_GONE" } | { refused: false; reason?: never })

export type CreatureHealth = { hp: number; back: number }
export type WildSnapshot = { revision: number; monsters: Record<string, CreatureHealth> }
