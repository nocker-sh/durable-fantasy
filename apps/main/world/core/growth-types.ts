import type { STATS } from "#/world/core/growth-rules"

export type Stat = (typeof STATS)[number]
export type Stats = Readonly<Record<Stat, number>>
export type Progress = {
  readonly level: number
  readonly exp: number
  readonly statPoints: number
}
