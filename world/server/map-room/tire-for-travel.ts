import { Player } from "#/durable-objects/player"
import { MAPS } from "#/world/maps"
import type { Reason } from "#/world/core/commands"

/** 野外へ出るときだけ保存先で疲労を反映し、進めない理由を移動の前に返す（game-system.md §3.6）。 */
export async function tireForTravel(owner: string | null, destination: string): Promise<Reason | null> {
  if (MAPS[destination]?.kind !== "field" || !owner) return null
  const tired = await Player.get(owner).run({ type: "tire", amount: 4 })
  if (!tired.ok) return tired.reason

  return null
}
