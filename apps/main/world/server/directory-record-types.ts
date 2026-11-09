/** One town's directory: how many are in each channel of each map (game-system.md §1.1). */
export type DirectoryRecord = { counts: Record<string, Record<number, number>> }
