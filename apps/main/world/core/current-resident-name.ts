import { RENAMED_RESIDENTS } from "#/world/core/renamed-residents"

/** The name a resident goes by now, for a name read from an older save or record. */
export function currentResidentName(name: string): string {
  return Object.hasOwn(RENAMED_RESIDENTS, name) ? RENAMED_RESIDENTS[name] : name
}
