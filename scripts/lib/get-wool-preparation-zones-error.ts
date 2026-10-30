import { getWoolPreparationZoneError } from "#/scripts/lib/get-wool-preparation-zone-error"
import type { z } from "zod"
import type { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Readonly<{ facility: SettingDocument; plan: z.infer<typeof woolPreparationSchema> }>

/** Keep raw fleece and retained effluent apart from rinsing, drying and prepared material, including the operator's floor space. */
export function getWoolPreparationZonesError(props: Props): Error | null {
  const dirty = props.plan.zones.dirty,
    clean = props.plan.zones.clean
  if (dirty[0] < clean[0] + clean[2] && clean[0] < dirty[0] + dirty[2] && dirty[1] < clean[1] + clean[3] && clean[1] < dirty[1] + dirty[3]) return new Error("Wool dirty and clean work areas overlap")
  for (const zone of ["dirty", "clean"] satisfies ("dirty" | "clean")[]) {
    const error = getWoolPreparationZoneError({ ...props, zone })
    if (error) return error
  }

  return null
}
