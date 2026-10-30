import { HOUSEHOLDS } from "#/world/town/houses"

/** The household someone belongs to. */
export const householdOf = (name: string) => HOUSEHOLDS.find((h) => h.members.includes(name))
