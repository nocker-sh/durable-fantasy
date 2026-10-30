export type DoorOperation = { body_radius_m: number; orbit_radius_m: number; start_deg: number; end_deg: number; waits_for?: { furniture: string; space_index: number; reason: string }[] }
