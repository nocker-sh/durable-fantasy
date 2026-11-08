/**
 * Residents whose name was changed, from the old name to the new one. Saves and records written
 * before the change still carry the old name (friendship, a day's purchase, an item's maker).
 */
export const RENAMED_RESIDENTS: Readonly<Record<string, string>> = {
  ギュンター: "アルノルト",
}
