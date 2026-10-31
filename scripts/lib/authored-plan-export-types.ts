/** A validated and formatted source, prepared before the batch may write any output. */
export type AuthoredPlanExport = Readonly<{ id: string; roomCount: number; filePath: string; source: string }>
