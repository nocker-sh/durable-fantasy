export type HitKind = "miss" | "hit" | "critical"

export type MonsterStrike = Readonly<{ id: string; kind: HitKind; damage: number; hp: number; back: number }>
