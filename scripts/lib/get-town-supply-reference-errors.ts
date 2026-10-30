import type { z } from "zod"
import type { townSupplySystemsSchema } from "#/scripts/lib/town-supply-systems-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type System = z.infer<typeof townSupplySystemsSchema>[number]
type Role = "sources" | "processing" | "destinations" | "carriers" | "handlers"
type Props = Readonly<{ town: SettingDocument; system: System; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve each supply role within its own town; an existing ID alone is insufficient. */
export function getTownSupplyReferenceErrors(props: Props): readonly string[] {
  const kinds: Readonly<Record<Role, readonly string[]>> = {
    sources: ["buildings", "rooms", "facilities", "residents"],
    processing: ["rooms", "facilities"],
    destinations: ["buildings", "rooms", "facilities"],
    carriers: ["residents"],
    handlers: ["residents"],
  }
  const errors: string[] = []
  for (const role of ["sources", "processing", "destinations", "carriers", "handlers"] satisfies Role[]) {
    const references = props.system[role] ?? []
    if (new Set(references).size !== references.length) errors.push(`${props.system.id}: duplicate ${role} reference`)
    for (const id of references) {
      const document = props.documents.get(id)
      if (!document || !kinds[role].includes(document.kind)) errors.push(`${props.system.id}: invalid ${role} reference ${id}`)
      else if (document.town !== props.town.id) errors.push(`${props.system.id}: ${role} reference belongs to another town: ${id}`)
      else if (props.town.design_gate === "通過" && document.design_gate !== "通過") errors.push(`${props.system.id}: unresolved ${role} reference ${id}`)
    }
  }
  return errors
}
