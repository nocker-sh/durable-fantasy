import type { PublishedCreature } from "#/world/client/wild-publication"

export function currentCreature(previous: PublishedCreature | undefined, revision?: number): boolean {
  const incoming = revision ?? 0
  return Number.isSafeInteger(incoming) && incoming >= 0 && incoming >= (previous?.revision ?? 0)
}
