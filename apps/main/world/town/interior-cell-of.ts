import type { Cell } from "#/world/town/interiors"

export const interiorCellOf = (x: number, z: number): Cell => [Math.floor(x * 2), Math.floor(z * 2)]
