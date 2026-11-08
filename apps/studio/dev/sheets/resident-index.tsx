import { RESIDENTS } from "#/world/town/residents"

export const residentIndex = (name: string) => RESIDENTS.findIndex((r) => r.name === name)
