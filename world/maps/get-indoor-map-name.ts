import type { Interior } from "#/world/town/interiors"

const cityNames: ReadonlyMap<string, string> = new Map([["phanthiet", "ファンティエット"]])

export function getIndoorMapName(interior: Interior): string {
  return `${cityNames.get(interior.house.map.split("-")[0]) ?? ""} ― ${interior.house.name}${interior.floor > 0 ? ` ― ${interior.floor + 1}階` : ""}`
}
