import type { SettingDocument } from "#/scripts/lib/setting-document"

/** A declared surface must be checked even when its required foundation or stair is missing. */
export function hasEntryApproachSections(document: SettingDocument): boolean {
  const site = document.site_plan
  if (!site || typeof site !== "object" || !("approaches" in site) || !Array.isArray(site.approaches)) return false

  return site.approaches.some((approach: unknown) => approach !== null && typeof approach === "object" && Object.hasOwn(approach, "section"))
}
