import { DAY_TURNS } from "#/world/core/clock-rules"

/** Daily errands and friendship use the same Japan-time rollover rule. */
export const dayOf = (now: number) => new Date(now + (9 * 60 - DAY_TURNS) * 60_000).toISOString().slice(0, 10)
