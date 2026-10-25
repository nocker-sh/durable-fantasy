import type { Look, Item } from "../figure"

export type Cell = [number, number]

export interface ResidentInfo {
  id: number
  name: string
  job: string
  x: number
  z: number
}

export interface WalkerInfo {
  id: string
  name: string
  x: number
  z: number
  walking: boolean
}

export interface SceneEvents {
  /** loading progress text while the scene builds */
  progress(text: string): void
  ready(): void
  failed?(error: unknown): void
  /** the player started walking along these cells (first cell: where they are or are stepping to) */
  walk(cells: Cell[]): void
  /** the player reached a resident they clicked */
  reach(id: number): void
  /** the player reached a gathering spot they clicked (core/gather.ts) */
  gatherAt(node: string): void
  /** the player reached a station they clicked (core/crafting.ts) */
  stationAt(station: string): void
  /** the player is in reach of the creature they are fighting and their blow is due */
  swing(monster: string): void
  /** about 5 times a second */
  tick(): void
  /** another player's name was clicked */
  pickPlayer?(id: string): void
}

export interface Avatar {
  name: string
  look: Look
  held: Item
}
