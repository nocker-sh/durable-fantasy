export type Connection = {
  kind?: string
  door?: number[]
  target: string
  target_door?: number[]
  width_cells?: number
  furniture?: string
  target_furniture?: string
  access?: number[]
  target_access?: number[]
}

export type Layout = { cell_m: number; width: number; depth: number; floors: { floor: number; rooms: string[] }[] }
