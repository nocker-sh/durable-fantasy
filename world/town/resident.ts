import type { Look, Item } from "../scene/figure.ts"
type V2 = [number, number]

export interface Resident {
  name: string
  job: string
  look: Look
  at: string | V2
  item: Item
  map?: string
}
