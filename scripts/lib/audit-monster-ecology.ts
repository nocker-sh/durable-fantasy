import type { SettingDocument } from "#/scripts/lib/setting-document"
type Material = { item: string; origin: string; users: string[]; use: string }
type Props = {
  document: SettingDocument
  expected: { habitats: readonly string[]; drops: readonly string[] }
  documents: ReadonlyMap<string, SettingDocument>
  items: ReadonlySet<string>
}
export function auditMonsterEcology(props: Props): string[] {
  const document = props.document
  const expected = props.expected
  const documents = props.documents
  const items = props.items

  const errors: string[] = []
  const sameSet = (actual: unknown, expected: readonly string[]) =>
    Array.isArray(actual) &&
    actual.every((v) => typeof v === "string") &&
    new Set(actual).size === actual.length &&
    actual.length === new Set(expected).size &&
    expected.every((v) => actual.includes(v))
  if (!sameSet(document.habitats, expected.habitats)) errors.push("Document habitats disagree with registered spawns")
  const ecology = document.ecology as Record<string, unknown> | undefined
  for (const key of ["diet", "water", "rest", "social", "human_contact", "reaction"]) if (typeof ecology?.[key] !== "string" || !ecology[key]) errors.push(`Missing ecology: ${key}`)
  const materials = document.materials as Material[] | undefined
  if (!Array.isArray(materials)) return [...errors, "Missing material provenance"]
  if (
    !sameSet(
      materials.map((material) => material.item),
      expected.drops,
    )
  )
    errors.push("Material provenance disagrees with registered drops")
  for (const material of materials) {
    if (!items.has(material.item)) errors.push(`${material.item}: unknown material`)
    if (typeof material.origin !== "string" || !material.origin || typeof material.use !== "string" || !material.use) errors.push(`${material.item}: missing origin or use`)
    if (!Array.isArray(material.users) || !material.users.length || material.users.some((id) => documents.get(id)?.kind !== "residents")) errors.push(`${material.item}: unresolved material users`)
  }
  for (const habitat of expected.habitats) {
    const map = documents.get(habitat)
    if (map?.kind !== "maps" || !Array.isArray(map.monsters) || !map.monsters.includes(document.id)) errors.push(`${habitat}: map does not reference species`)
  }
  return errors
}
