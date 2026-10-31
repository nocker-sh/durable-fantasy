import { z } from "zod"
import { readIndexedSetting } from "#/scripts/lib/read-indexed-setting"
import { getAuthoredExportTargets } from "#/scripts/lib/get-authored-export-targets"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

type Props = Readonly<{ base: string; entries: readonly SettingIndexEntry[]; buildingId: string }>

/** Resolve the selected building's declared rooms and parent map through one validated inventory. */
export async function readAuthoredPlanDocuments(props: Props) {
  const id = getAuthoredExportTargets([props.buildingId], props.entries)[0]
  const building = await readIndexedSetting({ ...props, id, kind: "buildings" })
  const ids = z.array(z.string().min(1)).min(1).parse(building.rooms)
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate authored room reference: ${id}`)
  const rooms = await Promise.all(ids.map((id) => readIndexedSetting({ ...props, id, kind: "rooms" })))
  const map = await readIndexedSetting({ ...props, id: z.string().min(1).parse(building.map), kind: "maps" })
  return { building, rooms, map }
}
