export type Endpoint = { document: string; room?: string; door: number[] }

export type Access = { from: Endpoint; door: number[]; width_m: number; points_tiles: number[][]; status: string }

export type OutdoorObstacle = { id: string; map: string; rect: readonly [number, number, number, number] }
