import type { HearthMaintenance } from "#/scripts/lib/hearth-maintenance"

/** Settings are authored documents. Reading and auditing must never rewrite their contents. */
export type TransportContainer = {
  shape: "cylinder"
  id: string
  stream: string
  material: string
  lidded: boolean
  outer_diameter_m: number
  outer_height_m: number
  inner_diameter_m: number
  usable_depth_m: number
  capacity_l: number
  empty_mass_kg: number
}

export type SettingDocument = {
  id: string
  kind: string
  title: string
  status: string
  source: string
  design_gate: string
  issues: string[]
  grid?: null | { cell_m: number; rows: string[] }
  parallel_use?: { activity: string; operations: { resident: string; furniture: string; space_index: number }[] }[]
  furniture?: {
    cooking_top?: unknown
    potable_vessel_support?: unknown
    potable_vessel?: unknown
    cloth_drying?: unknown
    hearth_maintenance?: HearthMaintenance
    hearth?: unknown
    hearth_front?: "n" | "s" | "w" | "e"
    shelf?: unknown
    bed?: unknown
    work_surface?: { height_m: number; thickness_m: number; leg_width_m: number; leg_inset_m: number; knee_clearance_m: number }
    seat?: {
      facing?: "n" | "s" | "w" | "e"
      occupant_forward_m?: number
      foot_rest?: { under_table?: string; height_m: number; width_m: number; depth_m: number; forward_m: number; thickness_m: number }
      width_m: number
      depth_m: number
      height_m: number
      back_height_m: number
      board_thickness_m: number
      leg_width_m: number
    }
    wall_mount?: { side: "n" | "e" | "s" | "w"; bottom_m: number; height_m: number }
    runtime_kind?: string
    runtime_solid?: boolean
    symbol: string
    name: string
    owner: string
    source: string
    maintainers?: string[]
    rect: number[]
    access: number[][]
    seat_symbols?: string[]
    transport_container?: TransportContainer
    role?: string
    owners?: string[]
    compartments?: string[]
    use_space?: { activity: string; rect: number[] }[]
  }[]
  [key: string]: unknown
}
