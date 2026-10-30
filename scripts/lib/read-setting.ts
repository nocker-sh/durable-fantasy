import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { assertSettingShape } from "#/scripts/lib/setting-shape"
import type { SettingDocument } from "#/scripts/lib/setting-document"

export function readSetting(text: string): SettingDocument {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)
  if (!match) throw Error("Missing settings metadata")
  const metadata: unknown = JSON.parse(match[1])
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw Error("Invalid settings metadata")
  const value = metadata as SettingDocument
  for (const field of ["id", "kind", "title", "status", "source", "design_gate"] as const) if (typeof value[field] !== "string" || !value[field]) throw Error(`Missing ${field}`)
  if (!["現状整理", "設計中", "設計済み", "描画照合済み"].includes(value.status)) throw Error("Invalid design status")
  if (!["未通過", "通過"].includes(value.design_gate)) throw Error("Invalid design gate")
  if (!Array.isArray(value.issues) || value.issues.some((issue) => typeof issue !== "string")) throw Error("Invalid issues")
  if (new Set(value.issues).size !== value.issues.length) throw Error("Duplicate unresolved issues")
  if (value.design_gate === "通過" && (value.issues.length || !["設計済み", "描画照合済み"].includes(value.status))) throw Error("Unresolved design cannot pass its gate")
  if (value.kind === "rooms" && value.design_gate === "通過" && !value.grid) throw Error("Room design needs a grid")
  if (value.kind === "buildings" && value.design_gate === "通過" && !value.layout) throw Error("Building design needs a layout")
  if (value.kind === "rooms" && (!Number.isSafeInteger(value.bed_capacity) || Number(value.bed_capacity) < 0)) throw Error("Invalid room bed capacity")
  assertSettingShape(value)
  if (value.status === "描画照合済み" && ((value.runtime_layout_omissions as { rooms: unknown[] } | undefined)?.rooms.length ?? 0) > 0)
    throw Error("Rendered setting still has unrepresented source rooms")
  if (value.status === "描画照合済み" && ((value.runtime_graphics_omissions as { pieces: unknown[] } | undefined)?.pieces.length ?? 0) > 0)
    throw Error("Rendered setting still has unsupported source furniture")
  const body = text.slice(match[0].length).replace(/\r\n/g, "\n").trim(),
    heading = `# ${value.title}`
  const prose = body
    .slice(heading.length)
    .replace(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm, "")
    .replace(/<!--[\s\S]*?-->/g, "")
  const hasContent = prose.split("\n").some((line) => line.trim() && !/^#{1,6}(?:\s|$)/.test(line.trim()))
  if (!body.startsWith(`${heading}\n`) || !hasContent) throw Error("Missing settings body or mismatched title")
  const diagrams = [...body.matchAll(/^```grid\n([\s\S]*?)\n```[ \t]*$/gm)]
  for (const diagram of diagrams) if (!value.grid || diagram[1] !== value.grid.rows.join("\n")) throw Error("Grid diagram disagrees with settings metadata")
  const districtDiagrams = [...body.matchAll(/^```district-grid\n([\s\S]*?)\n```[ \t]*$/gm)],
    districtPlan = townDistrictPlanSchema.safeParse(value.town_district_plan)
  for (const diagram of districtDiagrams) if (!districtPlan.success || diagram[1] !== districtPlan.data.rows.join("\n")) throw Error("District diagram disagrees with settings metadata")
  const stockLockDiagrams = [...body.matchAll(/^```stock-lock-grid\n([\s\S]*?)\n```[ \t]*$/gm)],
    stockLock = stockLockSchema.safeParse(value.stock_lock)
  for (const diagram of stockLockDiagrams) if (!stockLock.success || diagram[1] !== stockLock.data.layout.rows.join("\n")) throw Error("Stock lock diagram disagrees with settings metadata")
  return value
}
