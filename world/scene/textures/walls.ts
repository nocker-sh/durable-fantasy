export type WallOpts = {
  w: number
  h: number
  floors: number
  timber: boolean
  seed: number
  door?: number // u position (units) of door centre
  windows?: boolean
  shutter?: string
  flowers?: boolean
  ramp?: string
  sign?: string
  opening?: boolean // open-front workshop
  /** what the wall is built of (town/style.ts): plaster (timber-framed when `timber`), laid stone, boards */
  material?: "plaster" | "stone" | "board"
  /** leaded diamond panes, four square panes, or a small shuttered window */
  windowKind?: "leaded" | "square" | "small"
  /** the shutters closed over the windows (a household asleep by day); the same wall otherwise */
  shut?: boolean
  /** a plain plank door, an arched one, or a double door */
  doorKind?: "plank" | "arched" | "double"
}
