import type { z } from "zod"
import type { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
export const WOOL_PREPARATION_STATIONS: ReadonlyArray<Readonly<{ station: keyof z.infer<typeof woolPreparationSchema>["stations"]; role: string; zone: "dirty" | "clean" }>> = [
  { station: "raw", role: "raw_fleece_storage", zone: "dirty" },
  { station: "supply", role: "reserved_process_water", zone: "dirty" },
  { station: "wash", role: "wool_wash_basin", zone: "dirty" },
  { station: "rinse", role: "wool_rinse_basin", zone: "clean" },
  { station: "handwash", role: "separate_handwash_basin", zone: "clean" },
  { station: "dry", role: "covered_wool_drying", zone: "clean" },
  { station: "prepare", role: "dry_wool_fibre_workbench", zone: "clean" },
  { station: "clean", role: "clean_prepared_wool_storage", zone: "clean" },
  { station: "effluent", role: "retained_wool_effluent", zone: "dirty" },
]
