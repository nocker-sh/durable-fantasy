import type { Look, Item } from "#/world/scene/figure/look"
type V2 = [number, number]

export type Resident = {
  name: string
  job: string
  look: Look
  at: string | V2
  item: Item
  map?: string
}
