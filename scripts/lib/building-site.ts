export type Rect = readonly [number, number, number, number]

export type ExistingHouse = { id: string; map: string; x0: number; z0: number; x1: number; z1: number }

export type SiteCheck = { problems: string[]; bounds?: Rect }
