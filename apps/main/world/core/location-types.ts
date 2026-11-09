import type { Cell } from "#/world/protocol"

export type PlayerLocation = {
  world: number
  map: string
  route: Cell[]
  since: number
  connection: string | null
}
