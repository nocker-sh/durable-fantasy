import { WORLD } from "#/world/maps/grid"

export const squareAt = (col: number, row: number) => WORLD.find((square) => square.at[0] === col && square.at[1] === row)
