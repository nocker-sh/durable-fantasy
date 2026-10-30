import type { Stat } from "#/world/core/growth-types"

// game-system.md §3.1–3.2
export const STATS = ["vit", "mnd", "str", "dex", "int", "fth"] as const
export const STAT_NAME: Record<Stat, string> = { vit: "体力", mnd: "精神", str: "筋力", dex: "技量", int: "知力", fth: "信仰" }
export const MAX_LEVEL = 32
export const MAX_STAT = 99
export const START_STAT = 5
export const STARTING_POINTS = 10
