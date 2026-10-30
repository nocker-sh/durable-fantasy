export type GridSweepInput = Readonly<{ from: readonly [number, number]; to: readonly [number, number]; radius: number; cellSize: number }>
export type GridSweepQuery = GridSweepInput & Readonly<{ isCellFree: (cell: readonly [number, number]) => boolean }>
export type GridSweepWindow = Readonly<{ x0: number; z0: number; width: number; depth: number; count: number }>
export type GridSweepWindowFailure = "Invalid moving footprint" | "Moving footprint exceeds traversal budget"
export type GridSweepFailure = GridSweepWindowFailure | "Moving footprint intersects a blocked grid cell"
