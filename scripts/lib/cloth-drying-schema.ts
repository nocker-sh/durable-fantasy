import { z } from "zod"

/** Authored dimensions describe one cloth on each rail, with a shared inset drip tray. */
export const clothDryingSchema = z
  .object({
    storage: z.object({ furniture: z.string().length(1), item: z.string().min(1) }),
    rail_height_m: z.number(),
    rail_length_m: z.number(),
    rail_diameter_m: z.number(),
    rails_x_m: z.array(z.number()).min(1),
    cloth_width_m: z.number(),
    cloth_length_m: z.number(),
    cloth_thickness_m: z.number(),
    min_air_gap_m: z.number(),
    tray_inset_m: z.number(),
    tray_top_m: z.number(),
    floor_clearance_m: z.number(),
  })
  .transform((authored) => ({
    storage: authored.storage,
    railHeight: authored.rail_height_m,
    railLength: authored.rail_length_m,
    railDiameter: authored.rail_diameter_m,
    rails: authored.rails_x_m,
    clothWidth: authored.cloth_width_m,
    clothLength: authored.cloth_length_m,
    clothThickness: authored.cloth_thickness_m,
    airGap: authored.min_air_gap_m,
    trayInset: authored.tray_inset_m,
    trayTop: authored.tray_top_m,
    floorClearance: authored.floor_clearance_m,
  }))
