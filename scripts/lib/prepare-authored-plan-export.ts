import { resolve } from "node:path"
import { readAuthoredPlanDocuments } from "#/scripts/lib/read-authored-plan-documents"
import { compileAuthoredPlan } from "#/scripts/lib/compile-authored-plan"
import { getAuthoredPlanSource } from "#/scripts/lib/get-authored-plan-source"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"
import type { AuthoredPlanExport } from "#/scripts/lib/authored-plan-export-types"

type Props = Readonly<{ base: string; directory: string; entries: readonly SettingIndexEntry[]; buildingId: string }>

/** Compile and format without touching output files, so incomplete proposals cannot partially publish a batch. */
export async function prepareAuthoredPlanExport(props: Props): Promise<AuthoredPlanExport> {
  const documents = await readAuthoredPlanDocuments(props)
  const plan = compileAuthoredPlan(documents.building, documents.rooms, documents.map)
  if (plan.id !== props.buildingId.slice("building-".length)) throw new Error("Authored export identity disagrees")
  const filePath = resolve(props.directory, `${plan.id}.ts`)
  return { id: plan.id, roomCount: plan.rooms.length, filePath, source: getAuthoredPlanSource({ plan, filePath }) }
}
