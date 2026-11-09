import type { V2 } from "#/world/scene/construction/registry"
import type { Figure } from "#/world/scene/figure/figure"

/** A figure that walks cell to cell: the player and other players. */
type Walker = {
  id: string
  name: string
  fig: Figure
  pos: V2
  path: V2[]
  head: number
  t: number
  label: HTMLDivElement
}

export type { Walker }
