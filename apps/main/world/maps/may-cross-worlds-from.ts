import { MAPS } from "#/world/maps"

/** 糸をたどって別の町へ渡れるのは、町の通りか屋内にいるときだけ（game-system.md §1.1）。 */
export function mayCrossWorldsFrom(map: string): boolean {
  const kind = MAPS[map]?.kind
  return kind === "town" || kind === "indoor"
}
