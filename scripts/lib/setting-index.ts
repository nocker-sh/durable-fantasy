export const SETTING_PREFIXES = { towns: "town", maps: "map", buildings: "building", rooms: "room", residents: "resident", monsters: "monster", facilities: "facility" } as const

export type SettingIndexEntry = { id: string; kind: keyof typeof SETTING_PREFIXES; file: string }
