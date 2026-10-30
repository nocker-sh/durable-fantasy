import { WORLD } from "#/world/maps/grid"

export const squareOf = (map: string) => WORLD.find((square) => square.map === map)
