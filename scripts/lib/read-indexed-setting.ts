import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { readSettingIndex } from "#/scripts/lib/read-setting-index"
import { readSetting } from "#/scripts/lib/read-setting"
import type { SettingIndexEntry } from "#/scripts/lib/setting-index"

type Props = Readonly<{ base: string; entries: readonly SettingIndexEntry[]; id: string; kind: SettingIndexEntry["kind"] }>

/** Read the index's canonical path and verify its contents, rather than deriving an unchecked filename from a reference. */
export async function readIndexedSetting(props: Props) {
  const matches = props.entries.filter((entry) => entry.id === props.id && entry.kind === props.kind)
  if (matches.length !== 1) throw new Error(`Setting reference is missing or ambiguous: ${props.id}`)
  const entry = readSettingIndex({ version: 1, entries: matches })[0]
  const document = readSetting(await readFile(resolve(props.base, entry.file), "utf8"))
  if (document.id !== entry.id || document.kind !== entry.kind) throw new Error(`Indexed setting identity disagrees: ${entry.id}`)
  return document
}
