import type { CreatureHealth } from "#/world/core/wild/types"

export type HitKind = "miss" | "hit" | "critical"

export type MonsterStrike = Readonly<{ id: string; kind: HitKind; damage: number; hp: number; back: number; combat?: CreatureHealth["combat"]; run?: CreatureHealth["run"] }>
