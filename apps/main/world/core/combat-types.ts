export type Random = () => number

export type Fighter = {
  atk: number
  def: number
  hit: number
  flee: number
  crit: number
}

export type Swing = { kind: "miss" } | { kind: "hit" | "critical"; damage: number }
