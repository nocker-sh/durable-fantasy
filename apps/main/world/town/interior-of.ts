import { INTERIORS } from "#/world/town/interiors"

export const interiorOf = (id: string) => INTERIORS.find((i) => i.id === id)
